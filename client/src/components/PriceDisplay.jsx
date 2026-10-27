import { cn } from '../lib/cn.js';
import { formatCurrency } from '../utils/format.js';

export default function PriceDisplay({ price, negotiable = false, size = 'md', className = '' }) {
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span
        className={cn(
          'font-semibold tracking-tight text-ink',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-xl',
          size === 'lg' && 'text-3xl sm:text-4xl'
        )}
      >
        {formatCurrency(price)}
      </span>
      {negotiable && (
        <span className={cn('text-muted', size === 'lg' ? 'text-sm' : 'text-[11px]')}>
          Negotiable
        </span>
      )}
    </div>
  );
}
