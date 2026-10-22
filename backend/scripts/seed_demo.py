#!/usr/bin/env python3
"""Deterministic demo seed/reset script for ReviewLens Semester 3 prototype.
Boutique Storefront Migration: Blush & Bloom ("A little world of lovely things")

Seeds:
- 1 Pre-created Administrator account (admin@reviewlens.edu)
- 6 Student demo accounts (student1@reviewlens.edu - student6@reviewlens.edu)
- 16 Curated Boutique Products across 4 core categories:
  * Plush Toys ("Cuddle Corner")
  * Fragrances ("Sweet Scents")
  * Beauty & Makeup ("Pretty Essentials")
  * Accessories & Gifts ("Little Joys")
- Realistic synthetic reviews with varied ratings (1-5) and UTC timestamps
  strictly respecting UNIQUE(user_id, product_id).

Usage:
  python scripts/seed_demo.py [--reset]
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

from sqlalchemy import select, func, text
from app.db import SessionLocal, engine, Base
from app.models import User, Product, Review, CorpusSample
from app.security import hash_password
from app.services.preprocess import clean_text

# Seed users: 1 Admin + 6 Students
USERS_DATA = [
    {
        "full_name": "ReviewLens Administrator",
        "email": "admin@reviewlens.edu",
        "password": "Admin@ReviewLens2026",
        "role": "admin",
        "created_at": datetime.datetime(2026, 9, 1, 9, 0, 0, tzinfo=datetime.timezone.utc),
    },
    {
        "full_name": "Aarav Sharma",
        "email": "student1@reviewlens.edu",
        "password": "Student@ReviewLens1",
        "role": "student",
        "created_at": datetime.datetime(2026, 9, 2, 10, 15, 0, tzinfo=datetime.timezone.utc),
    },
    {
        "full_name": "Riddhima Patel",
        "email": "student2@reviewlens.edu",
        "password": "Student@ReviewLens2",
        "role": "student",
        "created_at": datetime.datetime(2026, 9, 3, 11, 30, 0, tzinfo=datetime.timezone.utc),
    },
    {
        "full_name": "Karan Verma",
        "email": "student3@reviewlens.edu",
        "password": "Student@ReviewLens3",
        "role": "student",
        "created_at": datetime.datetime(2026, 9, 4, 14, 0, 0, tzinfo=datetime.timezone.utc),
    },
    {
        "full_name": "Sneha Kulkarni",
        "email": "student4@reviewlens.edu",
        "password": "Student@ReviewLens4",
        "role": "student",
        "created_at": datetime.datetime(2026, 9, 5, 16, 45, 0, tzinfo=datetime.timezone.utc),
    },
    {
        "full_name": "Rohan Gupta",
        "email": "student5@reviewlens.edu",
        "password": "Student@ReviewLens5",
        "role": "student",
        "created_at": datetime.datetime(2026, 9, 6, 12, 10, 0, tzinfo=datetime.timezone.utc),
    },
    {
        "full_name": "Ananya Joshi",
        "email": "student6@reviewlens.edu",
        "password": "Student@ReviewLens6",
        "role": "student",
        "created_at": datetime.datetime(2026, 9, 7, 15, 20, 0, tzinfo=datetime.timezone.utc),
    },
]

# 16 Curated Boutique Products across 4 database-backed categories
PRODUCTS_DATA = [
    # Category 1: Plush Toys (Cuddle Corner)
    {
        "slug": "strawberry-bunny-plush",
        "name": "Strawberry Bunny Plush",
        "category": "Plush Toys",
        "description": "Super soft strawberry bunny stuffed animal with embroidered rosy cheeks and floppy ears, crafted from velvety cloud-touch fabric.",
        "image_path": "/images/products/strawberry-bunny-plush.webp",
    },
    {
        "slug": "cloud-bear-teddy",
        "name": "Cloud Bear Teddy",
        "category": "Plush Toys",
        "description": "Classic huggable pastel teddy bear with a gentle cream fur texture, sweet sitting pose, and an adorable hand-stitched blush nose.",
        "image_path": "/images/products/cloud-bear-teddy.webp",
    },
    {
        "slug": "pastel-pink-cat-plush",
        "name": "Pastel Pink Cat Plush",
        "category": "Plush Toys",
        "description": "Chubby kawaii pink kitten plushie with round paws, embroidered whiskers, and ultra-squishy marshmallow stuffing.",
        "image_path": "/images/products/pastel-pink-cat-plush.webp",
    },
    {
        "slug": "cozy-marshmallow-plush",
        "name": "Cozy Marshmallow Lamb Plush",
        "category": "Plush Toys",
        "description": "Dreamy snuggle lamb with looped textured fleece, gentle pastel hooves, and a soothing weighted feel for relaxing evenings.",
        "image_path": "/images/products/cozy-marshmallow-plush.webp",
    },

    # Category 2: Fragrances (Sweet Scents)
    {
        "slug": "rose-bloom-eau-de-parfum",
        "name": "Rose Bloom Eau de Parfum",
        "category": "Fragrances",
        "description": "A delicate floral bouquet with notes of fresh damask rose petals, sparkling lychee, and soft white musk in an elegant glass flacon.",
        "image_path": "/images/products/rose-bloom-eau-de-parfum.webp",
    },
    {
        "slug": "vanilla-dream-body-mist",
        "name": "Vanilla Dream Body Mist",
        "category": "Fragrances",
        "description": "Lightweight sweet body and hair mist infused with warm Madagascar vanilla bean, caramelized sugar, and whipped coconut cream.",
        "image_path": "/images/products/vanilla-dream-body-mist.webp",
    },
    {
        "slug": "peach-blossom-fragrance",
        "name": "Peach Blossom Eau de Toilette",
        "category": "Fragrances",
        "description": "Crisp and juicy white peach nectar blended with blooming spring blossoms, sunny citrus zest, and sheer cedarwood.",
        "image_path": "/images/products/peach-blossom-fragrance.webp",
    },
    {
        "slug": "soft-cotton-perfume",
        "name": "Soft Cotton Linen Mist",
        "category": "Fragrances",
        "description": "Clean and comforting aroma of fresh sun-dried cotton sheets, soft iris petals, and warm morning breeze.",
        "image_path": "/images/products/soft-cotton-perfume.webp",
    },

    # Category 3: Beauty & Makeup (Pretty Essentials)
    {
        "slug": "rosy-glow-lip-tint",
        "name": "Rosy Glow Dewy Lip Tint",
        "category": "Beauty & Makeup",
        "description": "Glassy water-drop lip tint delivering long-lasting soft petal color, nourishing vitamin E, and a non-sticky glossy finish.",
        "image_path": "/images/products/rosy-glow-lip-tint.webp",
    },
    {
        "slug": "peach-cream-blush",
        "name": "Peach Cream Velvet Blush",
        "category": "Beauty & Makeup",
        "description": "Silky melt-on cream-to-powder blush compact that leaves a natural healthy flush with weightless buildable pigment.",
        "image_path": "/images/products/peach-cream-blush.webp",
    },
    {
        "slug": "everyday-makeup-brush-set",
        "name": "Rose Gold Makeup Brush Set",
        "category": "Beauty & Makeup",
        "description": "Set of five vegan cruelty-free brushes with pastel pink wooden handles, rose gold ferrules, and ultra-plush synthetic bristles.",
        "image_path": "/images/products/everyday-makeup-brush-set.webp",
    },
    {
        "slug": "soft-pink-beauty-sponge-set",
        "name": "Petal Soft Beauty Sponge Trio",
        "category": "Beauty & Makeup",
        "description": "Trio of latex-free teardrop blending sponges for seamless foundation, cream blush, and powder application.",
        "image_path": "/images/products/soft-pink-beauty-sponge-set.webp",
    },

    # Category 4: Accessories & Gifts (Little Joys)
    {
        "slug": "pastel-hair-claw-set",
        "name": "Pastel Blossom Hair Claw Set",
        "category": "Accessories & Gifts",
        "description": "Durable matte cellulose acetate hair claw clips designed to hold thick or fine hair comfortably without pulling.",
        "image_path": "/images/products/pastel-hair-claw-set.webp",
    },
    {
        "slug": "heart-vanity-mirror",
        "name": "Heart-Shaped Standing Vanity Mirror",
        "category": "Accessories & Gifts",
        "description": "Two-sided tabletop vanity mirror with 1x/3x magnification, rotatable 360-degree angle, and pastel pink heart frame.",
        "image_path": "/images/products/heart-vanity-mirror.webp",
    },
    {
        "slug": "cute-bow-hair-clips",
        "name": "Satin Ribbon Bow Hair Clips",
        "category": "Accessories & Gifts",
        "description": "Pair of handmade pink satin ribbon bow alligator clips to add an effortless coquette touch to any hairstyle.",
        "image_path": "/images/products/cute-bow-hair-clips.webp",
    },
    {
        "slug": "floral-makeup-pouch",
        "name": "Quilted Floral Cosmetic Pouch",
        "category": "Accessories & Gifts",
        "description": "Charming cotton quilted zipper pouch with pastel floral print, water-resistant interior lining, and ample space for daily beauty essentials.",
        "image_path": "/images/products/floral-makeup-pouch.webp",
    },
]

# Synthetic Reviews: mapped by (student_index, product_index, rating, text_body, created_at)
# student_index: 1=Aarav, 2=Riddhima, 3=Karan, 4=Sneha, 5=Rohan, 6=Ananya
# product_index: 0..15
REVIEWS_SPEC = [
    # Product 0: strawberry-bunny-plush (Plush Toys) - 5 reviews
    (1, 0, 5, "The fabric is unimaginably soft! The embroidered strawberry detail on the ear is so adorable.", datetime.datetime(2026, 9, 10, 11, 0, tzinfo=datetime.timezone.utc)),
    (2, 0, 5, "My favorite plush on my dorm bed! It has the perfect squishiness and holds its shape nicely.", datetime.datetime(2026, 9, 12, 14, 20, tzinfo=datetime.timezone.utc)),
    (3, 0, 4, "Bought this as a study companion. High quality stitching with zero loose threads.", datetime.datetime(2026, 9, 15, 9, 30, tzinfo=datetime.timezone.utc)),
    (4, 0, 5, "The pastel pink shade looks even prettier in person than on camera. Highly recommended!", datetime.datetime(2026, 9, 20, 16, 10, tzinfo=datetime.timezone.utc)),
    (6, 0, 4, "Super sweet and cuddly. Slight initial factory smell, but it aired out within a day.", datetime.datetime(2026, 10, 1, 18, 45, tzinfo=datetime.timezone.utc)),

    # Product 1: cloud-bear-teddy (Plush Toys) - 4 reviews
    (1, 1, 5, "Classic teddy bear silhouette with the coziest fur texture. Very comforting to hug while reading.", datetime.datetime(2026, 9, 11, 12, 0, tzinfo=datetime.timezone.utc)),
    (2, 1, 4, "Delicate cream color matches any bedroom aesthetic. The pink nose is a lovely finishing touch.", datetime.datetime(2026, 9, 16, 17, 30, tzinfo=datetime.timezone.utc)),
    (4, 1, 5, "Extremely well constructed and the sitting posture stays stable on shelves.", datetime.datetime(2026, 9, 28, 15, 40, tzinfo=datetime.timezone.utc)),
    (5, 1, 4, "High quality material that doesn't shed. Great gift option for anyone who loves bears.", datetime.datetime(2026, 10, 5, 11, 25, tzinfo=datetime.timezone.utc)),

    # Product 2: pastel-pink-cat-plush (Plush Toys) - 4 reviews
    (2, 2, 5, "The round shape and tiny paws are beyond cute. Incredibly squishy and relaxing to squeeze.", datetime.datetime(2026, 9, 13, 8, 45, tzinfo=datetime.timezone.utc)),
    (3, 2, 4, "Looks just like an adorable mochi dumpling. Fabric feels velvety and premium.", datetime.datetime(2026, 9, 18, 19, 10, tzinfo=datetime.timezone.utc)),
    (5, 2, 3, "Super cute design though slightly smaller than I anticipated from the photos.", datetime.datetime(2026, 10, 2, 21, 0, tzinfo=datetime.timezone.utc)),
    (6, 2, 5, "Instant mood lifter on my desk! The subtle pink pastel tone is just perfection.", datetime.datetime(2026, 10, 8, 14, 50, tzinfo=datetime.timezone.utc)),

    # Product 3: cozy-marshmallow-plush (Plush Toys) - 4 reviews
    (1, 3, 5, "The looped fleece texture gives it such a cozy sensory feel. Perfect bedtime companion.", datetime.datetime(2026, 9, 14, 16, 0, tzinfo=datetime.timezone.utc)),
    (3, 3, 4, "Gentle weighted feel provides genuine calming comfort during stressful exam weeks.", datetime.datetime(2026, 9, 19, 10, 15, tzinfo=datetime.timezone.utc)),
    (4, 3, 5, "Exceptional craftsmanship. The pastel fleece hasn't matted even after weeks of hugs.", datetime.datetime(2026, 9, 27, 18, 20, tzinfo=datetime.timezone.utc)),
    (6, 3, 4, "Sweet expression and wonderfully soft materials throughout.", datetime.datetime(2026, 10, 11, 16, 30, tzinfo=datetime.timezone.utc)),

    # Product 4: rose-bloom-eau-de-parfum (Fragrances) - 5 reviews
    (1, 4, 4, "Fresh and youthful rose fragrance without any powdery heaviness. Lasts about 6 hours on clothes.", datetime.datetime(2026, 9, 17, 13, 0, tzinfo=datetime.timezone.utc)),
    (2, 4, 5, "The lychee top note makes it crisp and modern! Beautiful bottle with a sturdy glass sprayer.", datetime.datetime(2026, 9, 21, 11, 45, tzinfo=datetime.timezone.utc)),
    (4, 4, 4, "Very elegant daily signature scent. Received multiple compliments from classmates.", datetime.datetime(2026, 9, 29, 9, 15, tzinfo=datetime.timezone.utc)),
    (5, 4, 3, "Pleasant floral scent, though I wish the sillage was slightly stronger in open outdoor areas.", datetime.datetime(2026, 10, 6, 17, 0, tzinfo=datetime.timezone.utc)),
    (6, 4, 5, "Subtle, feminine, and graceful. The dry down into white musk is heavenly.", datetime.datetime(2026, 10, 12, 10, 20, tzinfo=datetime.timezone.utc)),

    # Product 5: vanilla-dream-body-mist (Fragrances) - 4 reviews
    (1, 5, 4, "Smells like warm vanilla cookies without being overwhelming. Perfect post-shower mist.", datetime.datetime(2026, 9, 15, 14, 0, tzinfo=datetime.timezone.utc)),
    (2, 5, 5, "The coconut cream undertone makes it feel summery and cozy at the same time. Love this mist!", datetime.datetime(2026, 9, 23, 16, 30, tzinfo=datetime.timezone.utc)),
    (3, 5, 2, "A bit too sweet for my personal taste, but the bottle size is generous for the price.", datetime.datetime(2026, 9, 30, 12, 10, tzinfo=datetime.timezone.utc)),
    (5, 5, 4, "Spritzes evenly and does not leave any sticky residue on clothes or skin.", datetime.datetime(2026, 10, 7, 15, 45, tzinfo=datetime.timezone.utc)),

    # Product 6: peach-blossom-fragrance (Fragrances) - 4 reviews
    (2, 6, 5, "Authentic juicy peach opening with crisp blossom notes. Not synthetic at all!", datetime.datetime(2026, 9, 18, 15, 0, tzinfo=datetime.timezone.utc)),
    (3, 6, 4, "Light and sparkling for spring days. The citrus note adds an uplifting freshness.", datetime.datetime(2026, 9, 26, 10, 30, tzinfo=datetime.timezone.utc)),
    (4, 6, 5, "One of my absolute favorites! Very reminiscent of Japanese boutique fruit fragrances.", datetime.datetime(2026, 10, 3, 14, 15, tzinfo=datetime.timezone.utc)),
    (6, 6, 3, "Love the fragrance itself but requires reapplication after roughly 3 hours.", datetime.datetime(2026, 10, 9, 11, 0, tzinfo=datetime.timezone.utc)),

    # Product 7: soft-cotton-perfume (Fragrances) - 4 reviews
    (1, 7, 5, "The cleanest laundry scent ever! Gives an effortless fresh-out-of-the-dryer vibe all day.", datetime.datetime(2026, 9, 20, 17, 0, tzinfo=datetime.timezone.utc)),
    (3, 7, 4, "Wonderful for spritzing bedding and sweaters before going to morning classes.", datetime.datetime(2026, 9, 28, 12, 0, tzinfo=datetime.timezone.utc)),
    (4, 7, 4, "Non-irritating on sensitive skin. Very calming and relaxing before sleeping.", datetime.datetime(2026, 10, 5, 16, 20, tzinfo=datetime.timezone.utc)),
    (5, 7, 5, "Minimalist clean scent profile that never causes headache or sensory overload.", datetime.datetime(2026, 10, 13, 9, 30, tzinfo=datetime.timezone.utc)),

    # Product 8: rosy-glow-lip-tint (Beauty & Makeup) - 5 reviews
    (2, 8, 5, "Stays dewy for hours without feeling sticky. Gives the prettiest natural berry flush!", datetime.datetime(2026, 9, 22, 20, 0, tzinfo=datetime.timezone.utc)),
    (3, 8, 4, "Hydrating texture that doesn't accentuate dry lip lines. The applicator sponge is soft.", datetime.datetime(2026, 9, 29, 18, 10, tzinfo=datetime.timezone.utc)),
    (4, 8, 5, "Leaves a long-lasting gentle tint even after drinking coffee or eating lunch.", datetime.datetime(2026, 10, 6, 22, 0, tzinfo=datetime.timezone.utc)),
    (5, 8, 1, "The cap leaked slightly inside my makeup bag when turned upside down.", datetime.datetime(2026, 10, 12, 19, 15, tzinfo=datetime.timezone.utc)),
    (6, 8, 5, "The shine is glassy and reflective like high-end Korean lip oils. Definite staple.", datetime.datetime(2026, 10, 16, 21, 30, tzinfo=datetime.timezone.utc)),

    # Product 9: peach-cream-blush (Beauty & Makeup) - 4 reviews
    (1, 9, 4, "Melts into the skin seamlessly with fingertips. Very flattering peachy-pink tone.", datetime.datetime(2026, 9, 24, 11, 0, tzinfo=datetime.timezone.utc)),
    (2, 9, 5, "Sets to a velvety matte finish that doesn't fade throughout eight-hour college days.", datetime.datetime(2026, 10, 2, 15, 30, tzinfo=datetime.timezone.utc)),
    (4, 9, 4, "Buildable pigment so you can keep it sheer or layer for a vivid cheerful cheek glow.", datetime.datetime(2026, 10, 10, 13, 0, tzinfo=datetime.timezone.utc)),
    (6, 9, 4, "Compact mirror inside the lid is handy for quick touch-ups between seminars.", datetime.datetime(2026, 10, 17, 10, 45, tzinfo=datetime.timezone.utc)),

    # Product 10: everyday-makeup-brush-set (Beauty & Makeup) - 4 reviews
    (1, 10, 5, "Bristles are incredibly silky and soft. No shedding even after washing with gentle shampoo.", datetime.datetime(2026, 9, 25, 14, 0, tzinfo=datetime.timezone.utc)),
    (2, 10, 4, "The rose gold ferrules look chic on my vanity. All five brush sizes are truly practical.", datetime.datetime(2026, 10, 3, 11, 30, tzinfo=datetime.timezone.utc)),
    (4, 10, 5, "Blends cream and powder eyeshadow effortlessly without harsh demarcation lines.", datetime.datetime(2026, 10, 9, 16, 20, tzinfo=datetime.timezone.utc)),
    (5, 10, 3, "Solid basic set, though I wish it included a dedicated angled brow brush as well.", datetime.datetime(2026, 10, 15, 12, 15, tzinfo=datetime.timezone.utc)),

    # Product 11: soft-pink-beauty-sponge-set (Beauty & Makeup) - 4 reviews
    (2, 11, 5, "Expands to twice its size when damp and gives an airbrushed finish with any foundation.", datetime.datetime(2026, 9, 26, 13, 10, tzinfo=datetime.timezone.utc)),
    (3, 11, 4, "Tear drop tip gets right into the inner corners of under-eyes without tugging skin.", datetime.datetime(2026, 10, 4, 17, 45, tzinfo=datetime.timezone.utc)),
    (4, 11, 4, "Durable latex-free foam that doesn't rip easily when squeezed dry with a towel.", datetime.datetime(2026, 10, 11, 9, 50, tzinfo=datetime.timezone.utc)),
    (6, 11, 5, "Three pack is fantastic value. Softest sponges I have used this semester.", datetime.datetime(2026, 10, 18, 14, 0, tzinfo=datetime.timezone.utc)),

    # Product 12: pastel-hair-claw-set (Accessories & Gifts) - 4 reviews
    (1, 12, 5, "Strong spring that actually holds thick wavy hair in a French twist all afternoon!", datetime.datetime(2026, 9, 27, 10, 0, tzinfo=datetime.timezone.utc)),
    (2, 12, 5, "Matte finish is smooth with no sharp seam edges. The pastel colors are so aesthetic.", datetime.datetime(2026, 10, 5, 15, 15, tzinfo=datetime.timezone.utc)),
    (4, 12, 4, "Doesn't slip or cause headache tension like cheaper plastic drugstore claws.", datetime.datetime(2026, 10, 12, 11, 40, tzinfo=datetime.timezone.utc)),
    (6, 12, 4, "Holds hair securely during laboratory classes and study sessions. Very pleased.", datetime.datetime(2026, 10, 19, 16, 30, tzinfo=datetime.timezone.utc)),

    # Product 13: heart-vanity-mirror (Accessories & Gifts) - 4 reviews
    (2, 13, 5, "The cutest addition to my bedroom desk! The 3x magnifying side is clear with zero distortion.", datetime.datetime(2026, 9, 28, 16, 0, tzinfo=datetime.timezone.utc)),
    (3, 13, 4, "Rotates smoothly and stays in position without drooping. Stable weighted base.", datetime.datetime(2026, 10, 7, 18, 20, tzinfo=datetime.timezone.utc)),
    (4, 13, 5, "Pale pink pastel frame looks super aesthetic in room decor photos and daily makeup routines.", datetime.datetime(2026, 10, 13, 14, 10, tzinfo=datetime.timezone.utc)),
    (5, 13, 3, "Mirror reflection is crystal clear, though the plastic swivel screw needed tightening out of box.", datetime.datetime(2026, 10, 18, 10, 0, tzinfo=datetime.timezone.utc)),

    # Product 14: cute-bow-hair-clips (Accessories & Gifts) - 4 reviews
    (1, 14, 4, "The alligator clip teeth have a rubberized coating so they do not snag delicate hair.", datetime.datetime(2026, 9, 29, 12, 30, tzinfo=datetime.timezone.utc)),
    (2, 14, 5, "Silky satin ribbon holds its shape crisp and neat. Instant coquette vintage aesthetic!", datetime.datetime(2026, 10, 8, 13, 50, tzinfo=datetime.timezone.utc)),
    (4, 14, 5, "Wore them for college cultural festival presentations and received many sweet compliments.", datetime.datetime(2026, 10, 14, 17, 15, tzinfo=datetime.timezone.utc)),
    (6, 14, 4, "Very cute and lightweight. They stay in place even during brisk walks across campus.", datetime.datetime(2026, 10, 20, 15, 0, tzinfo=datetime.timezone.utc)),

    # Product 15: floral-makeup-pouch (Accessories & Gifts) - 5 reviews
    (1, 15, 5, "The quilting is thick and protective. Fits my daily lip tint, powder, mirror, and keys easily.", datetime.datetime(2026, 9, 30, 15, 45, tzinfo=datetime.timezone.utc)),
    (2, 15, 5, "Charming vintage floral fabric with a smooth gold zipper that glides without snagging.", datetime.datetime(2026, 10, 9, 19, 0, tzinfo=datetime.timezone.utc)),
    (3, 15, 4, "Water-resistant lining inside makes it easy to wipe down in case of accidental makeup spills.", datetime.datetime(2026, 10, 14, 11, 20, tzinfo=datetime.timezone.utc)),
    (4, 15, 4, "Adorable print and spacious enough for all essentials without being bulky in a backpack.", datetime.datetime(2026, 10, 17, 16, 40, tzinfo=datetime.timezone.utc)),
    (5, 15, 2, "Stitching is great but the zipper pull tag could be slightly wider for easier grip.", datetime.datetime(2026, 10, 21, 13, 10, tzinfo=datetime.timezone.utc)),
]


def reset_and_seed(verbose: bool = True):
    """Resets tables and populates deterministic demonstration data."""
    if verbose:
        print("Ensuring tables exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if verbose:
            print("Clearing existing demo reviews, products, and users...")
        db.execute(text("TRUNCATE TABLE reviews, products, users RESTART IDENTITY CASCADE"))
        db.commit()

        # 1. Insert Users
        created_users = []
        for u in USERS_DATA:
            user = User(
                full_name=u["full_name"],
                email=u["email"].lower(),
                password_hash=hash_password(u["password"]),
                role=u["role"],
                created_at=u["created_at"],
            )
            db.add(user)
            created_users.append(user)
        db.commit()
        for u in created_users:
            db.refresh(u)
        if verbose:
            print(f"Created {len(created_users)} users (1 Admin + {len(created_users)-1} Students)")

        # 2. Insert Products
        created_products = []
        for p in PRODUCTS_DATA:
            product = Product(
                slug=p["slug"],
                name=p["name"],
                category=p["category"],
                description=p["description"],
                image_path=p["image_path"],
            )
            db.add(product)
            created_products.append(product)
        db.commit()
        for p in created_products:
            db.refresh(p)
        if verbose:
            print(f"Created {len(created_products)} curated catalog products")

        # 3. Insert Reviews
        reviews_count = 0
        for student_idx, prod_idx, rating, text_body, created_at in REVIEWS_SPEC:
            user = created_users[student_idx]
            prod = created_products[prod_idx]
            cleaned = clean_text(text_body)
            review = Review(
                product_id=prod.id,
                user_id=user.id,
                reviewer_name=user.full_name,
                rating=rating,
                review_text=text_body,
                cleaned_text=cleaned,
                source="demo_seed",
                created_at=created_at,
            )
            db.add(review)
            reviews_count += 1
        db.commit()
        if verbose:
            print(f"Created {reviews_count} synthetic reviews (source=demo_seed)")

        # Summary check
        user_cnt = db.execute(select(func.count(User.id))).scalar()
        prod_cnt = db.execute(select(func.count(Product.id))).scalar()
        rev_cnt = db.execute(select(func.count(Review.id))).scalar()
        avg_rtg = db.execute(select(func.avg(Review.rating))).scalar()
        if verbose:
            print("\nDatabase Seed Complete:")
            print(f"  Total users:     {user_cnt}")
            print(f"  Total products:  {prod_cnt}")
            print(f"  Total reviews:   {rev_cnt}")
            print(f"  Average rating:  {float(avg_rtg):.2f} / 5.0")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed ReviewLens database")
    parser.add_argument("--reset", action="store_true", help="Reset and re-seed database")
    args = parser.parse_args()
    reset_and_seed(verbose=True)
