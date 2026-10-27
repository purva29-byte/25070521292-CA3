import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/cn.js';

export default function SearchBar({
  initialValue = '',
  placeholder = 'Search textbooks, calculators, lab kits…',
  size = 'md',
  className = '',
  onSearch,
  autoFocus = false,
}) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const query = value.trim();
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(query ? `/marketplace?q=${encodeURIComponent(query)}` : '/marketplace');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center gap-2 rounded-xl border border-line bg-white p-1.5 shadow-sm transition focus-within:border-forest-400 focus-within:ring-4 focus-within:ring-forest-600/10',
        size === 'lg' && 'rounded-2xl p-2',
        className
      )}
      role="search"
    >
      <Search
        className={cn('ml-2 shrink-0 text-muted', size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')}
        aria-hidden="true"
      />
      <label className="sr-only" htmlFor="site-search">
        Search listings
      </label>
      <input
        id="site-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted/75',
          size === 'lg' ? 'py-2.5 text-[15px]' : 'py-1.5 text-sm'
        )}
      />
      <button
        type="submit"
        className={cn('btn-primary shrink-0', size === 'lg' ? 'px-5 py-3' : 'px-3 py-2 text-xs')}
      >
        Search
      </button>
    </form>
  );
}
