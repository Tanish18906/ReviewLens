from fastapi import APIRouter, Depends
from sqlalchemy import func, select, desc
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User, Product, Review
from app.schemas import (
    AdminOverviewResponse,
    RatingBucket,
    TopProductItem,
    RecentReviewItem,
)
from app.dependencies import require_admin_user

router = APIRouter(prefix="/admin", tags=["Admin Analytics"])


@router.get("/overview", response_model=AdminOverviewResponse)
def get_admin_overview(
    _admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    # 1. Totals
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_reviews = db.query(func.count(Review.id)).scalar() or 0
    raw_avg_rating = db.query(func.avg(Review.rating)).scalar()
    avg_rating = round(float(raw_avg_rating), 1) if raw_avg_rating is not None else None

    # 2. Rating distribution (5 buckets: 1 to 5 stars)
    distribution_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    dist_rows = (
        db.query(Review.rating, func.count(Review.id))
        .group_by(Review.rating)
        .all()
    )
    for rating_val, count in dist_rows:
        if rating_val in distribution_counts:
            distribution_counts[rating_val] = count

    rating_distribution = [
        RatingBucket(rating=r, count=distribution_counts[r])
        for r in range(1, 6)
    ]

    # 3. Top products by review count
    top_rows = (
        db.query(
            Product.id,
            Product.slug,
            Product.name,
            Product.category,
            func.count(Review.id).label("rev_count"),
            func.avg(Review.rating).label("avg_rating"),
        )
        .outerjoin(Review, Product.id == Review.product_id)
        .group_by(Product.id)
        .order_by(desc("rev_count"), desc("avg_rating"), Product.name)
        .limit(5)
        .all()
    )

    top_products = [
        TopProductItem(
            id=row[0],
            slug=row[1],
            name=row[2],
            category=row[3],
            review_count=int(row[4]),
            average_rating=round(float(row[5]), 1) if row[5] is not None else None,
        )
        for row in top_rows
    ]

    # 4. Recent reviews
    recent_rows = (
        db.query(
            Review.id,
            Product.name.label("product_name"),
            Product.slug.label("product_slug"),
            Review.reviewer_name,
            Review.rating,
            Review.review_text,
            Review.created_at,
        )
        .join(Product, Review.product_id == Product.id)
        .order_by(desc(Review.created_at))
        .limit(5)
        .all()
    )

    recent_reviews = [
        RecentReviewItem(
            id=row[0],
            product_name=row[1],
            product_slug=row[2],
            reviewer_name=row[3],
            rating=row[4],
            review_text=row[5],
            created_at=row[6],
        )
        for row in recent_rows
    ]

    return AdminOverviewResponse(
        total_users=total_users,
        total_products=total_products,
        total_reviews=total_reviews,
        average_rating=avg_rating,
        rating_distribution=rating_distribution,
        top_products=top_products,
        recent_reviews=recent_reviews,
    )
