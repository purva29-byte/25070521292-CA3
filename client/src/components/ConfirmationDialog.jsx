import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  danger = false,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className={`flex gap-3 rounded-xl p-3 text-sm ${danger ? 'bg-red-50 text-red-800' : 'bg-forest-50 text-forest-800'}`}>
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>This action takes effect immediately. Please make sure you want to continue.</p>
      </div>
    </Modal>
  );
}
