# ReviewLens — Semester 3 Academic Prototype

> **Official Project Title:** AI-Driven Fake Review and Sentiment Manipulation Detection System  
> **Current Release:** Semester 3 Prototype (v1.0) | **Scope:** Review Collection, Storage, Preprocessing, and Descriptive Analytics  
> **Academic Boundary:** Sentiment classification, fake-review detection models, trust scores, and ML inference are explicitly scheduled for Semesters 4–6. This Semester 3 release focuses strictly on data pipeline integrity, relational storage, reproducible dataset ingestion, and descriptive analytics.

---

## 1. System Architecture

ReviewLens runs entirely locally on a single machine without internet requirements:

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Lucide Icons.
- **Backend:** FastAPI (Python 3.11+), Pydantic v2, SQLAlchemy 2.x ORM, PyJWT, Argon2 password hashing.
- **Database:** Local PostgreSQL (`reviewlens_sem3`) enforcing relational integrity, check constraints, and unique indices.
- **Corpus & NLP Foundation:** Deterministic text normalization pipeline and reproducible ingestion of the UCI *Sentiment Labelled Sentences* dataset into a dedicated benchmark table.

---

## 2. Prerequisites

- **Node.js:** v20.19+ or v22.12+ (tested with v22.22.1)
- **Python:** 3.11+ (tested with 3.11 / 3.14)
- **PostgreSQL:** 16+ (running locally or via Docker)

---

## 3. Local PostgreSQL Setup

### Option A: Using Docker (Recommended for quick demo)
```bash
docker run -d \
  --name reviewlens-postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=reviewlens_sem3 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine
```

### Option B: Local Native PostgreSQL
```bash
psql -U postgres -c "CREATE DATABASE reviewlens_sem3;"
```

---

## 4. Backend Setup & Run

```bash
cd backend

# Create virtual environment (using python venv or uv)
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (defaults connect to localhost:5432)
cp .env.example .env

# Run database seed (creates 1 admin, 6 students, 10 products, 49 reviews)
python scripts/seed_demo.py --reset

# Start the FastAPI server (accessible at http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```

FastAPI interactive OpenAPI documentation is available at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 5. Frontend Setup & Run

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server (accessible at http://localhost:5173)
npm run dev

# Or build for production preview
npm run build
npm run preview
```

The Vite dev server proxies `/api` calls directly to `http://127.0.0.1:8000`.

---

## 6. Demo Accounts (Known Demonstration Credentials)

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | ReviewLens Administrator | `admin@reviewlens.edu` | `Admin@ReviewLens2026` |
| **Student** | Aarav Sharma | `student1@reviewlens.edu` | `Student@ReviewLens1` |
| **Student** | Riddhima Patel | `student2@reviewlens.edu` | `Student@ReviewLens2` |
| **Student** | Karan Verma | `student3@reviewlens.edu` | `Student@ReviewLens3` |
| **Student** | Sneha Kulkarni | `student4@reviewlens.edu` | `Student@ReviewLens4` |
| **Student** | Rohan Gupta | `student5@reviewlens.edu` | `Student@ReviewLens5` |
| **Student** | Ananya Joshi | `student6@reviewlens.edu` | `Student@ReviewLens6` |

---

## 7. Running Tests & Verifications

```bash
cd backend
source .venv/bin/activate
pytest tests/
```
