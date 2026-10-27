import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MapPin } from 'lucide-react';
import Avatar from './Avatar.jsx';
import ConditionBadge from './ConditionBadge.jsx';
import FavoriteButton from './FavoriteButton.jsx';
import PriceDisplay from './PriceDisplay.jsx';
import StatusBadge from './StatusBadge.jsx';
import { cn } from '../lib/cn.js';
import { imageUrl, truncate } from '../utils/format.js';
import { categoryImage } from '../utils/categoryMeta.js';

function ListingImage({ listing, className }) {
  const fallback = categoryImage(listing.category);
  const initialSrc = listing.images?.[0] ? imageUrl(listing.images[0]) : fallback;
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  function handleError() {
    if (!hasError && currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setHasError(true);
    }
  }

  return (
    <div className={cn('relative overflow-hidden bg-[#ECE8DE]', className)}>
      <img
        src={currentSrc}
        alt={listing.title}
        loading="lazy"
        className="relative h-full w-full object-cover transition duration-500 group-hover:scale-105"
        onError={handleError}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 pointer-events-none">
        <div className="flex flex-wrap gap-2 pointer-events-auto">
          <ConditionBadge condition={listing.condition} />
          {listing.status === 'sold' && <StatusBadge status="sold" />}
        </div>
      </div>
      {listing.status === 'sold' && (
        <div className="absolute inset-0 grid place-items-center bg-ink/40 backdrop-blur-[2px]">
          <span className="rounded-full bg-paper/95 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink shadow-card">
            Sold
          </span>
        </div>
      )}
    </div>
  );
}


export default function ListingCard({ listing, layout = 'grid' }) {
  const isList = layout === 'list';

  return (
    <article
      className={cn(
        'group card relative overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-lift',
        isList && 'flex flex-col sm:flex-row'
      )}
    >
      <Link
        to={`/listing/${listing.id || listing._id}`}
        className={cn('block focus-visible:outline-none', isList && 'sm:w-60 sm:shrink-0')}
        aria-label={`View ${listing.title}`}
      >
        <ListingImage
          listing={listing}
          className={cn('aspect-[4/3] w-full', isList && 'sm:h-full sm:min-h-44')}
        />
      </Link>

      <FavoriteButton
        listingId={listing.id || listing._id}
        className="absolute right-3 top-3"
        size="sm"
      />

      <div className={cn('flex flex-1 flex-col p-4', isList && 'sm:p-5')}>
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
          <span className="truncate">{listing.category}</span>
          {listing.views > 0 && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1">
              <Eye className="h-3 w-3" /> {listing.views}
            </span>
          )}
        </div>

        <Link
          to={`/listing/${listing.id || listing._id}`}
          className="mt-1.5 focus-visible:outline-none"
        >
          <h3
            className={cn(
              'line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-ink transition group-hover:text-forest-700',
              isList && 'sm:text-lg'
            )}
          >
            {listing.title}
          </h3>
        </Link>

        {isList && listing.description && (
          <p className="mt-2 hidden text-sm leading-6 text-muted sm:line-clamp-2">
            {truncate(listing.description, 180)}
          </p>
        )}

        <div className="mt-auto pt-3">
          <PriceDisplay price={listing.price} negotiable={listing.isNegotiable} size="sm" />
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-line/80 pt-3">
            <Link
              to={listing.seller?.id ? `/seller/${listing.seller.id}` : '#'}
              onClick={(event) => {
                if (!listing.seller?.id) event.preventDefault();
              }}
              className="flex min-w-0 items-center gap-2 rounded-md transition hover:text-forest-700"
            >
              <Avatar name={listing.seller?.name || 'Student'} size="xs" />
              <span className="truncate text-[11px] font-medium text-muted">
                {listing.seller?.name || 'Student seller'}
              </span>
            </Link>
            {(listing.college || listing.seller?.college) && (
              <span className="flex min-w-0 items-center gap-1 text-[10px] text-muted">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{listing.college || listing.seller?.college}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
