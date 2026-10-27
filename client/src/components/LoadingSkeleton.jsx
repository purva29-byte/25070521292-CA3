import { cn } from '../lib/cn.js';

export function LoadingSkeleton({ className = '' }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

export function ListingCardSkeleton({ layout = 'grid' }) {
  if (layout === 'list') {
    return (
      <div className="card flex gap-4 p-3">
        <LoadingSkeleton className="h-32 w-36 shrink-0" />
        <div className="flex-1 space-y-3 py-2">
          <LoadingSkeleton className="h-3 w-24" />
          <LoadingSkeleton className="h-5 w-3/4" />
          <LoadingSkeleton className="h-3 w-full" />
          <LoadingSkeleton className="h-4 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <LoadingSkeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          <LoadingSkeleton className="h-5 w-20" />
          <LoadingSkeleton className="h-5 w-14" />
        </div>
        <LoadingSkeleton className="h-5 w-4/5" />
        <LoadingSkeleton className="h-6 w-24" />
        <div className="flex items-center gap-2 pt-1">
          <LoadingSkeleton className="h-7 w-7 rounded-full" />
          <LoadingSkeleton className="h-3 w-28" />
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 6, layout = 'grid' }) {
  return (
    <div
      className={cn(
        'grid gap-5',
        layout === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <ListingCardSkeleton key={index} layout={layout} />
      ))}
    </div>
  );
}

export function PageSpinner({ label = 'Loading' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-forest-200 border-t-forest-600" />
      <span className="text-sm text-muted">{label}…</span>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-9 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <LoadingSkeleton key={index} className="h-28" />
        ))}
      </div>
      <LoadingSkeleton className="h-10 w-96 max-w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <LoadingSkeleton className="h-64" />
        <LoadingSkeleton className="h-64" />
      </div>
    </div>
  );
}
