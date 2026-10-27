import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { authService } from '../services/authService.js';
import { getApiError } from '../services/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '' } });

  async function submit(values) {
    setError('');
    try {
      const responseMessage = await authService.forgotPassword(values.email);
      setMessage(responseMessage);
      setSent(true);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not request a password reset.'));
    }
  }

  return (
    <div>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-forest-700">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Reset your password</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Enter the email you used for UniMarket. If an account exists, we will send a single-use link
        that expires in 30 minutes.
      </p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-forest-100 bg-forest-50 p-5">
          <CheckCircle2 className="h-6 w-6 text-forest-700" />
          <h2 className="mt-3 text-base font-semibold text-forest-900">Check your inbox</h2>
          <p className="mt-2 text-sm leading-6 text-forest-900/75">{message}</p>
          <Link to="/login" className="btn-secondary mt-5">Return to login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5" noValidate>
          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="field-label">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@college.edu"
              className="field-input"
              {...register('email', {
                required: 'Enter your email address.',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
              })}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </button>
          <p className="text-[11px] leading-5 text-muted">
            This project does not simulate emails. If SMTP is not configured on the server, the API
            returns a clear configuration message instead of claiming a message was sent.
          </p>
        </form>
      )}
    </div>
  );
}
