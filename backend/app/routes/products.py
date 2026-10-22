import datetime
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, desc, asc
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.db import get_db
from app.models import Product, Review, User
from app.schemas import (
    ProductListResponse,
    ProductListItem,
    ProductDetailResponse,
    ReviewListResponse,
    ReviewResponse,
    ReviewCreateRequest,
)
from app.dependencies import get_current_user
from app.services.preprocess import clean_text

logger = logging.getLogger("reviewlens.products")
router = APIRouter(prefix="/products", tags=["Products & Reviews"])


@router.get("", response_model=ProductListResponse)
def list_products(
    q: Optional[str] = Query(None, description="Search term for name or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sort: Optional[str] = Query("name_asc", description="Sort order: name_asc, rating_desc, reviews_desc"),
    limit: int = Query(24, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    try:
        # Subquery for product review statistics
        # Compute count and avg rating dynamically without denormalized columns
        stats_subquery = (
            select(
                Review.product_id,
                func.count(Review.id).label("sub_rev_count"),
                func.avg(Review.rating).label("sub_avg_rating"),
            )
            .group_by(Review.product_id)
            .subquery()
        )

        review_count_expr = func.coalesce(stats_subquery.c.sub_rev_count, 0).label("review_count")
        avg_rating_expr = stats_subquery.c.sub_avg_rating.label("avg_rating")

        base_query = (
            select(
                Product,
                review_count_expr,
                avg_rating_expr,
            )
            .outerjoin(stats_subquery, Product.id == stats_subquery.c.product_id)
        )

        # Filter by search term
        if q and q.strip():
            search_term = f"%{q.strip().lower()}%"
            base_query = base_query.where(
                func.lower(Product.name).like(search_term) | func.lower(Product.description).like(search_term)
            )

        # Filter by category
        if category and category.strip() and category.strip().lower() != "all":
            base_query = base_query.where(func.lower(Product.category) == category.strip().lower())

        # Get total count before pagination
        count_query = select(func.count()).select_from(base_query.subquery())
        total = db.execute(count_query).scalar() or 0

        # Sort
        if sort == "rating_desc":
            # Sort highest rating first; nulls last, then tiebreak by review count desc, name asc
            base_query = base_query.order_by(
                desc(avg_rating_expr).nullslast(),
                desc(review_count_expr),
                asc(Product.name)
            )
        elif sort == "reviews_desc":
            # Sort most reviewed first, tiebreak by rating desc, name asc
            base_query = base_query.order_by(
                desc(review_count_expr),
                desc(avg_rating_expr).nullslast(),
                asc(Product.name)
            )
        else:  # name_asc (default)
            base_query = base_query.order_by(asc(Product.name))

        # Paginate
        paged_query = base_query.offset(offset).limit(limit)
        rows = db.execute(paged_query).all()

        items = []
        for prod, rev_count, avg_rating in rows:
            items.append(
                ProductListItem(
                    id=prod.id,
                    slug=prod.slug,
                    name=prod.name,
                    category=prod.category,
                    description=prod.description,
                    image_path=prod.image_path,
                    average_rating=round(float(avg_rating), 1) if avg_rating is not None else None,
                    review_count=int(rev_count),
                )
            )

        return ProductListResponse(items=items, total=total)

    except SQLAlchemyError as exc:
        logger.error(f"Database error in list_products: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load catalog from database.",
        )
    except Exception as exc:
        logger.error(f"Unexpected error in list_products: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while loading products.",
        )


@router.get("/{slug}", response_model=ProductDetailResponse)
def get_product(slug: str, db: Session = Depends(get_db)):
    # Query product with aggregate review stats
    stats_query = (
        select(
            Product,
            func.count(Review.id).label("review_count"),
            func.avg(Review.rating).label("avg_rating"),
        )
        .outerjoin(Review, Product.id == Review.product_id)
        .where(Product.slug == slug)
        .group_by(Product.id)
    )

    row = db.execute(stats_query).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="We couldn't find that product.",
        )

    prod, rev_count, avg_rating = row
    return ProductDetailResponse(
        id=prod.id,
        slug=prod.slug,
        name=prod.name,
        category=prod.category,
        description=prod.description,
        image_path=prod.image_path,
        average_rating=round(float(avg_rating), 1) if avg_rating is not None else None,
        review_count=int(rev_count),
    )


@router.get("/{slug}/reviews", response_model=ReviewListResponse)
def get_product_reviews(
    slug: str,
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.slug == slug).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="We couldn't find that product.",
        )

    # Count total reviews
    total = (
        db.query(func.count(Review.id))
        .filter(Review.product_id == product.id)
        .scalar()
        or 0
    )

    # Fetch reviews sorted newest first
    reviews = (
        db.query(Review)
        .filter(Review.product_id == product.id)
        .order_by(desc(Review.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )

    return ReviewListResponse(
        items=[ReviewResponse.model_validate(r) for r in reviews],
        total=total,
    )


@router.post("/{slug}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    slug: str,
    payload: ReviewCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.slug == slug).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="We couldn't find that product.",
        )

    # Check duplicate review constraint for this user and product
    existing_review = (
        db.query(Review)
        .filter(Review.product_id == product.id, Review.user_id == current_user.id)
        .first()
    )
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this product.",
        )

    cleaned = clean_text(payload.review_text)

    new_review = Review(
        product_id=product.id,
        user_id=current_user.id,
        reviewer_name=current_user.full_name,
        rating=payload.rating,
        review_text=payload.review_text,
        cleaned_text=cleaned,
        source="user",
        created_at=datetime.datetime.now(datetime.timezone.utc),
    )

    try:
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this product.",
        )

    return ReviewResponse.model_validate(new_review)
