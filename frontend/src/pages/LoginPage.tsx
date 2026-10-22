import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { apiFetch, ApiError } from '../lib/api';
import { PageShell } from '../components/PageShell';
import { FormField } from '../components/FormField';
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] py-8">
        <div className="w-full max-w-[420px] bg-surface rounded-card shadow-card border border-border p-8">
          <div className="text-center mb-6">
            <h1 className="text-[26px] font-bold text-ink tracking-tight">Sign in</h1>
            <p className="text-[13px] text-muted mt-1">ReviewLens · Semester 3 review prototype</p>
          </div>

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
              label="Email address"
              type="email"
              id="login-email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@reviewlens.edu"
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
                  className="text-muted hover:text-ink focus:outline-none p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-[44px] mt-2 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white text-[15px] font-medium rounded-control shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand font-semibold hover:underline">
              Create account
            </Link>
          </div>

          {/* Demonstration Quick Fill Box */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted uppercase tracking-wider mb-2.5">
              <Lock className="w-3.5 h-3.5" />
              Demo Credentials (Click to fill)
            </div>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <button
                type="button"
                onClick={() => handleDemoFill('student1@reviewlens.edu', 'Student@ReviewLens1')}
                className="text-left p-2 rounded border border-border hover:bg-page transition-colors"
              >
                <div className="font-semibold text-ink">Student 1</div>
                <div className="text-muted truncate">student1@...</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@reviewlens.edu', 'Admin@ReviewLens2026')}
                className="text-left p-2 rounded border border-border hover:bg-page transition-colors"
              >
                <div className="font-semibold text-brand">Admin User</div>
                <div className="text-muted truncate">admin@...</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
