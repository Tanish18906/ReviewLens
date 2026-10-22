#!/usr/bin/env python3
"""Deterministic demo seed/reset script for ReviewLens Semester 3 prototype.

Seeds:
- 1 Pre-created Administrator account (admin@reviewlens.edu)
- 6 Student demo accounts (student1@reviewlens.edu - student6@reviewlens.edu)
- 10 Curated Products across 5 common categories
- 48 Realistic synthetic reviews with varied ratings (1-5) and UTC timestamps
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

# 10 Curated Products
PRODUCTS_DATA = [
    {
        "slug": "wireless-headphones",
        "name": "AcousticPro Wireless Headphones",
        "category": "Audio",
        "description": "Comfortable over-ear Bluetooth headphones with active noise cancellation, low latency audio, and up to 30 hours of continuous battery life.",
        "image_path": "/products/wireless-headphones.jpg",
    },
    {
        "slug": "mechanical-keyboard",
        "name": "KeyCraft Tactile Mechanical Keyboard",
        "category": "Computing",
        "description": "Compact tenkeyless mechanical keyboard featuring hot-swappable tactile switches, durable PBT keycaps, and customizable white backlighting.",
        "image_path": "/products/mechanical-keyboard.jpg",
    },
    {
        "slug": "smart-fitness-watch",
        "name": "PulseTrack Smart Fitness Watch",
        "category": "Wearables",
        "description": "Lightweight health tracker with continuous heart rate monitoring, sleep analysis, 5ATM water resistance, and crisp AMOLED display.",
        "image_path": "/products/smart-fitness-watch.jpg",
    },
    {
        "slug": "ergonomic-office-chair",
        "name": "ErgoFlex Mesh Desk Chair",
        "category": "Home Office",
        "description": "Breathable mesh ergonomic chair with dynamic lumbar support, 3D armrests, and smooth reclining tension control for long study sessions.",
        "image_path": "/products/ergonomic-office-chair.jpg",
    },
    {
        "slug": "noise-cancelling-earbuds",
        "name": "EchoFree True Wireless Earbuds",
        "category": "Audio",
        "description": "In-ear wireless earbuds featuring hybrid active noise cancellation, transparency audio mode, and quick Qi-wireless charging case.",
        "image_path": "/products/noise-cancelling-earbuds.jpg",
    },
    {
        "slug": "laptop-stand-aluminum",
        "name": "AluRise Adjustable Laptop Stand",
        "category": "Accessories",
        "description": "Sturdy anodized aluminum stand with multi-angle height adjustment, ventilation cutouts, and anti-slip silicone cushions.",
        "image_path": "/products/laptop-stand-aluminum.jpg",
    },
    {
        "slug": "usb-c-multiport-hub",
        "name": "ConnectPro 7-in-1 USB-C Hub",
        "category": "Computing",
        "description": "Compact expansion hub providing 4K HDMI output, three USB 3.0 ports, SD/microSD card slots, and 100W USB-C Power Delivery pass-through.",
        "image_path": "/products/usb-c-multiport-hub.jpg",
    },
    {
        "slug": "ultrawide-desk-mat",
        "name": "DeskGuard Premium Desk Mat",
        "category": "Accessories",
        "description": "Spacious dual-sided waterproof desk pad with stitched edges, providing smooth mouse tracking and desk surface protection.",
        "image_path": "/products/ultrawide-desk-mat.jpg",
    },
    {
        "slug": "smart-led-desk-lamp",
        "name": "Lumina Eye-Care LED Task Lamp",
        "category": "Home Office",
        "description": "Flicker-free desk lamp with automated ambient light sensor, 5 color temperature presets, and a built-in USB charging port.",
        "image_path": "/products/smart-led-desk-lamp.jpg",
    },
    {
        "slug": "hd-webcam-microphone",
        "name": "ClearView 1080p HD Webcam",
        "category": "Computing",
        "description": "Plug-and-play 1080p video conferencing camera with dual noise-reducing microphones and a physical sliding privacy shutter.",
        "image_path": "/products/hd-webcam-microphone.jpg",
    },
]

# 48 Synthetic Reviews: mapped by (student_index, product_index)
# Index ranges: student_index in 1..6 (Aarav, Riddhima, Karan, Sneha, Rohan, Ananya)
# product_index in 0..9
REVIEWS_SPEC = [
    # Product 0: wireless-headphones (Audio) - 6 reviews
    (1, 0, 5, "Outstanding sound quality and the noise cancellation blocks library noise completely.", datetime.datetime(2026, 9, 10, 11, 0, tzinfo=datetime.timezone.utc)),
    (2, 0, 4, "Very comfortable for long lecture listening sessions, though the ear cups get slightly warm.", datetime.datetime(2026, 9, 12, 14, 20, tzinfo=datetime.timezone.utc)),
    (3, 0, 4, "Battery life easily lasts me three days of college commuting. Bluetooth connection is rock solid.", datetime.datetime(2026, 9, 15, 9, 30, tzinfo=datetime.timezone.utc)),
    (4, 0, 5, "Clean treble and punchy bass without distortion. The build quality feels very premium.", datetime.datetime(2026, 9, 20, 16, 10, tzinfo=datetime.timezone.utc)),
    (5, 0, 3, "Decent sound but the microphone picks up a bit of background room echo during Zoom calls.", datetime.datetime(2026, 9, 25, 10, 0, tzinfo=datetime.timezone.utc)),
    (6, 0, 4, "Great value for the price. The physical buttons are responsive and intuitive to use.", datetime.datetime(2026, 10, 1, 18, 45, tzinfo=datetime.timezone.utc)),

    # Product 1: mechanical-keyboard (Computing) - 5 reviews
    (1, 1, 5, "Typing feel is extremely satisfying. The tactile bump is noticeable without being annoyingly loud.", datetime.datetime(2026, 9, 11, 12, 0, tzinfo=datetime.timezone.utc)),
    (2, 1, 4, "Keycaps have a pleasant textured finish. Clean design without unnecessary gaming branding.", datetime.datetime(2026, 9, 16, 17, 30, tzinfo=datetime.timezone.utc)),
    (3, 1, 5, "Compact layout frees up a ton of mouse space on my desk. Hot-swap sockets work as advertised.", datetime.datetime(2026, 9, 22, 13, 15, tzinfo=datetime.timezone.utc)),
    (4, 1, 2, "Spacebar has a noticeable rattle right out of the box. Stabilizers need lubrication.", datetime.datetime(2026, 9, 28, 15, 40, tzinfo=datetime.timezone.utc)),
    (5, 1, 4, "Solid metal backplate gives it good weight so it doesn't slide across the table.", datetime.datetime(2026, 10, 5, 11, 25, tzinfo=datetime.timezone.utc)),

    # Product 2: smart-fitness-watch (Wearables) - 5 reviews
    (2, 2, 4, "Pedometer and heart rate sensors match my treadmill readouts closely. Screen is bright outdoors.", datetime.datetime(2026, 9, 13, 8, 45, tzinfo=datetime.timezone.utc)),
    (3, 2, 3, "Companion mobile app is a bit cluttered, but the hardware itself is lightweight and reliable.", datetime.datetime(2026, 9, 18, 19, 10, tzinfo=datetime.timezone.utc)),
    (4, 2, 5, "Battery lasts a full week even with daily morning runs recorded. Extremely happy with it.", datetime.datetime(2026, 9, 24, 7, 30, tzinfo=datetime.timezone.utc)),
    (5, 2, 4, "Sleep tracking accurately caught my restless nights during midterm exam week.", datetime.datetime(2026, 10, 2, 21, 0, tzinfo=datetime.timezone.utc)),
    (6, 2, 3, "Strap material caused mild skin itching after sweaty workouts until I swapped it out.", datetime.datetime(2026, 10, 8, 14, 50, tzinfo=datetime.timezone.utc)),

    # Product 3: ergonomic-office-chair (Home Office) - 5 reviews
    (1, 3, 5, "Significantly reduced my lower back stiffness after 6-hour coding assignments. Excellent support.", datetime.datetime(2026, 9, 14, 16, 0, tzinfo=datetime.timezone.utc)),
    (3, 3, 4, "Mesh back keeps cool in summer heat. Assembly took about 25 minutes with the included allen key.", datetime.datetime(2026, 9, 19, 10, 15, tzinfo=datetime.timezone.utc)),
    (4, 3, 5, "Armrests have great 3D adjustability. Much sturdier than cheap local office store chairs.", datetime.datetime(2026, 9, 27, 18, 20, tzinfo=datetime.timezone.utc)),
    (5, 3, 3, "Seat cushion could be slightly thicker for people sitting all day, but ergonomic shape is great.", datetime.datetime(2026, 10, 4, 12, 40, tzinfo=datetime.timezone.utc)),
    (6, 3, 4, "Wheels roll smoothly on hard laminate floors without scratching the surface.", datetime.datetime(2026, 10, 11, 16, 30, tzinfo=datetime.timezone.utc)),

    # Product 4: noise-cancelling-earbuds (Audio) - 5 reviews
    (1, 4, 4, "Compact charging case easily fits in pocket. Sound signature is balanced and natural.", datetime.datetime(2026, 9, 17, 13, 0, tzinfo=datetime.timezone.utc)),
    (2, 4, 5, "Transparency mode is very clear when ordering coffee or crossing streets safely.", datetime.datetime(2026, 9, 21, 11, 45, tzinfo=datetime.timezone.utc)),
    (3, 4, 2, "Ear tips didn't seal well in my left ear, resulting in weak bass response.", datetime.datetime(2026, 9, 29, 9, 15, tzinfo=datetime.timezone.utc)),
    (5, 4, 4, "Quick 10-minute charge gives almost two hours of playback when in a rush.", datetime.datetime(2026, 10, 6, 17, 0, tzinfo=datetime.timezone.utc)),
    (6, 4, 4, "Touch controls are responsive without accidental trigger when adjusting in the ear.", datetime.datetime(2026, 10, 12, 10, 20, tzinfo=datetime.timezone.utc)),

    # Product 5: laptop-stand-aluminum (Accessories) - 5 reviews
    (1, 5, 5, "Simple, elegant, and rock solid aluminum. Eliminates neck strain when working at my desk.", datetime.datetime(2026, 9, 15, 14, 0, tzinfo=datetime.timezone.utc)),
    (2, 5, 5, "Folds completely flat so I can carry it in my college backpack every single day.", datetime.datetime(2026, 9, 23, 16, 30, tzinfo=datetime.timezone.utc)),
    (4, 5, 4, "Silicone padding protects laptop finish from scratches. Well engineered product.", datetime.datetime(2026, 9, 30, 12, 10, tzinfo=datetime.timezone.utc)),
    (5, 5, 4, "Good heat dissipation compared to resting a hot laptop directly on wooden tables.", datetime.datetime(2026, 10, 7, 15, 45, tzinfo=datetime.timezone.utc)),
    (6, 5, 3, "A bit stiff to adjust the angle initially, but holds heavy 16-inch laptops without slipping.", datetime.datetime(2026, 10, 14, 18, 0, tzinfo=datetime.timezone.utc)),

    # Product 6: usb-c-multiport-hub (Computing) - 5 reviews
    (1, 6, 4, "Provides all ports missing from modern laptops. 4K 60Hz HDMI works without screen flickering.", datetime.datetime(2026, 9, 18, 15, 0, tzinfo=datetime.timezone.utc)),
    (2, 6, 3, "Gets slightly warm during continuous 100W power passthrough, but transfer speeds remain high.", datetime.datetime(2026, 9, 26, 10, 30, tzinfo=datetime.timezone.utc)),
    (3, 6, 4, "SD card reader speeds are fast enough for quick photo transfer from my DSLR camera.", datetime.datetime(2026, 10, 3, 14, 15, tzinfo=datetime.timezone.utc)),
    (4, 6, 1, "HDMI port became intermittent after three weeks of plugging and unplugging.", datetime.datetime(2026, 10, 9, 11, 0, tzinfo=datetime.timezone.utc)),
    (6, 6, 4, "Braided cable gives confidence it won't fray around the connector neck.", datetime.datetime(2026, 10, 15, 13, 40, tzinfo=datetime.timezone.utc)),

    # Product 7: ultrawide-desk-mat (Accessories) - 4 reviews
    (2, 7, 5, "Extremely smooth surface for optical mouse sensor. Spilled water wiped right off.", datetime.datetime(2026, 9, 20, 17, 0, tzinfo=datetime.timezone.utc)),
    (3, 7, 4, "Edge stitching is clean and doesn't fray against wrists during typing.", datetime.datetime(2026, 9, 28, 12, 0, tzinfo=datetime.timezone.utc)),
    (4, 7, 4, "Large enough to fit full keyboard and mouse pad comfortably without crowding.", datetime.datetime(2026, 10, 5, 16, 20, tzinfo=datetime.timezone.utc)),
    (5, 7, 4, "Subtle dark color looks professional and doesn't show desk dust easily.", datetime.datetime(2026, 10, 13, 9, 30, tzinfo=datetime.timezone.utc)),

    # Product 8: smart-led-desk-lamp (Home Office) - 5 reviews
    (1, 8, 5, "Warm reading light preset is easy on the eyes late at night. No audible buzzing noise.", datetime.datetime(2026, 9, 22, 20, 0, tzinfo=datetime.timezone.utc)),
    (2, 8, 4, "Auto-dimming feature adjusts brightness smoothly when room lights change.", datetime.datetime(2026, 9, 29, 18, 10, tzinfo=datetime.timezone.utc)),
    (3, 8, 4, "USB port in the base is very convenient for charging my phone overnight.", datetime.datetime(2026, 10, 6, 22, 0, tzinfo=datetime.timezone.utc)),
    (4, 8, 5, "Gooseneck holds position securely without drooping over time. Highly recommended.", datetime.datetime(2026, 10, 12, 19, 15, tzinfo=datetime.timezone.utc)),
    (6, 8, 3, "Touch controls can be slightly sensitive if bumped accidentally while organizing papers.", datetime.datetime(2026, 10, 16, 21, 30, tzinfo=datetime.timezone.utc)),

    # Product 9: hd-webcam-microphone (Computing) - 4 reviews
    (1, 9, 4, "Picture is sharp and colors look natural under normal room lighting without harsh glare.", datetime.datetime(2026, 9, 24, 11, 0, tzinfo=datetime.timezone.utc)),
    (3, 9, 4, "Physical privacy shutter provides peace of mind when not on active calls.", datetime.datetime(2026, 10, 2, 15, 30, tzinfo=datetime.timezone.utc)),
    (4, 9, 2, "Stereo mic audio sounds a bit hollow in rooms with high ceilings and no carpeting.", datetime.datetime(2026, 10, 10, 13, 0, tzinfo=datetime.timezone.utc)),
    (5, 9, 4, "Plug and play worked immediately on Ubuntu and Mac without installing special drivers.", datetime.datetime(2026, 10, 17, 10, 45, tzinfo=datetime.timezone.utc)),
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
