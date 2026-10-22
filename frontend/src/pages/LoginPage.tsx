import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { apiFetch, ApiError } from '../lib/api';
import { PageShell } from '../components/PageShell';
import { FormField } from '../components/FormField';
import { Eye, EyeOff, Lock, LogIn, Heart, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';

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
          
          {/* Left Column: Boutique Atmosphere & Imagery */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-brand-pale text-brand border border-brand/20 text-[12px] font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Blush & Bloom</span>
              <span>·</span>
              <span>Semester 3 Prototype</span>
            </div>

            <h1 className="text-[32px] sm:text-[40px] font-extrabold text-ink tracking-tight leading-[1.18]">
              Welcome back, <br />
              <span className="text-brand">lovely!</span>
            </h1>

            <p className="text-[15px] sm:text-[16px] text-muted leading-relaxed">
              Sign in to share your thoughts on your favorite little finds and contribute honest reviews to our academic database.
            </p>

            {/* Visual Card */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-brand/20 shadow-card group">
              <img
                src="/images/storefront/hero-lifestyle-collection.webp"
                alt="Blush & Bloom lifestyle collection"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith('.webp')) {
                    target.src = '/images/storefront/hero-lifestyle-collection.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white text-[12.5px] flex items-center justify-between">
                <span className="font-medium flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-brand-baby text-brand-baby" />
                  A little world of lovely things
                </span>
                <span className="text-white/80 font-mono text-[11px]">PostgreSQL backed</span>
              </div>
            </div>

            {/* Discreet Traceability Note */}
            <p className="text-[12px] text-muted/80">
              Blush & Bloom — Powered by ReviewLens | Semester 3 Academic Prototype
            </p>
          </div>

          {/* Right Column: Authentication Card */}
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
                <h2 className="text-[24px] font-bold text-ink tracking-tight">Sign in</h2>
                <p className="text-[13px] text-muted mt-1">
                  Enter your student or administrator credentials.
                </p>
              </div>

              {registeredSuccess && (
                <div
                  role="status"
                  className="mb-5 p-3.5 rounded-xl bg-success-subtle border border-success/30 text-success text-[13px] flex items-center gap-2 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <span>Account registered successfully! You can now sign in.</span>
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
                  className="w-full h-[46px] mt-2 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white text-[14.5px] font-bold rounded-pill shadow-subtle hover:shadow-card transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign in to Blush & Bloom
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-[13px] text-muted">
                Need a new student evaluator account?{' '}
                <Link to="/register" className="text-brand font-semibold hover:underline">
                  Create account
                </Link>
              </div>

              {/* Discreet Collapsible Demo Helper */}
              <div className="mt-6 pt-5 border-t border-border">
                <details className="group">
                  <summary className="flex items-center justify-between text-[12px] font-semibold text-muted hover:text-ink cursor-pointer list-none select-none py-1">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider text-brand">
                      <Lock className="w-3.5 h-3.5" />
                      Demo Credentials (Click to autofill)
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180 text-brand" />
                  </summary>

                  <div className="mt-3 pt-2 grid grid-cols-2 gap-2 text-[12px]">
                    <button
                      type="button"
                      onClick={() => handleDemoFill('student1@reviewlens.edu', 'Student@ReviewLens1')}
                      className="text-left p-2.5 rounded-xl border border-border bg-page hover:bg-brand-pale hover:border-brand/40 transition-colors"
                    >
                      <div className="font-bold text-ink">Student 1</div>
                      <div className="text-[11px] text-muted truncate">Aarav Sharma</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoFill('student2@reviewlens.edu', 'Student@ReviewLens2')}
                      className="text-left p-2.5 rounded-xl border border-border bg-page hover:bg-brand-pale hover:border-brand/40 transition-colors"
                    >
                      <div className="font-bold text-ink">Student 2</div>
                      <div className="text-[11px] text-muted truncate">Riddhima Patel</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoFill('student3@reviewlens.edu', 'Student@ReviewLens3')}
                      className="text-left p-2.5 rounded-xl border border-border bg-page hover:bg-brand-pale hover:border-brand/40 transition-colors"
                    >
                      <div className="font-bold text-ink">Student 3</div>
                      <div className="text-[11px] text-muted truncate">Karan Verma</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoFill('admin@reviewlens.edu', 'Admin@ReviewLens2026')}
                      className="text-left p-2.5 rounded-xl border border-brand/20 bg-brand-pale text-brand hover:bg-brand-pale/80 transition-colors"
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
