import { useEffect, useRef, useState } from 'react';
import { listingService } from '../services/listingService.js';
import { getApiError } from '../services/api.js';

export function useListings(filters) {
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = JSON.stringify(filters);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    listingService
      .list(filtersRef.current)
      .then((data) => {
        if (!active) return;
        setListings(data.listings);
        setMeta(data.meta);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(getApiError(requestError, 'Could not load listings.'));
        setListings([]);
        setMeta(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requestKey, reloadKey]);

  return {
    listings,
    meta,
    loading,
    error,
    reload: () => setReloadKey((key) => key + 1),
  };
}
