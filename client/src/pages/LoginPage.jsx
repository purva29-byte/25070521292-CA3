import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { getApiError, getFieldErrors } from '../services/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

function safeReturnTo(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

export default function LoginPage() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  async function submit(values) {
    setGeneralError('');
    try {
      const user = await login(values);
      notify.success(`Welcome back, ${user.name.split(' ')[0]}.`);
      navigate(safeReturnTo(searchParams.get('returnTo')) || (user.role === 'admin' ? '/admin' : '/dashboard'));
    } catch (error) {
      const fields = getFieldErrors(error);
      Object.entries(fields).forEach(([field, message]) => setError(field, { message }));
      setGeneralError(getApiError(error, 'Could not sign in.'));
    }
  }

  return (
    <div>
      <p className="section-kicker">Welcome back</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Log in to UniMarket</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Pick up your saved listings, messages, and campus marketplace activity.
      </p>

      <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5" noValidate>
        {generalError && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {generalError}
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
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="field-label">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-forest-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              className="field-input pr-11"
              {...register('password', { required: 'Enter your password.' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted transition hover:bg-ink/5"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Signing in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to UniMarket?{' '}
        <Link to="/register" className="link">Create an account</Link>
      </p>

      <div className="mt-7 rounded-xl border border-line bg-paper p-4 text-xs leading-5 text-muted">
        <span className="font-semibold text-ink">Demo accounts:</span> the database seed script
        creates student and admin accounts. Their credentials are documented in the project README.
        No password is embedded in the frontend.
      </div>
    </div>
  );
}
