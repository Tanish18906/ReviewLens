import { useState, useEffect, useTransition } from 'react';
import { apiFetch, ApiError } from '../lib/api';
import { PageShell } from '../components/PageShell';
import { ProductCard, ProductCardSkeleton, ProductCardData } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { Search, SlidersHorizontal, RefreshCcw, PackageSearch, AlertCircle } from 'lucide-react';

interface ProductListResponse {
  items: ProductCardData[];
  total: number;
}

const CATEGORIES = [
  'All categories',
  'Audio',
  'Computing',
  'Wearables',
  'Accessories',
  'Home Office',
];

export function ProductsPage() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All categories');
  const [sortBy, setSortBy] = useState<string>('name_asc');

  const [, startTransition] = useTransition();

  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedCategory && selectedCategory !== 'All categories') {
        params.set('category', selectedCategory);
      }
      if (sortBy) params.set('sort', sortBy);

      const url = `/api/products?${params.toString()}`;
      const data = await apiFetch<ProductListResponse>(url);
      setProducts(data.items);
      setTotalCount(data.total);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.detail);
      } else {
        setErrorMessage('Unable to connect to the backend API. Please ensure the server is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search / filter fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleClearFilters = () => {
    startTransition(() => {
      setSearchQuery('');
      setSelectedCategory('All categories');
      setSortBy('name_asc');
    });
  };

  return (
    <PageShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-ink tracking-tight">
            Explore product reviews
          </h1>
          <p className="text-[14px] sm:text-[15px] text-muted mt-1.5 max-w-2xl leading-relaxed">
            Browse feedback and compare ratings from our demonstration dataset.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-muted bg-surface px-3 py-1.5 rounded-full border border-border shadow-xs">
            {totalCount} {totalCount === 1 ? 'product' : 'products'}
          </span>
        </div>
      </div>

      {/* Discovery Filters Bar */}
      <div className="bg-surface rounded-card border border-border p-4 mb-8 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="lg:col-span-6 relative">
            <label htmlFor="catalog-search" className="sr-only">
              Search products
            </label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="catalog-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or description..."
              className="w-full h-[44px] pl-10 pr-4 text-[14px] bg-page border border-border rounded-control text-ink placeholder-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:bg-surface transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-muted hover:text-ink font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="lg:col-span-3">
            <label htmlFor="category-select" className="sr-only">
              Filter by Category
            </label>
            <div className="relative">
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-[44px] px-3 text-[14px] font-medium bg-page border border-border rounded-control text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:bg-surface transition-all appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="lg:col-span-3">
            <label htmlFor="sort-select" className="sr-only">
              Sort products
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-[44px] px-3 text-[14px] font-medium bg-page border border-border rounded-control text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:bg-surface transition-all appearance-none cursor-pointer"
            >
              <option value="name_asc">Name A-Z</option>
              <option value="rating_desc">Highest rated</option>
              <option value="reviews_desc">Most reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {errorMessage ? (
        <div className="bg-red-50 border border-error/30 rounded-card p-6 text-center max-w-md mx-auto my-12">
          <AlertCircle className="w-8 h-8 text-error mx-auto mb-3" />
          <h2 className="text-[17px] font-bold text-ink mb-1">We couldn't load products right now</h2>
          <p className="text-[13px] text-muted mb-4">{errorMessage}</p>
          <button
            type="button"
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-[13px] font-semibold rounded-control hover:bg-brand-hover transition-colors shadow-xs"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : isLoading ? (
        /* Skeletons preserving exact 4:3 dimensions */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No matching products found"
          description="We couldn't find any products matching your current search keywords or category filters."
          actionText="Clear all filters"
          onAction={handleClearFilters}
        />
      ) : (
        /* Responsive 3-col desktop, 2-col tablet, 1-col mobile */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
