import { cn } from '../lib/cn.js';
import { LISTING_STATUS_LABELS } from '../utils/constants.js';

const styles = {
  approved: 'border-forest-200 bg-forest-50 text-forest-800',
  pending: 'border-ochre-100 bg-ochre-50 text-ochre-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  sold: 'border-line bg-ink/5 text-ink/65',
  removed: 'border-line bg-canvas text-muted',
  active: 'border-forest-200 bg-forest-50 text-forest-800',
  suspended: 'border-red-200 bg-red-50 text-red-700',
  open: 'border-ochre-100 bg-ochre-50 text-ochre-700',
  resolved: 'border-forest-200 bg-forest-50 text-forest-800',
  dismissed: 'border-line bg-canvas text-muted',
};

const labels = {
  ...LISTING_STATUS_LABELS,
  active: 'Active',
  suspended: 'Suspended',
  open: 'Open',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

export default function StatusBadge({ status, label, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold',
        styles[status] || styles.pending,
        className
      )}
    >
      {label || labels[status] || status}
    </span>
  );
}
