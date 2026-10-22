# DATA ATTRIBUTION AND PROVENANCE (`data/SOURCE.md`)

## Rated product demo data

- **Purpose:** Demonstrate product browsing, review submission, ratings, aggregates and role-controlled data access.
- **Origin:** Synthetic, locally created for Semester 3 classroom presentation.
- **Items:** 10 fictional product listings; 6 seeded student accounts; approximately 40-60 fictional rated reviews.
- **Integrity:** The sample ratings/reviews are not real consumer research and must not be cited as evidence of fake-review detection, real-world product satisfaction or model accuracy.

## UCI review-text research corpus

- **Official dataset:** Sentiment Labelled Sentences.
- **Dataset authors:** Dimitrios Kotzias, Misha Denil, Nando de Freitas and Padhraic Smyth (2015).
- **Publisher:** UCI Machine Learning Repository.
- **Dataset landing page:** https://archive.ics.uci.edu/dataset/331/sentiment+labelled+sentences
- **DOI:** https://doi.org/10.24432/C57604
- **License:** Creative Commons Attribution 4.0 International (CC BY 4.0), per the UCI page. Reuse requires attribution.
- **Dataset content:** 3,000 short sentences in Amazon, Yelp and IMDb subsets (1,000 each); binary labels 0/1 were provided with the original data.
- **Subset for this Semester 3 project:** 100 valid rows sampled deterministically from `amazon_cells_labelled.txt`, keeping original source line numbers (1 through 100).
- **Download date:** 2026-10-22
- **Import date:** 2026-10-22
- **Imported successfully:** 100
- **Skipped/invalid records:** 0
- **Transformer/preprocessing used:** Lowercasing, URL/punctuation handling, whitespace normalization and tokenization; source text preserved.
- **Original source fields:** A short review sentence and a 0/1 source-provided sentiment label. **There are no star ratings, reviewer accounts, product IDs or timestamps in this source.**
- **Use in this project:** Import and inspect a real text corpus in the separate `corpus_samples` table; future Semester 4 text experiments may use the source-provided labels. **No prediction is performed in Semester 3.**
- **Not used for:** Product rating calculation, fake-review labels, generated user activity, or fabricated star ratings.

### Attribution statement for project report

“Text corpus excerpts were sourced from the UCI Machine Learning Repository's *Sentiment Labelled Sentences* dataset (Kotzias et al., 2015; DOI: 10.24432/C57604), licensed CC BY 4.0. We use a documented Amazon subset for data ingestion and preliminary text preprocessing. Its existing 0/1 sentiment labels come from the dataset, not from our Semester 3 application.”
