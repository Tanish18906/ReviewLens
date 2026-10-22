import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, ApiError } from '../lib/api';
import { PageShell } from '../components/PageShell';
import { FormField } from '../components/FormField';
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      setSuccessMessage('Registration successful! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFieldErrors({ email: 'An account with this email already exists.' });
      } else if (err instanceof ApiError) {
        setGeneralError(err.detail);
      } else {
        setGeneralError('Could not connect to the backend server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell hideFooter={true}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] py-8">
        <div className="w-full max-w-[420px] bg-surface rounded-card shadow-card border border-border p-8">
          <div className="text-center mb-6">
            <h1 className="text-[26px] font-bold text-ink tracking-tight">Create an account</h1>
            <p className="text-[13px] text-muted mt-1">For our Semester 3 review prototype.</p>
          </div>

          {successMessage && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-control bg-emerald-50 border border-success/30 text-success text-[13px] flex items-center gap-2 font-medium"
            >
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {generalError && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-control bg-red-50 border border-error/30 text-error text-[13px] flex items-start gap-2 font-medium"
            >
              <span className="text-[15px] leading-tight" aria-hidden="true">⚠</span>
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              label="Full name"
              type="text"
              id="register-fullname"
              name="fullName"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
              }}
              error={fieldErrors.fullName}
              placeholder="e.g. Riddhima Patel"
            />

            <FormField
              label="Email address"
              type="email"
              id="register-email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
              }}
              error={fieldErrors.email}
              placeholder="student@reviewlens.edu"
            />

            <FormField
              label="Password (min 8 characters)"
              type={showPassword ? 'text' : 'password'}
              id="register-password"
              name="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
              }}
              error={fieldErrors.password}
              placeholder="••••••••"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-muted hover:text-ink focus:outline-none p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[44px] mt-2 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white text-[15px] font-medium rounded-control shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-muted">
            Already registered?{' '}
            <Link to="/login" className="text-brand font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
