import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';
import { adminService } from '../services/adminService.js';
import { getApiError } from '../services/api.js';
import { useToast } from '../context/ToastProvider.jsx';
import { REPORT_REASONS } from '../utils/constants.js';

const moderationCopy = {
  approve: {
    title: 'Approve this listing?',
    description: 'It will become visible in the public marketplace immediately.',
    button: 'Approve listing',
    requireReason: false,
  },
  reject: {
    title: 'Reject this listing',
    description: 'The seller will see your reason and can edit the listing to resubmit it.',
    button: 'Reject listing',
    requireReason: true,
  },
  remove: {
    title: 'Remove this listing',
    description: 'The listing will disappear from public results. Open reports will be resolved.',
    button: 'Remove listing',
    requireReason: true,
  },
  restore: {
    title: 'Restore this listing?',
    description: 'A removed listing will become public again. Use this only after reviewing it.',
    button: 'Restore listing',
    requireReason: false,
  },
};

export function ModerationModal({ target, onClose, onSuccess }) {
  const { notify } = useToast();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const config = target ? moderationCopy[target.action] : moderationCopy.approve;

  useEffect(() => {
    setReason('');
    setError('');
    setLoading(false);
  }, [target]);

  async function submit(event) {
    event.preventDefault();
    if (!target) return;
    if (config.requireReason && reason.trim().length < 3) {
      setError('Add a short reason for the seller.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await adminService.moderate(target.listing.id || target.listing._id, {
        action: target.action,
        reason: reason.trim(),
      });
      notify.success(response.message || 'Moderation action saved.');
      onSuccess();
      onClose();
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not complete the moderation action.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={Boolean(target)}
      onClose={loading ? () => {} : onClose}
      title={config.title}
      description={config.description}
      size="md"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            form="moderation-form"
            className={target?.action === 'remove' || target?.action === 'reject' ? 'btn-danger' : 'btn-primary'}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {config.button}
          </button>
        </>
      }
    >
      <form id="moderation-form" onSubmit={submit} className="space-y-4">
        {target?.listing && (
          <div className="rounded-xl border border-line bg-canvas p-3">
            <p className="line-clamp-2 text-sm font-semibold">{target.listing.title}</p>
            <p className="mt-1 text-xs text-muted">
              {target.listing.seller?.name || 'Seller'} · {target.listing.seller?.email || 'No email'}
            </p>
          </div>
        )}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <div>
          <label htmlFor="moderation-reason" className="field-label">
            Reason {config.requireReason ? '' : <span className="font-normal text-muted">(optional)</span>}
          </label>
          <textarea
            id="moderation-reason"
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={1000}
            className="field-input resize-y"
            placeholder={
              config.requireReason
                ? 'Explain what needs to change so the seller can act on it.'
                : 'Optional internal note, visible to the seller if provided.'
            }
          />
          <p className="mt-1 text-right text-[10px] text-muted">{reason.length}/1000</p>
        </div>
      </form>
    </Modal>
  );
}

export function ReportReviewModal({ target, onClose, onSuccess }) {
  const { notify } = useToast();
  const [status, setStatus] = useState('resolved');
  const [resolutionNote, setResolutionNote] = useState('');
  const [removeListing, setRemoveListing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus('resolved');
    setResolutionNote('');
    setRemoveListing(false);
    setError('');
    setLoading(false);
  }, [target]);

  async function submit(event) {
    event.preventDefault();
    if (!target) return;
    setLoading(true);
    setError('');
    try {
      const response = await adminService.reviewReport(target.id || target._id, {
        status,
        resolutionNote: resolutionNote.trim(),
        removeListing,
      });
      notify.success(response.message || 'Report reviewed.');
      onSuccess();
      onClose();
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not review the report.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={Boolean(target)}
      onClose={loading ? () => {} : onClose}
      title="Review report"
      description="Resolve or dismiss the report after checking the listing and its context."
      size="md"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="report-review-form" className="btn-primary" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save review
          </button>
        </>
      }
    >
      <form id="report-review-form" onSubmit={submit} className="space-y-4">
        {target?.listing && (
          <div className="rounded-xl border border-line bg-canvas p-3">
            <p className="line-clamp-2 text-sm font-semibold">{target.listing.title}</p>
            <p className="mt-1 text-xs text-muted">
              Reported by {target.reportedBy?.name || 'Student'} ·{' '}
              {REPORT_REASONS.find((reason) => reason.value === target.reason)?.label || target.reason}
            </p>
            {target.description && <p className="mt-2 text-xs leading-5 text-muted">{target.description}</p>}
          </div>
        )}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <div>
          <label htmlFor="report-status" className="field-label">Decision</label>
          <select id="report-status" value={status} onChange={(event) => setStatus(event.target.value)} className="field-input">
            <option value="resolved">Resolved — action was appropriate</option>
            <option value="dismissed">Dismissed — no issue found</option>
          </select>
        </div>
        <div>
          <label htmlFor="resolution-note" className="field-label">Resolution note</label>
          <textarea
            id="resolution-note"
            rows={3}
            value={resolutionNote}
            onChange={(event) => setResolutionNote(event.target.value)}
            maxLength={1000}
            className="field-input resize-y"
            placeholder="Record what you checked and why you reached this decision."
          />
        </div>
        {target?.listing && target.listing.status !== 'removed' && (
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-red-100 bg-red-50/60 p-3.5 text-xs leading-5 text-red-800">
            <input
              type="checkbox"
              checked={removeListing}
              onChange={(event) => setRemoveListing(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-red-200 text-red-700 focus:ring-red-500"
            />
            <span>
              Also remove the reported listing. This records a separate moderation action and
              resolves other open reports for the listing.
            </span>
          </label>
        )}
      </form>
    </Modal>
  );
}

export function UserStatusModal({ target, onClose, onSuccess }) {
  const { notify } = useToast();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const suspending = target?.nextStatus === 'suspended';

  useEffect(() => {
    setReason('');
    setError('');
    setLoading(false);
  }, [target]);

  async function submit(event) {
    event.preventDefault();
    if (!target) return;
    if (suspending && reason.trim().length < 3) {
      setError('Add a short reason for suspending this account.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await adminService.updateUserStatus(target.user.id, {
        status: target.nextStatus,
        reason: reason.trim(),
      });
      notify.success(response.message || 'Account status updated.');
      onSuccess();
      onClose();
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not update the account status.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={Boolean(target)}
      onClose={loading ? () => {} : onClose}
      title={suspending ? 'Suspend this account?' : 'Reactivate this account?'}
      description={
        suspending
          ? 'Suspending revokes active sessions and blocks new sign-ins. Their listings remain in moderation history.'
          : 'The student will be able to sign in and use the marketplace again.'
      }
      size="sm"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            form="user-status-form"
            className={suspending ? 'btn-danger' : 'btn-primary'}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {suspending ? 'Suspend account' : 'Reactivate account'}
          </button>
        </>
      }
    >
      <form id="user-status-form" onSubmit={submit} className="space-y-4">
        {target?.user && (
          <div className="rounded-xl border border-line bg-canvas p-3">
            <p className="text-sm font-semibold">{target.user.name}</p>
            <p className="mt-0.5 text-xs text-muted">{target.user.email}</p>
          </div>
        )}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <div>
          <label htmlFor="user-status-reason" className="field-label">
            Reason {suspending ? '' : <span className="font-normal text-muted">(optional)</span>}
          </label>
          <textarea
            id="user-status-reason"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="field-input resize-y"
            maxLength={1000}
            placeholder="Record the moderation reason."
          />
        </div>
      </form>
    </Modal>
  );
}
