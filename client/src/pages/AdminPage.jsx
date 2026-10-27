import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Loader2,
  MessageSquare,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AdminSidebar from '../components/AdminSidebar.jsx';
import Avatar from '../components/Avatar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { DashboardSkeleton } from '../components/LoadingSkeleton.jsx';
import { ModerationModal, ReportReviewModal, UserStatusModal } from '../components/AdminModals.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { adminService } from '../services/adminService.js';
import { getApiError } from '../services/api.js';
import { formatCurrency, formatDate, imageUrl, timeAgo } from '../utils/format.js';
import { REPORT_REASONS } from '../utils/constants.js';
import { cn } from '../lib/cn.js';

const TABS = ['overview', 'moderation', 'reports', 'users', 'activity'];
const DEFAULT_STATUS = { moderation: 'pending', reports: 'open', users: 'all', activity: 'all' };

const ACTION_LABELS = {
  approve_listing: 'Approved listing',
  reject_listing: 'Rejected listing',
  remove_listing: 'Removed listing',
  restore_listing: 'Restored listing',
  resolve_report: 'Resolved report',
  dismiss_report: 'Dismissed report',
  suspend_user: 'Suspended account',
  reactivate_user: 'Reactivated account',
};

const reasonLabels = Object.fromEntries(REPORT_REASONS.map((reason) => [reason.value, reason.label]));

export default function AdminPage() {
  useDocumentTitle('Admin dashboard');
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab = TABS.includes(requestedTab) ? requestedTab : 'overview';

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [statusByTab, setStatusByTab] = useState(DEFAULT_STATUS);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [table, setTable] = useState({ items: [], meta: null });
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [moderationTarget, setModerationTarget] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [userTarget, setUserTarget] = useState(null);

  const currentStatus = statusByTab[activeTab] || 'all';

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const data = await adminService.stats();
      setStats(data);
    } catch (error) {
      setStatsError(getApiError(error, 'Could not load admin statistics.'));
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    setPage(1);
    setSearch('');
    setSearchInput('');
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'overview') return undefined;
    let cancelled = false;

    async function loadTable() {
      setTableLoading(true);
      setTableError('');
      const params = { page, limit: 10 };
      if (activeTab !== 'reports' && activeTab !== 'activity' && search.trim()) params.q = search.trim();
      if (activeTab !== 'activity' && currentStatus !== 'all') params.status = currentStatus;

      try {
        let result;
        if (activeTab === 'moderation') {
          const data = await adminService.listings(params);
          result = { items: data.listings, meta: data.meta };
        } else if (activeTab === 'reports') {
          const data = await adminService.reports(params);
          result = { items: data.reports, meta: data.meta };
        } else if (activeTab === 'users') {
          const data = await adminService.users(params);
          result = { items: data.users, meta: data.meta };
        } else {
          const data = await adminService.logs(params);
          result = { items: data.logs, meta: data.meta };
        }
        if (!cancelled) setTable(result);
      } catch (error) {
        if (!cancelled) setTableError(getApiError(error, 'Could not load this admin section.'));
      } finally {
        if (!cancelled) setTableLoading(false);
      }
    }

    loadTable();
    return () => {
      cancelled = true;
    };
  }, [activeTab, page, search, currentStatus, refreshKey]);

  function changeTab(tab) {
    setSearchParams(tab === 'overview' ? {} : { tab });
  }

  function setStatus(value) {
    setStatusByTab((current) => ({ ...current, [activeTab]: value }));
    setPage(1);
  }

  function afterChange() {
    setRefreshKey((key) => key + 1);
    loadStats();
  }

  const statusOptions =
    activeTab === 'moderation'
      ? [
          ['pending', 'Pending review'],
          ['approved', 'Approved'],
          ['rejected', 'Rejected'],
          ['sold', 'Sold'],
          ['removed', 'Removed'],
          ['all', 'All statuses'],
        ]
      : activeTab === 'reports'
        ? [
            ['open', 'Open'],
            ['resolved', 'Resolved'],
            ['dismissed', 'Dismissed'],
            ['all', 'All reports'],
          ]
        : [
            ['all', 'All accounts'],
            ['active', 'Active'],
            ['suspended', 'Suspended'],
          ];

  return (
    <div className="container-page pb-20 pt-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-forest-700">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">Administration</p>
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Platform overview.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Moderation, reports, accounts, and database-backed activity. Access is enforced by the
            API, not just by hiding this page.
          </p>
        </div>
        <Link to="/marketplace" className="btn-secondary shrink-0">
          <Store className="h-4 w-4" /> Marketplace
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-7 lg:flex-row">
        <AdminSidebar active={activeTab} onChange={changeTab} stats={stats} />

        <div className="min-w-0 flex-1">
          {activeTab === 'overview' ? (
            statsLoading ? (
              <DashboardSkeleton />
            ) : statsError ? (
              <ErrorState message={statsError} onRetry={loadStats} />
            ) : (
              <OverviewTab stats={stats} onTab={changeTab} />
            )
          ) : (
            <div>
              <div className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {activeTab === 'moderation' && 'Listing moderation'}
                    {activeTab === 'reports' && 'Reported listings'}
                    {activeTab === 'users' && 'Student accounts'}
                    {activeTab === 'activity' && 'Moderation history'}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {activeTab === 'moderation' && 'Review, approve, reject, remove, or restore campus listings.'}
                    {activeTab === 'reports' && 'Investigate reports and record a clear resolution.'}
                    {activeTab === 'users' && 'Suspend or reactivate student accounts. Admin accounts are protected.'}
                    {activeTab === 'activity' && 'Every moderation action records the actor, target, reason, and timestamp.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeTab !== 'reports' && activeTab !== 'activity' && (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        setSearch(searchInput);
                        setPage(1);
                      }}
                      className="flex items-center gap-2"
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                        <input
                          type="search"
                          value={searchInput}
                          onChange={(event) => setSearchInput(event.target.value)}
                          placeholder={activeTab === 'users' ? 'Search name, email, college' : 'Search listings'}
                          className="field-input w-56 py-2 pl-8 text-xs"
                          aria-label="Search this admin section"
                        />
                      </div>
                      <button type="submit" className="btn-secondary btn-sm">Search</button>
                    </form>
                  )}
                  {activeTab !== 'activity' && (
                    <select
                      value={currentStatus}
                      onChange={(event) => setStatus(event.target.value)}
                      className="field-input w-auto py-2 text-xs"
                      aria-label="Filter by status"
                    >
                      {statusOptions.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="mt-5">
                {tableError ? (
                  <ErrorState message={tableError} onRetry={() => setRefreshKey((key) => key + 1)} />
                ) : activeTab === 'moderation' ? (
                  <ModerationTable
                    items={table.items}
                    loading={tableLoading}
                    onAction={(listing, action) => setModerationTarget({ listing, action })}
                  />
                ) : activeTab === 'reports' ? (
                  <ReportsTable items={table.items} loading={tableLoading} onReview={setReportTarget} />
                ) : activeTab === 'users' ? (
                  <UsersTable
                    items={table.items}
                    loading={tableLoading}
                    onStatus={(user, nextStatus) => setUserTarget({ user, nextStatus })}
                  />
                ) : (
                  <ActivityTable items={table.items} loading={tableLoading} />
                )}

                {table.meta && table.meta.totalPages > 1 && (
                  <Pager meta={table.meta} page={page} onPage={setPage} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ModerationModal
        target={moderationTarget}
        onClose={() => setModerationTarget(null)}
        onSuccess={afterChange}
      />
      <ReportReviewModal
        target={reportTarget}
        onClose={() => setReportTarget(null)}
        onSuccess={afterChange}
      />
      <UserStatusModal
        target={userTarget}
        onClose={() => setUserTarget(null)}
        onSuccess={afterChange}
      />
    </div>
  );
}

function OverviewTab({ stats, onTab }) {
  const cards = [
    { label: 'Total students', value: stats.users.total, hint: `${stats.users.suspended} suspended`, icon: Users, tone: 'bg-[#E5EDF2] text-[#355B70]' },
    { label: 'Total listings', value: stats.listings.total, hint: `${stats.listings.approved} live`, icon: Store, tone: 'bg-forest-50 text-forest-700' },
    { label: 'Pending review', value: stats.listings.pending, hint: 'Needs a decision', icon: Clock3, tone: 'bg-ochre-50 text-ochre-700' },
    { label: 'Open reports', value: stats.reports.open, hint: `${stats.reports.total} all time`, icon: Flag, tone: 'bg-red-50 text-red-700' },
    { label: 'Sold listings', value: stats.listings.sold, hint: 'Excluded from browse', icon: CheckCircle2, tone: 'bg-ink/5 text-ink' },
    { label: 'Messages', value: stats.messages.total, hint: 'Persisted conversations', icon: MessageSquare, tone: 'bg-[#F3E4DF] text-[#7C4735]' },
  ];

  const statusData = [
    { name: 'Approved', value: stats.listings.approved, color: '#36785E' },
    { name: 'Pending', value: stats.listings.pending, color: '#B68A2F' },
    { name: 'Rejected', value: stats.listings.rejected, color: '#B24A3D' },
    { name: 'Sold', value: stats.listings.sold, color: '#66706A' },
    { name: 'Removed', value: stats.listings.removed, color: '#A9A79E' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, hint, icon: Icon, tone }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <span className={cn('grid h-9 w-9 place-items-center rounded-xl', tone)}>
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <p className="text-3xl font-semibold tracking-tight">{value}</p>
            </div>
            <p className="mt-4 text-xs font-semibold text-ink/75">{label}</p>
            <p className="mt-0.5 text-[10px] text-muted">{hint}</p>
          </div>
        ))}
      </div>

      {(stats.listings.pending > 0 || stats.reports.open > 0) && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ochre-100 bg-ochre-50 px-4 py-3 text-sm text-ochre-700">
          <AlertTriangle className="h-4 w-4" />
          <p className="font-medium">
            {stats.listings.pending} pending listing{stats.listings.pending === 1 ? '' : 's'} ·{' '}
            {stats.reports.open} open report{stats.reports.open === 1 ? '' : 's'}
          </p>
          <div className="ml-auto flex gap-2">
            {stats.listings.pending > 0 && (
              <button type="button" onClick={() => onTab('moderation')} className="text-xs font-semibold underline underline-offset-4">
                Open queue
              </button>
            )}
            {stats.reports.open > 0 && (
              <button type="button" onClick={() => onTab('reports')} className="text-xs font-semibold underline underline-offset-4">
                Review reports
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold">Listing status</h2>
              <p className="mt-1 text-xs text-muted">Live database counts</p>
            </div>
            <ShoppingBag className="h-4 w-4 text-muted" />
          </div>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="#E3DED2" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6F756F' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6F756F' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E3DED2', fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={38}>
                  {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5">
          <div>
            <h2 className="text-base font-semibold">Approved listings by category</h2>
            <p className="mt-1 text-xs text-muted">Where students are actively listing</p>
          </div>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categories} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 12 }}>
                <CartesianGrid stroke="#E3DED2" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#6F756F' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 9, fill: '#6F756F' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E3DED2', fontSize: 12 }} />
                <Bar dataKey="count" fill="#36785E" radius={[0, 6, 6, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Recent listings</h2>
              <p className="mt-1 text-xs text-muted">Newest submissions across all statuses</p>
            </div>
            <button type="button" onClick={() => onTab('moderation')} className="text-xs font-semibold text-forest-700 hover:underline">
              Moderation
            </button>
          </div>
          <div className="mt-4 divide-y divide-line">
            {stats.recentListings.length ? stats.recentListings.map((listing) => (
              <div key={listing._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-canvas">
                  {listing.images?.[0] && <img src={imageUrl(listing.images[0])} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{listing.title}</p>
                  <p className="mt-0.5 text-[10px] text-muted">{listing.seller?.name} · {timeAgo(listing.createdAt)}</p>
                </div>
                <StatusBadge status={listing.status} />
              </div>
            )) : (
              <p className="py-8 text-center text-xs text-muted">No listings yet.</p>
            )}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Recent moderation activity</h2>
              <p className="mt-1 text-xs text-muted">Audit trail of admin actions</p>
            </div>
            <button type="button" onClick={() => onTab('activity')} className="text-xs font-semibold text-forest-700 hover:underline">
              Full history
            </button>
          </div>
          <div className="mt-4 divide-y divide-line">
            {stats.recentActivity.length ? stats.recentActivity.map((log) => (
              <div key={log._id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-50 text-forest-700">
                  <Activity className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">{ACTION_LABELS[log.action] || log.action}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted">
                    {log.listing?.title || log.targetUser?.name || 'Platform'} · by {log.admin?.name || 'Admin'}
                  </p>
                </div>
                <span className="shrink-0 text-[9px] text-muted">{timeAgo(log.createdAt)}</span>
              </div>
            )) : (
              <p className="py-8 text-center text-xs text-muted">No moderation actions yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TableShell({ children, loading, empty, emptyMessage = 'No records found.' }) {
  return (
    <div className="overflow-hidden card">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-forest-700" />
        </div>
      ) : empty ? (
        <div className="px-5 py-14 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-forest-400" />
          <p className="mt-3 text-sm font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </div>
  );
}

function ModerationTable({ items, loading, onAction }) {
  return (
    <TableShell loading={loading} empty={items.length === 0} emptyMessage="This moderation queue is clear.">
      <table className="w-full min-w-[900px] text-left text-xs">
        <thead className="border-b border-line bg-canvas text-[10px] uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Listing</th>
            <th className="px-4 py-3 font-semibold">Seller</th>
            <th className="px-4 py-3 font-semibold">Price</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Submitted</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((listing) => (
            <tr key={listing._id} className="align-middle transition hover:bg-canvas/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-canvas">
                    {listing.images?.[0] && <img src={imageUrl(listing.images[0])} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <Link to={`/listing/${listing._id}`} className="block max-w-56 truncate font-medium hover:text-forest-700">
                      {listing.title}
                    </Link>
                    <p className="mt-0.5 text-[10px] text-muted">{listing.category}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{listing.seller?.name || 'Unknown'}</p>
                <p className="mt-0.5 text-[10px] text-muted">{listing.seller?.email}</p>
              </td>
              <td className="px-4 py-3 font-medium">{formatCurrency(listing.price)}</td>
              <td className="px-4 py-3"><StatusBadge status={listing.status} /></td>
              <td className="px-4 py-3 text-muted">{formatDate(listing.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                  {['pending', 'rejected'].includes(listing.status) && (
                    <>
                      <button type="button" className="btn-secondary btn-sm" onClick={() => onAction(listing, 'approve')}>Approve</button>
                      <button type="button" className="btn-ghost btn-sm text-red-700" onClick={() => onAction(listing, 'reject')}>Reject</button>
                    </>
                  )}
                  {['approved', 'sold'].includes(listing.status) && (
                    <button type="button" className="btn-ghost btn-sm text-red-700" onClick={() => onAction(listing, 'remove')}>Remove</button>
                  )}
                  {listing.status === 'removed' && (
                    <button type="button" className="btn-secondary btn-sm" onClick={() => onAction(listing, 'restore')}>Restore</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function ReportsTable({ items, loading, onReview }) {
  return (
    <TableShell loading={loading} empty={items.length === 0} emptyMessage="No reports in this view.">
      <table className="w-full min-w-[920px] text-left text-xs">
        <thead className="border-b border-line bg-canvas text-[10px] uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Listing</th>
            <th className="px-4 py-3 font-semibold">Reported by</th>
            <th className="px-4 py-3 font-semibold">Reason</th>
            <th className="px-4 py-3 font-semibold">Reported</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((report) => (
            <tr key={report._id} className="align-top transition hover:bg-canvas/60">
              <td className="px-4 py-3">
                <p className="max-w-60 truncate font-medium">{report.listing?.title || 'Listing deleted'}</p>
                <p className="mt-0.5 max-w-64 truncate text-[10px] text-muted">{report.description || 'No extra detail.'}</p>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{report.reportedBy?.name || 'Deleted account'}</p>
                <p className="mt-0.5 text-[10px] text-muted">{report.reportedBy?.email}</p>
              </td>
              <td className="px-4 py-3">{reasonLabels[report.reason] || report.reason}</td>
              <td className="px-4 py-3 text-muted">{formatDate(report.createdAt)}</td>
              <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
              <td className="px-4 py-3 text-right">
                {report.status === 'open' ? (
                  <button type="button" className="btn-secondary btn-sm" onClick={() => onReview(report)}>Review</button>
                ) : (
                  <span className="text-[10px] text-muted">Reviewed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function UsersTable({ items, loading, onStatus }) {
  return (
    <TableShell loading={loading} empty={items.length === 0} emptyMessage="No accounts match this search.">
      <table className="w-full min-w-[860px] text-left text-xs">
        <thead className="border-b border-line bg-canvas text-[10px] uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Student</th>
            <th className="px-4 py-3 font-semibold">College</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Joined</th>
            <th className="px-4 py-3 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((user) => (
            <tr key={user.id} className="transition hover:bg-canvas/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={user.name} size="sm" />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="max-w-48 truncate">{user.college}</p>
                <p className="mt-0.5 text-[10px] text-muted">{[user.department, user.year].filter(Boolean).join(' · ') || '—'}</p>
              </td>
              <td className="px-4 py-3 capitalize">{user.role}</td>
              <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
              <td className="px-4 py-3 text-muted">{formatDate(user.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                {user.role === 'admin' ? (
                  <span className="text-[10px] text-muted">Protected</span>
                ) : user.status === 'active' ? (
                  <button type="button" className="btn-ghost btn-sm text-red-700" onClick={() => onStatus(user, 'suspended')}>Suspend</button>
                ) : (
                  <button type="button" className="btn-secondary btn-sm" onClick={() => onStatus(user, 'active')}>Reactivate</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function ActivityTable({ items, loading }) {
  return (
    <TableShell loading={loading} empty={items.length === 0} emptyMessage="No moderation actions recorded.">
      <table className="w-full min-w-[820px] text-left text-xs">
        <thead className="border-b border-line bg-canvas text-[10px] uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Action</th>
            <th className="px-4 py-3 font-semibold">Admin</th>
            <th className="px-4 py-3 font-semibold">Target</th>
            <th className="px-4 py-3 font-semibold">Reason</th>
            <th className="px-4 py-3 font-semibold">When</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((log) => (
            <tr key={log._id} className="align-top transition hover:bg-canvas/60">
              <td className="px-4 py-3 font-medium">{ACTION_LABELS[log.action] || log.action}</td>
              <td className="px-4 py-3">
                <p>{log.admin?.name || 'Admin'}</p>
                <p className="mt-0.5 text-[10px] text-muted">{log.admin?.email}</p>
              </td>
              <td className="px-4 py-3">
                {log.listing ? <span className="max-w-52 truncate">{log.listing.title}</span> : null}
                {log.targetUser ? <span>{log.targetUser.name}</span> : null}
                {!log.listing && !log.targetUser ? <span className="text-muted">—</span> : null}
              </td>
              <td className="px-4 py-3 text-muted">
                <span className="block max-w-64 text-[11px] leading-5">{log.reason || 'No reason provided.'}</span>
              </td>
              <td className="px-4 py-3 text-muted">{formatDate(log.createdAt, { hour: 'numeric', minute: '2-digit' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function Pager({ meta, page, onPage }) {
  return (
    <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
      <p className="text-xs text-muted">
        Page {page} of {meta.totalPages} · {meta.total} result{meta.total === 1 ? '' : 's'}
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPage(page - 1)} disabled={!meta.hasPreviousPage} className="btn-secondary btn-sm">
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </button>
        <button type="button" onClick={() => onPage(page + 1)} disabled={!meta.hasNextPage} className="btn-secondary btn-sm">
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
