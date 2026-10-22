import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, ApiError } from '../lib/api';
import { PageShell } from '../components/PageShell';
import { FormField } from '../components/FormField';
import { Eye, EyeOff, UserPlus, CheckCircle2, Star, Database, ShieldCheck } from 'lucide-react';

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
        navigate('/login?registered=true');
      }, 1200);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFieldErrors({ email: 'An account with this email already exists.' });
      } else if (err instanceof ApiError) {
        setGeneralError(err.detail);
      } else {
        setGeneralError('Could not connect to the backend server. Please verify the service is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell hideFooter={true}>
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-6 sm:py-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Academic Brand Context */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-brand-subtle text-brand border border-brand/15 text-[12px] font-bold tracking-wide uppercase">
              <span>Academic Prototype</span>
              <span>·</span>
              <span>Semester 3</span>
            </div>

            <h1 className="text-[30px] sm:text-[38px] font-extrabold text-ink tracking-tight leading-[1.2]">
              Contribute to structured review research.
            </h1>

            <p className="text-[15px] sm:text-[16px] text-muted leading-relaxed">
              Join ReviewLens as a verified student evaluator. Submit genuine ratings and structured textual reviews to build our academic corpus.
            </p>

            {/* 3 Academic Feature Highlights */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-control bg-surface border border-border flex items-center justify-center text-brand flex-shrink-0 shadow-2xs">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-ink">Single Review Constraint</h2>
                  <p className="text-[13px] text-muted leading-relaxed">
                    Database-enforced uniqueness prevents duplicate ballot bias per user per product.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-control bg-surface border border-border flex items-center justify-center text-brand flex-shrink-0 shadow-2xs">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-ink">Verbatim & Cleaned Preprocessing</h2>
                  <p className="text-[13px] text-muted leading-relaxed">
                    Submitted text is stored with deterministic cleaning pipeline outputs for subsequent NLP phases.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-control bg-surface border border-border flex items-center justify-center text-brand flex-shrink-0 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-ink">Strict Semester 3 Scope</h2>
                  <p className="text-[13px] text-muted leading-relaxed">
                    Honest descriptive statistics only—no black-box sentiment classification or fake review models.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-6 w-full max-w-[440px] mx-auto">
            <div className="bg-surface rounded-card shadow-card border border-border p-6 sm:p-8 transition-all">
              <div className="mb-6">
                <h2 className="text-[24px] font-bold text-ink tracking-tight">Create student account</h2>
                <p className="text-[13px] text-muted mt-1">
                  Enter your details to register as a student reviewer.
                </p>
              </div>

              {successMessage && (
                <div
                  role="status"
                  className="mb-5 p-3.5 rounded-control bg-success-subtle border border-success/30 text-success text-[13px] flex items-center gap-2 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {generalError && (
                <div
                  role="alert"
                  tabIndex={-1}
                  className="mb-5 p-3.5 rounded-control bg-error-subtle border border-error/30 text-error text-[13px] flex items-start gap-2 font-medium"
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
                      className="text-muted hover:text-ink focus:outline-none p-1 rounded transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[44px] mt-2 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white text-[14.5px] font-semibold rounded-control shadow-subtle hover:shadow-card transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span>Creating account...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Register Account
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

        </div>
      </div>
    </PageShell>
  );
}
