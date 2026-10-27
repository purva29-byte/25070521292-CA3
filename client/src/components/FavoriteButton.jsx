import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { getApiError } from '../services/api.js';
import { cn } from '../lib/cn.js';

export default function FavoriteButton({ listingId, className = '', showLabel = false, size = 'md' }) {
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const saved = isFavorite(listingId);

  async function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      notify.info('Sign in to save listings to your favourites.');
      navigate(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    setLoading(true);
    try {
      const next = await toggle(listingId);
      if (next === true) notify.success('Saved to favourites.');
      if (next === false) notify.success('Removed from favourites.');
    } catch (error) {
      notify.error(getApiError(error, 'Could not update favourites.'));
    } finally {
      setLoading(false);
    }
  }

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from favourites' : 'Save to favourites'}
      disabled={loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border transition',
        showLabel ? 'px-4 py-2.5 text-sm font-semibold' : 'h-10 w-10',
        saved
          ? 'border-forest-200 bg-forest-50 text-forest-700'
          : 'border-line bg-white/95 text-ink/70 hover:border-forest-200 hover:text-forest-700',
        'shadow-sm backdrop-blur disabled:opacity-70',
        className
      )}
    >
      {loading ? (
        <Loader2 className={cn(iconSize, 'animate-spin')} />
      ) : (
        <Heart className={cn(iconSize, saved && 'fill-current')} />
      )}
      {showLabel && (saved ? 'Saved' : 'Save')}
    </button>
  );
}
