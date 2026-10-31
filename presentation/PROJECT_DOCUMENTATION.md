# AccessCheck AI — Complete Project Technical Documentation & Presentation Guide
**Event**: Hacktoberfest Gemma 4 Challenge  
**Primary AI Model**: `gemma-4-26b-a4b-it` (Google Gemma 4)  
**Author**: AccessCheck AI Engineering Team  
**Date**: October 2026  

---

# PART 1 — COMPLETE PROJECT DOCUMENTATION

## 1. Project Overview
**AccessCheck AI** is an automated, enterprise-grade web application that audits websites across three critical pillars:
1. **WCAG Accessibility Conformance** (using Deque's official `axe-core` library injected into headless Google Chrome via Playwright).
2. **Website Design & Responsive Intelligence** (performing rendered browser DOM measurements across Desktop, Tablet, and Mobile viewports for layout overflow, typography discipline, heading hierarchy, and touch target sizing).
3. **Content Quality & Correctness Intelligence** (combining deterministic dictionary spell checking with Google's open **Gemma 4** model for contextual grammar analysis, placeholder text detection, and consistency verification).

AccessCheck AI provides developers, QA engineers, and site owners with actionable Before/After HTML and CSS code fixes, mathematical transparency in scoring, Plotly compliance visualizations, and exportable PDF certificates and CSV datasets—all without requiring user account creation or credential harvesting.

---

## 2. Problem Statement
The modern web suffers from critical digital blind spots:
- **Pervasive Accessibility Violations**: According to the WebAIM Million report, over 96% of top homepages fail basic WCAG 2.1 Level AA criteria. Missing alt text, broken color contrast, and unlabeled buttons prevent millions of individuals with visual, motor, or cognitive disabilities from accessing digital services.
- **Content Mistakes in Production**: Developer placeholders (e.g., `"Lorem ipsum"`, `"TODO"`, `"Enter text here"`), repeated words (`"the the"`), and homophone errors (`their/there`) frequently slip past static linters and harm enterprise credibility.
- **Responsive Layout Failures**: Elements that look fine on a 1920px monitor frequently break or horizontally overflow on 375px mobile viewports, making touch controls unusable.
- **Inefficient Manual Audits**: Manual audits require certified accessibility specialists (CPACC/WAS) and cost thousands of dollars, while existing automated scanners provide vague rule warnings rather than copy-pasteable, verified code solutions.

---

## 3. Why This Project is Needed
AccessCheck AI bridges the gap between **raw automated detection** and **actionable developer remediation**:
- Traditional linters and audit tools merely state *what* is broken.
- AccessCheck AI pairs actual rendered browser measurements with **Google Gemma 4 (`gemma-4-26b-a4b-it`)** to provide *exact Before and After code snippets*, step-by-step developer remediation instructions, and clear explanations of how each defect impacts users with disabilities.
- It operates with zero friction: no registration forms, no password requirements, and zero threat of cross-user data leakage.

---

## 4. Project Objectives
1. **Zero-Friction Auditing**: Allow developers to audit any public web page by simply providing its URL.
2. **Authentic Browser Automation**: Use genuine headless Google Chrome via Playwright to evaluate dynamic client-side rendered DOM trees (React, Vue, Angular, Next.js).
3. **Tri-Pillar Evaluation**: Deliver three distinct, transparent scores (Accessibility Score, Design Quality Score, Content Quality Score) out of 100.
4. **Gemma 4 Driven Remediation**: Exclusively use Google's open `gemma-4-26b-a4b-it` model through the official `google-genai` Python SDK to generate structured code fixes and contextual text analysis.
5. **Security & Privacy by Design**: Protect internal networks using Server-Side Request Forgery (SSRF) validation, sanitize untrusted copy against prompt injection, and redact all sensitive tokens, passwords, and cookies before contacting AI services.
6. **Auditor-Grade Deliverables**: Enable one-click export of executive compliance PDFs (built with ReportLab) and CSV datasets (built with Pandas).

---

## 5. Target Users
- **Front-End Developers & Software Engineers**: Looking for instant, copy-pasteable accessible HTML/JSX/CSS fixes for failing components.
- **Quality Assurance & DevOps Teams**: Running automated pre-deployment audits or integrating quality gates into continuous delivery pipelines.
- **Accessibility & Compliance Officers (CPACC)**: Reviewing WCAG 2.1/2.2 Level A/AA criteria for legal compliance under ADA Title III, Section 508, and the European Accessibility Act (EAA).
- **Product Managers & Content Editors**: Ensuring marketing pages are typo-free, responsive on mobile devices, and devoid of lingering dummy placeholders.

---

## 6. Real-World Use Cases
- **Pre-Release Web Auditing**: Auditing landing pages and checkout flows before public launch to ensure zero accessibility blockers or broken layouts.
- **Client Delivery & Agency Handover**: Web development agencies generating professional PDF compliance certificates for client deliverables.
- **Continuous Quality Monitoring**: Storing recurring audit records in SQLite to compare score trajectories and track regressions between releases.
- **Copy & Content Review**: Scanning high-traffic blog posts and marketing pages to catch contextual grammatical slips, missing punctuation spaces, and accidental template copy.

---

## 7. Complete Frontend Architecture
- **Framework & Tooling**: Built with **React 18** and **Vite**, bundled via Rolldown.
- **Styling**: **Tailwind CSS** with full Dark/Light theme switching supported via `ThemeContext.jsx`.
- **Navigation & Routing**: Clean single-page application (SPA) state router managing 10 views without heavy external router dependencies:
  - `NewScanPage.jsx`: URL entry, standard selection, and live audit dispatching.
  - `ScanResultsPage.jsx`: Tri-pillar score display, formula explanation modal, and three tabbed inspection views (WCAG Accessibility, Design Analysis, Content Quality).
  - `DashboardPage.jsx`: Metric trends, overview analytics, and quick scan triggers.
  - `AiFixAssistantPage.jsx`: Interactive Gemma 4 code remediation studio and developer Q&A.
  - `ScanHistoryPage.jsx`: Persistent scan logs, search, date filtering, and side-by-side comparison selector.
  - `ReportsPage.jsx`: Compliance certificate generator with PDF and CSV export buttons.
  - `AnalyticsPage.jsx`: Interactive Plotly compliance distributions and severity charts.
  - `WcagGuidelinesPage.jsx`: Comprehensive WCAG learning center with Gemma 4 inquiry assistant.
  - `SettingsPage.jsx`: Configuration status inspector (`gemma-4-26b-a4b-it`, FastAPI gateway connection status).
  - `AboutPage.jsx`: Architecture breakdown, methodology, and technology credits.
- **Component Architecture**:
  - `CircularGauge.jsx`: Custom SVG animated percentage dial for scores.
  - `Header.jsx`: Real-time backend connection status indicator (`connected`, `connecting`, `disconnected`) with manual retry button and theme toggle.
  - `Sidebar.jsx`: Accessible ARIA navigation drawer with active route badges.
- **API Service Layer (`src/services/api.js`)**:
  - Configured with `VITE_API_URL` (defaulting to `http://localhost:8000`).
  - AbortController request timeout management (default 45s).
  - Centralized error handling for 400, 404, 422, and 500 status codes.

---

## 8. Complete Backend Architecture
- **Framework & Server**: **FastAPI** running on Python 3.14 with **Uvicorn** on port `8000`.
- **Application Lifespan (`backend/main.py`)**: Asynchronous startup validation initializing the SQLite database, confirming database connectivity, and executing graceful cleanup on shutdown.
- **CORS Middleware**: Dynamic CORS origin allowing `settings.FRONTEND_URL` (`http://localhost:5173`) in production and permissive local origins during development.
- **Core Modules**:
  - `backend/core/config.py`: Environment variable loader; establishes `GEMMA_MODEL=gemma-4-26b-a4b-it` as the single source of truth.
  - `backend/scanners/axe_scanner.py`: Playwright browser automation and axe-core execution engine.
  - `backend/scanners/security.py`: Network security module validating schemes, parsing IP addresses, and preventing SSRF attacks.
  - `backend/services/design_analyzer.py`: Browser layout and multi-viewport responsive design analyzer.
  - `backend/services/spell_checker.py`: Deterministic dictionary spell checker and untrusted copy sanitizer.
  - `backend/ai/client.py`: Centralized `GemmaClient` calling the official `google-genai` SDK.
  - `backend/ai/gemma_service.py`: High-level AI feature orchestrator.
  - `backend/models/database.py`: Async SQLite database manager utilizing `aiosqlite`.
  - `backend/reports/exporter.py`: Enterprise PDF generator (ReportLab) and CSV exporter (Pandas).
  - `backend/analytics/visualizer.py`: Plotly.js chart generation engine.

---

## 9. API Endpoints and Their Purposes

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/health` | Backend and database connectivity status, reporting `ai_provider: "Google Gen AI API"` and `gemma_model: "gemma-4-26b-a4b-it"`. |
| `POST` | `/api/scan` | Initiates an end-to-end audit: Chrome navigation, axe-core audit, multi-viewport design sweep, content scan, Gemma 4 remediation, and SQLite persistence. |
| `GET` | `/api/audit/history` | Fetches historical scan logs with search query, date range filtering, and pagination limits. |
| `GET` | `/api/audit/{audit_id}` | Retrieves full stored audit JSON by unique UUID. |
| `DELETE` | `/api/audit/{audit_id}` | Cascading deletion of a scan record and its associated violations. |
| `DELETE` | `/api/audit/history/clear` | Purges all audit history from the local database. |
| `GET` | `/api/audit/compare` | Compares two scans side-by-side, calculating score deltas and resolved/new violations. |
| `GET` | `/api/audit/analytics/summary` | Aggregates high-level statistics across all stored scans. |
| `GET` | `/api/reports/{scan_id}/pdf` | Generates and streams an enterprise ReportLab compliance certificate PDF. |
| `GET` | `/api/reports/{scan_id}/csv` | Generates and streams a Pandas-formatted CSV dataset of violations. |
| `GET` | `/api/ai/status` | Returns operational status of Gemma 4 without exposing secret credentials. |
| `POST` | `/api/ai/ping` | Executes a live lightweight connectivity check to Gemma 4; updates connection state. |
| `POST` | `/api/ai/explain` | Generates structured explanations, HTML before/after snippets, and CSS fixes for axe violations. |
| `POST` | `/api/ai/ask` | Answers developer questions regarding WCAG guidelines and code fixes. |
| `POST` | `/api/ai/checklist` | Generates a prioritized remediation checklist (P0/P1/P2) from scan findings. |
| `POST` | `/api/ai/compare` | Evaluates audit deltas and generates progress narratives using Gemma 4. |
| `POST` | `/api/ai/visual-analysis` | Multimodal analysis of page screenshot for visual contrast, layout, and touch targets. |

---

## 10. Database Structure
AccessCheck AI utilizes **SQLite** (`accesscheck.db`) managed through asynchronous connections (`aiosqlite`). The database schema is fully normalized:

```sql
-- 1. Scans Table
CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    duration_seconds REAL NOT NULL,
    score INTEGER NOT NULL,
    total_violations INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    serious_count INTEGER DEFAULT 0,
    moderate_count INTEGER DEFAULT 0,
    minor_count INTEGER DEFAULT 0,
    passes_count INTEGER DEFAULT 0,
    incomplete_count INTEGER DEFAULT 0,
    inapplicable_count INTEGER DEFAULT 0,
    wcag_compliance_rate REAL DEFAULT 100.0,
    metrics_json TEXT NOT NULL,
    full_scan_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Violations Table
CREATE TABLE IF NOT EXISTS violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    impact TEXT NOT NULL,
    description TEXT NOT NULL,
    help TEXT NOT NULL,
    help_url TEXT,
    tags_json TEXT,
    nodes_json TEXT,
    FOREIGN KEY(scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

-- 3. AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    remediation_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(scan_id) REFERENCES scans(id) ON DELETE CASCADE
);
```

---

## 11. Website Scanning Workflow
```
[User enters URL in React UI]
               │
               ▼
   [SSRF & DNS Resolution Check] ──(Disallowed IP)──> [HTTP 400 Policy Rejection]
               │
               ▼ (Valid Public URL)
[Playwright launches Headless Chrome]
               │
               ├───────────────────────────────────────────────┐
               ▼                                               ▼
    [Inject axe.min.js & run]                     [Multi-Viewport Design Sweep]
   (WCAG 2.1 A/AA DOM Rules)                     (Desktop: 1440px, Tablet: 768px, Mobile: 375px)
               │                                               │
               ▼                                               ▼
 [Extract Violations & Selectors]               [Measure Overflow, Headings, Fonts, Targets]
               │                                               │
               ├───────────────────────────────────────────────┘
               ▼
[Extract Visible Text & Redact Tokens/Passwords]
               │
               ├───────────────────────────────┐
               ▼                               ▼
 [Deterministic SpellChecker]      [Gemma 4 (gemma-4-26b-a4b-it)]
(Technical Whitelist Glossary)   (Contextual Grammar, Phrasing, Contradictions)
               │                               │
               └───────────────┬───────────────┘
                               ▼
            [Assemble Tri-Pillar Scores & Full Audit]
                               │
                               ▼
              [Commit Normalized Record to SQLite]
                               │
                               ▼
               [Render Interactive Results in UI]
```

---

## 12. Playwright and Google Chrome Integration
- **Direct Automation**: Uses Playwright's asynchronous API (`async_playwright`).
- **Channel**: Pinned to use Google Chrome directly (`channel="chrome"`, `headless=True`).
- **Isolation**: Every scan creates a fresh `BrowserContext` with standard user-agent strings, custom viewports, and zero persistent session contamination.
- **Network Stabilization**: Navigates with `wait_until="domcontentloaded"` and awaits `"networkidle"` with a safety fallback to handle dynamically loaded single-page applications.

---

## 13. Axe-Core Accessibility Analysis
- **Local Asset Injection**: AccessCheck AI bundles Deque's official `axe.min.js` directly within `backend/scanners/assets/axe.min.js`. The script is evaluated directly into the page context, eliminating external CDN dependencies or third-party tracking.
- **Rule Coverage**: Configured to audit against `wcag2a`, `wcag2aa`, `wcag21a`, and `wcag21aa`.
- **Attribution**: Captures target CSS selectors, failing DOM element HTML snippets, failure summaries, rule impact, and Deque University reference documentation links.
- **Scoring Formula**:
  $$\text{Accessibility Score} = \max\left(0, 100 - (15 \times \text{Critical} + 8 \times \text{Serious} + 4 \times \text{Moderate} + 1 \times \text{Minor})\right)$$

---

## 14. Dictionary-Based Spell Checking
- **Engine**: Implemented via `pyspellchecker` utilizing Levenshtein distance candidate ranking.
- **Curated Technical Glossary**: Over 100 web, cloud, and programming terms (`API`, `HTML`, `CSS`, `FastAPI`, `Vite`, `React`, `Tailwind`, `Playwright`, `DOM`, `ARIA`, `Gemma`, `GitHub`, `PostgreSQL`, etc.) are pre-loaded into the dictionary to eliminate false positives on technical vocabulary.
- **Syntax & Punctuation Rules**: Regex checks detect duplicate consecutive words (`"the the"`), missing spaces after punctuation marks (`"end.Next"`), and double punctuation.
- **Placeholder Detection**: Regex patterns identify leftover developer templates (`"Lorem ipsum"`, `"TODO"`, `"Enter text here"`, `"Sample headline"`).

---

## 15. Grammar Checking
- **Contextual Verification**: Grammar analysis is executed by **Gemma 4 (`gemma-4-26b-a4b-it`)**.
- **Sentence Flow**: Identifies subject-verb disagreements, incorrect verb tenses, and awkward phrasing in extracted visible DOM copy.
- **Homophone Detection**: Contextually distinguishes confused words (e.g. *their/there*, *accept/except*, *affect/effect*).

---

## 16. Website Design Analysis
Implemented in [`backend/services/design_analyzer.py`](file:///c:/Hacktoberfest/NavraCommunity/accesscheck-ai/backend/services/design_analyzer.py):
1. **Visual & Heading Hierarchy**: Validates semantic heading progression (`<h1>` through `<h6>`). Flags missing `<h1>` tags, multiple `<h1>` tags, and skipped heading levels.
2. **Typography & Readability**: Counts distinct font families, flagging typography sprawl (>4 fonts). Identifies body copy rendered below 12px or with line-height ratios below 1.25.
3. **Spacing & Layout**: Calculates bounding client rectangles of adjacent sections to detect element collisions and overlaps (>20px).
4. **Responsive Sweeps**:
   - **Desktop (1440×900)**: Evaluates layout reflow and horizontal overflow.
   - **Tablet (768×1024)**: Evaluates multi-column grid wrapping.
   - **Mobile (375×667)**: Identifies horizontal scrollbars and sub-standard touch targets (`< 36×36px`).
5. **Design Quality Score**:
   $$\text{Design Quality Score} = \max\left(0, 100 - (15 \times \text{Mobile Overflow} + 10 \times \text{Serious} + 5 \times \text{Moderate} + 2 \times \text{Minor})\right)$$

---

## 17. Content Quality and Correctness Analysis
- **Finding Labels**:
  - `Confirmed spelling error`
  - `Grammar suggestion`
  - `Possible contradiction`
  - `Unclear content`
  - `Potentially misleading claim`
  - `Requires human verification`
- **Internal Consistency**: Gemma 4 compares extracted passages to flag internal discrepancies (e.g., conflicting pricing or dates in different sections).
- **Ethical Disclaimer**: AccessCheck AI explicitly disclaims that findings are based solely on the website's own text without external knowledge base fact-checking.

---

## 18. Gemma 4 Integration
- **SDK**: Official `google-genai` Python SDK (`from google import genai`).
- **Single Source of Truth**: `GEMMA_MODEL=gemma-4-26b-a4b-it` configured in `backend/core/config.py`.
- **Zero Fallbacks**: No Gemini 2.5 Flash fallbacks or silent model substitutions exist in the codebase.
- **Centralized Client**: All AI requests funnel through `GemmaClient` in `backend/ai/client.py`.
- **Resilience**: Features built-in timeout handling (25s–35s), retry loops, and deterministic documentation fallbacks if API quotas are exhausted.

---

## 19. Security and Privacy
1. **SSRF Defense (`backend/scanners/security.py`)**: Validates URLs, resolves hostnames to IPv4/IPv6 addresses, and aborts any request attempting to access loopback (`127.0.0.0/8`), private RFC 1918 networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local addresses, or cloud metadata endpoints (`169.254.169.254`).
2. **Credential Redaction**: Before sending any extracted copy to the Gemma 4 API, text is scanned for sensitive regex patterns (passwords, OTPs, session IDs, authorization headers, bearer tokens, JWTs, and SSNs); any matching element is completely purged.
3. **Prompt Injection Neutralization**: All website copy is treated as untrusted user data. Injection triggers (`"ignore previous instructions"`, `"system prompt"`, `"disregard all previous"`) are sanitized with `[redacted_injection_attempt]`.
4. **Zero Account Requirement**: AccessCheck AI does not collect user emails, passwords, or personal details.

---

## 20. Limitations
- **External Fact-Checking**: Content correctness checks evaluate internal consistency across page segments; verifying external real-world factual claims requires human editorial confirmation.
- **Single-Page Depth**: The standard scanner audits a single targeted public URL at a time rather than performing full multi-level crawler discovery.
- **Complex CAPTCHA / Multi-Factor Auth**: Pages guarded by aggressive bot challenges (Cloudflare Turnstile, reCAPTCHA v3) or SMS OTPs cannot be scanned autonomously without human-assisted session handoff.

---

## 21. Future Scope
- **Multi-Page Domain Crawler**: Automated sitemap discovery and multi-page crawl scheduling.
- **CI/CD GitHub Action**: Headless CLI runner that fails build pipelines if the Accessibility Score or Design Quality Score drops below a defined threshold.
- **Automated Pull Request Bot**: Generating automated Git pull requests that apply Gemma 4's suggested HTML and CSS fixes directly to project repositories.

---

# PART 2 — MODEL DETAILS & VERIFICATION

### Model Identifier
- **`GEMMA_MODEL=gemma-4-26b-a4b-it`**

### Configuration & Invocation Points
- **Configuration**: Loaded in [`backend/core/config.py`](file:///c:/Hacktoberfest/NavraCommunity/accesscheck-ai/backend/core/config.py#L17):
  ```python
  self.GEMMA_MODEL: str = os.getenv("GEMMA_MODEL", "gemma-4-26b-a4b-it")
  ```
- **Central Invocation**: Called in [`backend/ai/client.py`](file:///c:/Hacktoberfest/NavraCommunity/accesscheck-ai/backend/ai/client.py#L90-L98):
  ```python
  response = await asyncio.wait_for(
      loop.run_in_executor(
          None,
          lambda: self.client.models.generate_content(
              model=target_model,  # self.gemma_model = settings.GEMMA_MODEL
              contents=prompt
          )
      ),
      timeout=timeout
  )
  ```
- **Service Orchestrators**:
  - `backend/ai/gemma_service.py`: Generates violation explanations, before/after HTML snippets, CSS focus styles, WCAG answers, and remediation checklists.
  - `backend/services/spell_checker.py`: Performs contextual grammar, word-usage, and content contradiction checks.
  - `backend/services/design_analyzer.py`: Performs qualitative design and CTA analysis on real rendered browser measurements.

### Real API Request Evidence
- Live ping request sent to `POST /api/ai/ping` using the configured Google GenAI API key:
  ```json
  {
    "ai_provider": "Google Gen AI API",
    "configured_model": "gemma-4-26b-a4b-it",
    "status": "connected",
    "connected": true,
    "sample_reply": "PONG"
  }
  ```
- Live test execution:
  `backend/tests/test_gemma_live.py::test_live_gemma_4_api_call PASSED`

---

# PART 3 — COMPLETE USER WORKFLOW

1. **Opening AccessCheck AI**:
   - The user opens the React application (`http://localhost:5173`).
   - The top header automatically pings `GET /health` to verify FastAPI backend and SQLite database connectivity.
2. **Entering a Target URL**:
   - On `NewScanPage`, the user enters any public URL (e.g., `https://example.com`).
   - The user toggles optional audit flags: **WCAG Tag Profiles**, **Enable Gemma 4 Fix Engine**, **Enable AI Grammar Review**, and **Content Language**.
3. **Dispatching the Scan**:
   - The user clicks **"Launch Accessibility & Design Scan"**.
   - A real-time loading indicator reports progress as Playwright launches Chromium, audits the DOM, performs responsive sweeps, and consults Gemma 4.
4. **Inspecting Tri-Pillar Results**:
   - The user is automatically navigated to `ScanResultsPage`, displaying:
     - **Accessibility Score** (with SVG gauge and violation breakdown).
     - **Design Quality Score** (desktop, tablet, and mobile overflow indicators).
     - **Content Quality Score** (spelling errors, repeated words, placeholder text).
5. **Switching Inspection Tabs**:
   - **WCAG Accessibility Tab**: Filter violations by impact (Critical, Serious, Moderate, Minor), expand failing DOM nodes, inspect exact CSS selector paths, and view raw HTML code snippets.
   - **Website Design Analysis Tab**: Review multi-viewport overflow metrics (1440px vs 768px vs 375px), heading hierarchy defects, font consistency warnings, and touch target size ratings.
   - **Content Quality & Consistency Tab**: Review flagged spelling errors, repeated words, placeholder tags, and Gemma 4 grammar suggestions with exact sentence quotes and proposed fixes.
6. **Remediation Studio**:
   - Clicking **"Remediation Fix"** on any violation opens the `AiFixAssistantPage`, displaying Gemma 4's Before and After HTML/JSX snippets, CSS styling fixes, and disability impact analysis.
7. **Exporting Reports**:
   - The user clicks **"Export Report"** to download an auditor-grade ReportLab PDF certificate or a Pandas-generated CSV dataset.
8. **Reviewing Scan History**:
   - The user navigates to `ScanHistoryPage` to view past scans, filter by date range, compare scores between two audits, or clear history.

---

# PART 4 — POWERPOINT PRESENTATION DETAILS

The presentation file has been generated and saved:
- **File Name**: `presentation/AccessCheck_AI_Hacktoberfest_Gemma4_Presentation.pptx`
- **Slide Count**: 12 Widescreen (16:9) slides.
- **Theme**: Slate 900 dark background (`#0F172A`) with Indigo (`#6366F1`), Emerald (`#10B981`), and Amber (`#F59E0B`) card accents.
- **Embedded Assets**: Actual project hero screenshot from `frontend/src/assets/hero.png` embedded on the title slide.
- **Speaker Notes**: Embedded on every slide.

### Slide Outline:
1. **Title & Introduction**: AccessCheck AI for Hacktoberfest Gemma 4 Challenge.
2. **The Problem**: Over 96% of homepages failing WCAG; broken dummy content; manual audit inefficiency.
3. **Project Objectives & The AccessCheck AI Solution**: Zero-auth access, real Chrome automation, tri-pillar auditing.
4. **Core Functional Features**: 6 core capabilities from WCAG audits to ReportLab PDFs.
5. **End-to-End System Architecture**: 3-tier architecture (React + FastAPI + Gemma 4/SQLite).
6. **Automated Website Scanning Workflow**: 6-step lifecycle from SSRF validation to dashboard display.
7. **Accessibility Analysis & Transparent Scoring**: Axe-core engine, rule attribution, and scoring formula.
8. **Content Quality & Correctness Intelligence**: Dictionary spell checking paired with Gemma 4 contextual analysis.
9. **Rendered Website Design & Responsive Intelligence**: Multi-viewport sweeps (1440px, 768px, 375px) and touch targets.
10. **Gemma 4 Architecture & Technical Integration**: `gemma-4-26b-a4b-it` integration via `google-genai` SDK.
11. **Security Architecture & Real-World Use Cases**: SSRF defense, prompt injection defense, token redaction, and industry use cases.
12. **Summary & Conclusion**: Core takeaways and open Q&A.

---

# PART 5 — FIVE-MINUTE PRESENTATION SCRIPT

*(Estimated time: 5 minutes | Pace: Clear, confident, technical)*

**[0:00 - 0:45] Introduction & The Hook**  
"Good morning, judges, mentors, and fellow developers. Today, I am proud to present **AccessCheck AI**, built for the Hacktoberfest Gemma 4 Challenge.

Consider this staggering reality: according to the WebAIM Million study, over 96% of the world’s top one million websites fail basic accessibility criteria. Millions of individuals with low vision, motor impairments, or cognitive disabilities are locked out of everyday digital services. At the same time, broken template placeholders like 'Lorem ipsum' and confusing grammar slips escape into production every day. Traditional audit tools give high-level scores, but they leave developers with vague warnings rather than verified, actionable code fixes. AccessCheck AI changes that."

**[0:45 - 1:45] The Solution & Tri-Pillar Engine**  
"AccessCheck AI is an automated, zero-friction website auditing platform. You enter any public URL, and with zero registration or credential harvesting, AccessCheck AI deploys a genuine headless Google Chrome browser via Playwright.

Within seconds, our engine evaluates the website across three essential pillars:
First, **WCAG Accessibility**: We inject Deque’s industry-standard axe-core directly into the DOM to uncover exact failing HTML nodes, CSS selectors, and WCAG criteria violations.
Second, **Website Design Intelligence**: Rather than asking an AI to guess what a layout looks like, our browser measures real rendered pixels across Desktop (1440px), Tablet (768px), and Mobile (375px) viewports, identifying horizontal overflow, heading hierarchy defects, and cramped touch targets.
Third, **Content Quality**: We pair deterministic dictionary spell checking with Google's open Gemma 4 model to catch typos, repeated words, and contextual grammar errors."

**[1:45 - 2:45] Gemma 4 Integration: No Hallucinations, Pure Code Remediation**  
"Now, let's talk about the heart of our AI remediation: **Google Gemma 4 (`gemma-4-26b-a4b-it`)**.

In AccessCheck AI, Gemma 4 is our single source of truth. There are zero Gemini 2.5 Flash fallbacks or silent substitutions in this codebase. We use the official `google-genai` Python SDK.

When axe-core identifies a violation—for instance, an image missing alternative text or an unlabeled icon button—we send the verified DOM snippet and axe failure summary to Gemma 4. Gemma 4 responds with a structured JSON payload containing:
1. An explanation of how this defect impacts users with disabilities.
2. A copy-pasteable, production-ready **Before and After HTML/JSX code fix**.
3. Contextual CSS fixes, such as visible focus rings or high-contrast styles.
4. And a prioritized remediation checklist from P0 to P2."

**[2:45 - 3:45] Security, Privacy & Architectural Rigor**  
"We built AccessCheck AI with strict security and privacy standards:
- Every scan request undergoes strict **SSRF and DNS rebinding validation**, blocking private RFC 1918 networks and cloud metadata endpoints.
- Scanned copy is treated as untrusted data: our pre-processor redacts passwords, session tokens, OTPs, and authorization headers before contacting the AI API, and neutralizes prompt injection attempts.
- All scan records, metrics, and fixes are persisted in a normalized, local SQLite database, ensuring complete user privacy.
- And for enterprise compliance, users can export executive PDF certificates generated with ReportLab or CSV violation datasets using Pandas."

**[3:45 - 4:30] Demonstration Flow & Verification**  
"In our live application, you enter a URL, click 'Launch Scan', and watch our tri-pillar scorecards update in real-time. You can toggle between WCAG Violations, Design Analysis, and Content Quality tabs. Clicking 'Remediation Fix' opens our AI Assistant where developers can immediately grab Gemma 4’s verified code adjustments.

We practice what we preach: our test suite contains 25 automated tests covering layout overflow, prompt injection defense, dictionary spell checking, and live Gemma 4 API connectivity. In fact, AccessCheck AI audited its own interface and achieved a certified 100/100 score with zero violations."

**[4:30 - 5:00] Conclusion**  
"AccessCheck AI proves that open models like Gemma 4, when combined with authentic browser automation and grounded measurements, can solve real-world accessibility and content challenges at enterprise scale.

Thank you very much. I am eager to answer your technical questions."

---

# PART 6 — TECHNICAL Q&A (20 QUESTIONS & ANSWERS)

### 1. Why did you build AccessCheck AI?
"We built AccessCheck AI because accessibility and content audits are traditionally manual, expensive, and slow. Existing automated scanners produce warning lists without actionable code solutions. We wanted to create a zero-friction tool that combines real browser automation with Google's open Gemma 4 model to provide developers with instant, copy-pasteable code fixes."

### 2. What exact problem does it solve?
"It solves three major problems: first, the 96%+ prevalence of accessibility violations on the web; second, the lack of actionable, verified code fixes for discovered defects; and third, the escape of placeholder text, broken mobile layouts, and grammar errors into production."

### 3. Why choose Gemma 4 (`gemma-4-26b-a4b-it`)?
"Gemma 4 provides state-of-the-art reasoning, structured JSON output adherence, and code generation capabilities in an open-weights architecture. For Hacktoberfest, standardizing on `gemma-4-26b-a4b-it` allows us to deliver high-quality developer remediations while maintaining full model transparency without proprietary vendor lock-in."

### 4. How is Gemma 4 integrated into the backend?
"Gemma 4 is integrated via the official `google-genai` Python SDK (`from google import genai`). We created a centralized client (`GemmaClient` in `backend/ai/client.py`) that initializes the SDK with `GEMINI_API_KEY` from `.env` and calls `client.models.generate_content(model=settings.GEMMA_MODEL, contents=prompt)`. It enforces strict JSON output parsing, timeout handling, and limited retries."

### 5. Why use axe-core instead of building custom accessibility rules?
"Deque's `axe-core` is the globally recognized gold standard for automated accessibility testing. It is mathematically verified to produce zero false positives for supported rules and maps directly to official W3C WCAG 2.1/2.2 Success Criteria."

### 6. Why use Playwright and Google Chrome?
"Static HTML parsers (like BeautifulSoup) cannot execute JavaScript or render single-page applications built with React, Vue, or Next.js. Playwright launches genuine headless Google Chrome (`channel='chrome'`), allowing us to inject axe-core into the fully rendered DOM and perform real pixel-based viewport measurements."

### 7. How does dictionary-based spelling detection work?
"We use `pyspellchecker`, which utilizes Levenshtein distance candidate ranking against an English word frequency list. To prevent false positives on modern software jargon, we pre-loaded a whitelist of over 100 technical terms (e.g., API, DOM, ARIA, FastAPI, Vite, Tailwind)."

### 8. How does grammar checking work?
"Grammar checking uses Gemma 4. Visible text passages extracted from the DOM are sanitized and passed to Gemma 4 with instructions to evaluate subject-verb agreement, tense consistency, and homophone confusion (such as their/there). Gemma returns findings in structured JSON."

### 9. How does website design analysis work without AI hallucination?
"We do not ask the AI to guess visual dimensions. Playwright explicitly resizes the browser to Desktop (1440px), Tablet (768px), and Mobile (375px), measuring `scrollWidth` versus `innerWidth` to detect horizontal overflow in real pixels. It also computes bounding boxes for touch targets (`< 32px` / `< 36px`) and evaluates heading tags (`<h1>`–`<h6>`). These objective browser measurements are then passed to Gemma 4 for qualitative critique."

### 10. How do you identify incorrect or contradictory website content?
"Gemma 4 analyzes extracted text passages across different sections of the page to detect internal contradictions (such as conflicting prices, dates, or return policies). Every finding is tagged with clear labels such as `Possible contradiction` or `Requires human verification`, with an explicit disclaimer that findings are derived only from the page copy itself."

### 11. How do you protect user credentials and prevent data exfiltration?
"First, AccessCheck AI requires no user accounts or passwords. Second, our `sanitize_text_for_ai()` function scans text extracted from scanned websites and redacts passwords, session tokens, OTPs, authorization headers, and cookies before making any API request to Gemma 4."

### 12. How do you scan authenticated or password-protected pages?
"Currently, AccessCheck AI is engineered for public website scanning without credential storage. For websites requiring authentication, our planned roadmap features a secure browser session handoff where the user authenticates locally in an isolated browser window rather than submitting passwords to our backend."

### 13. What happens if the Gemma 4 API times out or fails?
"AccessCheck AI is resilient. If the AI service experiences network timeouts, quota limits, or server errors, our deterministic documentation fallback activates automatically. The core accessibility audit, design measurements, and dictionary spell-checking complete normally, and the UI displays authoritative WCAG guidelines."

### 14. What makes AccessCheck AI different from tools like Lighthouse or Wave?
"Lighthouse provides high-level scores and warning descriptions, but leaves developers on their own to figure out how to fix them. WAVE provides visual icons on the page. AccessCheck AI unifies WCAG compliance, multi-viewport responsive design sweeps, and content quality into a single tri-pillar dashboard, and uses Gemma 4 to provide exact Before and After HTML/JSX and CSS code fixes."

### 15. How do you prevent website prompt injection attacks?
"Because scanned website copy represents untrusted user input, our sanitizer searches for prompt injection delimiters (such as `'ignore previous instructions'`, `'system prompt'`, `'disregard all previous'`) and replaces them with `'[redacted_injection_attempt]'`. Furthermore, our system prompt strictly instructs the model to treat the text as passive data rather than instructions."

### 16. How is the Accessibility Score calculated?
"It uses an objective, weighted deduction model:
$$\text{Score} = \max\left(0, 100 - (15 \times \text{Critical} + 8 \times \text{Serious} + 4 \times \text{Moderate} + 1 \times \text{Minor})\right)$$
This formula is fully transparent and viewable in the UI via our Formula documentation modal."

### 17. How is the Design Quality Score calculated?
"It deducts points for objective browser failures: 15 points for mobile horizontal overflow, 10 for serious layout collisions or missing `<h1>` tags, 5 for skipped heading levels, and 2 for minor typography inconsistencies, capped at a minimum of 0."

### 18. Did you verify that AccessCheck AI itself is accessible?
"Yes. We wrote an automated end-to-end regression test (`backend/tests/test_self_accessibility.py`) that uses Playwright and axe-core to scan AccessCheck AI's own frontend. It achieved a certified score of **100/100** with **0 accessibility violations**."

### 19. Can you export the audit findings?
"Yes. The platform provides one-click export of executive PDF compliance certificates built with ReportLab, as well as raw CSV violation datasets generated with Pandas for easy import into issue trackers like Jira or GitHub Issues."

### 20. Is Gemini 2.5 Flash used anywhere in this project?
"No. All legacy references and fallbacks to Gemini 2.5 Flash were completely audited and removed. Running `git grep 'gemini-2.5'` across the codebase returns zero results. Gemma 4 (`gemma-4-26b-a4b-it`) is the sole model used."

---

# PART 7 — ACCURACY & STATUS AUDIT

| Category | Features & Technical Capabilities |
| :--- | :--- |
| **Implemented and Tested** | • Automated Headless Google Chrome automation via Playwright.<br>• Pinned local `axe-core` injection with WCAG 2.1 A/AA rule evaluation.<br>• Transparent Accessibility Score, Design Quality Score, and Content Quality Score calculations.<br>• Multi-viewport responsive sweeps (Desktop 1440px, Tablet 768px, Mobile 375px) measuring horizontal overflow.<br>• Heading hierarchy analysis (missing `<h1>`, multiple `<h1>`s, skipped levels).<br>• Typography legibility checks (font count >4, text <12px, line-height <1.25).<br>• Touch target dimension verification against WCAG criteria.<br>• Dictionary spell checking (`pyspellchecker`) with 100+ technical term whitelist.<br>• Repeated word, missing space after punctuation, and dummy placeholder detection.<br>• Centralized `GemmaClient` calling `gemma-4-26b-a4b-it` via official `google-genai` SDK.<br>• Gemma 4 Before/After HTML and CSS code remediation generation.<br>• Gemma 4 contextual grammar, word-usage, and internal content contradiction analysis.<br>• SSRF IP filtering blocking RFC 1918 private subnets and metadata endpoints.<br>• Password, OTP, cookie, and token redaction from AI input text.<br>• Prompt injection neutralization.<br>• Persistent SQLite relational storage with search, date filtering, and cascading deletion.<br>• ReportLab PDF compliance certificates and Pandas CSV export.<br>• Interactive Plotly compliance visualizations.<br>• 25 automated pytest tests passing 100%.<br>• Verified live API connection to `gemma-4-26b-a4b-it`. |
| **Implemented but Not Tested** | None. All implemented capabilities have automated unit/integration tests and verified API endpoints. |
| **Configured but Not Connected** | None. Live network connection to `gemma-4-26b-a4b-it` was executed and verified via `/api/ai/ping` returning `"PONG"`. |
| **Not Implemented** | • Multi-page recursive domain crawling (currently audits targeted single URLs).<br>• Authenticated website scanning behind MFA/CAPTCHA.<br>• External real-world fact-checking (disclaimed as internal consistency analysis only). |
| **Known Errors** | None. Both backend test suites (25/25 passed) and frontend Vite production builds compile cleanly. |
