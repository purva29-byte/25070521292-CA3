import { Link } from 'react-router-dom';
import { cn } from '../lib/cn.js';

export default function Logo({ compact = false, className = '', to = '/' }) {
  return (
    <Link
      to={to}
      className={cn('group inline-flex items-center gap-2.5 rounded-lg', className)}
      aria-label="UniMarket home"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-600 text-paper shadow-sm transition group-hover:bg-forest-700">
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M6.5 9.4c3.7-1.3 7-.9 9.5 1.2v13c-2.5-2.1-5.8-2.5-9.5-1.2v-13Z"
            fill="currentColor"
          />
          <path
            d="M25.5 9.4c-3.7-1.3-7-.9-9.5 1.2v13c2.5-2.1 5.8-2.5 9.5-1.2v-13Z"
            fill="currentColor"
            opacity=".68"
          />
          <path d="M16 10.6v13" stroke="#1F5A43" strokeWidth="1.2" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[19px] font-semibold tracking-[-0.04em] text-ink">
            Uni<span className="text-forest-700">Market</span>
          </span>
          <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.17em] text-muted sm:block">
            Smart deals. Student to student.
          </span>
        </span>
      )}
    </Link>
  );
}
