import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'We could not load this',
  message = 'Please check your connection and try again.',
  onRetry = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 px-6 py-12 text-center ${className}`}
      role="alert"
    >
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-700">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-red-800/75">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-5">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}
