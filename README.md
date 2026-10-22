# ReviewLens — Semester 3 Academic Prototype

> **Official Project Title:** AI-Driven Fake Review and Sentiment Manipulation Detection System  
> **Release:** Semester 3 Prototype (v1.0) | **Scope Status:** FROZEN | **Date:** 22 October 2026  
> **Academic Boundary:** Sentiment polarity classification, ML fake-review detection models, trust scores, and LLM inferences are explicitly scheduled for Semesters 4–6 in accordance with the official department curriculum. This Semester 3 release establishes the data ingestion pipeline, secure user accounts, relational PostgreSQL persistence, deterministic NLP text preprocessing, and descriptive review analytics.

---

## 1. System Architecture & Features

ReviewLens is a self-contained web platform designed to execute 100% locally on a presentation laptop without external cloud or internet requirements.

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS with strict design tokens, React Router, Recharts, and Lucide Icons.
- **Backend:** FastAPI (Python 3.11+), Pydantic v2 schemas, SQLAlchemy 2.x ORM, PyJWT bearer auth, and Argon2 password hashing.
- **Database:** Local PostgreSQL (`reviewlens_sem3`) with ACID transactions, `CHECK(rating >= 1 AND rating <= 5)`, and `UNIQUE(user_id, product_id)` constraints.
- **NLP Preprocessing:** Deterministic text normalization service stripping URLs, lowercasing, converting punctuation to spaces, and removing documented English stop words.
- **Corpus Ingestion:** Reproducible offline importer ingesting 100 benchmark sentences from the UCI *Sentiment Labelled Sentences* dataset (CC BY 4.0) into a dedicated `corpus_samples` table.

---

## 2. Directory Structure

```text
reviewlens/
  ├── frontend/                     # React + TypeScript + Vite SPA
  │   ├── src/
  │   │   ├── app/App.tsx           # Router & session provider
  │   │   ├── components/           # Header, ProductCard, RatingStars, FormField, EmptyState
  │   │   ├── pages/                # Products, ProductDetail, Login, Register, Profile, Admin
  │   │   ├── lib/                  # api.ts (fetch client), auth.tsx (context)
  │   │   └── styles/index.css      # Design tokens (--ink, --brand, --surface...)
  │   └── public/products/          # Offline SVG product illustrations
  ├── backend/                      # FastAPI Python ASGI Application
  │   ├── app/
  │   │   ├── main.py               # FastAPI entry point & CORS
  │   │   ├── config.py             # Pydantic BaseSettings (.env)
  │   │   ├── db.py                 # SQLAlchemy engine & sessionmaker
  │   │   ├── models.py             # User, Product, Review, CorpusSample models
  │   │   ├── schemas.py            # Pydantic v2 request/response models
  │   │   ├── security.py           # Argon2 hashing & JWT creation/decoding
  │   │   ├── dependencies.py       # Auth guards & admin role protection
  │   │   ├── routes/               # auth.py, products.py, admin.py
  │   │   └── services/preprocess.py# Deterministic NLP cleaning service
  │   ├── scripts/
  │   │   ├── seed_demo.py          # Deterministic database reset & demo seed
  │   │   └── import_corpus.py      # Idempotent UCI Amazon dataset importer
  │   └── tests/                    # 27 automated Pytest unit/integration tests
  ├── data/
  │   ├── uci_amazon_sample.tsv     # Sampled 100 lines from UCI ML repository
  │   └── SOURCE.md                 # Provenance, license (CC BY 4.0), and attribution
  └── docs/
      ├── architecture.md           # System architecture & data flow diagrams
      ├── api_contract.md           # Complete JSON REST API contracts
      ├── test_results.md           # Real measured benchmarks & test matrix
      └── viva_notes.md             # Defense pitch, examiners Q&A, and 4-person role split
```

---

## 3. Quickstart & Local Setup

### Step 1: Start PostgreSQL (Docker or Native)

```bash
# Recommended: Run PostgreSQL 16 container locally
docker run -d \
  --name reviewlens-postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=reviewlens_sem3 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine
```

### Step 2: Configure & Start Backend

```bash
cd reviewlens/backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Configure environment variables (defaults connect to localhost:5432)
cp .env.example .env

# Reset and seed database with 1 admin, 6 students, 10 products, 49 reviews
python scripts/seed_demo.py --reset

# Import 100 UCI Amazon review-text sentences
python scripts/import_corpus.py

# Start FastAPI server (runs on http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```

FastAPI documentation is available at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Step 3: Start Frontend

```bash
cd reviewlens/frontend

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev

# Or build for production preview
npm run build
npm run preview
```

---

## 4. Pre-Seeded Demonstration Accounts

| Role | Display Name | Email | Password | Access Rights |
|---|---|---|---|---|
| **Admin** | ReviewLens Administrator | `admin@reviewlens.edu` | `Admin@ReviewLens2026` | Full Analytics Dashboard & Public Catalog |
| **Student** | Aarav Sharma | `student1@reviewlens.edu` | `Student@ReviewLens1` | Product Catalog, Submit 1 Review/Product |
| **Student** | Riddhima Patel | `student2@reviewlens.edu` | `Student@ReviewLens2` | Product Catalog, Submit 1 Review/Product |
| **Student** | Karan Verma | `student3@reviewlens.edu` | `Student@ReviewLens3` | Product Catalog, Submit 1 Review/Product |
| **Student** | Sneha Kulkarni | `student4@reviewlens.edu` | `Student@ReviewLens4` | Product Catalog, Submit 1 Review/Product |
| **Student** | Rohan Gupta | `student5@reviewlens.edu` | `Student@ReviewLens5` | Product Catalog, Submit 1 Review/Product |
| **Student** | Ananya Joshi | `student6@reviewlens.edu` | `Student@ReviewLens6` | Product Catalog, Submit 1 Review/Product |

*(Tip: In the Sign In screen, click any "Demo Credentials" button to auto-fill the login form.)*

---

## 5. Verification & Testing

Execute the complete 27-test automated test suite:

```bash
cd reviewlens/backend
source .venv/bin/activate
PYTHONPATH=. pytest tests/
```

### Actual Benchmarked Performance (Local Linux Workstation):
- `GET /api/products`: **13.66 ms** median (target <= 400 ms)
- `GET /api/admin/overview`: **20.30 ms** median (target <= 400 ms)
- `POST /api/products/:slug/reviews`: **60.88 ms** (target <= 1000 ms)
- Total Pytest execution: **3.30s** for 27 tests (100% pass)

---

## 6. Academic Documentation Pack

- [System Architecture & Data Flows](docs/architecture.md)
- [REST API Specifications & Contracts](docs/api_contract.md)
- [Empirical Test Results & Benchmarks](docs/test_results.md)
- [Viva Defense Guide & Examiner Q&A](docs/viva_notes.md)
- [Data Provenance & UCI CC BY 4.0 Attribution](data/SOURCE.md)
