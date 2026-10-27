import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { favoriteService } from '../services/favoriteService.js';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user, booting } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef(new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const data = await favoriteService.list();
      setFavoriteIds(new Set(data.favoriteIds));
      setFavorites(data.listings);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (booting) return;
    if (!user) {
      setFavoriteIds(new Set());
      setFavorites([]);
      return;
    }
    refresh().catch(() => {
      // The favorites page shows its own actionable error state.
    });
  }, [booting, user, refresh]);

  const toggle = useCallback(
    async (listingId) => {
      if (!user) return null;
      if (pendingRef.current.has(listingId)) return null;
      pendingRef.current.add(listingId);

      try {
        const isSaved = favoriteIds.has(listingId);
        const data = isSaved
          ? await favoriteService.remove(listingId)
          : await favoriteService.add(listingId);
        setFavoriteIds(new Set(data.favoriteIds));
        setFavorites(data.listings);
        return !isSaved;
      } finally {
        pendingRef.current.delete(listingId);
      }
    },
    [favoriteIds, user]
  );

  const isFavorite = useCallback((listingId) => favoriteIds.has(listingId), [favoriteIds]);

  const value = useMemo(
    () => ({
      favoriteIds,
      favorites,
      loading,
      refresh,
      toggle,
      isFavorite,
      count: favoriteIds.size,
    }),
    [favoriteIds, favorites, loading, refresh, toggle, isFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider.');
  return context;
}
