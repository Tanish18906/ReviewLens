#!/usr/bin/env python3
"""Script to download real product photography for ReviewLens products and update DB."""

import os
import subprocess
import urllib.request
from pathlib import Path
from app.db import SessionLocal
from app.models import Product

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PUBLIC_PRODUCTS_DIR = BASE_DIR / "frontend" / "public" / "products"

IMAGES = {
    "wireless-headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop&q=80",
    "mechanical-keyboard": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&h=600&fit=crop&q=80",
    "smart-fitness-watch": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&q=80",
    "ergonomic-office-chair": "https://images.unsplash.com/photo-1594235048794-fae8583a5af5?w=800&h=600&fit=crop&q=80",
    "noise-cancelling-earbuds": "https://images.unsplash.com/photo-1590658165737-15a047b7c0b0?w=800&h=600&fit=crop&q=80",
    "laptop-stand-aluminum": "https://plus.unsplash.com/premium_photo-1683736986821-e4662912a70d?w=800&h=600&fit=crop&q=80",
    "usb-c-multiport-hub": "https://plus.unsplash.com/premium_photo-1761043248662-42f371ad31b4?w=800&h=600&fit=crop&q=80",
    "ultrawide-desk-mat": "https://images.unsplash.com/photo-1781120199906-9ebcb5644407?w=800&h=600&fit=crop&q=80",
    "smart-led-desk-lamp": "https://images.unsplash.com/photo-1519219788971-8d9797e0928e?w=800&h=600&fit=crop&q=80",
    "hd-webcam-microphone": "https://upload.wikimedia.org/wikipedia/commons/7/7f/Webcam_on_computer_screen.jpg",
}

def download_and_format_images():
    PUBLIC_PRODUCTS_DIR.mkdir(parents=True, exist_ok=True)
    headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}

    for slug, url in IMAGES.items():
        dest_jpg = PUBLIC_PRODUCTS_DIR / f"{slug}.jpg"
        temp_file = PUBLIC_PRODUCTS_DIR / f"temp_{slug}.jpg"

        print(f"Downloading real image for: {slug}...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp, open(temp_file, "wb") as f:
            f.write(resp.read())

        # Resize and center-crop to exact 800x600 4:3 with ffmpeg
        cmd = [
            "ffmpeg",
            "-y",
            "-i", str(temp_file),
            "-vf", "scale=800:600:force_original_aspect_ratio=increase,crop=800:600",
            "-q:v", "2",
            str(dest_jpg),
        ]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if temp_file.exists():
            temp_file.unlink()

        if res.returncode == 0 and dest_jpg.exists():
            print(f"  ✓ Saved 800x600: {dest_jpg.name} ({dest_jpg.stat().st_size // 1024} KB)")
        else:
            print(f"  ✗ Failed processing {slug}")

def update_database_image_paths():
    print("\nUpdating PostgreSQL product image paths...")
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        for p in products:
            new_path = f"/products/{p.slug}.jpg"
            p.image_path = new_path
        db.commit()
        print(f"Successfully updated image_path for {len(products)} products in database.")
    finally:
        db.close()

if __name__ == "__main__":
    download_and_format_images()
    update_database_image_paths()
