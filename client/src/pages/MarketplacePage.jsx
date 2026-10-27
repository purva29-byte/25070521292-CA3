import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import CategoryFilter from '../components/CategoryFilter.jsx';
import FilterDrawer from '../components/FilterDrawer.jsx';
import ListingGrid from '../components/ListingGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useListings } from '../hooks/useListings.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { listingService } from '../services/listingService.js';
import { CATEGORIES, CONDITIONS, SORT_OPTIONS } from '../utils/constants.js';
import { formatCurrency } from '../utils/format.js';
import { cn } from '../lib/cn.js';

function parseCommaList(value) {
  return value ? value.split(',').filter(Boolean) : [];
}

function FiltersContent({
  selectedCategories,
  selectedConditions,
  onToggleCategory,
  onToggleCondition,
  minPrice,
  maxPrice,
  priceError,
  onMinPrice,
  onMaxPrice,
  onApplyPrice,
  onClearAll,
  counts,
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Category</h3>
          {selectedCategories.length > 0 && (
            <button type="button" onClick={onClearAll} className="text-[11px] font-medium text-forest-700 hover:underline">
              Clear all
            </button>
          )}
        </div>
        <CategoryFilter selected={selectedCategories} onChange={onToggleCategory} counts={counts} />
      </div>

      <div className="border-t border-line pt-5">
        <h3 className="mb-3 text-sm font-semibold">Price range</h3>
        <form onSubmit={onApplyPrice} className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">₹</span>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => onMinPrice(event.target.value)}
              placeholder="Min"
              className="field-input pl-6 py-2 text-xs"
              aria-label="Minimum price"
            />
          </div>
          <span className="text-xs text-muted">to</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">₹</span>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => onMaxPrice(event.target.value)}
              placeholder="Max"
              className="field-input pl-6 py-2 text-xs"
              aria-label="Maximum price"
            />
          </div>
          <button type="submit" className="btn-secondary btn-sm shrink-0" aria-label="Apply price filter">
            Go
          </button>
        </form>
        {priceError && <p className="field-error">{priceError}</p>}
      </div>

      <div className="border-t border-line pt-5">
        <h3 className="mb-3 text-sm font-semibold">Condition</h3>
        <div className="space-y-2.5">
          {CONDITIONS.map((condition) => (
            <label key={condition.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={selectedConditions.includes(condition.value)}
                onChange={() => onToggleCondition(condition.value)}
                className="h-4 w-4 rounded border-line text-forest-600 focus:ring-forest-500"
              />
              {condition.label}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-canvas p-3 text-[11px] leading-5 text-muted">
        Search and filters run against live MongoDB records. Sold, pending, rejected, and removed
        listings are excluded from public results.
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  useDocumentTitle('Marketplace');
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [categories, setCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [priceError, setPriceError] = useState('');
  const [layout, setLayout] = useState(() => {
    try {
      return localStorage.getItem('unimarket-layout') || 'grid';
    } catch {
      return 'grid';
    }
  });

  const q = searchParams.get('q') || '';
  const selectedCategories = parseCommaList(searchParams.get('category'));
  const selectedConditions = parseCommaList(searchParams.get('condition'));
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const debouncedSearch = useDebounce(searchInput, 400);

  const filters = useMemo(
    () => ({
      q,
      category: selectedCategories,
      condition: selectedConditions,
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort,
      page,
      limit: 12,
    }),
    [q, searchParams, selectedCategories, selectedConditions, sort, page]
  );

  const { listings, meta, loading, error, reload } = useListings(filters);

  useEffect(() => {
    listingService.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setSearchInput(q);
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [q, searchParams]);

  useEffect(() => {
    if (debouncedSearch === q) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch.trim()) next.set('q', debouncedSearch.trim());
    else next.delete('q');
    next.delete('page');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    try {
      localStorage.setItem('unimarket-layout', layout);
    } catch {
      // Layout preference is a nice-to-have.
    }
  }, [layout]);

  const counts = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.name, category.count])),
    [categories]
  );

  function patchParams(updates, resetPage = true) {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, value);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  }

  function toggleCategory(category) {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];
    patchParams({ category: next.join(',') });
  }

  function toggleCondition(condition) {
    const next = selectedConditions.includes(condition)
      ? selectedConditions.filter((item) => item !== condition)
      : [...selectedConditions, condition];
    patchParams({ condition: next.join(',') });
  }

  function applyPrice(event) {
    event?.preventDefault();
    const min = minPrice === '' ? '' : Number(minPrice);
    const max = maxPrice === '' ? '' : Number(maxPrice);
    if (min !== '' && min < 0) return setPriceError('Minimum price cannot be negative.');
    if (max !== '' && max < 0) return setPriceError('Maximum price cannot be negative.');
    if (min !== '' && max !== '' && min > max) {
      return setPriceError('Minimum price cannot be greater than maximum price.');
    }
    setPriceError('');
    patchParams({ minPrice: min, maxPrice: max });
    setDrawerOpen(false);
  }

  function clearAll() {
    setSearchInput('');
    setMinPrice('');
    setMaxPrice('');
    setPriceError('');
    setSearchParams({}, { replace: true });
    setDrawerOpen(false);
  }

  const activeFilterCount =
    selectedCategories.length +
    selectedConditions.length +
    (q ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0);

  return (
    <div className="container-page pb-16 pt-8 sm:pt-10">
      <nav className="text-xs text-muted" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-forest-700">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Marketplace</span>
      </nav>

      <div className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="section-kicker">Campus marketplace</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Find something useful.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            Live, approved listings from students. Search by item, choose a category, or narrow by
            condition and price.
          </p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const next = new URLSearchParams(searchParams);
            if (searchInput.trim()) next.set('q', searchInput.trim());
            else next.delete('q');
            next.delete('page');
            setSearchParams(next);
          }}
          className="flex w-full max-w-xl items-center gap-2 rounded-2xl border border-line bg-white p-1.5 shadow-sm focus-within:border-forest-400 focus-within:ring-4 focus-within:ring-forest-600/10"
        >
          <Search className="ml-2 h-4 w-4 shrink-0 text-muted" />
          <label htmlFor="marketplace-search" className="sr-only">
            Search marketplace
          </label>
          <input
            id="marketplace-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search title, description, or category"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted/70"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="rounded-md p-1 text-muted hover:bg-ink/5"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button type="submit" className="btn-primary btn-sm">
            Search
          </button>
        </form>
      </div>

      <div className="mt-9 grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 card p-5">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-forest-700" />
              <h2 className="text-sm font-semibold">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="ml-auto rounded-full bg-forest-600 px-2 py-0.5 text-[9px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <FiltersContent
              selectedCategories={selectedCategories}
              selectedConditions={selectedConditions}
              onToggleCategory={toggleCategory}
              onToggleCondition={toggleCondition}
              minPrice={minPrice}
              maxPrice={maxPrice}
              priceError={priceError}
              onMinPrice={setMinPrice}
              onMaxPrice={setMaxPrice}
              onApplyPrice={applyPrice}
              onClearAll={clearAll}
              counts={counts}
            />
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-sm text-muted">
              {loading ? 'Finding listings…' : `${meta?.total || 0} listing${meta?.total === 1 ? '' : 's'}`}
              {q && <span className="text-ink"> for “{q}”</span>}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="btn-secondary btn-sm lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-forest-600 px-1.5 text-[9px] text-white">{activeFilterCount}</span>
                )}
              </button>
              <label htmlFor="sort" className="sr-only">
                Sort listings
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => patchParams({ sort: event.target.value === 'newest' ? '' : event.target.value })}
                className="field-input w-auto py-2 text-xs"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="hidden items-center rounded-lg border border-line bg-white p-0.5 sm:flex">
                <button
                  type="button"
                  onClick={() => setLayout('grid')}
                  className={cn('rounded-md p-1.5 transition', layout === 'grid' ? 'bg-forest-50 text-forest-700' : 'text-muted hover:text-ink')}
                  aria-label="Grid view"
                  aria-pressed={layout === 'grid'}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('list')}
                  className={cn('rounded-md p-1.5 transition', layout === 'list' ? 'bg-forest-50 text-forest-700' : 'text-muted hover:text-ink')}
                  aria-label="List view"
                  aria-pressed={layout === 'list'}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {q && (
                <button type="button" onClick={() => { setSearchInput(''); patchParams({ q: '' }); }} className="chip">
                  “{q}” <X className="h-3 w-3" />
                </button>
              )}
              {selectedCategories.map((category) => (
                <button key={category} type="button" onClick={() => toggleCategory(category)} className="chip">
                  {category} <X className="h-3 w-3" />
                </button>
              ))}
              {selectedConditions.map((condition) => (
                <button key={condition} type="button" onClick={() => toggleCondition(condition)} className="chip">
                  {CONDITIONS.find((item) => item.value === condition)?.label || condition} <X className="h-3 w-3" />
                </button>
              ))}
              {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    patchParams({ minPrice: '', maxPrice: '' });
                  }}
                  className="chip"
                >
                  {searchParams.get('minPrice') ? formatCurrency(searchParams.get('minPrice')) : '₹0'} –{' '}
                  {searchParams.get('maxPrice') ? formatCurrency(searchParams.get('maxPrice')) : 'Any'} <X className="h-3 w-3" />
                </button>
              )}
              <button type="button" onClick={clearAll} className="text-xs font-medium text-forest-700 hover:underline">
                Clear all
              </button>
            </div>
          )}

          <div className="mt-6">
            {error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : !loading && listings.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No listings match these filters"
                description="Try a broader search, remove a filter, or be the first to list this kind of item."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={clearAll} className="btn-secondary">
                      Clear filters
                    </button>
                    <Link to="/sell" className="btn-primary">
                      Sell an item
                    </Link>
                  </div>
                }
              />
            ) : (
              <ListingGrid listings={listings} loading={loading} layout={layout} skeletonCount={6} />
            )}
          </div>

          {meta && meta.totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
              <button
                type="button"
                onClick={() => patchParams({ page: String(page - 1) }, false)}
                disabled={!meta.hasPreviousPage}
                className="btn-secondary btn-sm"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="px-2 text-xs text-muted">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                type="button"
                onClick={() => patchParams({ page: String(page + 1) }, false)}
                disabled={!meta.hasNextPage}
                className="btn-secondary btn-sm"
                aria-label="Next page"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn-secondary" onClick={clearAll}>
              Clear all
            </button>
            <button type="button" className="btn-primary" onClick={() => setDrawerOpen(false)}>
              Show {meta?.total || 0} results
            </button>
          </div>
        }
      >
        <FiltersContent
          selectedCategories={selectedCategories}
          selectedConditions={selectedConditions}
          onToggleCategory={toggleCategory}
          onToggleCondition={toggleCondition}
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceError={priceError}
          onMinPrice={setMinPrice}
          onMaxPrice={setMaxPrice}
          onApplyPrice={applyPrice}
          onClearAll={clearAll}
          counts={counts}
        />
      </FilterDrawer>
    </div>
  );
}
