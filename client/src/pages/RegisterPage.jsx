import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { getApiError, getFieldErrors } from '../services/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { YEARS } from '../utils/constants.js';
import { cn } from '../lib/cn.js';

const passwordChecks = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'One number', test: (value) => /[0-9]/.test(value) },
];

export default function RegisterPage() {
  useDocumentTitle('Create an account');
  const { register: signUp } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      college: '',
      department: '',
      year: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });
  const password = watch('password', '');

  async function submit(values) {
    setGeneralError('');
    try {
      const user = await signUp({
        ...values,
        terms: Boolean(values.terms),
      });
      notify.success(`Welcome to UniMarket, ${user.name.split(' ')[0]}.`);
      navigate('/dashboard');
    } catch (error) {
      const fields = getFieldErrors(error);
      Object.entries(fields).forEach(([field, message]) => setError(field, { message }));
      setGeneralError(getApiError(error, 'Could not create your account.'));
    }
  }

  return (
    <div>
      <p className="section-kicker">Join your campus marketplace</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Create your account</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Free for students. Buy, sell, save favourites, and message sellers on campus.
      </p>

      <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-4" noValidate>
        {generalError && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {generalError}
          </p>
        )}

        <div>
          <label htmlFor="name" className="field-label">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            className="field-input"
            {...register('name', {
              required: 'Enter your full name.',
              minLength: { value: 2, message: 'Name must be at least 2 characters.' },
              maxLength: { value: 80, message: 'Name cannot exceed 80 characters.' },
            })}
          />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

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
          <label htmlFor="college" className="field-label">College name</label>
          <input
            id="college"
            type="text"
            placeholder="e.g. Fergusson College"
            className="field-input"
            {...register('college', {
              required: 'Enter your college name.',
              minLength: { value: 2, message: 'College name must be at least 2 characters.' },
              maxLength: { value: 120, message: 'College name cannot exceed 120 characters.' },
            })}
          />
          {errors.college && <p className="field-error">{errors.college.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="department" className="field-label">
              Department <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="department"
              type="text"
              placeholder="e.g. Computer Science"
              className="field-input"
              {...register('department', { maxLength: { value: 100, message: 'Too long.' } })}
            />
            {errors.department && <p className="field-error">{errors.department.message}</p>}
          </div>
          <div>
            <label htmlFor="year" className="field-label">
              Year <span className="font-normal text-muted">(optional)</span>
            </label>
            <select id="year" className="field-input" {...register('year')}>
              <option value="">Not specified</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="field-label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
              className="field-input pr-11"
              {...register('password', {
                required: 'Create a password.',
                minLength: { value: 8, message: 'Password must be at least 8 characters.' },
              })}
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
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {passwordChecks.map((check) => {
              const passed = check.test(password);
              return (
                <span key={check.label} className={cn('flex items-center gap-1.5 text-[10px]', passed ? 'text-forest-700' : 'text-muted')}>
                  <Check className={cn('h-3 w-3', passed ? 'opacity-100' : 'opacity-30')} /> {check.label}
                </span>
              );
            })}
          </div>
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="field-label">Confirm password</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat your password"
            className="field-input"
            {...register('confirmPassword', {
              required: 'Confirm your password.',
              validate: (value) => value === password || 'Passwords do not match.',
            })}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-paper p-3.5 text-xs leading-5 text-muted">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-line text-forest-600 focus:ring-forest-500"
            {...register('terms', { required: 'Agree to the terms and safety guidelines to continue.' })}
          />
          <span>
            I agree to the <Link to="/terms" className="link">terms of use</Link> and{' '}
            <Link to="/safety" className="link">safety guidelines</Link>, and understand that
            UniMarket does not process payments or verify seller identity.
          </span>
        </label>
        {errors.terms && <p className="field-error">{errors.terms.message}</p>}

        <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link to="/login" className="link">Log in</Link>
      </p>
    </div>
  );
}
