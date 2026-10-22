import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, ApiError } from '../lib/api';
import { PageShell } from '../components/PageShell';
import { FormField } from '../components/FormField';
import { Eye, EyeOff, UserPlus, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

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
          
          {/* Left Column: Boutique Atmosphere & Imagery */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-brand-pale text-brand border border-brand/20 text-[12px] font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Blush & Bloom</span>
              <span>·</span>
              <span>Semester 3 Prototype</span>
            </div>

            <h1 className="text-[32px] sm:text-[40px] font-extrabold text-ink tracking-tight leading-[1.18]">
              Join our <br />
              <span className="text-brand">little world.</span>
            </h1>

            <p className="text-[15px] sm:text-[16px] text-muted leading-relaxed">
              Create an account to explore and review lovely everyday finds. Share thoughtful evaluations and contribute to student research.
            </p>

            {/* Visual Card */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-brand/20 shadow-card group">
              <img
                src="/images/storefront/category-plush-toys.webp"
                alt="Plush collection at Blush & Bloom"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith('.webp')) {
                    target.src = '/images/storefront/category-plush-toys.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white text-[12.5px] flex items-center justify-between">
                <span className="font-medium flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-brand-baby text-brand-baby" />
                  Cute plushies, sweet scents & essentials
                </span>
                <span className="text-white/80 font-mono text-[11px]">Academic Prototype</span>
              </div>
            </div>

            {/* Traceability */}
            <p className="text-[12px] text-muted/80">
              Blush & Bloom — Powered by ReviewLens | Semester 3 Academic Prototype
            </p>
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-6 w-full max-w-[440px] mx-auto">
            <div className="bg-surface rounded-3xl shadow-card border border-border p-6 sm:p-8 transition-all">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-pale text-brand flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-brand/30 text-brand" />
                  </div>
                  <span className="text-[13px] font-bold text-brand uppercase tracking-wider">
                    Blush & Bloom
                  </span>
                </div>
                <h2 className="text-[24px] font-bold text-ink tracking-tight">Create account</h2>
                <p className="text-[13px] text-muted mt-1">
                  Register as a student evaluator to post reviews.
                </p>
              </div>

              {successMessage && (
                <div
                  role="status"
                  className="mb-5 p-3.5 rounded-xl bg-success-subtle border border-success/30 text-success text-[13px] flex items-center gap-2 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {generalError && (
                <div
                  role="alert"
                  tabIndex={-1}
                  className="mb-5 p-3.5 rounded-xl bg-error-subtle border border-error/30 text-error text-[13px] flex items-start gap-2 font-medium"
                >
                  <span className="text-[15px] leading-tight" aria-hidden="true">⚠</span>
                  <span>{generalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <FormField
                  label="Full name"
                  type="text"
                  id="reg-fullname"
                  name="fullName"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) {
                      setFieldErrors({ ...fieldErrors, fullName: '' });
                    }
                  }}
                  error={fieldErrors.fullName}
                  placeholder="Riddhima Patel"
                />

                <FormField
                  label="Email address"
                  type="email"
                  id="reg-email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: '' });
                    }
                  }}
                  error={fieldErrors.email}
                  placeholder="student@reviewlens.edu"
                />

                <FormField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  name="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors({ ...fieldErrors, password: '' });
                    }
                  }}
                  error={fieldErrors.password}
                  helperText="Minimum 8 characters"
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
                  className="w-full h-[46px] mt-2 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white text-[14.5px] font-bold rounded-pill shadow-subtle hover:shadow-card transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

        </div>
      </div>
    </PageShell>
  );
}
