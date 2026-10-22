import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch, ApiError } from '../lib/api';
import { PageShell } from '../components/PageShell';
import { ProductCard, ProductCardSkeleton, ProductCardData } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import {
  Search,
  SlidersHorizontal,
  RefreshCcw,
  PackageSearch,
  AlertCircle,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ProductListResponse {
  items: ProductCardData[];
  total: number;
}

const CATEGORIES = [
  'All categories',
  'Plush Toys',
  'Fragrances',
  'Beauty & Makeup',
  'Accessories & Gifts',
];

interface ShowcaseCategory {
  key: string;
  categoryName: string;
  title: string;
  subtitle: string;
  image: string;
}

const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
  {
    key: 'plush',
    categoryName: 'Plush Toys',
    title: 'Cuddle Corner',
    subtitle: 'Cozy plushies & soft teddy bears',
    image: '/images/storefront/category-plush-toys.webp',
  },
  {
    key: 'fragrance',
    categoryName: 'Fragrances',
    title: 'Sweet Scents',
    subtitle: 'Floral perfumes & warm body mists',
    image: '/images/storefront/category-fragrances.webp',
  },
  {
    key: 'beauty',
    categoryName: 'Beauty & Makeup',
    title: 'Pretty Essentials',
    subtitle: 'Dewy lip tints, velvet blush & brushes',
    image: '/images/storefront/category-beauty-makeup.webp',
  },
  {
    key: 'accessories',
    categoryName: 'Accessories & Gifts',
    title: 'Little Joys',
    subtitle: 'Hair claws, satin bows & vanity mirrors',
    image: '/images/storefront/category-accessories-gifts.webp',
  },
];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  const initialCategory = searchParams.get('category') || 'All categories';
  const initialSearch = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'name_asc';

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES.includes(initialCategory) ? initialCategory : 'All categories'
  );
  const [sortBy, setSortBy] = useState<string>(initialSort);

  // Sync state if URL search params change externally (e.g. from header nav click)
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat && CATEGORIES.includes(urlCat)) {
      setSelectedCategory(urlCat);
    } else if (!urlCat) {
      setSelectedCategory('All categories');
    }
  }, [searchParams]);

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
      params.set('limit', '24');

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

  const handleCategorySelect = (cat: string) => {
    startTransition(() => {
      setSelectedCategory(cat);
      const newParams = new URLSearchParams(searchParams);
      if (cat === 'All categories') {
        newParams.delete('category');
      } else {
        newParams.set('category', cat);
      }
      setSearchParams(newParams);
    });

    const collectionEl = document.getElementById('collection');
    if (collectionEl) {
      collectionEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearFilters = () => {
    startTransition(() => {
      setSearchQuery('');
      setSelectedCategory('All categories');
      setSortBy('name_asc');
      setSearchParams({});
    });
  };

  return (
    <PageShell>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-pale via-page to-brand-subtle/40 border border-brand/15 p-6 sm:p-10 lg:p-14 mb-12 shadow-subtle">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface text-brand border border-brand/25 text-[12px] font-bold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Blush & Bloom</span>
              <span className="text-muted/60">·</span>
              <span className="text-muted font-medium">Semester 3 Prototype</span>
            </div>

            <h1 className="text-[32px] sm:text-[42px] lg:text-[48px] font-extrabold text-ink tracking-tight leading-[1.14]">
              Little things. <br />
              <span className="text-brand">Everyday favorites.</span>
            </h1>

            <p className="text-[15px] sm:text-[17px] text-muted max-w-xl leading-relaxed">
              Discover cozy plushies, dreamy fragrances, pretty beauty essentials, and everyday favorites reviewed by students.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="#collection"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white text-[14px] font-bold rounded-pill shadow-subtle hover:shadow-card transition-all duration-200 min-h-[44px]"
              >
                <span>Explore the collection</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => handleCategorySelect('Plush Toys')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-surface hover:bg-brand-pale text-ink hover:text-brand border border-border text-[14px] font-semibold rounded-pill transition-all duration-200 shadow-2xs min-h-[44px]"
              >
                <Heart className="w-4 h-4 text-brand" />
                <span>Browse plushies</span>
              </button>
            </div>

            {/* Academic Trust Badges */}
            <div className="pt-4 border-t border-brand/15 flex flex-wrap items-center gap-6 text-[12.5px] text-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>16 curated products</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0" />
                <span>One review per product, per student</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>No ads or sponsored reviews</span>
              </span>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl overflow-hidden border-2 border-surface shadow-card group">
              <img
                src="/images/storefront/hero-lifestyle-collection.webp"
                alt="Blush & Bloom collection preview with plushies, fragrances, and beauty favorites"
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith('.webp')) {
                    target.src = '/images/storefront/hero-lifestyle-collection.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-60" />
              
              {/* Floating Pill Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-surface/95 backdrop-blur-md border border-brand/20 p-3.5 rounded-xl shadow-card flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-ink flex items-center gap-1.5">
                    <span className="truncate">A little world of lovely things</span>
                    <Heart className="w-3.5 h-3.5 fill-brand text-brand flex-shrink-0" />
                  </div>
                  <div className="text-[11.5px] text-muted truncate">
                    Boutique catalog and student reviews
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 bg-brand-pale text-brand rounded-pill border border-brand/20 flex-shrink-0">
                  4 Categories
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORY SHOWCASE SECTION */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-wider text-brand mb-1">
              Categories
            </div>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-ink tracking-tight">
              Browse by category
            </h2>
          </div>
          {selectedCategory !== 'All categories' && (
            <button
              type="button"
              onClick={() => handleCategorySelect('All categories')}
              className="text-[13px] font-semibold text-brand hover:text-brand-hover underline underline-offset-4 py-1"
            >
              View all products
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SHOWCASE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.categoryName;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategorySelect(cat.categoryName)}
                className={`group relative text-left rounded-card overflow-hidden border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isSelected
                    ? 'ring-2 ring-brand border-brand shadow-card bg-brand-pale/40'
                    : 'border-border bg-surface hover:border-brand/40 hover:shadow-card hover:-translate-y-1'
                }`}
              >
                {/* 1:1 Image */}
                <div className="relative aspect-square w-full bg-brand-pale/30 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.endsWith('.webp')) {
                        target.src = cat.image.replace('.webp', '.jpg');
                      }
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-50" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill bg-surface/90 text-brand backdrop-blur-sm border border-brand/20">
                      {cat.categoryName}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[16px] font-bold text-ink group-hover:text-brand transition-colors">
                      {cat.title}
                    </h3>
                    <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-brand group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[12px] text-muted leading-relaxed line-clamp-1">
                    {cat.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. PRODUCT CATALOG DISCOVERY SECTION */}
      <section id="collection" className="scroll-mt-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-ink tracking-tight">
              Browse products
            </h2>
            <p className="text-[14px] sm:text-[15px] text-muted mt-1 leading-relaxed">
              Explore our collection and discover student favorites.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-muted bg-surface px-3 py-1.5 rounded-pill border border-border shadow-xs">
              {totalCount} {totalCount === 1 ? 'product' : 'products'}
            </span>
          </div>
        </div>

        {/* Discovery Filter Controls */}
        <div className="bg-surface rounded-card border border-border p-4 mb-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
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
                placeholder="Search plushies, perfumes, lip tints..."
                className="w-full h-[44px] pl-10 pr-12 text-[15px] sm:text-[14px] bg-page border border-border rounded-control text-ink placeholder-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:bg-surface transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search text"
                  className="absolute inset-y-0 right-0 w-11 h-11 flex items-center justify-center text-xs text-muted hover:text-ink font-semibold"
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
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full h-[44px] px-3 pr-8 text-[14px] font-medium bg-page border border-border rounded-control text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:bg-surface transition-all appearance-none cursor-pointer"
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
                <option value="name_asc">Name A to Z</option>
                <option value="rating_desc">Highest rated</option>
                <option value="reviews_desc">Most reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Content Grid */}
        {errorMessage ? (
          <div className="bg-red-50 border border-error/30 rounded-card p-6 text-center max-w-md mx-auto my-12">
            <AlertCircle className="w-8 h-8 text-error mx-auto mb-3" />
            <h3 className="text-[17px] font-bold text-ink mb-1">
              We couldn't load products right now
            </h3>
            <p className="text-[13px] text-muted mb-4">{errorMessage}</p>
            <button
              type="button"
              onClick={fetchProducts}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-[13px] font-semibold rounded-pill hover:bg-brand-hover transition-colors shadow-xs min-h-[44px]"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : isLoading ? (
          /* Skeletons preserving 1:1 dimensions */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No matching products found"
            description="Try adjusting your search terms or clearing filters."
            actionText="Clear all filters"
            onAction={handleClearFilters}
          />
        ) : (
          /* Responsive 4-col large desktop, 3-col desktop, 2-col tablet, 1-col mobile */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. UNDERSTATED BOUTIQUE EDITORIAL HIGHLIGHT */}
      <section className="mt-16 bg-surface rounded-2xl border border-border p-8 sm:p-10 text-center max-w-3xl mx-auto shadow-subtle">
        <div className="w-10 h-10 rounded-full bg-brand-pale text-brand mx-auto flex items-center justify-center mb-3">
          <Heart className="w-5 h-5 fill-brand/20 text-brand" />
        </div>
        <h3 className="text-[19px] font-bold text-ink mb-2">
          A little world of lovely things.
        </h3>
        <p className="text-[14px] text-muted leading-relaxed max-w-xl mx-auto">
          Blush & Bloom is a Semester 3 academic prototype showcasing storefront UI design, database persistence, and transparent review analytics.
        </p>
      </section>
    </PageShell>
  );
}
