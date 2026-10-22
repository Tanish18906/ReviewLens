import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 px-3 py-1.5 rounded-control text-[14px] font-medium transition-all ${
      isActive
        ? 'bg-brand-subtle text-brand font-semibold shadow-2xs'
        : 'text-muted hover:text-ink hover:bg-page'
    }`;

  return (
    <header className="sticky top-0 z-40 h-[68px] bg-surface/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-container mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Cluster */}
        <div className="flex items-center gap-8">
          <Link
            to="/products"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-control py-1 px-1.5 -ml-1.5 transition-colors"
          >
            {/* Custom Optical Lens Mark */}
            <div className="w-8 h-8 rounded-control bg-brand flex items-center justify-center text-white shadow-subtle group-hover:bg-brand-hover transition-colors flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
                <path d="M11 8v6M8 11h6" strokeWidth="1.8" />
              </svg>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-[19px] font-bold tracking-tight text-ink">
                ReviewLens
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill bg-brand-subtle text-brand border border-brand/15">
                Sem 3
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Main Navigation">
            <NavLink to="/products" className={navLinkClass}>
              <ShoppingBag className="w-4 h-4" />
              Products
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right Desktop: Auth State */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/profile"
                className="flex items-center gap-2.5 py-1.5 px-3 rounded-control text-[13px] font-medium text-ink hover:bg-page transition-colors border border-border/80 shadow-2xs hover:border-border"
              >
                <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-ink">{user.full_name}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    isAdmin ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {user.role}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                className="p-2 text-muted hover:text-error rounded-control hover:bg-page transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-3.5 py-2 text-[14px] font-medium text-ink hover:text-brand transition-colors rounded-control hover:bg-page"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-[14px] font-semibold bg-brand hover:bg-brand-hover text-white rounded-control shadow-subtle hover:shadow-card transition-all"
              >
                Create account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
            className="p-2 text-muted hover:text-ink rounded-control hover:bg-page transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border px-4 py-4 space-y-2 shadow-elevated">
          <NavLink
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 py-2 px-3 rounded-control text-[14px] font-medium text-ink hover:bg-page"
          >
            <ShoppingBag className="w-4 h-4 text-muted" />
            Products Catalog
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2 px-3 rounded-control text-[14px] font-medium text-ink hover:bg-page"
            >
              <LayoutDashboard className="w-4 h-4 text-muted" />
              Admin Overview
            </NavLink>
          )}

          <hr className="border-border my-2" />

          {isAuthenticated && user ? (
            <div className="space-y-2 pt-1">
              <div className="px-3 text-[12px] text-muted">
                Signed in as <strong className="text-ink">{user.email}</strong>
              </div>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-2 px-3 rounded-control text-[14px] font-medium text-ink hover:bg-page"
              >
                <UserIcon className="w-4 h-4 text-muted" />
                My Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 py-2 px-3 rounded-control text-[14px] font-medium text-error hover:bg-error-subtle transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-[14px] font-medium text-ink border border-border rounded-control hover:bg-page"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-[14px] font-semibold bg-brand text-white rounded-control shadow-subtle hover:bg-brand-hover"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
