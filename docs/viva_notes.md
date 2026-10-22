# ReviewLens Viva Defense Notes & Presentation Guide

**Project Title:** AI-Driven Fake Review and Sentiment Manipulation Detection System  
**Presentation Prototype:** ReviewLens (Semester 3 Milestone v1.0)  
**Target Milestone Date:** 30 October 2026 (Documentation 23 October 2026)  

---

## 1. 30-Second Opening Pitch

> “Our official academic project is the **AI-Driven Fake Review and Sentiment Manipulation Detection System**. Across our 8-semester department curriculum, **Semester 3 explicitly focuses on building the foundational data pipeline**: secure student authentication, catalog browsing, structured review submission, relational storage in PostgreSQL, deterministic NLP text preprocessing, and descriptive analytics.
>
> In accordance with our syllabus milestone requirements, machine learning inference, sentiment classification, and fake-review detection models are scheduled for Semesters 4 through 6. Today we present ReviewLens, our fully operational data collection and analytics prototype running completely locally.”

---

## 2. 4-Person Viva Speaking Division

| Presenter | Role & Topic | Core Responsibilities & What to Demonstrate |
|---|---|---|
| **Student 1** | **Problem Statement & Scope Governance** | Explains the real-world problem of review manipulation; articulates why reliable data ingestion is required before ML modeling; explains the Semester 3 vs. Semester 4–6 boundary. |
| **Student 2** | **Frontend Architecture & UX** | Demonstrates the React + Vite client, accessible design tokens (`--ink`, `--brand`, `--surface`), responsive mobile layouts, 4:3 catalog aspect cards, and form state management. |
| **Student 3** | **Backend APIs & Database Relational Integrity** | Walks through FastAPI endpoints, Argon2 password hashing, JWT bearer authentication, foreign key cascades, and the database-level `UNIQUE(user_id, product_id)` constraint. |
| **Student 4** | **NLP Preprocessing & Descriptive Analytics** | Demonstrates the raw-to-cleaned text normalization pipeline, the 5-bar Recharts rating distribution, and the separate UCI corpus benchmark ingestion with CC BY 4.0 provenance. |

---

## 3. High-Probability Viva Questions & Bulletproof Answers

### Q1: Your project title mentions "AI-Driven Fake Review Detection". Where is the AI?
> **Answer:**  
> "The department project guide defines an 8-semester roadmap. The official curriculum specifically designates Semester 3 for **web prototype scaffolding, database schema design, text preprocessing, and descriptive statistical analytics** (Milestone 3, Weeks 1–12).  
> Natural language processing sentiment classifiers and fake-review anomaly detectors are scheduled for Semester 4 and 5. Rather than faking confidence percentages or hardcoding heuristic rules as 'AI', we adhered strictly to academic integrity by establishing the data foundation first."

### Q2: Why did you choose React + FastAPI + PostgreSQL instead of full-stack Next.js or MongoDB?
> **Answer:**  
> "React with FastAPI and PostgreSQL is the exact technology stack mandated in the college syllabus plan (Weeks 2, 4, and 9).  
> 1. **React with Vite** provides lightning-fast local bundling and client-side routing without server-side rendering overhead.  
> 2. **FastAPI in Python** creates RESTful endpoints that integrate seamlessly with Python's data science ecosystem (NLTK, Scikit-Learn, PyTorch) when we transition to ML modeling in Semester 4.  
> 3. **PostgreSQL** enforces relational integrity, ACID transactions, check constraints, and unique indices that prevent duplicate student reviews at the storage engine level."

### Q3: How do you prevent a malicious student from submitting 50 reviews to boost a product?
> **Answer:**  
> "We implement defensive security across three distinct layers:  
> 1. **Authentication:** The review submission endpoint (`POST /api/products/:slug/reviews`) requires a signed JWT token from an authenticated student account.  
> 2. **API Verification:** The endpoint queries the database before insertion to verify whether the student has already reviewed this product. If so, it returns an explicit `HTTP 409 Conflict`.  
> 3. **Database Constraint:** The `reviews` table enforces a database-level `UNIQUE(user_id, product_id)` constraint. Even in high-concurrency race conditions, PostgreSQL rejects duplicate inserts."

### Q4: Why perform text preprocessing now if there is no machine learning model yet?
> **Answer:**  
> "Text data collected in the wild is noisy—containing erratic capitalization, URL links, punctuation artifacts, and redundant whitespace. Preprocessing raw strings upon ingestion ensures that clean tokens are preserved alongside the original text.  
> In `app/services/preprocess.py`, our deterministic pipeline strips URLs, converts to lowercase, normalizes punctuation to whitespace, tokenizes words, and filters common stop words. This creates a standardized baseline dataset ready for vectorization in Semester 4."

### Q5: How is the average rating calculated? Is it stored in a column?
> **Answer:**  
> "No, we intentionally do not store a denormalized `average_rating` column on the product table, because denormalized columns can drift out of sync when reviews are added.  
> Instead, our backend uses dynamic SQL aggregation (`func.avg(Review.rating)` and `func.count(Review.id)`) grouped by `product_id`. When a student submits a new review, the database computes the new average immediately, and products without reviews show 'No ratings yet'."

### Q6: What is the purpose of the UCI dataset import?
> **Answer:**  
> "The college specification required open dataset acquisition during Weeks 5–6. We acquired 100 sentences from the UCI *Sentiment Labelled Sentences* dataset (Kotzias et al., 2015), licensed under CC BY 4.0.  
> We maintain clear separation: the UCI sentences are stored in a dedicated `corpus_samples` table with their original source labels. They are not fabricated into fake star reviews or mixed with our catalog products, maintaining strict experimental provenance."

---

## 4. 8-Slide Presentation Outline

1. **Title Slide:** Official Academic Title, Semester 3 Review Prototype (ReviewLens), Team Members, and Project Guide.
2. **Problem Definition:** Growth of online commerce, risk of review manipulation, and the engineering necessity of structured data pipelines.
3. **Curriculum Roadmap:** The 8-semester project trajectory—highlighting Semester 3 Foundation vs. Semester 4–6 ML Detection.
4. **System Architecture:** 3-tier diagram illustrating React (Vite) → FastAPI (Python) → Local PostgreSQL.
5. **Entity-Relationship Data Model:** Tables (`users`, `products`, `reviews`, `corpus_samples`) with foreign keys, checks, and unique constraints.
6. **Live Product Catalog & Review Submission:** Screenshots of catalog discovery, category filters, and student review submission.
7. **Descriptive Analytics Dashboard:** Screenshots of the 4 KPI cards, 5-bar Recharts rating distribution, and top product rankings.
8. **Testing & Next Semester Outlook:** 27 passed automated tests, measured sub-50ms API latencies, and preview of Semester 4 NLP modeling.
