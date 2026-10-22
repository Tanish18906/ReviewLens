import datetime
from sqlalchemy import (
    Column,
    Integer,
    SmallInteger,
    String,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index,
    func,
)
from sqlalchemy.orm import relationship
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(16), nullable=False, default="student")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        server_default=func.now(),
    )

    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    category = Column(String(60), index=True, nullable=False)
    description = Column(Text, nullable=False)
    image_path = Column(String(255), nullable=False)

    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reviewer_name = Column(String(100), nullable=False)
    rating = Column(SmallInteger, nullable=False)
    review_text = Column(Text, nullable=False)
    cleaned_text = Column(Text, nullable=False, default="")
    source = Column(String(16), nullable=False, default="user")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        server_default=func.now(),
    )

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_between_1_and_5"),
        UniqueConstraint("user_id", "product_id", name="uq_user_product_review"),
        Index("ix_reviews_product_created", "product_id", created_at.desc()),
        Index("ix_reviews_created_at_desc", created_at.desc()),
    )


class CorpusSample(Base):
    __tablename__ = "corpus_samples"

    id = Column(Integer, primary_key=True, index=True)
    source_site = Column(String(30), nullable=False, default="amazon")
    source_line = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=False)
    provided_label = Column(SmallInteger, nullable=False)
    cleaned_text = Column(Text, nullable=False, default="")
    imported_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        server_default=func.now(),
    )

    __table_args__ = (
        UniqueConstraint("source_site", "source_line", name="uq_corpus_source_line"),
    )
