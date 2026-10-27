import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, GraduationCap, MapPin, Store } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import ListingGrid from '../components/ListingGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { PageSpinner } from '../components/LoadingSkeleton.jsx';
import { userService } from '../services/userService.js';
import { listingService } from '../services/listingService.js';
import { getApiError } from '../services/api.js';
import { formatDate } from '../utils/format.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function SellerPage() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useDocumentTitle(seller ? `${seller.name} · Seller` : 'Seller profile');

  function load() {
    setLoading(true);
    setError('');
    Promise.all([userService.profile(id), listingService.list({ seller: id, limit: 48, sort: 'newest' })])
      .then(([user, listingData]) => {
        setSeller(user);
        setListings(listingData.listings);
      })
      .catch((requestError) => setError(getApiError(requestError, 'Could not load this seller profile.')))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <PageSpinner label="Loading seller profile" />;
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Seller profile unavailable" message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-line bg-paper">
        <div className="container-page py-10 sm:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar name={seller.name} size="xl" className="ring-4 ring-forest-50" />
            <div className="min-w-0 flex-1">
              <p className="section-kicker">Student seller</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{seller.name}</h1>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" /> {seller.college}
                </span>
                {(seller.department || seller.year) && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {[seller.department, seller.year].filter(Boolean).join(' · ')}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> Member since {formatDate(seller.memberSince, { day: undefined, month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-canvas px-5 py-4 text-center">
              <p className="text-2xl font-semibold">{seller.activeListings || 0}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">Live listings</p>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-xs leading-5 text-muted">
            UniMarket does not verify identity or student status. Meet in a public campus location
            and inspect items before paying.
          </p>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-kicker">Currently selling</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Listings from {seller.name.split(' ')[0]}</h2>
          </div>
          <Link to="/marketplace" className="hidden btn-secondary btn-sm sm:inline-flex">
            <Store className="h-3.5 w-3.5" /> Browse all
          </Link>
        </div>

        <div className="mt-6">
          {listings.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No live listings right now"
              description="This seller has no approved listings at the moment. Check the marketplace for other useful items."
              action={<Link to="/marketplace" className="btn-primary">Browse marketplace</Link>}
            />
          ) : (
            <ListingGrid listings={listings} skeletonCount={3} />
          )}
        </div>
      </div>
    </div>
  );
}
