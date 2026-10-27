import { cn } from '../lib/cn.js';
import { CONDITION_LABELS } from '../utils/constants.js';

const styles = {
  new: 'bg-forest-600 text-white',
  like_new: 'bg-forest-100 text-forest-800',
  good: 'bg-white/95 text-ink',
  fair: 'bg-ochre-100 text-ochre-700',
};

export default function ConditionBadge({ condition, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur',
        styles[condition] || styles.good,
        className
      )}
    >
      {CONDITION_LABELS[condition] || condition}
    </span>
  );
}
