#!/usr/bin/env python3
"""Offline UCI Review-Text Corpus Importer for ReviewLens Semester 3.

Imports 100 sample lines from the UCI 'Sentiment Labelled Sentences' dataset
into the separate 'corpus_samples' table.

Guarantees:
- Strictly idempotent via UNIQUE(source_site, source_line).
- Stores original raw sentence, original 0/1 provided label, and deterministically
  cleaned text.
- NEVER invents fake star ratings, authors, product IDs, or timestamps.
- Records and reports accepted, skipped (already present), and rejected counts.

Usage:
  python scripts/import_corpus.py [--file path/to/tsv] [--site amazon]
"""

import sys
import os
import argparse
import datetime
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select, func
from app.db import SessionLocal, Base, engine
from app.models import CorpusSample
from app.services.preprocess import clean_text


def import_corpus(file_path: Path, source_site: str = "amazon", verbose: bool = True):
    if not file_path.exists():
        print(f"Error: Dataset file not found at {file_path}", file=sys.stderr)
        sys.exit(1)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    accepted_count = 0
    skipped_count = 0
    rejected_count = 0

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        if verbose:
            print(f"Reading corpus file: {file_path} ({len(lines)} lines)")

        for line_num, raw_line in enumerate(lines, start=1):
            line = raw_line.strip()
            if not line:
                continue

            parts = line.split("\t")

            # Support 3-column (source_line, review_text, label) or 2-column (review_text, label)
            if len(parts) == 3:
                try:
                    src_line = int(parts[0].strip())
                    text_body = parts[1].strip()
                    label_val = int(parts[2].strip())
                except ValueError:
                    rejected_count += 1
                    continue
            elif len(parts) == 2:
                src_line = line_num
                text_body = parts[0].strip()
                try:
                    label_val = int(parts[1].strip())
                except ValueError:
                    rejected_count += 1
                    continue
            else:
                rejected_count += 1
                continue

            # Validate text and label
            if not text_body or label_val not in (0, 1):
                rejected_count += 1
                continue

            # Check for existing record (idempotent)
            existing = (
                db.query(CorpusSample)
                .filter(
                    CorpusSample.source_site == source_site,
                    CorpusSample.source_line == src_line,
                )
                .first()
            )

            if existing:
                skipped_count += 1
                continue

            cleaned = clean_text(text_body)

            sample = CorpusSample(
                source_site=source_site,
                source_line=src_line,
                review_text=text_body,
                provided_label=label_val,
                cleaned_text=cleaned,
                imported_at=datetime.datetime.now(datetime.timezone.utc),
            )
            db.add(sample)
            accepted_count += 1

        db.commit()

        total_corpus = db.execute(select(func.count(CorpusSample.id))).scalar()

        if verbose:
            print("\nUCI Corpus Import Summary:")
            print(f"  Source site:      {source_site}")
            print(f"  Accepted (new):   {accepted_count}")
            print(f"  Skipped (exists): {skipped_count}")
            print(f"  Rejected (bad):   {rejected_count}")
            print(f"  Total in DB:      {total_corpus}")

        return accepted_count, skipped_count, rejected_count, total_corpus

    except Exception as e:
        db.rollback()
        print(f"Import failed: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    default_data_file = backend_dir.parent / "data" / "uci_amazon_sample.tsv"
    parser = argparse.ArgumentParser(description="Import UCI Sentiment Labelled Sentences")
    parser.add_argument("--file", type=Path, default=default_data_file, help="Path to TSV file")
    parser.add_argument("--site", type=str, default="amazon", help="Source site identifier")
    args = parser.parse_args()

    import_corpus(args.file, args.site, verbose=True)
