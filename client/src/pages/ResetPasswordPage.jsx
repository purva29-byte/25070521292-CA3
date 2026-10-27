import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../services/authService.js';
import { getApiError } from '../services/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function ResetPasswordPage() {
  useDocumentTitle('Choose a new password');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { password: '', confirmPassword: '' } });
  const password = watch('password', '');

  async function submit(values) {
    setError('');
    try {
      await authService.resetPassword({ token, ...values });
      setSuccess(true);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not reset your password.'));
    }
  }

  if (!token) {
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Reset link is incomplete</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          This page needs a reset token. Request a new link from the forgot-password page.
        </p>
        <Link to="/forgot-password" className="btn-primary mt-6">Request a new link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-forest-100 bg-forest-50 p-6">
        <CheckCircle2 className="h-7 w-7 text-forest-700" />
        <h1 className="mt-4 text-2xl font-semibold text-forest-900">Password updated</h1>
        <p className="mt-2 text-sm leading-6 text-forest-900/75">
          Your reset token has been used. Sign in with your new password to continue.
        </p>
        <Link to="/login" className="btn-primary mt-6">Go to login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Choose a new password</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Use at least 8 characters with uppercase, lowercase, and a number. This link can only be
        used once.
      </p>

      <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-4" noValidate>
        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="password" className="field-label">New password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="field-input pr-11"
              {...register('password', {
                required: 'Enter a new password.',
                minLength: { value: 8, message: 'Password must be at least 8 characters.' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted hover:bg-ink/5"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="field-label">Confirm new password</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className="field-input"
            {...register('confirmPassword', {
              required: 'Confirm your password.',
              validate: (value) => value === password || 'Passwords do not match.',
            })}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Updating…' : 'Set new password'}
        </button>
      </form>
    </div>
  );
}
