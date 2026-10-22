import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { apiFetch, ApiError } from '../lib/api';
import { PageShell } from '../components/PageShell';
import { RatingStars } from '../components/RatingStars';
import { ProductCardData } from '../components/ProductCard';
import {
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Send,
  UserCheck,
  Star,
  RefreshCcw,
  Sparkles,
  Heart,
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
        setProductError("We couldn't find that product in our boutique collection.");
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
      // Reviews fail handled gracefully
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

  // Compute rating distribution from loaded reviews
  const distribution = useMemo(() => {
    const counts: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (counts[r.rating] !== undefined) {
        counts[r.rating] += 1;
      }
    });
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      percentage: reviews.length > 0 ? Math.round((counts[star] / reviews.length) * 100) : 0,
    }));
  }, [reviews]);

  // Check if current authenticated user has already submitted a review
  const userHasReviewed = user ? reviews.some((r) => r.user_id === user.id) : false;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const trimmed = formText.trim();
    if (trimmed.length < 20) {
      setFormError('Please enter at least 20 characters describing your evaluation.');
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

      setFormSuccess('Thank you, lovely! Your review has been saved in our PostgreSQL database.');
      setFormText('');
      setFormRating(5);

      // Refresh product stats and review list from backend
      await Promise.all([fetchProduct(), fetchReviews(0)]);
      setPage(0);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormError('You have already submitted a review for this product.');
      } else if (err instanceof ApiError) {
        setFormError(err.detail);
      } else {
        setFormError('Failed to post review to backend. Please check server connectivity.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <PageShell>
        <div className="animate-pulse space-y-6 max-w-5xl mx-auto py-4">
          <div className="h-4 bg-brand-pale rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 aspect-square bg-brand-pale/60 rounded-card" />
            <div className="md:col-span-7 space-y-4">
              <div className="h-4 bg-brand-pale rounded w-1/6" />
              <div className="h-8 bg-brand-pale rounded w-3/4" />
              <div className="h-4 bg-brand-pale rounded w-1/3" />
              <div className="h-24 bg-brand-pale/40 rounded w-full" />
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
          <h1 className="text-[20px] font-bold text-ink mb-2">Find Not Found</h1>
          <p className="text-[14px] text-muted mb-6">
            {productError || "We couldn't find that lovely item in the catalog."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={fetchProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-border bg-page hover:bg-surface text-ink font-medium text-[13px] rounded-control transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Retry
            </button>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white font-medium text-[13px] rounded-control hover:bg-brand-hover transition-colors"
            >
              Return to boutique
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-muted">
          <Link to="/products" className="hover:text-brand transition-colors font-medium">
            Collection
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
          <Link
            to={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-brand transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
          <span className="font-semibold text-ink truncate max-w-xs">{product.name}</span>
        </nav>

        {/* 2-Column Product Spotlight Card */}
        <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* 1:1 Aspect Ratio Image Frame */}
            <div className="md:col-span-5 aspect-square w-full bg-brand-pale/30 rounded-2xl border border-border overflow-hidden relative group">
              <img
                src={product.image_path}
                alt={product.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith('.webp')) {
                    target.src = product.image_path.replace('.webp', '.jpg');
                  } else if (!target.src.endsWith('.svg')) {
                    target.src = product.image_path.replace('.jpg', '.svg');
                  }
                }}
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
              />
            </div>

            {/* Details Panel */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand px-3 py-1 rounded-pill bg-brand-pale border border-brand/20 mb-3">
                  {product.category}
                </span>
                <h1 className="text-[26px] sm:text-[32px] font-extrabold text-ink tracking-tight mb-3">
                  {product.name}
                </h1>
                <p className="text-[15px] text-muted leading-relaxed mb-6">
                  {product.description}
                </p>
              </div>

              {/* Rating & Review Summary Footer */}
              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {product.average_rating !== null && product.review_count > 0 ? (
                    <div className="flex items-center gap-2">
                      <RatingStars rating={product.average_rating} size="md" />
                      <span className="text-[18px] font-bold text-ink font-mono">
                        {product.average_rating.toFixed(1)}
                      </span>
                      <span className="text-[13.5px] text-muted">
                        ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  ) : (
                    <span className="text-[14px] text-muted italic flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand/60" />
                      Be the first to review this find
                    </span>
                  )}
                </div>

                <a
                  href="#review-form"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-[13px] font-semibold rounded-pill hover:bg-brand-hover shadow-subtle hover:shadow-card transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Write a review
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution & Summary Card */}
        {product.review_count > 0 && (
          <div className="bg-surface rounded-2xl border border-border shadow-xs p-6 sm:p-7">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Score Big Display */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center md:border-r md:border-border md:pr-8">
                <div className="text-[44px] font-extrabold text-ink font-mono tracking-tight leading-none mb-2">
                  {product.average_rating !== null ? product.average_rating.toFixed(1) : '—'}
                </div>
                <div className="mb-2">
                  <RatingStars rating={product.average_rating || 0} size="md" />
                </div>
                <div className="text-[13px] text-muted font-medium">
                  Based on {product.review_count} student {product.review_count === 1 ? 'review' : 'reviews'}
                </div>
              </div>

              {/* 5-Bucket Distribution Bars */}
              <div className="md:col-span-8 space-y-2.5">
                <div className="text-[13px] font-bold uppercase tracking-wider text-muted mb-2">
                  Rating Breakdown ({reviews.length} shown)
                </div>
                {distribution.map(({ star, count, percentage }) => (
                  <div key={star} className="flex items-center gap-3 text-[13px]">
                    <span className="w-12 font-medium text-ink flex items-center gap-1 flex-shrink-0">
                      <span>{star}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </span>

                    {/* Progress Bar Track */}
                    <div className="flex-1 h-2.5 bg-brand-pale/50 rounded-full overflow-hidden border border-brand/15">
                      <div
                        className="h-full bg-brand rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                        role="progressbar"
                        aria-valuenow={percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${star} star rating: ${count} reviews (${percentage}%)`}
                      />
                    </div>

                    <span className="w-16 text-right font-mono text-[12px] text-muted flex-shrink-0">
                      {count} ({percentage}%)
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* Reviews List Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-bold text-ink">Evaluator feedback</h2>
              <p className="text-[13px] text-muted mt-0.5">
                {totalReviews} recorded evaluations stored in relational database
              </p>
            </div>
          </div>

          {isLoadingReviews ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5 bg-surface border border-border rounded-card animate-pulse space-y-3">
                  <div className="h-4 bg-brand-pale rounded w-1/4" />
                  <div className="h-3 bg-brand-pale/50 rounded w-full" />
                  <div className="h-3 bg-brand-pale/50 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-border rounded-card shadow-xs">
              <p className="text-[14px] text-muted">
                No reviews yet for this lovely item. Be the first student evaluator to share your thoughts below!
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
                    className="p-5 sm:p-6 bg-surface rounded-2xl border border-border shadow-xs hover:border-brand/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink text-[14.5px]">
                          {rev.reviewer_name}
                        </span>
                        {rev.source === 'demo_seed' && (
                          <span className="text-[10px] font-bold text-brand bg-brand-pale px-2 py-0.5 rounded-pill border border-brand/20">
                            Demo Seed
                          </span>
                        )}
                      </div>
                      <time className="text-[12px] text-muted font-medium" dateTime={rev.created_at}>
                        {dateStr}
                      </time>
                    </div>

                    <div className="mb-3">
                      <RatingStars rating={rev.rating} size="sm" />
                    </div>

                    <p className="text-[14px] text-ink leading-relaxed whitespace-pre-line">
                      {rev.review_text}
                    </p>
                  </article>
                );
              })}

              {/* Pagination Controls */}
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
                    className="px-4 py-1.5 text-[12.5px] font-semibold rounded-pill border border-border bg-surface hover:bg-page transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-[12.5px] text-muted font-medium">
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
                    className="px-4 py-1.5 text-[12.5px] font-semibold rounded-pill border border-border bg-surface hover:bg-page transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Inline Review Submission Section */}
          <div id="review-form" className="pt-6 border-t border-border mt-10">
            <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card">
              <h3 className="text-[18px] font-bold text-ink mb-1 flex items-center gap-2">
                <span>Share your evaluation</span>
                <Heart className="w-4 h-4 text-brand fill-brand/20" />
              </h3>
              <p className="text-[13px] text-muted mb-6">
                Your feedback will be stored in our PostgreSQL review database and prepared for natural language preprocessing.
              </p>

              {!isAuthenticated ? (
                /* Unauthenticated Callout */
                <div className="p-6 bg-brand-pale/40 rounded-xl border border-brand/20 text-center">
                  <p className="text-[14px] text-ink font-medium mb-3">
                    Sign in with your student credentials to submit a review for this lovely item.
                  </p>
                  <Link
                    to={`/login?next=/products/${product.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-[13px] font-semibold rounded-pill hover:bg-brand-hover shadow-subtle hover:shadow-card transition-all"
                  >
                    Sign in to Blush & Bloom
                  </Link>
                </div>
              ) : userHasReviewed ? (
                /* Already Reviewed Callout */
                <div className="p-5 bg-brand-pale/40 rounded-xl border border-brand/25 flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-brand flex-shrink-0" />
                  <div>
                    <div className="text-[14px] font-semibold text-ink">
                      You have already submitted a review for this product.
                    </div>
                    <div className="text-[12.5px] text-muted mt-0.5">
                      Each student account is restricted to one review per product to maintain dataset integrity in Semester 3.
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Submission Form */
                <form onSubmit={handleReviewSubmit} className="space-y-5" noValidate>
                  {formSuccess && (
                    <div
                      role="status"
                      className="p-3.5 bg-success-subtle border border-success/30 text-success rounded-xl text-[13px] font-medium flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  {formError && (
                    <div
                      role="alert"
                      className="p-3.5 bg-error-subtle border border-error/30 text-error rounded-xl text-[13px] font-medium flex items-center gap-2"
                    >
                      <span aria-hidden="true">⚠</span>
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Rating Selector */}
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
                        className={`text-[12px] font-medium font-mono ${
                          formText.trim().length < 20 || formText.trim().length > 1000
                            ? 'text-muted'
                            : 'text-success'
                        }`}
                      >
                        {formText.trim().length} / 1000 chars (min 20)
                      </span>
                    </div>
                    <textarea
                      id="review-textarea"
                      rows={4}
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      placeholder="Share details of your evaluation (texture, softness, scent longevity, packaging, overall experience)..."
                      required
                      className="w-full p-3.5 text-[14px] bg-page border border-border rounded-xl text-ink placeholder-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:bg-surface transition-all leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting || formText.trim().length < 20}
                    className="h-[44px] px-6 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-pill shadow-subtle hover:shadow-card inline-flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
