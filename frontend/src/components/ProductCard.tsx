import { Link } from 'react-router-dom';
import { RatingStars } from './RatingStars';

export interface ProductCardData {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  image_path: string;
  average_rating: number | null;
  review_count: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col h-full bg-surface rounded-card border border-border shadow-card hover:shadow-md hover:border-brand/40 transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {/* 4:3 Fixed Aspect Ratio Image Area */}
      <div className="relative aspect-[4/3] w-full bg-page border-b border-border overflow-hidden">
        <img
          src={product.image_path}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface/90 text-muted shadow-sm backdrop-blur-sm border border-border/60">
            {product.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-ink line-clamp-2 group-hover:text-brand transition-colors mb-2 leading-snug">
            {product.name}
          </h2>
          <p className="text-[13px] text-muted line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Bottom Metadata Aligned */}
        <div className="pt-3 border-t border-border/80 flex items-center justify-between text-[13px]">
          {product.average_rating !== null && product.review_count > 0 ? (
            <div className="flex items-center gap-1.5">
              <RatingStars rating={product.average_rating} size="sm" />
              <span className="font-semibold text-ink ml-1">
                {product.average_rating.toFixed(1)}
              </span>
              <span className="text-muted text-[12px]">
                · {product.review_count} {product.review_count === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          ) : (
            <span className="text-muted font-medium text-[12px] italic">
              No ratings yet
            </span>
          )}
          <span className="text-xs font-semibold text-brand group-hover:translate-x-0.5 transition-transform">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-surface rounded-card border border-border shadow-card overflow-hidden animate-pulse">
      <div className="aspect-[4/3] w-full bg-slate-200" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
        </div>
        <div className="pt-3 border-t border-border flex justify-between items-center">
          <div className="h-3.5 bg-slate-200 rounded w-1/3" />
          <div className="h-3.5 bg-slate-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
}
