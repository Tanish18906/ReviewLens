import { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 1 to 5 (or 0 for unrated)
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  count?: number;
}

export function RatingStars({
  rating,
  interactive = false,
  onChange,
  size = 'md',
  showNumber = false,
  count,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const starClass = starSizes[size];
  const activeRating = hoverRating !== null ? hoverRating : rating;

  if (interactive) {
    return (
      <fieldset className="border-none p-0 m-0">
        <legend className="sr-only">Rate this product (1 to 5 stars)</legend>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-page p-1.5 rounded-control border border-border">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isFilled = starValue <= activeRating;
              return (
                <label
                  key={starValue}
                  className="cursor-pointer p-1.5 rounded hover:bg-surface transition-all focus-within:ring-2 focus-within:ring-brand"
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(null)}
                >
                  <input
                    type="radio"
                    name="rating-input"
                    value={starValue}
                    checked={rating === starValue}
                    onChange={() => onChange?.(starValue)}
                    className="sr-only"
                    aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
                  />
                  <Star
                    className={`${starClass} transition-colors ${
                      isFilled
                        ? 'fill-amber-400 text-amber-500'
                        : 'fill-slate-100 text-slate-300 hover:text-amber-300'
                    }`}
                  />
                </label>
              );
            })}
          </div>
          <span className="text-[13px] font-semibold text-ink ml-1">
            {activeRating > 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-[14px] text-brand">{activeRating}.0</span>
                <span className="text-muted font-normal">
                  ({activeRating === 1 ? 'Poor' : activeRating === 2 ? 'Fair' : activeRating === 3 ? 'Good' : activeRating === 4 ? 'Very Good' : 'Excellent'})
                </span>
              </span>
            ) : (
              <span className="text-muted">Select rating</span>
            )}
          </span>
        </div>
      </fieldset>
    );
  }

  // Read-only star display
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= Math.round(rating);
          return (
            <Star
              key={starValue}
              className={`${starClass} ${
                isFilled ? 'fill-amber-400 text-amber-500' : 'fill-slate-100 text-slate-200'
              }`}
            />
          );
        })}
      </div>
      <span className="sr-only">{rating > 0 ? `${rating.toFixed(1)} out of 5 stars` : 'No ratings yet'}</span>
      {showNumber && (
        <span className="text-[13px] font-semibold text-ink font-mono">
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      )}
      {count !== undefined && (
        <span className="text-[12px] text-muted">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
