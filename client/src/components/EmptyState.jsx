import { PackageOpen } from 'lucide-react';
import { cn } from '../lib/cn.js';

function getIllustration(title = '', description = '', explicit) {
  if (explicit) return explicit;
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('search') || text.includes('match') || text.includes('filter')) {
    return '/images/illustrations/empty-search.svg';
  }
  if (text.includes('favourite') || text.includes('favorite') || text.includes('saved')) {
    return '/images/illustrations/empty-favorites.svg';
  }
  if (text.includes('message') || text.includes('conversation') || text.includes('inbox')) {
    return '/images/illustrations/empty-messages.svg';
  }
  return '/images/illustrations/empty-box.svg';
}

export default function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  illustration,
  action = null,
  className = '',
}) {
  const visual = getIllustration(title, description, illustration);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-paper/60 px-6 py-12 text-center',
        className
      )}
    >
      {visual ? (
        <div className="mb-4 flex justify-center">
          <img
            src={visual}
            alt=""
            className="h-28 w-auto max-w-[200px] object-contain transition duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-forest-50 text-forest-700">
          <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
        </span>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

