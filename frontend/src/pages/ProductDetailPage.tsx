import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { apiFetch, ApiError } from '../lib/api';
import { PageShell } from '../components/PageShell';
import { RatingStars } from '../components/RatingStars';
import { ProductCardData } from '../components/ProductCard';
import {
  ChevronRight,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Send,
  UserCheck,
} from 'lucide-react';

interface ReviewItem {
  id: number;
  product_id: number;
  user_id: number;
  reviewer_name: string;
  rating: number;
  review_text: string;
  cleaned_text: string;
  source: string;
  created_at: string;
}

interface ReviewListResponse {
  items: ReviewItem[];
  total: number;
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductCardData | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const PAGE_SIZE = 10;

  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [productError, setProductError] = useState<string | null>(null);

  // Review Form State
  const [formRating, setFormRating] = useState<number>(5);
  const [formText, setFormText] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchProduct = async () => {
    setIsLoadingProduct(true);
    setProductError(null);
    try {
      const data = await apiFetch<ProductCardData>(`/api/products/${slug}`);
      setProduct(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setProductError("We couldn't find that product.");
      } else {
        setProductError('Unable to load product details from the local server.');
      }
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const fetchReviews = async (pageNum = 0) => {
    setIsLoadingReviews(true);
    try {
      const offset = pageNum * PAGE_SIZE;
      const data = await apiFetch<ReviewListResponse>(
        `/api/products/${slug}/reviews?limit=${PAGE_SIZE}&offset=${offset}`
      );
      setReviews(data.items);
      setTotalReviews(data.total);
    } catch {
      // reviews fail silently or handled
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchProduct();
      fetchReviews(0);
    }
  }, [slug]);

  // Check if current user has already submitted a review
  const userHasReviewed = user ? reviews.some((r) => r.user_id === user.id) : false;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const trimmed = formText.trim();
    if (trimmed.length < 20) {
      setFormError('Please enter at least 20 characters describing your experience.');
      return;
    }
    if (trimmed.length > 1000) {
      setFormError('Review text cannot exceed 1000 characters.');
      return;
    }

    setFormSubmitting(true);
    try {
      await apiFetch<ReviewItem>(`/api/products/${slug}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: formRating,
          review_text: trimmed,
        }),
      });

      setFormSuccess('Your review has been successfully submitted and stored.');
      setFormText('');
      setFormRating(5);

      // Refresh product stats and review list from backend
      await Promise.all([fetchProduct(), fetchReviews(0)]);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormError('You have already submitted a review for this product.');
      } else if (err instanceof ApiError) {
        setFormError(err.detail);
      } else {
        setFormError('Failed to post review to backend.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <PageShell>
        <div className="animate-pulse space-y-6 max-w-5xl mx-auto">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 aspect-[4/3] bg-slate-200 rounded-card" />
            <div className="md:col-span-7 space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/6" />
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-20 bg-slate-100 rounded w-full" />
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (productError || !product) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto my-16 text-center bg-surface border border-border p-8 rounded-card shadow-card">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-3" />
          <h1 className="text-[20px] font-bold text-ink mb-2">Product Not Found</h1>
          <p className="text-[14px] text-muted mb-6">
            {productError || "We couldn't find that product."}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white font-medium text-[14px] rounded-control hover:bg-brand-hover transition-colors"
          >
            Return to catalog
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-muted mb-6">
          <Link to="/products" className="hover:text-ink transition-colors font-medium">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
          <span className="font-semibold text-ink truncate max-w-xs">{product.name}</span>
        </nav>

        {/* 2-Column Hero Section */}
        <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden p-6 sm:p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Image panel (~42%) */}
            <div className="md:col-span-5 aspect-[4/3] w-full bg-page rounded-control border border-border overflow-hidden">
              <img
                src={product.image_path}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Details panel (~58%) */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-muted px-2.5 py-0.5 rounded bg-muted/10 mb-2">
                  {product.category}
                </span>
                <h1 className="text-[26px] sm:text-[32px] font-bold text-ink tracking-tight mb-3">
                  {product.name}
                </h1>
                <p className="text-[15px] text-muted leading-relaxed mb-6">
                  {product.description}
                </p>
              </div>

              {/* Rating & Review Counter */}
              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {product.average_rating !== null && product.review_count > 0 ? (
                    <div className="flex items-center gap-2">
                      <RatingStars rating={product.average_rating} size="md" />
                      <span className="text-[18px] font-bold text-ink">
                        {product.average_rating.toFixed(1)}
                      </span>
                      <span className="text-[14px] text-muted">
                        ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  ) : (
                    <span className="text-[14px] text-muted italic">No ratings yet</span>
                  )}
                </div>

                {/* Write a review CTA anchor */}
                <a
                  href="#review-form"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-[13px] font-semibold rounded-control hover:bg-brand-hover shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Write a review
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 className="text-[22px] font-bold text-ink">Customer reviews</h2>
              <p className="text-[13px] text-muted mt-0.5">
                {totalReviews} recorded feedback submissions
              </p>
            </div>
          </div>

          {/* Review List */}
          {isLoadingReviews ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5 bg-surface border border-border rounded-card animate-pulse space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-border rounded-card">
              <p className="text-[15px] text-muted">
                No reviews yet. Be the first to share your experience.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => {
                const dateStr = rev.created_at
                  ? new Date(rev.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recent';

                return (
                  <article
                    key={rev.id}
                    className="p-5 bg-surface rounded-card border border-border shadow-xs hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <span className="font-semibold text-ink text-[15px]">
                          {rev.reviewer_name}
                        </span>
                        {rev.source === 'demo_seed' && (
                          <span className="ml-2 text-[10px] font-bold text-muted bg-page px-1.5 py-0.5 rounded border border-border/60">
                            Demo seed
                          </span>
                        )}
                      </div>
                      <time className="text-[12px] text-muted" dateTime={rev.created_at}>
                        {dateStr}
                      </time>
                    </div>

                    <div className="mb-2">
                      <RatingStars rating={rev.rating} size="sm" />
                    </div>

                    <p className="text-[14px] text-ink leading-relaxed whitespace-pre-line">
                      {rev.review_text}
                    </p>
                  </article>
                );
              })}

              {/* Simple Pagination Controls if > 10 reviews */}
              {totalReviews > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => {
                      const prevPage = page - 1;
                      setPage(prevPage);
                      fetchReviews(prevPage);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-control border border-border bg-surface hover:bg-page disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-muted font-medium">
                    Page {page + 1} of {Math.ceil(totalReviews / PAGE_SIZE)}
                  </span>
                  <button
                    type="button"
                    disabled={(page + 1) * PAGE_SIZE >= totalReviews}
                    onClick={() => {
                      const nextP = page + 1;
                      setPage(nextP);
                      fetchReviews(nextP);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-control border border-border bg-surface hover:bg-page disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Inline Review Submission Section */}
          <div id="review-form" className="pt-6 border-t border-border mt-10">
            <div className="bg-surface rounded-card border border-border p-6 sm:p-8 shadow-card">
              <h3 className="text-[18px] font-bold text-ink mb-1">Share your review</h3>
              <p className="text-[13px] text-muted mb-6">
                Your feedback will be stored in our PostgreSQL review database and prepared for NLP processing.
              </p>

              {!isAuthenticated ? (
                /* Unauthenticated State */
                <div className="p-6 bg-page rounded-control border border-border text-center">
                  <p className="text-[14px] text-ink font-medium mb-3">
                    Sign in to post a review for this product.
                  </p>
                  <Link
                    to={`/login?next=/products/${product.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-[13px] font-semibold rounded-control hover:bg-brand-hover shadow-xs transition-colors"
                  >
                    Sign in with Student Account
                  </Link>
                </div>
              ) : userHasReviewed ? (
                /* Already Reviewed State */
                <div className="p-5 bg-page rounded-control border border-border/80 flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="text-[14px] font-semibold text-ink">
                      You have already reviewed this product.
                    </div>
                    <div className="text-[12px] text-muted">
                      Each student account may submit one review per catalog product in this Semester 3 prototype.
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Inline Form */
                <form onSubmit={handleReviewSubmit} className="space-y-5" noValidate>
                  {formSuccess && (
                    <div
                      role="status"
                      className="p-3.5 bg-emerald-50 border border-success/30 text-success rounded-control text-[13px] font-medium flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  {formError && (
                    <div
                      role="alert"
                      className="p-3.5 bg-red-50 border border-error/30 text-error rounded-control text-[13px] font-medium flex items-center gap-2"
                    >
                      <span aria-hidden="true">⚠</span>
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Star Rating Select */}
                  <div>
                    <label className="block text-[13px] font-semibold text-ink mb-2">
                      Overall rating <span className="text-error">*</span>
                    </label>
                    <RatingStars
                      rating={formRating}
                      interactive={true}
                      onChange={(r) => setFormRating(r)}
                      size="lg"
                    />
                  </div>

                  {/* Review Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="review-textarea" className="text-[13px] font-semibold text-ink">
                        Review feedback <span className="text-error">*</span>
                      </label>
                      <span
                        className={`text-[12px] font-medium ${
                          formText.trim().length < 20 || formText.trim().length > 1000
                            ? 'text-muted'
                            : 'text-emerald-700'
                        }`}
                      >
                        {formText.trim().length} / 1000 characters (min 20)
                      </span>
                    </div>
                    <textarea
                      id="review-textarea"
                      rows={4}
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      placeholder="Share details of your experience with this product (build quality, performance, usability)..."
                      required
                      className="w-full p-3.5 text-[14px] bg-page border border-border rounded-control text-ink placeholder-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:bg-surface transition-all leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting || formText.trim().length < 20}
                    className="h-[44px] px-6 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-control shadow-xs inline-flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formSubmitting ? (
                      <span>Saving review...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post review
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
