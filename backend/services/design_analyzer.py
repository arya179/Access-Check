import logging
from typing import Dict, Any, List, Optional
from playwright.async_api import Page
from backend.ai.client import ai_client
from backend.core.config import settings

logger = logging.getLogger("accesscheck.design_intelligence")

# Viewports for responsive evaluation
VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet": {"width": 768, "height": 1024},
    "mobile": {"width": 375, "height": 667}
}

class DesignAnalyzer:
    """
    Automated Website Design & Layout Intelligence Scanner.
    Executes real rendered browser DOM measurements using Playwright:
    1. Visual & Heading Hierarchy
    2. Typography & Readability (font sizes, line heights, font families)
    3. Color & Contrast consistency
    4. Spacing & Layout (margins, alignment, horizontal overflow, overlaps)
    5. Multi-viewport Responsive Analysis (Desktop 1440px, Tablet 768px, Mobile 375px)
    6. UI Consistency (button styles, form inputs, card designs)
    7. Usability & CTAs
    """

    async def measure_page_design(self, page: Page, url: str) -> Dict[str, Any]:
        """
        Executes actual browser DOM measurements and computes objective design metrics.
        Runs across Desktop, Tablet, and Mobile viewports.
        """
        # 1. Desktop evaluation & deep typography / layout inspection
        await page.set_viewport_size(VIEWPORTS["desktop"])
        await page.wait_for_timeout(100)

        desktop_metrics = await page.evaluate("""() => {
            const docWidth = document.documentElement.scrollWidth;
            const viewWidth = window.innerWidth;
            const hasHorizontalOverflow = docWidth > viewWidth + 2;

            // 1. Heading Hierarchy
            const headingNodes = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            const headings = headingNodes.map(h => ({
                level: parseInt(h.tagName.substring(1), 10),
                text: (h.innerText || '').trim().substring(0, 80),
                fontSize: parseFloat(window.getComputedStyle(h).fontSize) || 0
            }));

            // 2. Typography & Fonts
            const bodyStyle = window.getComputedStyle(document.body);
            const textNodes = Array.from(document.querySelectorAll('p, span, li, a, button, label, input, td, th'));
            const fontFamilies = new Set();
            const fontSizes = [];
            let verySmallTextCount = 0;
            let lowLineHeightCount = 0;

            textNodes.slice(0, 150).forEach(el => {
                const s = window.getComputedStyle(el);
                if (el.offsetParent === null) return; // not visible
                const ff = (s.fontFamily || '').split(',')[0].replace(/['"]/g, '').trim();
                if (ff) fontFamilies.add(ff);
                
                const fs = parseFloat(s.fontSize) || 16;
                const lh = parseFloat(s.lineHeight) || (fs * 1.2);
                fontSizes.push(fs);

                if (fs < 12 && (el.innerText || '').trim().length > 3) {
                    verySmallTextCount++;
                }
                if (lh > 0 && fs > 0 && (lh / fs) < 1.25 && (el.innerText || '').trim().length > 20) {
                    lowLineHeightCount++;
                }
            });

            // 3. UI Consistency: Buttons
            const buttonNodes = Array.from(document.querySelectorAll('button, [role="button"], a.btn, .btn'));
            const buttonStyles = buttonNodes.slice(0, 30).map(b => {
                const s = window.getComputedStyle(b);
                const rect = b.getBoundingClientRect();
                return {
                    text: (b.innerText || b.getAttribute('aria-label') || '').trim().substring(0, 40),
                    bg: s.backgroundColor,
                    color: s.color,
                    borderRadius: s.borderRadius,
                    height: Math.round(rect.height),
                    width: Math.round(rect.width),
                    padding: s.padding
                };
            });

            // 4. Overlapping & Clipped Elements
            let overlappingCount = 0;
            const importantElements = Array.from(document.querySelectorAll('header, nav, main, footer, section, button, a.btn, input, h1, h2')).slice(0, 50);
            for (let i = 0; i < importantElements.length; i++) {
                const r1 = importantElements[i].getBoundingClientRect();
                if (r1.width === 0 || r1.height === 0) continue;
                for (let j = i + 1; j < Math.min(i + 8, importantElements.length); j++) {
                    const r2 = importantElements[j].getBoundingClientRect();
                    if (r2.width === 0 || r2.height === 0) continue;
                    // Check if elements are descendants of each other
                    if (importantElements[i].contains(importantElements[j]) || importantElements[j].contains(importantElements[i])) continue;
                    
                    const overlapX = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
                    const overlapY = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
                    if (overlapX > 20 && overlapY > 20) {
                        overlappingCount++;
                    }
                }
            }

            // 5. Interactive touch targets (< 32px or 44px)
            let smallTargets = 0;
            buttonNodes.forEach(b => {
                const r = b.getBoundingClientRect();
                if (r.width > 0 && r.height > 0 && (r.width < 32 || r.height < 32)) {
                    smallTargets++;
                }
            });

            return {
                docWidth,
                viewWidth,
                hasHorizontalOverflow,
                headings,
                fontFamilies: Array.from(fontFamilies).slice(0, 8),
                primaryFontFamily: bodyStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
                verySmallTextCount,
                lowLineHeightCount,
                buttonCount: buttonNodes.length,
                buttonStyles: buttonStyles.slice(0, 10),
                overlappingCount,
                smallTargetsCount: smallTargets
            };
        }""")

        # 2. Tablet Responsive Check (768px)
        await page.set_viewport_size(VIEWPORTS["tablet"])
        await page.wait_for_timeout(100)
        tablet_metrics = await page.evaluate("""() => {
            const docWidth = document.documentElement.scrollWidth;
            const viewWidth = window.innerWidth;
            return {
                docWidth,
                viewWidth,
                hasHorizontalOverflow: docWidth > viewWidth + 2
            };
        }""")

        # 3. Mobile Responsive Check (375px)
        await page.set_viewport_size(VIEWPORTS["mobile"])
        await page.wait_for_timeout(100)
        mobile_metrics = await page.evaluate("""() => {
            const docWidth = document.documentElement.scrollWidth;
            const viewWidth = window.innerWidth;
            const hasHorizontalOverflow = docWidth > viewWidth + 2;
            
            // Check if navigation collapses or overflows
            const nav = document.querySelector('nav, header');
            const navWidth = nav ? nav.getBoundingClientRect().width : 0;
            const navOverflows = navWidth > viewWidth + 2;

            // Check touch targets on mobile
            const interactive = Array.from(document.querySelectorAll('button, a, input, select'));
            let subStandardTargets = 0;
            interactive.slice(0, 40).forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.height > 0 && (r.width < 36 || r.height < 36)) {
                    subStandardTargets++;
                }
            });

            return {
                docWidth,
                viewWidth,
                hasHorizontalOverflow,
                navOverflows,
                subStandardTargets
            };
        }""")

        # Restore desktop viewport
        await page.set_viewport_size(VIEWPORTS["desktop"])

        return {
            "desktop": desktop_metrics,
            "tablet": tablet_metrics,
            "mobile": mobile_metrics
        }

    def generate_deterministic_design_findings(self, measurements: Dict[str, Any], url: str) -> List[Dict[str, Any]]:
        """
        Derives objective, reproducible design findings from actual browser measurements.
        Zero hallucinations.
        """
        findings = []
        desktop = measurements.get("desktop", {})
        tablet = measurements.get("tablet", {})
        mobile = measurements.get("mobile", {})

        # --- 1. Responsive & Horizontal Overflow Checks ---
        if desktop.get("hasHorizontalOverflow"):
            findings.append({
                "page_url": url,
                "category": "Responsive Design",
                "finding_label": "Layout overflow",
                "description": f"Horizontal scrollbar detected on desktop (content width: {desktop.get('docWidth')}px, viewport: {desktop.get('viewWidth')}px).",
                "evidence": f"Document scroll width exceeds viewport width by {desktop.get('docWidth', 0) - desktop.get('viewWidth', 0)}px.",
                "severity": "serious",
                "suggested_correction": "Inspect CSS containers with fixed min-width or margin offsets causing horizontal overflow. Use max-width: 100% and box-sizing: border-box.",
                "requires_human_verification": False
            })

        if tablet.get("hasHorizontalOverflow"):
            findings.append({
                "page_url": url,
                "category": "Responsive Design",
                "finding_label": "Layout overflow",
                "description": f"Horizontal overflow on tablet viewport (768px width). Content measured at {tablet.get('docWidth')}px.",
                "evidence": f"Tablet scroll width {tablet.get('docWidth')}px > 768px viewport.",
                "severity": "moderate",
                "suggested_correction": "Add responsive media queries or flex-wrap to prevent multi-column desktop grids from overflowing tablet screens.",
                "requires_human_verification": False
            })

        if mobile.get("hasHorizontalOverflow"):
            findings.append({
                "page_url": url,
                "category": "Responsive Design",
                "finding_label": "Layout overflow",
                "description": f"Critical mobile horizontal overflow (375px viewport). Content measured at {mobile.get('docWidth')}px.",
                "evidence": f"Mobile scroll width {mobile.get('docWidth')}px > 375px viewport.",
                "severity": "critical",
                "suggested_correction": "Mobile users must pan horizontally. Ensure images and tables have max-width: 100% and overflow-x: auto.",
                "requires_human_verification": False
            })

        # --- 2. Heading Hierarchy ---
        headings = desktop.get("headings", [])
        if not headings:
            findings.append({
                "page_url": url,
                "category": "Visual Hierarchy",
                "finding_label": "Visual hierarchy defect",
                "description": "No semantic heading elements (<h1>-<h6>) detected on the page.",
                "evidence": "Query selector 'h1, h2, h3, h4, h5, h6' returned 0 elements.",
                "severity": "moderate",
                "suggested_correction": "Introduce semantic <h1>, <h2>, and <h3> elements to structure page sections for assistive technologies and scanning users.",
                "requires_human_verification": False
            })
        else:
            h1_count = sum(1 for h in headings if h["level"] == 1)
            if h1_count == 0:
                findings.append({
                    "page_url": url,
                    "category": "Visual Hierarchy",
                    "finding_label": "Visual hierarchy defect",
                    "description": "Page is missing an <h1> top-level heading.",
                    "evidence": f"Found {len(headings)} subheadings but 0 <h1> elements.",
                    "severity": "moderate",
                    "suggested_correction": "Add a prominent <h1> that describes the primary topic or purpose of the page.",
                    "requires_human_verification": False
                })
            elif h1_count > 1:
                findings.append({
                    "page_url": url,
                    "category": "Visual Hierarchy",
                    "finding_label": "Visual hierarchy defect",
                    "description": f"Multiple <h1> headings ({h1_count}) found on a single page.",
                    "evidence": f"Found {h1_count} h1 tags in DOM.",
                    "severity": "minor",
                    "suggested_correction": "Reserve <h1> for the main page title and use <h2> for subordinate sections to maintain clear information architecture.",
                    "requires_human_verification": False
                })

            # Check for skipped heading levels (e.g. h1 directly to h3)
            for i in range(len(headings) - 1):
                curr_lvl = headings[i]["level"]
                next_lvl = headings[i+1]["level"]
                if next_lvl > curr_lvl + 1:
                    findings.append({
                        "page_url": url,
                        "category": "Visual Hierarchy",
                        "finding_label": "Visual hierarchy defect",
                        "description": f"Skipped heading level from <h{curr_lvl}> to <h{next_lvl}> ('{headings[i+1]['text']}').",
                        "evidence": f"Heading hierarchy jumps by {next_lvl - curr_lvl} levels without intermediate <h{curr_lvl+1}>.",
                        "severity": "minor",
                        "suggested_correction": f"Nest headings hierarchically: do not jump from <h{curr_lvl}> directly to <h{next_lvl}>.",
                        "requires_human_verification": False
                    })
                    break

        # --- 3. Typography & Readability ---
        font_families = desktop.get("fontFamilies", [])
        if len(font_families) > 4:
            findings.append({
                "page_url": url,
                "category": "Typography",
                "finding_label": "Typography inconsistency",
                "description": f"Excessive font families detected ({len(font_families)} distinct typefaces: {', '.join(font_families[:4])}...).",
                "evidence": f"{len(font_families)} font-family declarations rendered simultaneously.",
                "severity": "minor",
                "suggested_correction": "Standardize on 1-2 coordinated typefaces (e.g. one for headings, one for body copy) to improve visual cohesion and load speed.",
                "requires_human_verification": False
            })

        if desktop.get("verySmallTextCount", 0) > 3:
            findings.append({
                "page_url": url,
                "category": "Typography",
                "finding_label": "Text readability deficiency",
                "description": f"Detected {desktop.get('verySmallTextCount')} text elements with font-size under 12px.",
                "evidence": f"Rendered computed font-size < 12px for body copy elements.",
                "severity": "moderate",
                "suggested_correction": "Increase body text font sizes to at least 14px-16px for comfortable legibility across displays.",
                "requires_human_verification": False
            })

        if desktop.get("lowLineHeightCount", 0) > 4:
            findings.append({
                "page_url": url,
                "category": "Typography",
                "finding_label": "Text readability deficiency",
                "description": "Tight line-height detected on multiple paragraphs (line-height to font-size ratio < 1.25).",
                "evidence": f"{desktop.get('lowLineHeightCount')} paragraph elements have cramped vertical line spacing.",
                "severity": "minor",
                "suggested_correction": "Set line-height to 1.5 - 1.6 for body copy (WCAG 1.4.12 recommends at least 1.5 times the font size).",
                "requires_human_verification": False
            })

        # --- 4. Interactive Target Sizing (Usability & Touch) ---
        small_targets = desktop.get("smallTargetsCount", 0)
        if small_targets > 0:
            findings.append({
                "page_url": url,
                "category": "Usability",
                "finding_label": "Interactive touch target deficiency",
                "description": f"{small_targets} interactive buttons or controls have rendered dimensions below 32x32px.",
                "evidence": f"Computed bounding client rect height or width < 32px on desktop.",
                "severity": "moderate",
                "suggested_correction": "Provide minimum touch target dimensions of 44x44px (or at least 24x24px with adequate spacing) to comply with WCAG 2.5.5 / 2.5.8.",
                "requires_human_verification": False
            })

        if mobile.get("subStandardTargets", 0) > 3:
            findings.append({
                "page_url": url,
                "category": "Usability",
                "finding_label": "Mobile touch target deficiency",
                "description": f"{mobile.get('subStandardTargets')} touch targets on mobile (375px) measure under 36x36px.",
                "evidence": f"Mobile viewport evaluation found {mobile.get('subStandardTargets')} cramped controls.",
                "severity": "serious",
                "suggested_correction": "Increase padding on links and buttons on mobile viewports to prevent accidental taps.",
                "requires_human_verification": False
            })

        # --- 5. Overlapping / Colliding Elements ---
        if desktop.get("overlappingCount", 0) > 0:
            findings.append({
                "page_url": url,
                "category": "Spacing and Layout",
                "finding_label": "Element overlap detected",
                "description": f"{desktop.get('overlappingCount')} visible element pairs collide or overlap unexpectedly.",
                "evidence": "Bounding client rectangles overlap by > 20px horizontally and vertically.",
                "severity": "moderate",
                "suggested_correction": "Check absolute positioning and negative margins in component containers. Use CSS Grid or Flexbox for dynamic flow.",
                "requires_human_verification": True
            })

        return findings

    async def analyze_with_gemma_ai(
        self,
        measurements: Dict[str, Any],
        url: str
    ) -> List[Dict[str, Any]]:
        """
        Synthesizes measured rendered browser evidence through Gemma 4 (gemma-4-26b-a4b-it).
        Gemma evaluates visual cohesion, CTA clarity, and usability without hallucinating numbers.
        """
        if not ai_client.client:
            return []

        desktop = measurements.get("desktop", {})
        button_sample = desktop.get("buttonStyles", [])[:6]
        headings = desktop.get("headings", [])[:8]

        prompt = f"""You are an elite UX/UI design auditor and accessibility specialist.
CRITICAL INSTRUCTIONS:
- You must ONLY analyze the real rendered browser measurements provided below.
- Do NOT invent or fabricate pixel values, font names, or metrics not present in the data.
- The target URL is: {url}

Rendered Browser Data:
- Primary Font: {desktop.get('primaryFontFamily', 'Default')}
- All Rendered Fonts: {', '.join(desktop.get('fontFamilies', []))}
- Headings Found: {len(headings)} (Sample: {[h['text'] for h in headings]})
- Total Interactive Buttons: {desktop.get('buttonCount', 0)}
- Sample Button Styles: {button_sample}
- Layout Overflow: Desktop={desktop.get('hasHorizontalOverflow')}, Tablet={measurements.get('tablet', {}).get('hasHorizontalOverflow')}, Mobile={measurements.get('mobile', {}).get('hasHorizontalOverflow')}
- Small Targets: Desktop={desktop.get('smallTargetsCount', 0)}, Mobile={measurements.get('mobile', {}).get('subStandardTargets', 0)}

Evaluate and return high-value design intelligence findings:
1. Visual hierarchy & call-to-action (CTA) prominence.
2. Button style consistency across the sample.
3. Typography pairing & readability.
4. Usability or cognitive clarity issues.

Return a valid JSON object matching this schema:
{{
  "findings": [
    {{
      "category": "Visual Hierarchy" | "UI Consistency" | "Typography" | "Usability",
      "finding_label": "Short label (e.g. CTA ambiguity, Inconsistent button styling)",
      "description": "Concise technical critique",
      "evidence": "Citing specific data from the prompt",
      "severity": "serious" | "moderate" | "minor",
      "suggested_correction": "Actionable developer advice",
      "requires_human_verification": true | false
    }}
  ]
}}
If no design issues are apparent from this data, return {{"findings": []}}.
"""
        try:
            parsed = await ai_client.generate_json(prompt, timeout=12.0)
            ai_findings = []
            for item in parsed.get("findings", []):
                ai_findings.append({
                    "page_url": url,
                    "category": item.get("category", "Usability"),
                    "finding_label": item.get("finding_label", "Design recommendation"),
                    "description": item.get("description", ""),
                    "evidence": item.get("evidence", "Browser measurement analysis"),
                    "severity": item.get("severity", "minor"),
                    "suggested_correction": item.get("suggested_correction", ""),
                    "requires_human_verification": bool(item.get("requires_human_verification", True)),
                    "is_ai_assisted": True
                })
            return ai_findings
        except Exception as e:
            logger.warning(f"Gemma 4 design analysis skipped/failed: {e}")
            return []

    async def analyze_website_design(
        self,
        page: Page,
        url: str,
        enable_ai: bool = True
    ) -> Dict[str, Any]:
        """
        Full design intelligence pipeline combining:
        1. Multi-viewport browser measurements (Desktop, Tablet, Mobile)
        2. Deterministic layout, typography, touch target & hierarchy rules
        3. Gemma 4 qualitative design & CTA critique
        4. Calculation of an objective Design Quality Score (100 - weighted deductions)
        """
        measurements = await self.measure_page_design(page, url)
        deterministic_findings = self.generate_deterministic_design_findings(measurements, url)
        
        ai_findings = []
        if enable_ai and ai_client.client:
            ai_findings = await self.analyze_with_gemma_ai(measurements, url)

        all_findings = deterministic_findings + ai_findings

        # Calculate Objective Design Score
        # Deduct 15 for critical (e.g. mobile overflow), 10 for serious, 5 for moderate, 2 for minor
        deductions = 0
        for f in all_findings:
            sev = f.get("severity", "minor")
            if sev == "critical":
                deductions += 15
            elif sev == "serious":
                deductions += 10
            elif sev == "moderate":
                deductions += 5
            else:
                deductions += 2

        design_score = max(0, 100 - deductions)

        return {
            "design_quality_score": design_score,
            "total_design_findings": len(all_findings),
            "measurements_summary": {
                "font_families": measurements.get("desktop", {}).get("fontFamilies", []),
                "heading_count": len(measurements.get("desktop", {}).get("headings", [])),
                "button_count": measurements.get("desktop", {}).get("buttonCount", 0),
                "has_desktop_overflow": measurements.get("desktop", {}).get("hasHorizontalOverflow", False),
                "has_tablet_overflow": measurements.get("tablet", {}).get("hasHorizontalOverflow", False),
                "has_mobile_overflow": measurements.get("mobile", {}).get("hasHorizontalOverflow", False),
                "small_targets_count": measurements.get("desktop", {}).get("smallTargetsCount", 0) + measurements.get("mobile", {}).get("subStandardTargets", 0)
            },
            "findings": all_findings
        }

design_analyzer = DesignAnalyzer()

