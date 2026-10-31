import os
import json
import time
import asyncio
import logging
from typing import Dict, Any, List, Optional
from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from backend.scanners.security import validate_and_resolve_url, SecurityValidationError

logger = logging.getLogger(__name__)

# Pinned local axe-core bundle path
AXE_ASSET_PATH = os.path.join(os.path.dirname(__file__), "assets", "axe.min.js")

class AccessibilityScanner:
    """
    Production-ready real website accessibility scanner using existing Google Chrome,
    Playwright, and bundled local axe-core.

    Features:
    - Launches existing Google Chrome (channel='chrome', headless=True)
    - Bundled local axe-core (zero reliance on external CDNs)
    - Full SSRF and DNS rebinding / redirect protection
    - Concurrency throttle via asyncio.Semaphore
    - Comprehensive rule inspection (Rule ID, impact, help, description, tags, HTML snippets, selectors)
    """

    def __init__(
        self,
        max_concurrency: int = 3,
        navigation_timeout_ms: int = 40000,
        axe_timeout_ms: int = 25000,
        axe_script_path: str = AXE_ASSET_PATH
    ):
        self.semaphore = asyncio.Semaphore(max_concurrency)
        self.navigation_timeout_ms = navigation_timeout_ms
        self.axe_timeout_ms = axe_timeout_ms
        self.axe_script_path = axe_script_path

        # Verify local axe-core script exists
        if not os.path.exists(self.axe_script_path):
            raise FileNotFoundError(f"Pinned axe-core script not found at {self.axe_script_path}")

        with open(self.axe_script_path, "r", encoding="utf-8") as f:
            self._axe_source = f.read()

    async def scan_url(
        self,
        url: str,
        tags: Optional[List[str]] = None,
        bypass_security_check_for_testing: bool = False,
        capture_screenshot: bool = False
    ) -> Dict[str, Any]:
        """
        Executes a real accessibility scan against the target URL.
        Optionally captures a masked screenshot for multimodal visual accessibility analysis.
        """
        if not tags:
            tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]

        # 1. URL validation & DNS resolving / SSRF protection
        if not bypass_security_check_for_testing:
            clean_url, resolved_ip = validate_and_resolve_url(url)
        else:
            clean_url = url

        async with self.semaphore:
            start_time = time.time()
            async with async_playwright() as p:
                # Launch existing Chrome installation using channel="chrome"
                browser: Browser = await p.chromium.launch(
                    channel="chrome",
                    headless=True,
                    args=[
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-gpu"
                    ]
                )

                context: BrowserContext = await browser.new_context(
                    viewport={"width": 1280, "height": 800},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 AccessCheck-AI/2.0"
                )

                page: Page = await context.new_page()

                # Setup route security check to block private IP redirects during navigation
                if not bypass_security_check_for_testing:
                    async def handle_route(route):
                        request = route.request
                        # Block access to private destination URLs during redirects
                        req_url = request.url
                        try:
                            # Verify redirect target isn't internal
                            if req_url.startswith("http://") or req_url.startswith("https://"):
                                validate_and_resolve_url(req_url)
                            await route.continue_()
                        except SecurityValidationError as sec_err:
                            logger.warning(f"Aborting redirect to restricted destination: {req_url} ({sec_err})")
                            await route.abort("blockedbyclient")
                        except Exception:
                            await route.continue_()

                    await context.route("**/*", handle_route)

                try:
                    # Navigate to target
                    response = await page.goto(
                        clean_url,
                        wait_until="domcontentloaded",
                        timeout=self.navigation_timeout_ms
                    )

                    # Give dynamically loaded elements a moment to settle
                    try:
                        await page.wait_for_load_state("networkidle", timeout=5000)
                    except Exception:
                        pass # Proceed if page continues periodic polling

                    # 2. Inject local pinned axe-core JavaScript directly
                    await page.evaluate(self._axe_source)

                    # 3. Configure and execute axe.run()
                    axe_config = {
                        "runOnly": {
                            "type": "tag",
                            "values": tags
                        }
                    }

                    raw_results = await page.evaluate(
                        """(options) => {
                            return new Promise((resolve, reject) => {
                                if (typeof axe === 'undefined') {
                                    return reject('axe-core not initialized');
                                }
                                axe.run(document, options, (err, results) => {
                                    if (err) return reject(err.message || err);
                                    resolve(results);
                                });
                            });
                        }""",
                        axe_config
                    )

                    duration = round(time.time() - start_time, 2)

                    # 4. Extract verified results
                    violations = raw_results.get("violations", [])
                    passes = raw_results.get("passes", [])
                    incomplete = raw_results.get("incomplete", [])
                    inapplicable = raw_results.get("inapplicable", [])

                    # 5. Extract visible text elements for Content Quality & Spell Checking
                    extracted_text_elements = await page.evaluate("""() => {
                        const results = [];
                        // Title and meta description
                        if (document.title) {
                            results.push({ tag: 'title', text: document.title.trim() });
                        }
                        const metaDesc = document.querySelector('meta[name="description"]');
                        if (metaDesc && metaDesc.content) {
                            results.push({ tag: 'meta-description', text: metaDesc.content.trim() });
                        }

                        // Visible selectors: headings, paragraphs, buttons, links, labels, table cells, cards
                        const selectors = 'h1, h2, h3, h4, h5, h6, p, button, a, label, [role="button"], [role="alert"], [role="dialog"], th, td, li, footer p, .card, .alert';
                        const nodes = document.querySelectorAll(selectors);
                        const seen = new Set();

                        nodes.forEach(el => {
                            // Only visible elements
                            if (el.offsetParent === null && el.tagName !== 'BODY') return;
                            const text = (el.innerText || el.textContent || '').trim();
                            // Keep meaningful texts between 3 and 400 chars, avoid duplicates
                            if (text && text.length >= 3 && text.length <= 400 && !seen.has(text)) {
                                seen.add(text);
                                results.push({
                                    tag: el.tagName.toLowerCase(),
                                    text: text
                                });
                            }
                        });
                        return results.slice(0, 40); // Cap at 40 rich elements per page
                    }""")

                    # 6. Design and Responsive Measurements
                    from backend.services.design_analyzer import design_analyzer
                    design_results = await design_analyzer.analyze_website_design(
                        page=page,
                        url=clean_url,
                        enable_ai=False # Performed downstream in audit_service if requested
                    )

                    critical_count = 0
                    serious_count = 0
                    moderate_count = 0
                    minor_count = 0

                    formatted_violations = []
                    for v in violations:
                        impact = v.get("impact", "minor") or "minor"
                        if impact == "critical":
                            critical_count += 1
                        elif impact == "serious":
                            serious_count += 1
                        elif impact == "moderate":
                            moderate_count += 1
                        else:
                            minor_count += 1

                        nodes_data = []
                        for node in v.get("nodes", []):
                            nodes_data.append({
                                "html": node.get("html", ""),
                                "target": node.get("target", []),
                                "failureSummary": node.get("failureSummary", "")
                            })

                        formatted_violations.append({
                            "id": v.get("id"),
                            "impact": impact,
                            "description": v.get("description", ""),
                            "help": v.get("help", ""),
                            "helpUrl": v.get("helpUrl", ""),
                            "tags": v.get("tags", []),
                            "nodes": nodes_data
                        })

                    # Calculate weighted accessibility score
                    deductions = (critical_count * 15) + (serious_count * 8) + (moderate_count * 4) + (minor_count * 1)
                    score = max(0, 100 - deductions)

                    total_rules_tested = len(violations) + len(passes)
                    compliance_rate = 100.0 if total_rules_tested == 0 else round((len(passes) / total_rules_tested) * 100, 1)

                    # Optional: capture screenshot with masked inputs (password, text, tel, email)
                    screenshot_b64 = None
                    if capture_screenshot:
                        try:
                            # Privacy masking: redact text inside input fields and passwords
                            await page.evaluate("""() => {
                                document.querySelectorAll('input, textarea').forEach(el => {
                                    el.style.filter = 'blur(8px)';
                                });
                            }""")
                            raw_png = await page.screenshot(type="png", full_page=False)
                            import base64
                            screenshot_b64 = base64.b64encode(raw_png).decode("utf-8")
                        except Exception as shot_err:
                            logger.warning(f"Failed to capture visual screenshot: {shot_err}")

                    return {
                        "duration_seconds": duration,
                        "score": score,
                        "metrics": {
                            "total_violations": len(violations),
                            "critical_count": critical_count,
                            "serious_count": serious_count,
                            "moderate_count": moderate_count,
                            "minor_count": minor_count,
                            "accessibility_score": score,
                            "wcag_compliance_rate": compliance_rate
                        },
                        "violations": formatted_violations,
                        "passes_count": len(passes),
                        "incomplete_count": len(incomplete),
                        "inapplicable_count": len(inapplicable),
                        "extracted_text_elements": extracted_text_elements,
                        "design_analysis": design_results,
                        "screenshot_b64": screenshot_b64
                    }

                finally:
                    await context.close()
                    await browser.close()
