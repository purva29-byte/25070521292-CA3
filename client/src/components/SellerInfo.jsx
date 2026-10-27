import { Link } from 'react-router-dom';
import { CalendarDays, GraduationCap, MapPin } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { formatDate } from '../utils/format.js';

export default function SellerInfo({ seller, compact = false, showMemberSince = true }) {
  if (!seller) return null;

  return (
    <div className="flex items-start gap-3">
      <Avatar name={seller.name} size={compact ? 'md' : 'lg'} />
      <div className="min-w-0 flex-1">
        <Link
          to={`/seller/${seller.id}`}
          className="inline-flex max-w-full items-center gap-1 truncate text-sm font-semibold transition hover:text-forest-700"
        >
          {seller.name}
        </Link>
        <div className="mt-1 space-y-1 text-xs text-muted">
          {seller.college && (
            <p className="flex items-start gap-1.5">
              <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{seller.college}</span>
            </p>
          )}
          {!compact && (seller.department || seller.year) && (
            <p className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{[seller.department, seller.year].filter(Boolean).join(' · ')}</span>
            </p>
          )}
          {showMemberSince && (seller.memberSince || seller.createdAt) && (
            <p className="flex items-start gap-1.5">
              <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Member since {formatDate(seller.memberSince || seller.createdAt, {
                  day: undefined,
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
