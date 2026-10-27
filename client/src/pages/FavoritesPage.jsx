import { Link } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import ListingGrid from '../components/ListingGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function FavoritesPage() {
  useDocumentTitle('Favourites');
  const { favorites, loading, count } = useFavorites();

  return (
    <div className="container-page pb-20 pt-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker">Saved for later</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Your favourites.</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            {count > 0
              ? `${count} saved listing${count === 1 ? '' : 's'}. Favourites stay in your account across sign-ins.`
              : 'Save listings you want to revisit. Your favourites stay in your account across sign-ins.'}
          </p>
        </div>
        <Link to="/marketplace" className="btn-secondary">
          <Search className="h-4 w-4" /> Browse marketplace
        </Link>
      </div>

      <div className="mt-8">
        {!loading && favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No favourites yet"
            description="Tap the heart on any live listing to keep it here. Removed or inaccessible listings drop out automatically."
            action={<Link to="/marketplace" className="btn-primary">Find something useful</Link>}
          />
        ) : (
          <ListingGrid listings={favorites} loading={loading} skeletonCount={3} />
        )}
      </div>
    </div>
  );
}
