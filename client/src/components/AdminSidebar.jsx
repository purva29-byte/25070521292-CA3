import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Flag,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { cn } from '../lib/cn.js';

const items = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'moderation', label: 'Moderation queue', icon: BookOpen, badge: 'pending' },
  { id: 'reports', label: 'Reports', icon: Flag, badge: 'reports' },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'activity', label: 'Moderation history', icon: Activity },
];

export default function AdminSidebar({ active, onChange, stats }) {
  return (
    <aside className="lg:w-60 lg:shrink-0">
      <div className="hidden lg:block">
        <div className="flex items-center gap-2.5 rounded-xl border border-forest-100 bg-forest-50 px-3.5 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-forest-600 text-white">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-forest-900">Admin workspace</p>
            <p className="text-[10px] text-forest-700">Role-protected area</p>
          </div>
        </div>
        <nav className="mt-4 space-y-1" aria-label="Admin sections">
          {items.map(({ id, label, icon: Icon, badge }) => {
            const count =
              badge === 'pending'
                ? stats?.listings?.pending
                : badge === 'reports'
                  ? stats?.reports?.open
                  : 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  active === id ? 'bg-forest-600 text-white' : 'text-ink/65 hover:bg-ink/[0.04] hover:text-ink'
                )}
                aria-current={active === id ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{label}</span>
                {count > 0 && (
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-semibold', active === id ? 'bg-white/20 text-white' : 'bg-ochre-100 text-ochre-700')}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <Link to="/" className="mt-5 flex items-center gap-2 px-3 py-2 text-xs text-muted transition hover:text-forest-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to marketplace
        </Link>
      </div>

      <div className="flex gap-1 overflow-x-auto lg:hidden">
        {items.map(({ id, label, icon: Icon, badge }) => {
          const count =
            badge === 'pending'
              ? stats?.listings?.pending
              : badge === 'reports'
                ? stats?.reports?.open
                : 0;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition',
                active === id ? 'border-forest-600 bg-forest-600 text-white' : 'border-line bg-paper text-ink/65'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label.replace(' queue', '').replace(' history', '')}
              {count > 0 && <span className="text-[9px] opacity-80">{count}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
