import { useId } from 'react';
import { Check } from 'lucide-react';
import { CATEGORIES } from '../utils/constants.js';
import { categoryIcon, categoryTint } from '../utils/categoryMeta.js';
import { cn } from '../lib/cn.js';

export default function CategoryFilter({ selected = [], onChange, counts = {}, compact = false }) {
  const groupId = useId();
  const selectedSet = new Set(selected);

  function toggle(category) {
    if (selectedSet.has(category)) {
      onChange(selected.filter((item) => item !== category));
    } else {
      onChange([...selected, category]);
    }
  }

  return (
    <div className={cn('space-y-1.5', compact && 'max-h-64 overflow-y-auto pr-1')}>
      {CATEGORIES.map((category) => {
        const Icon = categoryIcon(category);
        const count = counts[category];
        const checked = selectedSet.has(category);
        const id = `${groupId}-${category.replaceAll(' ', '-')}`;

        return (
          <label
            key={category}
            htmlFor={id}
            className={cn(
              'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition',
              checked ? 'bg-forest-50 text-forest-800' : 'text-ink/70 hover:bg-ink/[0.03]'
            )}
          >
            <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-md', categoryTint(category))}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1 leading-5">{category}</span>
            {typeof count === 'number' && <span className="text-[10px] text-muted">{count}</span>}
            <span
              className={cn(
                'grid h-4 w-4 shrink-0 place-items-center rounded border transition',
                checked ? 'border-forest-600 bg-forest-600 text-white' : 'border-line bg-white'
              )}
              aria-hidden="true"
            >
              {checked && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <input
              id={id}
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={() => toggle(category)}
            />
          </label>
        );
      })}
    </div>
  );
}
