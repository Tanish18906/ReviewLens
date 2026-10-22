"""Deterministic NLP text preprocessing service for ReviewLens Semester 3.

Pipeline:
1. Normalize leading, trailing, and repeated whitespace.
2. Convert text to lowercase.
3. Remove URL strings (http/https/www).
4. Replace non-alphanumeric punctuation with spaces (preserving apostrophes within words).
5. Split into simple word tokens and remove a documented, small English stop-word list.
6. Join cleaned tokens into a deterministic space-separated string.
"""

import re
from typing import Set

# Documented minimal English stop-word set for preliminary text normalization
STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "all", "am", "an", "and", "any",
    "are", "as", "at", "be", "because", "been", "before", "being", "below",
    "between", "both", "but", "by", "can", "did", "do", "does", "doing",
    "down", "during", "each", "few", "for", "from", "further", "had", "has",
    "have", "having", "he", "her", "here", "hers", "herself", "him", "himself",
    "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just",
    "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of",
    "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves",
    "out", "over", "own", "same", "she", "should", "so", "some", "such",
    "than", "that", "the", "their", "theirs", "them", "themselves", "then",
    "there", "these", "they", "this", "those", "through", "to", "too", "under",
    "until", "up", "very", "was", "we", "were", "what", "when", "where",
    "which", "while", "who", "whom", "why", "will", "with", "you", "your",
    "yours", "yourself", "yourselves"
}

_URL_PATTERN = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
_PUNCT_PATTERN = re.compile(r"[^\w\s']|_")
_WHITESPACE_PATTERN = re.compile(r"\s+")


def clean_text(raw_text: str, remove_stop_words: bool = True) -> str:
    """Deterministically cleans raw review text for preliminary NLP storage.

    Preserves the original text by returning a normalized derivative.
    Never alters, predicts, or scores the content.
    """
    if not raw_text:
        return ""

    # Step 1: Remove URLs
    text = _URL_PATTERN.sub(" ", raw_text)

    # Step 2: Lowercase
    text = text.lower()

    # Step 3: Replace non-alphanumeric punctuation (except inline apostrophe) with spaces
    text = _PUNCT_PATTERN.sub(" ", text)

    # Step 4: Tokenize on whitespace
    tokens = text.split()

    # Clean tokens: strip standalone apostrophes
    tokens = [t.strip("'") for t in tokens if t.strip("'")]

    # Step 5: Optional stop-word filtering
    if remove_stop_words:
        tokens = [t for t in tokens if t not in STOP_WORDS]

    # Step 6: Join tokens with single space
    cleaned = " ".join(tokens)
    return cleaned.strip()
