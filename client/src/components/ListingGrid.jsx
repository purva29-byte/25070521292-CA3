import ListingCard from './ListingCard.jsx';
import { ListingGridSkeleton } from './LoadingSkeleton.jsx';
import { cn } from '../lib/cn.js';

export default function ListingGrid({ listings, loading, layout = 'grid', skeletonCount = 6 }) {
  if (loading) return <ListingGridSkeleton count={skeletonCount} layout={layout} />;

  return (
    <div
      className={cn(
        'grid gap-5',
        layout === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
      )}
    >
      {listings.map((listing) => (
        <ListingCard key={listing.id || listing._id} listing={listing} layout={layout} />
      ))}
    </div>
  );
}
