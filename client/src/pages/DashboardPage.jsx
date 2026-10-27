import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  Heart,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  RotateCcw,
  Store,
  Tag,
  Trash2,
  UserRound,
} from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ConfirmationDialog from '../components/ConfirmationDialog.jsx';
import { DashboardSkeleton } from '../components/LoadingSkeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { listingService } from '../services/listingService.js';
import { conversationService } from '../services/conversationService.js';
import { userService } from '../services/userService.js';
import { getApiError, getFieldErrors } from '../services/api.js';
import { formatCurrency, formatDate, imageUrl, timeAgo } from '../utils/format.js';
import { categoryImage } from '../utils/categoryMeta.js';
import { YEARS } from '../utils/constants.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { cn } from '../lib/cn.js';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'listings', label: 'My listings' },
  { id: 'messages', label: 'Messages' },
  { id: 'profile', label: 'Profile' },
];

const statCards = [
  { key: 'total', label: 'Total listings', icon: Store, tone: 'bg-ink/5 text-ink' },
  { key: 'active', label: 'Live listings', icon: CheckCircle2, tone: 'bg-forest-50 text-forest-700' },
  { key: 'pending', label: 'Pending review', icon: Eye, tone: 'bg-ochre-50 text-ochre-700' },
  { key: 'sold', label: 'Marked sold', icon: Tag, tone: 'bg-[#E5EDF2] text-[#355B70]' },
];

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user, updateUser } = useAuth();
  const { favorites } = useFavorites();
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = tabs.some((tab) => tab.id === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'overview';
  const [data, setData] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useMemo(() => {
    if (searchParams.get('tab')) return null;
    return null;
  }, [searchParams]);

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const [listingData, conversationData] = await Promise.all([
        listingService.mine(),
        conversationService.list(),
      ]);
      setData(listingData);
      setConversations(conversationData);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not load your dashboard.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setTab(tab) {
    setSearchParams(tab === 'overview' ? {} : { tab });
  }

  async function handleStatus(listing, status) {
    setActionLoading(true);
    try {
      const result = await listingService.updateStatus(listing.id || listing._id, status);
      notify.success(result.message);
      await loadDashboard();
    } catch (requestError) {
      notify.error(getApiError(requestError, 'Could not update the listing.'));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await listingService.remove(deleteTarget.id || deleteTarget._id);
      notify.success('Listing deleted.');
      setDeleteTarget(null);
      await loadDashboard();
    } catch (requestError) {
      notify.error(getApiError(requestError, 'Could not delete the listing.'));
    } finally {
      setActionLoading(false);
    }
  }

  const unreadTotal = conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0);
  const counts = data?.counts || { total: 0, active: 0, pending: 0, sold: 0 };

  return (
    <div className="container-page pb-20 pt-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name} size="lg" />
          <div>
            <p className="section-kicker">Student dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Hello, {user?.name?.split(' ')[0]}.
            </h1>
            <p className="mt-1 text-sm text-muted">{user?.college}</p>
          </div>
        </div>
        <Link to="/sell" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" /> Create a listing
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto border-b border-line">
        <div className="flex min-w-max gap-1" role="tablist" aria-label="Dashboard sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                'relative px-4 py-3 text-sm font-medium transition',
                activeTab === tab.id ? 'text-forest-800' : 'text-muted hover:text-ink'
              )}
            >
              {tab.label}
              {tab.id === 'messages' && unreadTotal > 0 && (
                <span className="ml-2 rounded-full bg-forest-600 px-1.5 py-0.5 text-[9px] text-white">
                  {unreadTotal}
                </span>
              )}
              {activeTab === tab.id && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-forest-700" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7">
        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={loadDashboard} />
        ) : activeTab === 'overview' ? (
          <OverviewTab
            counts={counts}
            listings={data.listings}
            conversations={conversations}
            favorites={favorites}
            unreadTotal={unreadTotal}
            onTab={setTab}
          />
        ) : activeTab === 'listings' ? (
          <ListingsTab
            listings={data.listings}
            onEdit={(listing) => null}
            onDelete={setDeleteTarget}
            onStatus={handleStatus}
            actionLoading={actionLoading}
          />
        ) : activeTab === 'messages' ? (
          <MessagesTab conversations={conversations} />
        ) : (
          <ProfileTab user={user} updateUser={updateUser} notify={notify} />
        )}
      </div>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this listing?"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” and its conversations and reports will be permanently deleted. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete listing"
        loading={actionLoading}
        danger
      />
    </div>
  );
}

function OverviewTab({ counts, listings, conversations, favorites, unreadTotal, onTab }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, tone }) => (
          <div key={key} className="card p-5">
            <div className="flex items-center justify-between">
              <span className={cn('grid h-9 w-9 place-items-center rounded-xl', tone)}>
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="text-2xl font-semibold tracking-tight">{counts[key] || 0}</span>
            </div>
            <p className="mt-4 text-xs font-medium text-muted">{label}</p>
          </div>
        ))}
      </div>

      {counts.rejected > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ochre-100 bg-ochre-50 px-4 py-3 text-sm text-ochre-700">
          <BookOpen className="h-4 w-4" />
          <p className="font-medium">
            {counts.rejected} listing{counts.rejected === 1 ? '' : 's'} need changes before they can go live.
          </p>
          <button type="button" onClick={() => onTab('listings')} className="ml-auto text-xs font-semibold underline underline-offset-4">
            Review
          </button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Recent messages</h2>
              <p className="mt-1 text-xs text-muted">Buyer and seller conversations linked to listings.</p>
            </div>
            <Link to="/messages" className="text-xs font-semibold text-forest-700 hover:underline">Open</Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {conversations.length ? (
              conversations.slice(0, 4).map((conversation) => (
                <Link
                  key={conversation.id}
                  to={`/messages?conversation=${conversation.id}`}
                  className="flex items-start gap-3 py-3 transition first:pt-0 last:pb-0 hover:text-forest-700"
                >
                  <Avatar name={conversation.otherParticipant?.name || 'Student'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{conversation.otherParticipant?.name || 'Student'}</p>
                      {conversation.unreadCount > 0 && (
                        <span className="rounded-full bg-forest-600 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                      <span className="ml-auto shrink-0 text-[10px] text-muted">{timeAgo(conversation.lastMessageAt)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {conversation.lastMessage || conversation.listing?.title || 'Conversation started'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-muted">No conversations yet. Browse a listing to message a seller.</p>
            )}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Recently saved</h2>
              <p className="mt-1 text-xs text-muted">Favourites persist in your account.</p>
            </div>
            <Link to="/favorites" className="text-xs font-semibold text-forest-700 hover:underline">View all</Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {favorites.length ? (
              favorites.slice(0, 4).map((listing) => (
                <Link
                  key={listing._id}
                  to={`/listing/${listing._id}`}
                  className="flex items-center gap-3 py-3 transition first:pt-0 last:pb-0 hover:text-forest-700"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-canvas border border-line">
                    <img
                      src={listing.images?.[0] ? imageUrl(listing.images[0]) : categoryImage(listing.category)}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = categoryImage(listing.category);
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{listing.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{formatCurrency(listing.price)}</p>
                  </div>
                  <Heart className="h-4 w-4 fill-forest-100 text-forest-600" />
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-muted">No saved listings yet. Tap the heart on a listing to save it.</p>
            )}
          </div>
        </section>
      </div>

      {listings.length === 0 && (
        <EmptyState
          icon={Store}
          title="Your seller shelf is empty"
          description="List a textbook, calculator, or campus essential. New listings are reviewed before going live."
          action={<Link to="/sell" className="btn-primary"><Plus className="h-4 w-4" /> Create a listing</Link>}
        />
      )}
    </div>
  );
}

function ListingsTab({ listings, onDelete, onStatus, actionLoading }) {
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Your listings</h2>
          <p className="mt-1 text-sm text-muted">Edit details, mark items as sold, or relist them for review.</p>
        </div>
        <Link to="/sell" className="btn-secondary"><Plus className="h-4 w-4" /> New listing</Link>
      </div>

      {listings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Store}
            title="No listings yet"
            description="Create your first listing to start selling to students around your campus."
            action={<Link to="/sell" className="btn-primary">Create a listing</Link>}
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {listings.map((listing) => (
            <article key={listing._id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-canvas border border-line sm:h-20 sm:w-24">
                <img
                  src={listing.images?.[0] ? imageUrl(listing.images[0]) : categoryImage(listing.category)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = categoryImage(listing.category);
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={listing.status} />
                  <span className="text-[10px] text-muted">{listing.views || 0} views</span>
                </div>
                <Link to={`/listing/${listing._id}`} className="mt-1.5 block truncate text-sm font-semibold hover:text-forest-700">
                  {listing.title}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  {formatCurrency(listing.price)} · {listing.category} · Added {formatDate(listing.createdAt)}
                </p>
                {listing.rejectionReason && (
                  <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] leading-5 text-red-700">
                    <span className="font-semibold">Moderator note:</span> {listing.rejectionReason}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {listing.status === 'approved' && (
                  <Link to={`/listing/${listing._id}`} className="btn-secondary btn-sm">View</Link>
                )}
                {!['sold', 'removed'].includes(listing.status) && (
                  <Link to={`/sell/${listing._id}/edit`} className="btn-secondary btn-sm">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                )}
                {listing.status === 'approved' && (
                  <button
                    type="button"
                    onClick={() => onStatus(listing, 'sold')}
                    disabled={actionLoading}
                    className="btn-secondary btn-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark sold
                  </button>
                )}
                {listing.status === 'sold' && (
                  <button
                    type="button"
                    onClick={() => onStatus(listing, 'pending')}
                    disabled={actionLoading}
                    className="btn-secondary btn-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Relist
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(listing)}
                  className="btn-ghost btn-sm text-red-700 hover:bg-red-50"
                  aria-label={`Delete ${listing.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesTab({ conversations }) {
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Conversations</h2>
          <p className="mt-1 text-sm text-muted">Each conversation stays linked to a specific listing.</p>
        </div>
        <Link to="/messages" className="btn-secondary">Open inbox <ArrowRight className="h-4 w-4" /></Link>
      </div>
      {conversations.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Open a listing and contact the seller to start a persisted conversation."
            action={<Link to="/marketplace" className="btn-primary">Browse listings</Link>}
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/messages?conversation=${conversation.id}`}
              className="card flex items-start gap-3 p-4 transition hover:border-forest-200 hover:shadow-lift"
            >
              <Avatar name={conversation.otherParticipant?.name || 'Student'} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{conversation.otherParticipant?.name}</p>
                  {conversation.unreadCount > 0 && (
                    <span className="rounded-full bg-forest-600 px-1.5 py-0.5 text-[9px] text-white">{conversation.unreadCount}</span>
                  )}
                  <span className="ml-auto text-[10px] text-muted">{timeAgo(conversation.lastMessageAt)}</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted">{conversation.listing?.title}</p>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-ink/65">{conversation.lastMessage}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user, updateUser, notify }) {
  const [generalError, setGeneralError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    reset({
      name: user?.name || '',
      college: user?.college || '',
      department: user?.department || '',
      year: user?.year || '',
    });
  }, [user, reset]);

  async function submit(values) {
    setGeneralError('');
    try {
      const updated = await userService.updateMe(values);
      updateUser(updated);
      notify.success('Profile updated.');
    } catch (error) {
      const fields = getFieldErrors(error);
      Object.entries(fields).forEach(([field, message]) => setError(field, { message }));
      setGeneralError(getApiError(error, 'Could not update your profile.'));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="card p-5 sm:p-7">
        <h2 className="text-xl font-semibold">Public profile</h2>
        <p className="mt-1 text-sm text-muted">
          These details may appear on listings and your seller page. Your email stays private.
        </p>
        <form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4" noValidate>
          {generalError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{generalError}</p>}
          <div>
            <label className="field-label" htmlFor="profile-name">Full name</label>
            <input id="profile-name" className="field-input" {...register('name', { required: 'Name is required.', minLength: { value: 2, message: 'Name is too short.' } })} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="profile-college">College</label>
            <input id="profile-college" className="field-input" {...register('college', { required: 'College is required.' })} />
            {errors.college && <p className="field-error">{errors.college.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="profile-department">Department</label>
              <input id="profile-department" className="field-input" {...register('department')} />
            </div>
            <div>
              <label className="field-label" htmlFor="profile-year">Year</label>
              <select id="profile-year" className="field-input" {...register('year')}>
                <option value="">Not specified</option>
                {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Save profile
          </button>
        </form>
      </section>

      <section className="card h-fit p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} size="lg" />
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs text-muted">{user?.email}</p>
          </div>
        </div>
        <div className="mt-5 space-y-3 border-t border-line pt-5 text-xs text-muted">
          <p className="flex justify-between gap-4"><span>Account type</span><span className="font-medium capitalize text-ink">{user?.role}</span></p>
          <p className="flex justify-between gap-4"><span>Member since</span><span className="font-medium text-ink">{formatDate(user?.createdAt)}</span></p>
          <p className="flex justify-between gap-4"><span>Status</span><span className="font-medium text-forest-700">Active</span></p>
        </div>
        <p className="mt-5 rounded-lg bg-canvas p-3 text-[11px] leading-5 text-muted">
          Your email is only shown to you. Public seller pages expose your display name, college,
          department, year, and member-since date.
        </p>
      </section>
    </div>
  );
}
