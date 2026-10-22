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
        setErrorMessage('Unable to load overview statistics from the local database.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?next=/admin');
    } else if (!isAdmin) {
      // not admin
      setIsLoading(false);
    } else {
      fetchOverview();
    }
  }, [isAuthenticated, isAdmin]);

  if (isAuthenticated && !isAdmin) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto my-16 text-center bg-surface border border-border p-8 rounded-card shadow-card">
          <ShieldAlert className="w-12 h-12 text-error mx-auto mb-4" />
          <h1 className="text-[22px] font-bold text-ink mb-2">Access Denied</h1>
          <p className="text-[14px] text-muted mb-6">
            The admin overview dashboard is restricted to administrator accounts. Your account role is{' '}
            <strong className="text-ink">{user?.role}</strong>.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white font-medium text-[14px] rounded-control hover:bg-brand-hover transition-colors"
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
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar Rail (232px) */}
        <aside className="w-full lg:w-[232px] flex-shrink-0 bg-surface rounded-card border border-border p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted px-3 py-2">
            Admin Navigation
          </div>
          <nav className="space-y-1 mt-1">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-control bg-brand/10 text-brand font-semibold text-[14px]">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </div>
            <Link
              to="/products"
              className="flex items-center gap-2.5 px-3 py-2 rounded-control text-muted hover:text-ink hover:bg-page font-medium text-[14px] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to products
            </Link>
          </nav>

          <hr className="my-4 border-border" />

          <div className="px-3 py-2 text-[12px] text-muted leading-relaxed">
            <span className="font-semibold text-ink block mb-1">Academic Context:</span>
            Semester 3 baseline analytics derived directly from PostgreSQL aggregations.
          </div>
        </aside>

        {/* Main Dashboard Area */}
        <div className="flex-1 w-full space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[26px] sm:text-[30px] font-bold text-ink tracking-tight">
                  Review overview
                </h1>
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-muted/10 text-muted">
                  Demonstration Dataset
                </span>
              </div>
              <p className="text-[14px] text-muted mt-1">
                Descriptive statistics and rating distributions from the active database.
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-ink bg-surface hover:bg-page border border-border rounded-control shadow-xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="p-6 bg-red-50 border border-error/30 rounded-card text-center text-error">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold">{errorMessage}</div>
            </div>
          ) : isLoading || !data ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-surface rounded-card border border-border p-5 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* 4 KPI Cards Grid (Desktop 4-col, Tablet 2-col, Mobile 1-col) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Users */}
                <div className="bg-surface rounded-card border border-border p-5 shadow-card">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[13px] font-semibold">Registered users</span>
                    <Users className="w-4 h-4 text-muted/80" />
                  </div>
                  <div className="text-[30px] font-bold text-ink tracking-tight font-mono">
                    {data.total_users}
                  </div>
                  <div className="text-[11px] text-muted mt-1">
                    1 administrator · {data.total_users - 1} student reviewers
                  </div>
                </div>

                {/* Products */}
                <div className="bg-surface rounded-card border border-border p-5 shadow-card">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[13px] font-semibold">Catalog products</span>
                    <Package className="w-4 h-4 text-muted/80" />
                  </div>
                  <div className="text-[30px] font-bold text-ink tracking-tight font-mono">
                    {data.total_products}
                  </div>
                  <div className="text-[11px] text-muted mt-1">
                    Curated across 5 categories
                  </div>
                </div>

                {/* Reviews */}
                <div className="bg-surface rounded-card border border-border p-5 shadow-card">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[13px] font-semibold">Total reviews</span>
                    <MessageSquare className="w-4 h-4 text-muted/80" />
                  </div>
                  <div className="text-[30px] font-bold text-ink tracking-tight font-mono">
                    {data.total_reviews}
                  </div>
                  <div className="text-[11px] text-muted mt-1">
                    Stored in relational database
                  </div>
                </div>

                {/* Average Rating */}
                <div className="bg-surface rounded-card border border-border p-5 shadow-card">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[13px] font-semibold">Average rating</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-[30px] font-bold text-ink tracking-tight font-mono flex items-baseline gap-1">
                    {data.average_rating !== null ? data.average_rating.toFixed(1) : '—'}
                    <span className="text-[14px] text-muted font-normal">/ 5.0</span>
                  </div>
                  <div className="text-[11px] text-muted mt-1">
                    Calculated from saved reviews
                  </div>
                </div>
              </div>

              {/* Rating Distribution 5-Bar Chart Section */}
              <div className="bg-surface rounded-card border border-border p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[18px] font-bold text-ink">Rating distribution</h2>
                    <p className="text-[13px] text-muted">
                      Review frequency count across 1 to 5 star ratings
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold text-muted bg-page px-2.5 py-1 rounded border border-border">
                    Total: {data.total_reviews}
                  </span>
                </div>

                {/* Recharts Bar Chart */}
                <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAF1" />
                      <XAxis
                        dataKey="rating"
                        tick={{ fill: '#172235', fontSize: 13, fontWeight: 500 }}
                        axisLine={{ stroke: '#E5EAF1' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        domain={[0, 'auto']}
                        tick={{ fill: '#66758A', fontSize: 12 }}
                        axisLine={{ stroke: '#E5EAF1' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(23, 34, 53, 0.03)' }}
                        formatter={(val: number) => [`${val} reviews`, 'Count']}
                        labelFormatter={(lbl) => `${lbl} Rating`}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5EAF1',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(23,34,53,0.08)',
                          fontSize: '13px',
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill="#5575E8" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Accessible Table Fallback below chart */}
                <div className="mt-4 pt-4 border-t border-border">
                  <details className="text-[12px] text-muted cursor-pointer">
                    <summary className="font-semibold hover:text-ink">
                      View accessible data table
                    </summary>
                    <table className="w-full mt-2 border border-border text-left">
                      <thead>
                        <tr className="bg-page">
                          <th className="p-2 border-b border-border">Star Rating</th>
                          <th className="p-2 border-b border-border">Count</th>
                          <th className="p-2 border-b border-border">Share (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.rating_distribution.map((bucket) => {
                          const percentage = data.total_reviews > 0
                            ? ((bucket.count / data.total_reviews) * 100).toFixed(1)
                            : '0.0';
                          return (
                            <tr key={bucket.rating} className="border-b border-border/60">
                              <td className="p-2 font-medium">{bucket.rating} Star{bucket.rating > 1 ? 's' : ''}</td>
                              <td className="p-2 font-mono">{bucket.count}</td>
                              <td className="p-2 font-mono">{percentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </details>
                </div>
              </div>

              {/* 2-Column Section: Top Products & Recent Reviews */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Most Reviewed Products (col 6) */}
                <div className="lg:col-span-6 bg-surface rounded-card border border-border p-6 shadow-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[18px] font-bold text-ink">Most reviewed products</h2>
                      <span className="text-[12px] text-muted">Top 5</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[13px]">
                        <thead>
                          <tr className="border-b border-border text-muted font-semibold">
                            <th className="pb-2.5">Product Name</th>
                            <th className="pb-2.5">Category</th>
                            <th className="pb-2.5 text-right">Reviews</th>
                            <th className="pb-2.5 text-right">Avg Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {data.top_products.map((p) => (
                            <tr key={p.id} className="hover:bg-page transition-colors">
                              <td className="py-3 font-medium text-ink">
                                <Link
                                  to={`/products/${p.slug}`}
                                  className="hover:text-brand flex items-center gap-1 group"
                                >
                                  <span className="line-clamp-1">{p.name}</span>
                                  <ExternalLink className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 flex-shrink-0" />
                                </Link>
                              </td>
                              <td className="py-3 text-muted">{p.category}</td>
                              <td className="py-3 text-right font-mono font-semibold text-ink">
                                {p.review_count}
                              </td>
                              <td className="py-3 text-right font-mono font-semibold text-ink">
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
                <div className="lg:col-span-6 bg-surface rounded-card border border-border p-6 shadow-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[18px] font-bold text-ink">Recent reviews</h2>
                      <span className="text-[12px] text-muted">Latest 5</span>
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
                            className="p-3 bg-page rounded-control border border-border/80 text-[13px] space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-ink">{r.reviewer_name}</span>
                              <span className="text-[12px] text-muted">{dateFormatted}</span>
                            </div>
                            <div className="flex items-center justify-between text-[12px]">
                              <Link
                                to={`/products/${r.product_slug}`}
                                className="text-brand font-medium hover:underline truncate max-w-[200px]"
                              >
                                {r.product_name}
                              </Link>
                              <RatingStars rating={r.rating} size="sm" />
                            </div>
                            <p className="text-muted line-clamp-2 text-[12px] italic">
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
