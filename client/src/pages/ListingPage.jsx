import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Eye,
  Flag,
  GraduationCap,
  MapPin,
  MessageSquare,
  Pencil,
  ShieldCheck,
  Store,
} from 'lucide-react';
import ImageGallery from '../components/ImageGallery.jsx';
import SellerInfo from '../components/SellerInfo.jsx';
import PriceDisplay from '../components/PriceDisplay.jsx';
import ConditionBadge from '../components/ConditionBadge.jsx';
import ContactSellerButton from '../components/ContactSellerButton.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import ReportModal from '../components/ReportModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { PageSpinner } from '../components/LoadingSkeleton.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { listingService } from '../services/listingService.js';
import { getApiError } from '../services/api.js';
import { formatDate } from '../utils/format.js';

const safetyTips = [
  'Meet in a busy, well-lit campus location.',
  'Inspect the item before you pay anything.',
  'Avoid advance payments to unknown sellers.',
  'Never share OTPs, passwords, or banking details.',
];

export default function ListingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportOpen, setReportOpen] = useState(false);

  useDocumentTitle(listing?.title || 'Listing');

  function load() {
    setLoading(true);
    setError('');
    listingService
      .get(id)
      .then(setListing)
      .catch((requestError) => setError(getApiError(requestError, 'Could not load this listing.')))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <PageSpinner label="Loading listing" />;
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="This listing is unavailable"
          message={error}
          onRetry={load}
        />
        <div className="mt-6 text-center">
          <Link to="/marketplace" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" /> Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = listing.isOwner || (user && String(user.id) === String(listing.seller?.id));
  const isAvailable = listing.status === 'approved';

  return (
    <div className="container-page pb-20 pt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-forest-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <nav className="text-xs text-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-forest-700">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/marketplace" className="hover:text-forest-700">Marketplace</Link>
          <span className="mx-2">/</span>
          <Link to={`/marketplace?category=${encodeURIComponent(listing.category)}`} className="hover:text-forest-700">
            {listing.category}
          </Link>
        </nav>
      </div>

      {(isOwner || user?.role === 'admin') && listing.status !== 'approved' && (
        <div className="mt-5 rounded-xl border border-ochre-100 bg-ochre-50 p-4 text-sm text-ochre-700">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={listing.status} />
            <p className="font-medium">
              {listing.status === 'pending' && 'This listing is waiting for moderation and is not public yet.'}
              {listing.status === 'rejected' && 'This listing needs changes before it can go live.'}
              {listing.status === 'sold' && 'This item has been marked as sold.'}
              {listing.status === 'removed' && 'This listing was removed by a moderator.'}
            </p>
            {isOwner && listing.status !== 'pending' && (
              <Link to={`/sell/${listing.id || listing._id}/edit`} className="btn-secondary btn-sm ml-auto">
                <Pencil className="h-3.5 w-3.5" /> Edit listing
              </Link>
            )}
          </div>
          {listing.rejectionReason && (
            <p className="mt-3 border-t border-ochre-100 pt-3 text-xs leading-5">
              <span className="font-semibold">Moderator note:</span> {listing.rejectionReason}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.22fr_0.78fr] xl:gap-12">
        <div>
          <ImageGallery images={listing.images} title={listing.title} category={listing.category} />

          <div className="mt-8 lg:hidden">
            <ListingSummary
              listing={listing}
              isOwner={isOwner}
              onReport={() => setReportOpen(true)}
            />
          </div>

          <section className="mt-8 border-t border-line pt-8">
            <p className="section-kicker">About this item</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Seller’s description</h2>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-ink/75">
              {listing.description}
            </p>
          </section>

          <section className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-paper p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                <GraduationCap className="h-4 w-4 text-forest-700" /> Campus
              </div>
              <p className="mt-2 text-sm text-muted">{listing.college || listing.seller?.college}</p>
            </div>
            <div className="rounded-xl border border-line bg-paper p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                <MapPin className="h-4 w-4 text-forest-700" /> Pickup area
              </div>
              <p className="mt-2 text-sm text-muted">
                {listing.pickupLocation || 'Arrange the meeting point in chat.'}
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-forest-100 bg-forest-50/70 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-forest-800">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-base font-semibold">Safe exchange reminders</h2>
            </div>
            <ul className="mt-4 grid gap-2.5 text-sm text-forest-900/75 sm:grid-cols-2">
              {safetyTips.map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                  {tip}
                </li>
              ))}
            </ul>
            <Link to="/safety" className="link mt-4 inline-block text-xs">
              Read all safety guidelines
            </Link>
          </section>

          {!isOwner && user && (
            <div className="mt-8 border-t border-line pt-5">
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-red-700"
              >
                <Flag className="h-3.5 w-3.5" /> Report this listing
              </button>
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <ListingSummary
              listing={listing}
              isOwner={isOwner}
              onReport={() => setReportOpen(true)}
            />
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Seller</h2>
                <Link
                  to={listing.seller?.id ? `/seller/${listing.seller.id}` : '#'}
                  className="text-[11px] font-medium text-forest-700 hover:underline"
                >
                  View profile
                </Link>
              </div>
              <div className="mt-4">
                <SellerInfo seller={listing.seller} />
              </div>
              <div className="mt-4 border-t border-line pt-4 text-[11px] leading-5 text-muted">
                Public profiles show name, college, and member-since date. Email addresses and
                account details are not exposed.
              </div>
            </div>
          </div>
        </aside>
      </div>

      <ReportModal listing={listing} open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}

function ListingSummary({ listing, isOwner, onReport }) {
  const status = listing.status;
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip border-forest-100 bg-forest-50 text-forest-800">{listing.category}</span>
        <ConditionBadge condition={listing.condition} className="shadow-none" />
        {status !== 'approved' && <StatusBadge status={status} />}
      </div>

      <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
        {listing.title}
      </h1>

      <div className="mt-4">
        <PriceDisplay price={listing.price} negotiable={listing.isNegotiable} size="lg" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" /> Posted {formatDate(listing.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" /> {listing.views || 0} views
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {listing.college}
        </span>
      </div>

      {status === 'sold' && (
        <div className="mt-4 rounded-lg bg-ink/5 px-3 py-2 text-xs font-medium text-ink/70">
          This item has been marked as sold.
        </div>
      )}

      <div className="mt-5 space-y-2.5">
        <ContactSellerButton listing={listing} />
        {!isOwner && (
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <FavoriteButton listingId={listing.id || listing._id} showLabel className="w-full justify-center" />
            <button
              type="button"
              onClick={onReport}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-muted transition hover:border-red-200 hover:text-red-700"
              aria-label="Report listing"
              title="Report listing"
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-xl bg-canvas px-4 py-3 text-[11px] leading-5 text-muted">
        <div className="flex items-center gap-2 font-semibold text-ink/75">
          <MessageSquare className="h-3.5 w-3.5 text-forest-700" /> Keep it on UniMarket
        </div>
        Contact the seller here so listing information and safety reminders stay together.
      </div>

      {isOwner && (
        <Link to="/dashboard" className="btn-secondary mt-3 w-full">
          <Store className="h-4 w-4" /> Manage your listings
        </Link>
      )}
    </div>
  );
}
