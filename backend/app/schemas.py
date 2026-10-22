import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict


# --- Auth Schemas ---

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="User's full display name")
    email: EmailStr = Field(..., description="Unique email address")
    password: str = Field(..., min_length=8, max_length=128, description="Minimum 8 characters password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("full_name")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        name = v.strip()
        if not name:
            raise ValueError("Full name cannot be empty or whitespace only")
        return name


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


# --- Product Schemas ---

class ProductListItem(BaseModel):
    id: int
    slug: str
    name: str
    category: str
    description: str
    image_path: str
    average_rating: Optional[float] = None
    review_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    items: List[ProductListItem]
    total: int


class ProductDetailResponse(BaseModel):
    id: int
    slug: str
    name: str
    category: str
    description: str
    image_path: str
    average_rating: Optional[float] = None
    review_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# --- Review Schemas ---

class ReviewCreateRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Star rating between 1 and 5")
    review_text: str = Field(..., min_length=20, max_length=1000, description="Review text between 20 and 1000 characters")

    @field_validator("review_text")
    @classmethod
    def clean_whitespace(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 20:
            raise ValueError("Review text must be at least 20 characters after trimming whitespace")
        return stripped


class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    reviewer_name: str
    rating: int
    review_text: str
    cleaned_text: str
    source: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewListResponse(BaseModel):
    items: List[ReviewResponse]
    total: int


# --- Admin Dashboard Schemas ---

class RatingBucket(BaseModel):
    rating: int
    count: int


class TopProductItem(BaseModel):
    id: int
    slug: str
    name: str
    category: str
    review_count: int
    average_rating: Optional[float] = None


class RecentReviewItem(BaseModel):
    id: int
    product_name: str
    product_slug: str
    reviewer_name: str
    rating: int
    review_text: str
    created_at: datetime.datetime


class AdminOverviewResponse(BaseModel):
    total_users: int
    total_products: int
    total_reviews: int
    average_rating: Optional[float] = None
    rating_distribution: List[RatingBucket]
    top_products: List[TopProductItem]
    recent_reviews: List[RecentReviewItem]
