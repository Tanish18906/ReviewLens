# ReviewLens — AI-Driven Fake Review & Sentiment Manipulation Detection System

[![Project Status: Active Development](https://img.shields.io/badge/Project%20Status-Active%20Development-amber.svg?style=for-the-badge&logo=git)](https://github.com/Tanish18906/ReviewLens)
[![Academic Release: Semester 3](https://img.shields.io/badge/Release-Semester%203%20Prototype%20(v1.0)-pink.svg?style=for-the-badge)](docs/viva_notes.md)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016%20(ACID)-336791.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Pytest: 27/27 Passed](https://img.shields.io/badge/Tests-27%2F27%20Passing%20(100%25)-brightgreen.svg?style=for-the-badge&logo=pytest&logoColor=white)](docs/test_results.md)
[![WCAG 2.2 AA Compliant](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA%20Verified-blueviolet.svg?style=for-the-badge)](docs/test_results.md#5-ux-stabilization--responsive-verification-23-october-2026)

---

> [!WARNING]
> ### ⚠️ Project Status: In Active Development
> **ReviewLens** is an ongoing, multi-semester academic engineering project.  
> The current milestone is the **Semester 3 Prototype (v1.0)**, which establishes the core foundation:
> 
> * **Completed in Semester 3 (Current):** Secure authentication (Argon2 + JWT), relational PostgreSQL data models with ACID guarantees, one-review-per-student constraints (`UNIQUE(user_id, product_id)`), deterministic NLP text normalization pipeline, real-time descriptive review analytics, 100% offline dataset ingestion (UCI Amazon benchmark corpus), and production-quality UX stabilization with full WCAG 2.2 AA accessibility.
> * **Actively in Development for Semesters 4–6:** Machine learning sentiment classification (Naive Bayes, Support Vector Machines, Logistic Regression), deep learning transformers, automated fake-review pattern detection, reviewer credibility scoring, and model explainability dashboards.

---

## 🌸 Visual Showcase ("Blush & Bloom" Storefront)

The frontend features the approved **Blush & Bloom** (*"A little world of lovely things"*) boutique visual identity — combining soft pastel aesthetics with robust, production-grade responsive engineering.

### 1. Curated Boutique Catalog (Desktop — 1280px)
![Desktop Catalog Storefront](screenshots/after/guest-products-1280.png)
*Curated storefront showing category navigation, search, live rating counters, and student review metrics.*

---

### 2. Administrator Analytics Dashboard (Desktop — 1280px)
![Admin Analytics Dashboard](screenshots/after/admin-dashboard-1280.png)
*Dynamic PostgreSQL-driven analytics: 4 responsive KPI cards, 5-star distribution chart, top-reviewed inventory, and recent submissions.*

---

### 3. Mobile Storefront & Adaptive Layouts (375px & 768px)
| Mobile Storefront (375px) | Tablet Admin Subnav (768px) |
|:---:|:---:|
| ![Mobile Storefront](screenshots/after/guest-products-375.png) | ![Tablet Admin Dashboard](screenshots/after/admin-dashboard-768.png) |
| *Fluid mobile layout with $\ge 44\text{px}$ touch targets.* | *Adaptive horizontal navigation bar preventing screen cramping.* |

---

### 4. Compact & Accessible Account Menu
![Account Menu](screenshots/after/long-username-1024.png)
*Accessible dropdown menu with keyboard trapping (`Arrow` keys, `Escape`), focus restoration, and graceful name truncation for long titles.*

---

## 🗺️ Academic Scope & Development Roadmap

| Semester Phase | Focus Area | Status | Key Deliverables |
|---|---|---|---|
| **Semester 3** *(Current)* | **Data Ingestion, Schema & Foundation** | **FROZEN & VERIFIED** | PostgreSQL ACID relational models, FastAPI REST endpoints, deterministic text cleaning, 100-sentence UCI benchmark corpus, descriptive analytics, Blush & Bloom UI stabilization, WCAG 2.2 AA compliance. |
| **Semester 4** | **Supervised Sentiment Baseline** | *In Development* | TF-IDF & Bag-of-Words feature extraction, supervised ML classifiers (MultinomialNB, LinearSVC, LogisticRegression), train/validation/test splits, precision/recall/F1 evaluation matrix. |
| **Semester 5** | **Fake Review Detection Engine** | *Planned* | Feature engineering for text irregularity, duplicate detection, sentiment-rating mismatch heuristics, behavioral metadata modeling. |
| **Semester 6** | **Explainable AI & Final Deployment** | *Planned* | SHAP/LIME explainability overlays, real-time trust scoring dashboard, full containerized production deployment. |

---

## ⚡ Complete Beginner's Setup Guide (From Very Scratch)

Follow these step-by-step instructions to run ReviewLens on your computer.

### Prerequisites Check

Before starting, make sure you have the following installed on your machine:

1. **Python 3.11+**
   ```bash
   python3 --version
   # Expected: Python 3.11.x or higher
   ```
2. **Node.js (v18 or higher) & npm**
   ```bash
   node -v
   npm -v
   # Expected: Node v18+ and npm v9+
   ```
3. **Git**
   ```bash
   git --version
   ```
4. **PostgreSQL 16** (Either via **Docker** [easiest] OR a **Native Local Installation**)

---

### Step 0: Clone the Repository

Open your terminal (or Command Prompt / PowerShell on Windows) and clone the project:

```bash
git clone https://github.com/Tanish18906/ReviewLens.git
cd ReviewLens
```

---

### Step 1: Start PostgreSQL Database

You can run PostgreSQL in **one command using Docker** (recommended) or use an **existing local PostgreSQL service**.

#### Option A: Using Docker (Recommended — Fastest)
Run the following command to start an isolated, pre-configured PostgreSQL container:

```bash
docker run -d \
  --name reviewlens-postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=reviewlens_sem3 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine
```

#### Option B: Using Native Local PostgreSQL
If you already have PostgreSQL installed natively on your system:
```bash
# Access PostgreSQL prompt
psql -U postgres

# In psql, run:
CREATE DATABASE reviewlens_sem3;
\q
```

---

### Step 2: Set Up & Start Backend (FastAPI)

Navigate to the `backend/` directory:

```bash
cd backend
```

#### 2.1 Create & Activate a Python Virtual Environment

- **On Linux / macOS:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```
- **On Windows (PowerShell):**
  ```powershell
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  ```
- **On Windows (Command Prompt):**
  ```cmd
  python -m venv .venv
  .\.venv\Scripts\activate.bat
  ```

#### 2.2 Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 2.3 Configure Environment Variables
Copy the default environment configuration file:

- **On Linux / macOS:**
  ```bash
  cp .env.example .env
  ```
- **On Windows:**
  ```powershell
  copy .env.example .env
  ```

*(The default `.env` is already pre-configured to connect to `postgresql://postgres:postgres@localhost:5432/reviewlens_sem3`.)*

#### 2.4 Initialize Database & Seed Demo Data
Run the deterministic seed script to automatically build tables and populate 1 Admin, 6 Students, 16 Boutique Products, and 68 baseline reviews:

```bash
python scripts/seed_demo.py --reset
```

#### 2.5 Ingest UCI Benchmark Corpus
Import 100 offline review sentences from the UCI Amazon sentiment dataset:

```bash
python scripts/import_corpus.py
```

#### 2.6 Launch FastAPI Server
```bash
uvicorn app.main:app --reload --port 8000
```

> **Backend is now live!**  
> - API Base URL: `http://localhost:8000`  
> - Interactive Swagger UI Docs: `http://localhost:8000/docs`  
> - ReDoc Specification: `http://localhost:8000/redoc`  

*(Keep this terminal window open.)*

---

### Step 3: Set Up & Start Frontend (React + Vite)

Open a **new terminal tab or window**, navigate to the `frontend/` directory:

```bash
cd ReviewLens/frontend
```

#### 3.1 Install Dependencies
```bash
npm install
```

#### 3.2 Start the Development Server
```bash
npm run dev
```

> **Frontend is now running!**  
> Open your browser and visit: **`http://localhost:5173`**

*(Optional) To test a production build:*
```bash
npm run build
npm run preview
```

---

## 🔑 Pre-Seeded Demonstration Accounts

ReviewLens includes deterministic demonstration accounts for testing both guest, student, and administrator workflows.

| Role | Display Name | Email | Password | Permissions & Features |
|---|---|---|---|---|
| **Administrator** | ReviewLens Administrator | `admin@reviewlens.edu` | `Admin@ReviewLens2026` | Full Admin Analytics Dashboard, inventory metrics, system overview |
| **Student 1** | Aarav Sharma | `student1@reviewlens.edu` | `Student@ReviewLens1` | Browse catalog, view ratings, submit 1 review per product |
| **Student 2** | Riddhima Patel | `student2@reviewlens.edu` | `Student@ReviewLens2` | Browse catalog, view ratings, submit 1 review per product |
| **Student 3** | Karan Verma | `student3@reviewlens.edu` | `Student@ReviewLens3` | Browse catalog, view ratings, submit 1 review per product |
| **Student 4** | Sneha Kulkarni | `student4@reviewlens.edu` | `Student@ReviewLens4` | Browse catalog, view ratings, submit 1 review per product |
| **Student 5** | Rohan Gupta | `student5@reviewlens.edu` | `Student@ReviewLens5` | Browse catalog, view ratings, submit 1 review per product |
| **Student 6** | Ananya Joshi | `student6@reviewlens.edu` | `Student@ReviewLens6` | Browse catalog, view ratings, submit 1 review per product |

> [!TIP]
> **One-Click Demo Sign-In:** On the Sign In screen (`/login`), click any quick-fill button (`Admin Demo`, `Student Demo`) to automatically populate valid credentials.

---

## 🧪 Automated Testing & Verification Suite

ReviewLens includes a comprehensive, 100% passing automated test suite covering unit tests, role-based access control, relational database constraints, and descriptive analytics.

### Running Backend Tests
From the `backend/` directory with virtual environment activated:

```bash
cd backend
source .venv/bin/activate    # Or .\.venv\Scripts\Activate.ps1 on Windows
python -m pytest tests/ -v
```

### Test Suite Execution Output
```text
============================= test session starts ==============================
platform linux -- Python 3.11.16, pytest-8.4.2, pluggy-1.7.0
rootdir: ReviewLens/backend
plugins: anyio-4.15.1
collected 27 items

tests/test_analytics.py .....                                            [ 18%]
tests/test_auth.py ..........                                            [ 55%]
tests/test_reviews.py ............                                       [100%]

======================== 27 passed, 1 warning in 3.41s =========================
```

### Verified Real-World API Latencies (Local Benchmark)

| API Operation / Endpoint | Target Threshold | Actual Median Latency | Status |
|---|---|---|---|
| `GET /api/products` (Catalog list with grouped SQL metrics) | $\le 400\text{ ms}$ | **13.66 ms** | **PASS** (29x faster) |
| `GET /api/admin/overview` (Real-time analytics aggregations) | $\le 400\text{ ms}$ | **20.30 ms** | **PASS** (19x faster) |
| `POST /api/products/:slug/reviews` (End-to-end ACID submission) | $\le 1000\text{ ms}$ | **60.88 ms** | **PASS** (16x faster) |
| Frontend Production Build (`vite build`) | $\le 10.0\text{ s}$ | **3.89 s** | **PASS** |

---

## ♿ UX & Accessibility Stabilization (WCAG 2.2 AA)

During the Semester 3 stabilization milestone, all routes were audited using Playwright across 8 standard viewports (`320px`, `375px`, `390px`, `768px`, `1024px`, `1280px`, `1440px`, and `1920px`):

1. **Content-Aware Sticky Header:**
   - Fixed header maintains a strict **72px** height across all viewports without wrapping brand or navigation items onto multiple rows.
   - User profile gracefully truncates long names and presents a keyboard-accessible Account Menu (`role="menu"` with `ArrowDown`/`ArrowUp` navigation and `Escape` dismissal).
   - Global scroll clearance (`html { scroll-padding-top: 5rem; }` and `scroll-mt-24` on `#review-form`) ensures in-page links are never obscured by the sticky header.
2. **Responsive Admin Dashboard:**
   - 232px sidebar smoothly collapses into a horizontal navigation bar below 1024px.
   - KPI metrics cards adapt cleanly (`sm:grid-cols-2 xl:grid-cols-4`), eliminating cramped 4-column distortion on medium screens.
   - Tables are isolated with `overflow-x-auto` to prevent wide data from expanding page viewports.
3. **Zero Horizontal Overflow:**
   - Verified `document.documentElement.scrollWidth === window.innerWidth` across all pages and viewports. **Zero arbitrary `overflow-x: hidden` hacks were used.**
4. **Touch Targets & Form Usability:**
   - Interactive elements (search clear button, star rating radios, category pills, pagination buttons) provide minimum **44×44px** hit areas.
   - Text inputs enforce a 16px minimum font size on mobile to prevent iOS Safari auto-zoom.

---

## 📂 Project Directory Structure

```text
ReviewLens/
├── backend/                        # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py                 # FastAPI application entry point & CORS
│   │   ├── config.py               # Pydantic BaseSettings (.env loading)
│   │   ├── db.py                   # SQLAlchemy engine & session factory
│   │   ├── models.py               # PostgreSQL SQLAlchemy ORM models
│   │   ├── schemas.py              # Pydantic v2 validation models
│   │   ├── security.py             # Argon2 password hashing & JWT handling
│   │   ├── dependencies.py         # Auth bearer guards & admin RBAC
│   │   ├── routes/
│   │   │   ├── auth.py             # User registration & token endpoints
│   │   │   ├── products.py         # Product catalog & review submission
│   │   │   └── admin.py            # Descriptive analytics aggregation
│   │   └── services/
│   │       └── preprocess.py       # Deterministic text normalization pipeline
│   ├── scripts/
│   │   ├── seed_demo.py            # Deterministic database reset & seed
│   │   └── import_corpus.py        # Idempotent UCI Amazon corpus importer
│   ├── tests/                      # 27 Pytest integration & unit tests
│   └── requirements.txt            # Python dependencies
├── frontend/                       # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── app/App.tsx             # Root router & authentication context
│   │   ├── components/             # Reusable UI components (Header, RatingStars...)
│   │   ├── pages/                  # ProductsPage, ProductDetailPage, AdminDashboardPage...
│   │   ├── lib/                    # api.ts (Fetch wrapper), auth.tsx (Auth hook)
│   │   └── styles/index.css        # Blush & Bloom design tokens & base rules
│   ├── public/                     # Static boutique imagery & product illustrations
│   └── package.json                # Frontend dependencies & build scripts
├── screenshots/                    # Visual Verification Archive
│   ├── before/                     # 39 baseline screenshots (documenting previous issues)
│   └── after/                      # 34 refined screenshots (documenting stabilized layouts)
├── data/
│   ├── uci_amazon_sample.tsv       # 100 review sentences from UCI ML repository
│   └── SOURCE.md                   # Provenance, license (CC BY 4.0), and attribution
└── docs/
    ├── architecture.md             # System architecture & data flow diagrams
    ├── api_contract.md             # Complete JSON REST API contracts
    ├── test_results.md             # Empirical test results, benchmarks & audit matrix
    └── viva_notes.md               # Viva defense pitch, examiner Q&A & team split
```

---

## 📚 Academic Documentation Pack

For detailed technical evaluation and examiner defense, refer to the documents in `docs/`:

- 📐 **[System Architecture & Data Flows](docs/architecture.md)** — Architectural component diagrams, PostgreSQL schemas, and security design.
- 📋 **[REST API Specifications & Contracts](docs/api_contract.md)** — Comprehensive request/response JSON payloads and HTTP status codes.
- 📊 **[Empirical Test Results & Benchmarks](docs/test_results.md)** — Measured latency benchmarks, Pytest test matrix, and Playwright audit logs.
- 🎓 **[Viva Defense Guide & Examiner Q&A](docs/viva_notes.md)** — Project pitch, scope defense, and team contribution breakdown.
- 📜 **[Data Provenance & UCI Attribution](data/SOURCE.md)** — Attribution for the UCI Sentiment Labelled Sentences dataset (CC BY 4.0).

---

## 📄 License & Attribution

This academic prototype is developed for educational evaluation under Semester 3 coursework.  
- Benchmark Corpus: Derived from the *UCI Sentiment Labelled Sentences Data Set* (Kotzias et al., 2015), licensed under **CC BY 4.0**.
- Software License: Open for academic evaluation and internal institutional review.
