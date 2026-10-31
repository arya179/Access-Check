import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Theme Colors
    BG_DARK = RGBColor(15, 23, 42)       # Slate 900
    CARD_BG = RGBColor(30, 41, 59)       # Slate 800
    TEXT_LIGHT = RGBColor(248, 250, 252) # White/Slate 50
    TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400
    ACCENT_INDIGO = RGBColor(99, 102, 241) # Indigo 500
    ACCENT_EMERALD = RGBColor(16, 185, 129) # Emerald 500
    ACCENT_AMBER = RGBColor(245, 158, 11)  # Amber 500
    BORDER_COLOR = RGBColor(51, 65, 85)   # Slate 700

    def set_slide_background(slide):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = BG_DARK

    def add_header(slide, title_text, category_text="HACKTOBERFEST GEMMA 4 CHALLENGE"):
        # Category Tracker
        tb_cat = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        tf_cat = tb_cat.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = ACCENT_INDIGO

        # Slide Title
        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.8))
        tf_title = tb_title.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_LIGHT

    def add_card(slide, left, top, width, height, title, points, accent_color=ACCENT_INDIGO):
        # Card Background Shape
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = BORDER_COLOR
        shape.line.width = Pt(1)

        # Card Content
        tb = slide.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), width - Inches(0.5), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = accent_color

        for pt in points:
            p = tf.add_paragraph()
            p.text = f"• {pt}"
            p.font.size = Pt(12)
            p.font.color.rgb = TEXT_LIGHT
            p.space_before = Pt(6)

    # ================= SLIDE 1: Title & Introduction =================
    slide1 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide1)

    tb1 = slide1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(11.0), Inches(4.0))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "HACKTOBERFEST GEMMA 4 CHALLENGE"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_INDIGO

    p1 = tf1.add_paragraph()
    p1.text = "AccessCheck AI"
    p1.font.size = Pt(48)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_LIGHT
    p1.space_before = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = "Autonomous Website Accessibility, Design & Content Quality Intelligence"
    p2.font.size = Pt(20)
    p2.font.color.rgb = ACCENT_EMERALD
    p2.space_before = Pt(8)

    p3 = tf1.add_paragraph()
    p3.text = "Powered by Google Chrome, Playwright, Axe-core & Google Gemma 4 (gemma-4-26b-a4b-it)\nBuilt with React, Vite & Python FastAPI"
    p3.font.size = Pt(13)
    p3.font.color.rgb = TEXT_MUTED
    p3.space_before = Pt(18)

    # Hero image insertion if exists
    hero_path = "frontend/src/assets/hero.png"
    if os.path.exists(hero_path):
        slide1.shapes.add_picture(hero_path, Inches(8.8), Inches(1.8), Inches(3.5))

    slide1.notes_slide.notes_text_frame.text = (
        "Welcome judges and developers. Today I am presenting AccessCheck AI for the Hacktoberfest Gemma 4 challenge. "
        "AccessCheck AI is an automated, zero-friction website auditing platform that inspects real DOM elements, performs multi-viewport design analysis, "
        "validates content spelling and consistency, and leverages Google's open Gemma 4 model (gemma-4-26b-a4b-it) for actionable code remediations."
    )

    # ================= SLIDE 2: Problem Statement =================
    slide2 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide2)
    add_header(slide2, "The Problem: Digital Blind Spots on the Modern Web")

    add_card(slide2, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "Accessibility Barriers", 
             ["Over 96% of top 1M homepages fail WCAG 2.1 Level AA criteria.",
              "Missing alternative text, broken focus rings, and poor color contrast exclude millions of low-vision and assistive tech users.",
              "Legal compliance risks under ADA Title III and European Accessibility Act (EAA)."],
             ACCENT_AMBER)

    add_card(slide2, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "Fragile Content Quality", 
             ["Template dummy text (e.g. 'Lorem ipsum', 'TODO') frequently escapes into production.",
              "Grammar errors and homophone slips (their/there) erode enterprise credibility.",
              "Contradictory information across page sections confuses paying customers."],
             ACCENT_INDIGO)

    add_card(slide2, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "Manual Audit Inefficiency", 
             ["Manual audits take hours and require certified CPACC specialists.",
              "Lighthouse gives high-level scores but lacks automated DOM-level code fixes.",
              "Static linters miss dynamic client-side DOM rendering errors."],
             ACCENT_EMERALD)

    slide2.notes_slide.notes_text_frame.text = (
        "Manual website auditing is tedious, slow, and prone to human error. Over 96% of the web's top one million pages fail basic WCAG standards. "
        "At the same time, broken placeholder content and confusing grammar slips damage brand trust. Existing tools generate scores, but leave developers with vague warnings rather than verified before/after code solutions."
    )

    # ================= SLIDE 3: Objectives & Solution =================
    slide3 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide3)
    add_header(slide3, "Project Objectives & The AccessCheck AI Solution")

    add_card(slide3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Key Project Objectives",
             ["Zero-Friction Auditing: Scan any public website with one click—no account registration or credential harvesting required.",
              "Real Browser Automation: Inspect genuine rendered DOM trees using headless Google Chrome via Playwright.",
              "Tri-Pillar Analysis: Score Accessibility (Axe-core), Design Quality (Browser measurements), and Content Correctness.",
              "Open Gemma 4 Intelligence: Generate validated HTML/CSS code fixes using gemma-4-26b-a4b-it without proprietary fallbacks.",
              "Auditor-Grade Exports: Generate compliance ReportLab PDFs and Pandas CSV datasets."],
             ACCENT_INDIGO)

    add_card(slide3, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "The Unified Solution",
             ["Axe-Core Core Engine: Official Deque bundled library running directly in Chromium without external CDN dependencies.",
              "Multi-Viewport Inspector: Tests Desktop (1440px), Tablet (768px), and Mobile (375px) for horizontal overflow and touch targets.",
              "Hybrid Content Scanner: Combines deterministic dictionary spell-checking with Gemma 4 contextual grammar verification.",
              "Interactive Remediation Suite: Visualizes DOM selectors, provides before/after HTML snippets, and explains disability impacts.",
              "Persistent Local SQLite Store: Stores relational scan history with zero cross-user data leakage."],
             ACCENT_EMERALD)

    slide3.notes_slide.notes_text_frame.text = (
        "AccessCheck AI solves this by introducing a unified tri-pillar auditing engine. It bridges real browser automation with open Gemma 4 intelligence. "
        "Developers enter a URL, and within seconds receive an objective Accessibility Score, Design Quality measurements across three viewports, and an in-depth Content Quality review with verified code solutions."
    )

    # ================= SLIDE 4: Main Features =================
    slide4 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide4)
    add_header(slide4, "Core Functional Features")

    add_card(slide4, Inches(0.8), Inches(1.8), Inches(3.6), Inches(2.3),
             "1. WCAG 2.1 Audit",
             ["Real Chrome automation with pinned local axe-core.",
              "Extracts failing HTML nodes, selectors, and impact severity."],
             ACCENT_INDIGO)

    add_card(slide4, Inches(4.8), Inches(1.8), Inches(3.6), Inches(2.3),
             "2. Design Analysis",
             ["Multi-viewport overflow tests (1440px, 768px, 375px).",
              "Heading hierarchy validation & touch target sizing."],
             ACCENT_AMBER)

    add_card(slide4, Inches(8.8), Inches(1.8), Inches(3.6), Inches(2.3),
             "3. Content Quality",
             ["Dictionary spell checking with tech glossary whitelist.",
              "Repeated words, placeholder ('Lorem ipsum'), and syntax checks."],
             ACCENT_EMERALD)

    add_card(slide4, Inches(0.8), Inches(4.4), Inches(3.6), Inches(2.3),
             "4. Gemma 4 Fix Engine",
             ["Actionable Before/After HTML & CSS code remediations.",
              "Explanations of disability impact (low-vision, motor, cognitive)."],
             ACCENT_INDIGO)

    add_card(slide4, Inches(4.8), Inches(4.4), Inches(3.6), Inches(2.3),
             "5. Interactive Analytics",
             ["Plotly compliance gauges, severity distributions, and deltas.",
              "Side-by-side audit comparison with regression tracking."],
             ACCENT_AMBER)

    add_card(slide4, Inches(8.8), Inches(4.4), Inches(3.6), Inches(2.3),
             "6. Auditor Reports",
             ["Enterprise Python ReportLab PDF compliance certificates.",
              "Pandas CSV violation datasets for ticketing (Jira/GitHub)."],
             ACCENT_EMERALD)

    slide4.notes_slide.notes_text_frame.text = (
        "Our feature suite covers six core capabilities: automated WCAG auditing, multi-viewport responsive design analysis, hybrid content quality checking, "
        "Gemma 4 powered code fixes, Plotly interactive visual analytics, and enterprise PDF and CSV report exports."
    )

    # ================= SLIDE 5: System Architecture =================
    slide5 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide5)
    add_header(slide5, "End-to-End System Architecture")

    # Layer Cards
    add_card(slide5, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Frontend Layer\n(React + Vite)",
             ["Modern Single Page Application (SPA) built with Vite and Tailwind CSS.",
              "Dark/Light theme provider with zero-auth anonymous access.",
              "Custom CircularGauge and interactive Plotly visualization charts.",
              "Configurable API service targeting FastAPI at port 8000.",
              "Accessible ARIA navigation and responsive side drawer."],
             ACCENT_INDIGO)

    add_card(slide5, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Backend Gateway\n(FastAPI + Python 3.14)",
             ["Asynchronous REST API with CORS policies and lifespan validation.",
              "Playwright automation managing headless Google Chrome instances.",
              "Local bundled axe-core asset injection (zero CDN dependencies).",
              "Async aiosqlite relational database layer (scans, violations, fixes).",
              "Strict SSRF and private IP protection filter."],
             ACCENT_EMERALD)

    add_card(slide5, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "AI & Analytics Layer\n(Gemma 4 + Plotly)",
             ["Centralized GemmaClient using official google-genai Python SDK.",
              "Single source of truth: GEMMA_MODEL=gemma-4-26b-a4b-it.",
              "Prompt injection defense: untrusted text sanitization & redaction.",
              "Zero password/cookie/token exfiltration guarantee.",
              "Plotly JSON visualizer & ReportLab PDF generator."],
             ACCENT_AMBER)

    slide5.notes_slide.notes_text_frame.text = (
        "Here is our complete system architecture: A responsive React frontend communicating over asynchronous REST endpoints to FastAPI. "
        "The backend launches headless Google Chrome via Playwright, executes axe-core and design measurements, and coordinates with Gemma 4 for contextual AI insights, saving normalized audits to SQLite."
    )

    # ================= SLIDE 6: Scanning Workflow =================
    slide6 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide6)
    add_header(slide6, "Automated Website Scanning Workflow")

    steps = [
        ("Step 1: Request & SSRF Check", "User enters public URL in UI. Backend validates scheme, resolves DNS, and blocks internal private IP addresses (RFC 1918) to prevent SSRF."),
        ("Step 2: Headless Browser Launch", "Playwright launches Google Chrome (headless). Sets Desktop viewport (1440x900) and navigates with network-idle stabilization."),
        ("Step 3: Axe-Core DOM Execution", "Local axe.min.js is injected directly into page context. axe.run() audits all DOM nodes against WCAG 2.1 A/AA rules."),
        ("Step 4: Design & Responsive Sweep", "Browser takes rendered measurements across Desktop, Tablet (768px), and Mobile (375px) testing overflow, typography, and targets."),
        ("Step 5: Content Extraction & AI Analysis", "Visible text is extracted, sanitized against prompt injection, verified against SpellChecker, and analyzed by Gemma 4."),
        ("Step 6: Storage & Interactive Dashboard", "Full normalized audit is committed to SQLite. Interactive scores, gauges, and before/after fixes render in real-time.")
    ]

    top_pos = 1.8
    for st_title, st_desc in steps:
        shape = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(top_pos), Inches(11.7), Inches(0.75))
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = BORDER_COLOR
        shape.line.width = Pt(1)

        tb = slide6.shapes.add_textbox(Inches(1.0), Inches(top_pos + 0.05), Inches(11.3), Inches(0.65))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = st_title
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = ACCENT_INDIGO

        p_d = tf.add_paragraph()
        p_d.text = st_desc
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = TEXT_LIGHT

        top_pos += 0.85

    slide6.notes_slide.notes_text_frame.text = (
        "The scanning lifecycle executes in six distinct phases. Notice our strict security boundary: every request undergoes SSRF DNS resolution to protect internal networks. "
        "Chromium audits the DOM, performs responsive sweeps across three device widths, sanitizes copy, queries Gemma 4, and persists findings to SQLite."
    )

    # ================= SLIDE 7: Accessibility Analysis =================
    slide7 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide7)
    add_header(slide7, "Axe-Core & Algorithmic Accessibility Scoring")

    add_card(slide7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Axe-Core Engine & Standards",
             ["Integrated Standards: WCAG 2.0, 2.1, 2.2 Levels A & AA, and Section 508.",
              "Pinned Local Asset: Pinned axe.min.js bundled within backend/scanners/assets (zero external CDN network requests).",
              "DOM Element Attribution: Extracts failing HTML strings, CSS selector paths, and axe-core check guidance.",
              "Severity Classification: Critical (blockers), Serious (high barrier), Moderate (impediment), Minor (enhancement).",
              "Deterministic Scoring: Objective penalty deductions ensure 100% reproducible results."],
             ACCENT_INDIGO)

    add_card(slide7, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Transparent Scoring Formula",
             ["Formula: Score = max(0, 100 - (15×Critical + 8×Serious + 4×Moderate + 1×Minor))",
              "Pass Rate: (Passed Rules / Total Rules Tested) × 100",
              "Self-Accessibility Verification: AccessCheck AI's own frontend was audited with axe-core, achieving a certified 100/100 score.",
              "Zero Black-Box Scoring: Full formula is documented and accessible directly within the user interface via a dedicated modal.",
              "Auditor Consistency: Scans of the same page produce identical, verifiable scores."],
             ACCENT_EMERALD)

    slide7.notes_slide.notes_text_frame.text = (
        "We avoid black-box vanity scores. Our accessibility evaluation utilizes Deque's industry-standard axe-core with a mathematically transparent deduction formula: "
        "Critical violations deduct 15 points, Serious deduct 8, Moderate deduct 4, and Minor deduct 1. In fact, AccessCheck AI has audited its own interface, achieving a 100/100 score with zero violations."
    )

    # ================= SLIDE 8: Spelling & Content Intelligence =================
    slide8 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide8)
    add_header(slide8, "Content Quality & Correctness Intelligence")

    add_card(slide8, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Deterministic Checks",
             ["Dictionary Engine: Powered by pyspellchecker using Levenshtein distance candidate ranking.",
              "Technical Whitelist: Preloaded with 100+ web and cloud terms (API, DOM, ARIA, FastAPI, Vite, Tailwind, etc.) preventing false positives.",
              "Repeated Words: Regex detection catches accidental duplicated words (e.g. 'the the').",
              "Spacing & Punctuation: Detects missing spaces after punctuation and double punctuation.",
              "Placeholder Scanner: Flags 'Lorem ipsum', 'TODO', and 'Enter text here' template copy."],
             ACCENT_EMERALD)

    add_card(slide8, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Gemma 4 Contextual Intelligence",
             ["Grammar & Syntax: Detects subject-verb disagreements, wrong tenses, and awkward syntax.",
              "Homophone Verification: Identifies contextually incorrect words (their/there, accept/except).",
              "Standardized Finding Labels: Confirmed spelling error, Grammar suggestion, Possible contradiction, Unclear content, Requires human verification.",
              "Internal Consistency: Identifies conflicting statements across page passages.",
              "Ethical Disclaimer: Explicitly disclaims that findings are based solely on page text without external fact-checking."],
             ACCENT_INDIGO)

    slide8.notes_slide.notes_text_frame.text = (
        "Our content quality engine pairs deterministic dictionary checking with Gemma 4 contextual intelligence. "
        "While dictionary checks catch outright spelling mistakes, Gemma 4 evaluates grammatical flow, homophones, and internal contradictions. Every finding is labeled transparently, noting whether human verification is required."
    )

    # ================= SLIDE 9: Design Analysis =================
    slide9 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide9)
    add_header(slide9, "Rendered Website Design & Responsive Intelligence")

    add_card(slide9, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Visual Hierarchy & Typography",
             ["Heading Structure: Flags missing <h1>, multiple <h1>s, and skipped heading hierarchy levels (h1 -> h3).",
              "Typography Discipline: Detects excessive font families (>4 distinct fonts) causing visual chaos.",
              "Legibility Checks: Flags body copy with font size < 12px or tight line-height ratio (<1.25).",
              "CTA Prominence: Evaluates button color contrast and text discernibility."],
             ACCENT_AMBER)

    add_card(slide9, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Layout & Responsive Sweeps",
             ["Desktop (1440×900): Flags horizontal scrollbars and container overflow.",
              "Tablet (768×1024): Tests grid collapsing and column wrapping.",
              "Mobile (375×667): Detects critical mobile horizontal overflow.",
              "Element Collisions: Calculates bounding client rectangles to detect overlapping elements (>20px)."],
             ACCENT_INDIGO)

    add_card(slide9, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Interactive Usability",
             ["Touch Target Sizing: Measures rendered interactive elements against WCAG 2.5.5 / 2.5.8 (min 44x44px / 32x32px).",
              "Mobile Usability: Flags cramped links and buttons prone to accidental touch on smartphones.",
              "Grounding: Browser measurements are passed to Gemma 4; AI cannot invent pixel values.",
              "Objective Score: Deducts 15 for mobile overflow, 10 for serious defects."],
             ACCENT_EMERALD)

    slide9.notes_slide.notes_text_frame.text = (
        "Rather than asking an AI to guess what a website looks like, AccessCheck AI performs actual rendered browser measurements across Desktop, Tablet, and Mobile viewports. "
        "We measure heading hierarchy, font consistency, touch target sizes, and horizontal overflow in real pixels before Gemma 4 provides qualitative design critique."
    )

    # ================= SLIDE 10: Gemma 4 Integration =================
    slide10 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide10)
    add_header(slide10, "Gemma 4 Architecture & Technical Integration")

    add_card(slide10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Gemma 4 Configuration",
             ["Model Identifier: GEMMA_MODEL=gemma-4-26b-a4b-it",
              "SDK: Official google-genai Python SDK (from google import genai).",
              "Centralized Client: backend/ai/client.py (GemmaClient) is the sole AI invocation gateway.",
              "Single Source of Truth: No Gemini 2.5 Flash fallbacks or silent model substitutions.",
              "Credential Privacy: API key loaded strictly from backend .env; zero exposure to frontend JavaScript.",
              "Live Verification: Real ping connectivity tested via POST /api/ai/ping."],
             ACCENT_INDIGO)

    add_card(slide10, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "AI Powered Features",
             ["1. Violation Explanation: Explains WCAG criteria and technical causes.",
              "2. HTML Code Fixes: Generates before/after accessible markup.",
              "3. CSS Styling Fixes: Provides focus visible rings and contrast rules.",
              "4. Disability Impact: Details low-vision, cognitive, and motor barriers.",
              "5. Contextual Content Analysis: Grammar, wording, and consistency.",
              "6. Remediation Checklist: Generates prioritized P0/P1/P2 developer action items.",
              "7. Report Delta: Compares score progression between two audits."],
             ACCENT_EMERALD)

    slide10.notes_slide.notes_text_frame.text = (
        "Gemma 4 is the heart of our AI remediation capabilities. We use the official google-genai SDK locked strictly to gemma-4-26b-a4b-it. "
        "There are no Gemini 2.5 Flash fallbacks in this codebase. Gemma 4 generates before/after HTML code fixes, explains disability impacts, validates content phrasing, and produces prioritized remediation checklists."
    )

    # ================= SLIDE 11: Security & Real-World Use Cases =================
    slide11 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide11)
    add_header(slide11, "Security Architecture & Real-World Use Cases")

    add_card(slide11, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Security & Privacy Controls",
             ["SSRF & DNS Rebinding Shield: Resolves hostnames and blocks private RFC 1918 IPs (10.0.0.0/8, 127.0.0.0/8, 192.168.0.0/16, metadata endpoints).",
              "Data Exfiltration Defense: Scans input text and drops passwords, OTPs, session tokens, JWTs, and authorization headers before calling AI.",
              "Prompt Injection Neutralization: Website copy is treated as untrusted data; regex filters sanitize injection delimiters.",
              "Zero Account Requirement: Users audit public sites without submitting email addresses or credentials.",
              "Deterministic Fallback: If AI API experiences quota or network timeout, core accessibility and spelling scans continue uninterrupted."],
             ACCENT_AMBER)

    add_card(slide11, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Real-World Industry Applications",
             ["Enterprise CI/CD Pipelines: Automated accessibility and content linting before production web deployments.",
              "E-Commerce Audits: Ensuring checkout buttons, product pricing, and mobile touch targets comply with accessibility laws.",
              "Government & Public Sector: Conforming with Section 508 and European Accessibility Act (EAA) compliance.",
              "Digital Agencies: Rapidly generating white-labeled PDF accessibility compliance certificates for clients.",
              "SEO & Quality Assurance: Eliminating broken placeholder copy and mobile overflow penalties simultaneously."],
             ACCENT_EMERALD)

    slide11.notes_slide.notes_text_frame.text = (
        "Security is engineered into every layer. We protect private networks from SSRF attacks, redact passwords and session tokens before contacting the AI API, "
        "and treat website copy as untrusted data. Real-world users include engineering teams integrating audits into CI/CD, digital agencies exporting client compliance certificates, and public sector organizations meeting legal mandates."
    )

    # ================= SLIDE 12: Conclusion & Q&A =================
    slide12 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide12)
    add_header(slide12, "Summary & Conclusion")

    tb_c = slide12.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.7), Inches(4.8))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True

    p_c0 = tf_c.paragraphs[0]
    p_c0.text = "Key Takeaways"
    p_c0.font.size = Pt(20)
    p_c0.font.bold = True
    p_c0.font.color.rgb = ACCENT_INDIGO

    takeaways = [
        "1. Complete Tri-Pillar Engine: Unifies WCAG accessibility, multi-viewport responsive design analysis, and content quality into one coherent dashboard.",
        "2. Grounded Browser Measurements: Zero hallucinated pixel counts or fake scores. All findings stem from real Chromium measurements and Deque Axe-core.",
        "3. Google Gemma 4 (gemma-4-26b-a4b-it): Pure open-model integration powering actionable HTML/CSS code fixes and contextual content verification.",
        "4. Production Ready & Verified: 25 automated backend tests passing, live Gemma 4 API verified, and React production build fully compiling.",
        "5. Ethical & Open Source: Built for Hacktoberfest to make the open web universally accessible, readable, and inclusive."
    ]

    for item in takeaways:
        p = tf_c.add_paragraph()
        p.text = item
        p.font.size = Pt(14)
        p.font.color.rgb = TEXT_LIGHT
        p.space_before = Pt(12)

    p_qa = tf_c.add_paragraph()
    p_qa.text = "\nThank you! Questions & Discussion."
    p_qa.font.size = Pt(24)
    p_qa.font.bold = True
    p_qa.font.color.rgb = ACCENT_EMERALD
    p_qa.space_before = Pt(20)

    slide12.notes_slide.notes_text_frame.text = (
        "In conclusion, AccessCheck AI demonstrates the practical power of Google's Gemma 4 model when paired with real browser automation. "
        "It empowers developers to build an accessible, beautifully responsive, and typo-free web with actionable code guidance. Thank you, and I look forward to your questions."
    )

    output_path = "presentation/AccessCheck_AI_Hacktoberfest_Gemma4_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully at: {output_path}")

if __name__ == "__main__":
    create_deck()
