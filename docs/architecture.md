# ReviewLens Architecture & Component Flow

**Academic Title:** AI-Driven Fake Review and Sentiment Manipulation Detection System  
**Prototype Phase:** Semester 3 Foundation Prototype (v1.0)  
**Evaluation Date:** October 2026  

---

## 1. High-Level Architecture

ReviewLens is architected as a lean, local three-tier web application designed to operate 100% offline on a standard laptop. The design eliminates external cloud dependencies, hosted databases, and premature ML model hosting to guarantee verifiable reproducibility for the Semester 3 milestone.

```text
+-------------------------------------------------------------------------+
|                          Client Tier (Browser)                          |
|  - React 18 SPA (TypeScript + Vite)                                    |
|  - Tailwind CSS + Strict Design Tokens (--ink, --brand, --surface...)   |
|  - React Router DOM (Declarative routing: /products, /admin, etc.)      |
|  - Recharts (Descriptive rating distribution visualization)             |
|  - Session-based Bearer JWT storage (sessionStorage)                    |
+-------------------------------------------------------------------------+
                                    |
                                    | HTTP / JSON (REST API)
                                    | Base Prefix: /api
                                    v
+-------------------------------------------------------------------------+
|                        Application Tier (FastAPI)                       |
|  - FastAPI (Python 3.11+) asynchronous ASGI core                        |
|  - Pydantic v2 schemas for strict input validation & serialization       |
|  - Security Layer: Argon2 password hashing + HS256 JWT tokens           |
|  - Dependencies: Role-based route protection (student vs admin)         |
|  - Services: Deterministic NLP text cleaning service                    |
|  - Offline CLIs: seed_demo.py and import_corpus.py                      |
+-------------------------------------------------------------------------+
                                    |
                                    | SQLAlchemy 2.x ORM
                                    | Connection Pool via psycopg3
                                    v
+-------------------------------------------------------------------------+
|                         Database Tier (PostgreSQL)                      |
|  - Local PostgreSQL 16 instance (reviewlens_sem3)                       |
|  - users: User credentials, roles (student/admin), timestamps          |
|  - products: Curated demo items (title, category, slug, image path)     |
|  - reviews: Star ratings (1-5), raw text, cleaned text, foreign keys   |
|  - corpus_samples: Separate benchmark table for UCI Amazon dataset     |
|  - Relational Integrity: UNIQUE(user_id, product_id), CHECK constraints |
+-------------------------------------------------------------------------+
```

---

## 2. Component Descriptions

### 2.1 Frontend Tier (`frontend/`)
- **Routing & Shell:** `PageShell` enforces the sticky 68px header, responsive navigation, role-aware navigation links (Dashboard link only visible to admin users), and the academic footer disclaimer.
- **State & Auth:** `AuthProvider` (`lib/auth.tsx`) manages session state via `sessionStorage`, automatically re-validating the token against `GET /api/auth/me` on refresh.
- **Data Fetching:** Standardized `apiFetch<T>` utility in `lib/api.ts` transparently attaches `Authorization: Bearer <token>`, handles error parsing, and manages 401 token invalidation.
- **Components:**
  - `ProductCard`: Clamps titles, maintains fixed 4:3 aspect ratio images without layout shifts, and displays formatted averages.
  - `RatingStars`: Supports accessible display and interactive keyboard radio group selection (1 to 5 stars).
  - `AdminDashboardPage`: Renders a 4-KPI grid, an accessible 5-bar Recharts distribution, a top-5 product ranking table, and recent review activity.

### 2.2 Backend Tier (`backend/`)
- **`app/routes/auth.py`:** Handles `/auth/register` (student-only public registration), `/auth/login` (Argon2 verification and JWT minting), and `/auth/me` (session verification).
- **`app/routes/products.py`:** Powers catalog queries (name search, category filters, multi-mode sorting) and paginated review listing. Enforces student authentication, 20–1000 character review limits, and duplicate submission prevention via database constraints.
- **`app/routes/admin.py`:** Implements `GET /admin/overview`, computing all metrics via dynamic SQL aggregation (`func.count`, `func.avg`, and grouping) without denormalized rating caches.
- **`app/services/preprocess.py`:** Deterministic text normalization pipeline executing URL removal, lowercase normalization, punctuation replacement, tokenization, and documented stop-word filtering.

### 2.3 Database Tier (PostgreSQL)
- **Constraint Enforcement:**
  - `check_rating_between_1_and_5`: Database-level guard guaranteeing `rating >= 1 AND rating <= 5`.
  - `uq_user_product_review`: Database-level unique constraint on `(user_id, product_id)` strictly enforcing one review per product per student.
  - `uq_corpus_source_line`: Database-level constraint on `(source_site, source_line)` ensuring idempotent re-runs of dataset imports.
  - Performance Indices: `ix_reviews_product_created` and `ix_reviews_created_at_desc` accelerate pagination and admin recency queries.

---

## 3. Data Flow Pipelines

### 3.1 Review Submission & Descriptive Analytics Update Flow

```text
Student Submits Review (rating: 5, text: "...")
  │
  ▼
FastAPI POST /api/products/{slug}/reviews
  ├─ 1. Authenticate user via JWT bearer token (must be logged in)
  ├─ 2. Pydantic validates: rating in [1, 5], text length in [20, 1000]
  ├─ 3. Query DB to ensure product exists & student has not already reviewed
  ├─ 4. Preprocess: clean_text(raw_text) -> deterministic cleaned_text
  ├─ 5. Insert into reviews table with source='user', created_at=UTC
  └─ 6. Commit transaction; return 201 Created
        │
        ▼
Frontend receives 201
  ├─ Refetches product aggregate stats (GET /api/products/{slug})
  ├─ Refetches product reviews list (GET /api/products/{slug}/reviews)
  └─ Re-renders UI showing new review at top and updated star count
```

### 3.2 UCI Corpus Ingestion Flow

```text
Offline TSV Source: data/uci_amazon_sample.tsv
  │
  ▼
CLI Script: python scripts/import_corpus.py
  ├─ 1. Reads 100 sampled lines from UCI Sentiment Labelled Sentences
  ├─ 2. Validates format: line_number, raw_sentence, provided_label (0 or 1)
  ├─ 3. Applies deterministic clean_text() to raw sentence
  ├─ 4. Inserts into corpus_samples table (never touches products or reviews)
  └─ 5. Preserves source label as reference for future Semester 4 research
```
