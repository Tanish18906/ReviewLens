import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { apiFetch, ApiError } from '../lib/api';
import { PageShell } from '../components/PageShell';
import { RatingStars } from '../components/RatingStars';
import {
  Users,
  Package,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  LayoutDashboard,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Heart,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface RatingBucket {
  rating: number;
  count: number;
}

interface TopProductItem {
  id: number;
  slug: string;
  name: string;
  category: string;
  review_count: number;
  average_rating: number | null;
}

interface RecentReviewItem {
  id: number;
  product_name: string;
  product_slug: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

interface AdminOverviewData {
  total_users: number;
  total_products: number;
  total_reviews: number;
  average_rating: number | null;
  rating_distribution: RatingBucket[];
  top_products: TopProductItem[];
  recent_reviews: RecentReviewItem[];
}

export function AdminDashboardPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchOverview = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const overview = await apiFetch<AdminOverviewData>('/api/admin/overview');
      setData(overview);
      setLastRefreshed(new Date());
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setErrorMessage('Administrator privileges required. You do not have permission to view this page.');
      } else if (err instanceof ApiError && err.status === 401) {
        navigate('/login?next=/admin');
      } else {
        setErrorMessage('Unable to load overview statistics from the database.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?next=/admin');
    } else if (!isAdmin) {
      setIsLoading(false);
    } else {
      fetchOverview();
    }
  }, [isAuthenticated, isAdmin]);

  if (isAuthenticated && !isAdmin) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto my-16 text-center bg-surface border border-border p-8 rounded-2xl shadow-card">
          <ShieldAlert className="w-12 h-12 text-error mx-auto mb-4" />
          <h1 className="text-[22px] font-bold text-ink mb-2">Access Denied</h1>
          <p className="text-[14px] text-muted mb-6">
            The admin overview dashboard is restricted to administrator accounts. Your current account role is{' '}
            <strong className="text-ink">{user?.role}</strong>.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white font-semibold text-[14px] rounded-pill hover:bg-brand-hover transition-colors shadow-subtle hover:shadow-card min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to products
          </Link>
        </div>
      </PageShell>
    );
  }

  const chartData = (data?.rating_distribution || []).map((b) => ({
    name: `${b.rating} Star${b.rating > 1 ? 's' : ''}`,
    rating: `${b.rating}★`,
    count: b.count,
  }));

  return (
    <PageShell containerClass="max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start min-w-0">
        
        {/* Responsive Sidebar Rail (Compact bar on mobile/tablet, 232px column on desktop) */}
        <aside className="w-full lg:w-[232px] lg:flex-shrink-0 bg-surface rounded-2xl border border-border p-3.5 sm:p-4 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:flex-col lg:items-stretch">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted px-2 py-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-brand" />
              <span>Admin Navigation</span>
            </div>
            <nav className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-brand-pale text-brand font-semibold text-[13.5px] min-h-[40px]">
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span>Overview</span>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-muted hover:text-ink hover:bg-page font-medium text-[13.5px] transition-colors min-h-[40px]"
              >
                <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                <span>Back to products</span>
              </Link>
            </nav>
          </div>

          <hr className="hidden lg:block my-4 border-border" />

          <div className="hidden lg:block px-3 py-2 text-[12px] text-muted leading-relaxed">
            <span className="font-semibold text-ink block mb-1">Academic scope</span>
            Review analytics for the Semester 3 prototype.
          </div>
        </aside>

        {/* Main Dashboard Area */}
        <div className="flex-1 w-full min-w-0 space-y-8">
          
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[26px] sm:text-[30px] font-bold text-ink tracking-tight">
                  Review analytics
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-pill bg-brand-pale text-brand border border-brand/20">
                  Semester 3 Prototype
                </span>
              </div>
              <p className="text-[14px] text-muted mt-1">
                Review activity and rating trends.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[12px] text-muted hidden sm:inline">
                Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <button
                type="button"
                onClick={fetchOverview}
                disabled={isLoading}
                aria-label="Refresh analytics data"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-ink bg-surface hover:bg-page border border-border rounded-pill shadow-2xs hover:shadow-subtle transition-all disabled:opacity-50 min-h-[40px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="p-6 bg-error-subtle border border-error/30 rounded-2xl text-center text-error">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold">{errorMessage}</div>
            </div>
          ) : isLoading || !data ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-surface rounded-2xl border border-border p-5 space-y-2">
                  <div className="h-3 bg-brand-pale rounded w-1/2" />
                  <div className="h-8 bg-brand-pale rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Responsive KPI Cards Grid (1 col on mobile, 2 col on tablet/small desktop, 4 col on xl) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Users */}
                <div className="bg-surface rounded-2xl border border-border p-5 shadow-subtle hover:shadow-card transition-shadow min-w-0">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[13px] font-semibold">Registered users</span>
                    <Users className="w-4 h-4 text-brand flex-shrink-0" />
                  </div>
                  <div className="text-[28px] sm:text-[30px] font-bold text-ink tracking-tight font-mono">
                    {data.total_users}
                  </div>
                  <div className="text-[12px] text-muted mt-1 truncate">
                    1 administrator · {Math.max(0, data.total_users - 1)} student reviewers
                  </div>
                </div>

                {/* Products */}
                <div className="bg-surface rounded-2xl border border-border p-5 shadow-subtle hover:shadow-card transition-shadow min-w-0">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[13px] font-semibold">Catalog products</span>
                    <Package className="w-4 h-4 text-brand flex-shrink-0" />
                  </div>
                  <div className="text-[28px] sm:text-[30px] font-bold text-ink tracking-tight font-mono">
                    {data.total_products}
                  </div>
                  <div className="text-[12px] text-muted mt-1 truncate">
                    4 curated categories
                  </div>
                </div>

                {/* Reviews */}
                <div className="bg-surface rounded-2xl border border-border p-5 shadow-subtle hover:shadow-card transition-shadow min-w-0">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[13px] font-semibold">Total reviews</span>
                    <MessageSquare className="w-4 h-4 text-brand flex-shrink-0" />
                  </div>
                  <div className="text-[28px] sm:text-[30px] font-bold text-ink tracking-tight font-mono">
                    {data.total_reviews}
                  </div>
                  <div className="text-[12px] text-muted mt-1 truncate">
                    Recorded student reviews
                  </div>
                </div>

                {/* Average Rating */}
                <div className="bg-surface rounded-2xl border border-border p-5 shadow-subtle hover:shadow-card transition-shadow min-w-0">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[13px] font-semibold">Average rating</span>
                    <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  </div>
                  <div className="text-[28px] sm:text-[30px] font-bold text-ink tracking-tight font-mono flex items-baseline gap-1">
                    {data.average_rating !== null ? data.average_rating.toFixed(1) : '—'}
                    <span className="text-[14px] text-muted font-normal">/ 5.0</span>
                  </div>
                  <div className="text-[12px] text-muted mt-1 truncate">
                    From all verified reviews
                  </div>
                </div>
              </div>

              {/* Rating Distribution Bar Chart Section */}
              <div className="bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-subtle min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-[18px] font-bold text-ink">Rating distribution</h2>
                    <p className="text-[13px] text-muted">
                      Frequency distribution across 1 to 5 star ratings
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold text-brand bg-brand-pale px-3 py-1 rounded-pill border border-brand/20 self-start sm:self-auto font-mono">
                    Total: {data.total_reviews} reviews
                  </span>
                </div>

                {/* Recharts Bar Chart in Blush Pink Palette */}
                <div className="h-64 w-full min-w-0 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0DCE5" />
                      <XAxis
                        dataKey="rating"
                        tick={{ fill: '#382B35', fontSize: 13, fontWeight: 600 }}
                        axisLine={{ stroke: '#F0DCE5' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        domain={[0, 'auto']}
                        tick={{ fill: '#786772', fontSize: 12 }}
                        axisLine={{ stroke: '#F0DCE5' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(217, 107, 147, 0.08)' }}
                        formatter={(val: number) => [`${val} reviews`, 'Count']}
                        labelFormatter={(lbl) => `${lbl} Rating`}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#F0DCE5',
                          borderRadius: '12px',
                          boxShadow: '0 4px 14px rgba(56, 43, 53, 0.08)',
                          fontSize: '13px',
                          color: '#382B35',
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill="#D96B93" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Accessible Data Table Fallback */}
                <div className="mt-4 pt-4 border-t border-border">
                  <details className="text-[12px] text-muted cursor-pointer group">
                    <summary className="font-semibold text-ink/80 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded px-1 py-0.5">
                      View rating data table
                    </summary>
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full border border-border rounded-xl text-left min-w-[280px]">
                        <thead>
                          <tr className="bg-brand-pale/40 text-ink text-[12px] font-semibold">
                            <th className="p-2.5 border-b border-border">Star Rating</th>
                            <th className="p-2.5 border-b border-border text-right">Review Count</th>
                            <th className="p-2.5 border-b border-border text-right">Share (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {data.rating_distribution.map((bucket) => {
                            const percentage = data.total_reviews > 0
                              ? ((bucket.count / data.total_reviews) * 100).toFixed(1)
                              : '0.0';
                            return (
                              <tr key={bucket.rating} className="hover:bg-page transition-colors">
                                <td className="p-2.5 font-medium text-ink">
                                  {bucket.rating} Star{bucket.rating > 1 ? 's' : ''}
                                </td>
                                <td className="p-2.5 font-mono text-right text-ink">{bucket.count}</td>
                                <td className="p-2.5 font-mono text-right text-muted">{percentage}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </div>
              </div>

              {/* 2-Column Section: Top Products & Recent Reviews */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
                
                {/* Most Reviewed Products (col 6) */}
                <div className="lg:col-span-6 bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-subtle flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[18px] font-bold text-ink">Most reviewed products</h2>
                      <span className="text-[12px] font-semibold text-brand bg-brand-pale px-2.5 py-0.5 rounded-pill border border-brand/20">
                        Top 5
                      </span>
                    </div>

                    <div className="overflow-x-auto -mx-1 px-1">
                      <table className="w-full text-left text-[13px] min-w-[380px]">
                        <thead>
                          <tr className="border-b border-border text-muted font-semibold">
                            <th className="pb-2.5">Product</th>
                            <th className="pb-2.5">Category</th>
                            <th className="pb-2.5 text-right">Reviews</th>
                            <th className="pb-2.5 text-right">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {data.top_products.map((p) => (
                            <tr key={p.id} className="hover:bg-page transition-colors">
                              <td className="py-3 font-medium text-ink max-w-[160px]">
                                <Link
                                  to={`/products/${p.slug}`}
                                  className="hover:text-brand flex items-center gap-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                                >
                                  <span className="truncate">{p.name}</span>
                                  <ExternalLink className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                                </Link>
                              </td>
                              <td className="py-3 text-muted whitespace-nowrap">{p.category}</td>
                              <td className="py-3 text-right font-mono font-semibold text-ink">
                                {p.review_count}
                              </td>
                              <td className="py-3 text-right font-mono font-semibold text-ink whitespace-nowrap">
                                {p.average_rating !== null ? `★ ${p.average_rating.toFixed(1)}` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Recent Reviews (col 6) */}
                <div className="lg:col-span-6 bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-subtle flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[18px] font-bold text-ink">Recent reviews</h2>
                      <span className="text-[12px] font-semibold text-brand bg-brand-pale px-2.5 py-0.5 rounded-pill border border-brand/20">
                        Latest 5
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {data.recent_reviews.map((r) => {
                        const dateFormatted = new Date(r.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });

                        return (
                          <div
                            key={r.id}
                            className="p-3.5 bg-page rounded-xl border border-border/80 text-[13px] space-y-1.5 min-w-0"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-ink truncate">{r.reviewer_name}</span>
                              <span className="text-[12px] text-muted flex-shrink-0">{dateFormatted}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-[12px]">
                              <Link
                                to={`/products/${r.product_slug}`}
                                className="text-brand font-medium hover:underline truncate max-w-[200px]"
                              >
                                {r.product_name}
                              </Link>
                              <RatingStars rating={r.rating} size="sm" />
                            </div>
                            <p className="text-muted line-clamp-2 text-[12.5px] italic leading-relaxed">
                              "{r.review_text}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
