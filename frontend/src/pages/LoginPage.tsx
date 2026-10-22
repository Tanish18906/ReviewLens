import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { apiFetch, ApiError } from '../lib/api';
import { PageShell } from '../components/PageShell';
import { FormField } from '../components/FormField';
import { Eye, EyeOff, Lock, LogIn, Database, Star, CheckCircle2, ChevronDown } from 'lucide-react';

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: 'student' | 'admin';
    created_at: string;
  };
}

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const nextPath = searchParams.get('next') || '/products';
  const registeredSuccess = searchParams.get('registered') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!email.trim() || !password) {
      setGeneralError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiFetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      login(data.access_token, data.user);
      navigate(nextPath, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setGeneralError('Email or password is incorrect.');
      } else if (err instanceof ApiError) {
        setGeneralError(err.detail);
      } else {
        setGeneralError('Unable to connect to the backend server. Please verify the service is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setGeneralError(null);
  };

  return (
    <PageShell hideFooter={true}>
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-6 sm:py-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Academic Brand Context (Hidden on small mobile, visible on desktop) */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-brand-subtle text-brand border border-brand/15 text-[12px] font-bold tracking-wide uppercase">
              <span>Academic Prototype</span>
              <span>·</span>
              <span>Semester 3</span>
            </div>

            <h1 className="text-[30px] sm:text-[38px] font-extrabold text-ink tracking-tight leading-[1.2]">
              Understand product feedback with structured review data.
            </h1>

            <p className="text-[15px] sm:text-[16px] text-muted leading-relaxed">
              ReviewLens provides reliable review collection, relational PostgreSQL persistence, and descriptive statistical analytics.
            </p>

            {/* 3 Academic Feature Highlights */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-control bg-surface border border-border flex items-center justify-center text-brand flex-shrink-0 shadow-2xs">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-ink">Structured Ratings Collection</h2>
                  <p className="text-[13px] text-muted leading-relaxed">
                    Students submit 1 to 5 stars with strict one-review-per-product database constraints.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-control bg-surface border border-border flex items-center justify-center text-brand flex-shrink-0 shadow-2xs">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-ink">Relational Persistence & Preprocessing</h2>
                  <p className="text-[13px] text-muted leading-relaxed">
                    Original and deterministically cleaned review text stored for future NLP research.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-control bg-surface border border-border flex items-center justify-center text-brand flex-shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-ink">Honest Academic Boundary</h2>
                  <p className="text-[13px] text-muted leading-relaxed">
                    Descriptive statistics only; sentiment classification and fake detection scheduled for Sem 4–6.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-6 w-full max-w-[440px] mx-auto">
            <div className="bg-surface rounded-card shadow-card border border-border p-6 sm:p-8 transition-all">
              <div className="mb-6">
                <h2 className="text-[24px] font-bold text-ink tracking-tight">Sign in</h2>
                <p className="text-[13px] text-muted mt-1">
                  Enter your university student or administrator account credentials.
                </p>
              </div>

              {registeredSuccess && (
                <div
                  role="status"
                  className="mb-5 p-3.5 rounded-control bg-success-subtle border border-success/30 text-success text-[13px] flex items-center gap-2 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <span>Account registered successfully! You can now sign in.</span>
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
                  label="Email address"
                  type="email"
                  id="login-email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student1@reviewlens.edu"
                />

                <FormField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  disabled={isLoading || !email.trim() || !password}
                  className="w-full h-[44px] mt-2 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white text-[14.5px] font-semibold rounded-control shadow-subtle hover:shadow-card transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign in to ReviewLens
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-[13px] text-muted">
                Need a new student reviewer account?{' '}
                <Link to="/register" className="text-brand font-semibold hover:underline">
                  Create account
                </Link>
              </div>

              {/* Discreet Collapsible Demonstration Helper */}
              <div className="mt-6 pt-5 border-t border-border">
                <details className="group">
                  <summary className="flex items-center justify-between text-[12px] font-semibold text-muted hover:text-ink cursor-pointer list-none select-none py-1">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider">
                      <Lock className="w-3.5 h-3.5" />
                      Demo Credentials (Click to view)
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                  </summary>

                  <div className="mt-3 pt-2 grid grid-cols-2 gap-2 text-[12px]">
                    <button
                      type="button"
                      onClick={() => handleDemoFill('student1@reviewlens.edu', 'Student@ReviewLens1')}
                      className="text-left p-2.5 rounded-control border border-border bg-page hover:bg-surface hover:border-brand/40 transition-colors"
                    >
                      <div className="font-semibold text-ink">Student 1</div>
                      <div className="text-[11px] text-muted truncate">Aarav Sharma</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoFill('student2@reviewlens.edu', 'Student@ReviewLens2')}
                      className="text-left p-2.5 rounded-control border border-border bg-page hover:bg-surface hover:border-brand/40 transition-colors"
                    >
                      <div className="font-semibold text-ink">Student 2</div>
                      <div className="text-[11px] text-muted truncate">Riddhima Patel</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoFill('student3@reviewlens.edu', 'Student@ReviewLens3')}
                      className="text-left p-2.5 rounded-control border border-border bg-page hover:bg-surface hover:border-brand/40 transition-colors"
                    >
                      <div className="font-semibold text-ink">Student 3</div>
                      <div className="text-[11px] text-muted truncate">Karan Verma</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoFill('admin@reviewlens.edu', 'Admin@ReviewLens2026')}
                      className="text-left p-2.5 rounded-control border border-brand/20 bg-brand-subtle/50 hover:bg-brand-subtle transition-colors"
                    >
                      <div className="font-bold text-brand">Administrator</div>
                      <div className="text-[11px] text-muted truncate">admin@...</div>
                    </button>
                  </div>
                </details>
              </div>

            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
