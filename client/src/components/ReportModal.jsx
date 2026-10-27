import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';
import { REPORT_REASONS } from '../utils/constants.js';
import { reportService } from '../services/reportService.js';
import { getApiError, getFieldErrors } from '../services/api.js';
import { useToast } from '../context/ToastProvider.jsx';

export default function ReportModal({ listing, open, onClose }) {
  const { notify } = useToast();
  const [reason, setReason] = useState('misleading');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    try {
      await reportService.submit({
        listingId: listing.id || listing._id,
        reason,
        description,
      });
      notify.success('Report submitted. The moderation team will review it.');
      setReason('misleading');
      setDescription('');
      onClose();
    } catch (error) {
      setErrors(getFieldErrors(error));
      setGeneralError(getApiError(error, 'Could not submit the report.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report this listing"
      description="Reports go to the UniMarket moderation team. Use this for unsafe, misleading, or prohibited listings."
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            form="report-form"
            className="btn-primary"
            disabled={loading || description.length > 1000}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit report
          </button>
        </>
      }
    >
      <form id="report-form" onSubmit={handleSubmit} className="space-y-4">
        {generalError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {generalError}
          </p>
        )}
        <div>
          <label htmlFor="report-reason" className="field-label">
            What is the issue?
          </label>
          <select
            id="report-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="field-input"
          >
            {REPORT_REASONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.reason && <p className="field-error">{errors.reason}</p>}
        </div>
        <div>
          <label htmlFor="report-description" className="field-label">
            Details <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="report-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            maxLength={1000}
            className="field-input resize-y"
            placeholder="Tell the moderators what looks wrong."
          />
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>{errors.description}</span>
            <span>{description.length}/1000</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
