import { Link } from 'react-router-dom';
import { RatingStars } from './RatingStars';
import { ArrowRight, Sparkles } from 'lucide-react';

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
      className="group flex flex-col h-full bg-surface rounded-card border border-border shadow-subtle hover:shadow-card hover:border-brand/40 hover:-translate-y-1 transition-all duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {/* 1:1 Aspect Ratio Image Frame */}
      <div className="relative aspect-square w-full bg-brand-pale/40 border-b border-border/80 overflow-hidden">
        <img
          src={product.image_path}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.endsWith('.webp')) {
              target.src = product.image_path.replace('.webp', '.jpg');
            } else if (!target.src.endsWith('.svg')) {
              target.src = product.image_path.replace('.jpg', '.svg');
            }
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
        />
        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-pill bg-surface/95 text-brand shadow-xs backdrop-blur-sm border border-brand/20">
            {product.category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-ink line-clamp-1 group-hover:text-brand transition-colors mb-1.5 leading-snug">
            {product.name}
          </h2>
          <p className="text-[13px] text-muted line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Footer Meta Row */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-[13px]">
          {product.average_rating !== null && product.review_count > 0 ? (
            <div className="flex items-center gap-1.5">
              <RatingStars rating={product.average_rating} size="sm" />
              <span className="font-bold text-ink font-mono text-[13px] ml-0.5">
                {product.average_rating.toFixed(1)}
              </span>
              <span className="text-muted text-[12px]">
                ({product.review_count})
              </span>
            </div>
          ) : (
            <span className="text-muted font-medium text-[12px] italic flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand/60" />
              No reviews yet
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand group-hover:text-brand-hover group-hover:translate-x-0.5 transition-all">
            View details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-surface rounded-card border border-border shadow-subtle overflow-hidden animate-pulse">
      <div className="aspect-square w-full bg-brand-pale/60" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="h-4 bg-brand-pale rounded w-3/4" />
          <div className="h-3.5 bg-brand-pale/50 rounded w-full" />
          <div className="h-3.5 bg-brand-pale/50 rounded w-2/3" />
        </div>
        <div className="pt-3 border-t border-border flex justify-between items-center">
          <div className="h-4 bg-brand-pale rounded w-1/3" />
          <div className="h-3.5 bg-brand-pale rounded w-16" />
        </div>
      </div>
    </div>
  );
}
