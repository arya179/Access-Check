# AccessCheck AI 🌐♿

**AccessCheck AI** is an AI-powered enterprise website accessibility auditing platform that combines headless Google Chrome automation with Deque's Axe-core and Google Gemini AI (`google-genai`).

AccessCheck AI audits real DOM elements, calculates algorithmic scores, visualizes compliance distributions with Plotly, stores persistent audits in SQLite, generates ReportLab PDF compliance certificates, and uses Google Gemini to explain violations and produce before/after code fixes.

---

## 🌟 Key Architecture & Capabilities

1. **Automated Axe-Core Auditing**:
   - Launches existing Google Chrome (`channel="chrome"`, `headless=True`).
   - Uses local bundled `axe.min.js` (zero dependency on external CDNs).
   - Strict SSRF and private IP protection (`backend/scanners/security.py`).
2. **Google Gemini Remediation (`POST /api/ai/explain`)**:
   - Official `google-genai` Python SDK integration reading credentials from `.env`.
   - Structured JSON output with disability impacts, technical causes, implementation steps, and before/after HTML snippets.
   - Built-in timeout, retries, and authoritative axe documentation fallback.
3. **Interactive Visualizations & Analytics**:
   - Plotly.js charts (score gauge, severity donut, moving average score trajectory, WCAG principles distribution, and cross-website comparison).
   - PNG export functionality for reports and presentations.
4. **Persistent Relational SQLite Storage**:
   - Normalized relational tables: `scans`, `violations`, `ai_recommendations`.
   - Search by URL/domain, filter by date range, side-by-side scan comparison, and cascading deletion.
5. **Auditor-Grade Reports**:
   - Professional PDF compliance certificates generated with **Python ReportLab**.
   - Violation datasets exported with **Pandas** to CSV.
6. **Self-Audited Accessibility Conformance**:
   - The platform itself has been audited with axe-core via automated end-to-end testing, scoring **100/100** with **0 accessibility violations**.

---

## 📁 Project Architecture

```
AccessCheck-AI/
├── Dockerfile                            # Production container image with Google Chrome & Playwright
├── backend/
│   ├── api/routes.py                     # All REST endpoints (scan, AI explain, analytics, reports, history)
│   ├── core/config.py                    # Environment & pydantic-settings
│   ├── models/database.py                # Persistent SQLite layer (scans, violations, ai_recommendations)
│   ├── schemas/                          # Pydantic validation models (audit.py, ai.py)
│   ├── services/audit_service.py         # Full scan orchestration service
│   ├── scanners/
│   │   ├── axe_scanner.py                # Playwright Chromium + Deque Axe engine
│   │   ├── security.py                   # SSRF, DNS resolution & IP validator
│   │   └── assets/axe.min.js             # Local pinned axe-core JavaScript bundle
│   ├── ai/
│   │   ├── gemini.py                     # Gemini remediator
│   │   └── gemini_explainer.py           # Structured JSON explainer with fallback
│   ├── analytics/
│   │   ├── analytics_service.py          # Plotly + Pandas + NumPy figures
│   │   ├── visualizer.py                 # Plotly chart builders
│   │   └── graphify_tracker.py           # Graphify codebase architecture mapper
│   ├── reports/
│   │   ├── exporter.py                   # ReportLab PDF & Pandas CSV exporters
│   │   └── generator.py                  # Markdown & JSON report export
│   └── tests/
│       ├── test_analytics.py             # Analytics endpoints test suite
│       ├── test_api.py                   # REST API & AI fallback test suite
│       ├── test_database.py              # SQLite lifecycle test suite
│       ├── test_reports.py               # ReportLab PDF & CSV test suite
│       ├── test_scanner.py               # Security & real scanner test suite
│       └── test_self_accessibility.py    # Self-audit of AccessCheck AI UI
├── frontend/
│   ├── vercel.json                       # Vercel deployment single-page rewrite rules
│   ├── src/
│   │   ├── components/                   # Sidebar, Header, CircularGauge
│   │   ├── context/ThemeContext.jsx      # Dark & light theme toggle
│   │   ├── data/                         # WCAG guidelines, learning hub, scoring models
│   │   ├── pages/                        # 10 full pages (Dashboard, NewScan, ScanResults, AiFix, etc.)
│   │   ├── services/api.js               # Reusable API service with timeout & retry
│   │   ├── App.jsx
│   │   └── index.css                     # Accessible focus rings, sr-only, skip link
│   ├── index.html                        # Accessible HTML5 document structure
│   └── package.json
├── graphify-out/                         # Graphify topology graph artifacts
├── venv/                                 # Virtual environment
├── .env & .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

## ⚙️ Environment Variables Reference

### Backend (`.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Listening port for FastAPI server | `8000` |
| `HOST` | Bind host address | `0.0.0.0` |
| `ENVIRONMENT` | Environment mode (`development` or `production`) | `development` |
| `FRONTEND_URL` | Allowed origin for production CORS policy | `http://localhost:5173` |
| `GEMINI_API_KEY` | Google AI Studio API key for Gemini remediation | `""` (Falls back cleanly) |
| `GEMINI_MODEL` | Google Gemini model identifier | `gemini-2.5-flash` |
| `DATABASE_PATH` | Local SQLite database file location | `accesscheck.db` |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the running FastAPI backend | `http://localhost:8000` |

---

## 🚀 Local Development Setup

### 1. Backend Server Setup

```powershell
cd accesscheck-ai

# Activate venv
.\venv\Scripts\Activate.ps1

# Install dependencies (already pinned in requirements.txt)
pip install -r requirements.txt

# Configure environment (optional: set your GEMINI_API_KEY)
cp .env.example .env

# Run FastAPI with Uvicorn
python -m uvicorn backend.main:app --port 8000 --reload
```

- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Frontend Development Server

```powershell
cd accesscheck-ai\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)

---

## 🌐 Production Deployment Guide

### Option A: Frontend Deployment (Vercel)
1. Push your repository to GitHub.
2. In the Vercel Dashboard, select **Add New Project** and choose the `frontend/` directory as the root.
3. Configure the Framework Preset as **Vite**.
4. Add the Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://api.accesscheck.ai`).
5. Deploy. The included [`frontend/vercel.json`](file:///c:/Hacktoberfest\NavraCommunity\accesscheck-ai\frontend\vercel.json) automatically handles single-page application routing.

### Option B: Backend Deployment (Docker / Cloud Run / Render / Railway)
Because Playwright requires browser dependencies and Google Chrome, deploy using the included container configuration:
```bash
# Build production Docker image
docker build -t accesscheck-ai-backend .

# Run container with persistent SQLite volume and API Key
docker run -d -p 8000:8000 \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  -e ENVIRONMENT="production" \
  -e FRONTEND_URL="https://your-app.vercel.app" \
  -v accesscheck_data:/app/data \
  accesscheck-ai-backend
```

---

## 🧪 Comprehensive Automated Test Suite

Run all 11 unit, integration, report, and self-accessibility tests:

```powershell
cd accesscheck-ai
$env:PYTHONPATH="."
.\venv\Scripts\pytest.exe -v
```

All 11 test modules pass cleanly.
