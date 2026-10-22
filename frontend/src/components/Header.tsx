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
    `inline-flex items-center gap-1.5 text-[14px] font-medium transition-colors ${
      isActive ? 'text-brand font-semibold' : 'text-muted hover:text-ink'
    }`;

  return (
    <header className="sticky top-0 z-40 h-[68px] bg-surface border-b border-border transition-all">
      <div className="max-w-container mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-8">
          <Link to="/products" className="flex items-baseline gap-2 group">
            <span className="text-[20px] font-bold tracking-tight text-ink group-hover:text-brand transition-colors">
              ReviewLens
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted/10 text-muted">
              S3 Prototype
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
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
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-control text-[14px] font-medium text-ink hover:bg-page transition-colors border border-transparent hover:border-border"
              >
                <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span>{user.full_name}</span>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                }`}>
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
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-3.5 py-2 text-[14px] font-medium text-ink hover:text-brand transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-[14px] font-medium bg-brand hover:bg-brand-hover text-white rounded-control shadow-sm transition-colors"
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
            className="p-2 text-muted hover:text-ink rounded-control hover:bg-page"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border px-4 py-4 space-y-3 shadow-lg">
          <NavLink
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-[15px] font-medium text-ink"
          >
            <ShoppingBag className="w-4 h-4" />
            Products
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-[15px] font-medium text-ink"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
          )}
          <hr className="border-border my-2" />
          {isAuthenticated && user ? (
            <div className="space-y-2 pt-1">
              <div className="text-[13px] text-muted font-medium">Signed in as {user.email}</div>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-[15px] font-medium text-ink"
              >
                <UserIcon className="w-4 h-4" />
                My profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 py-2 text-[15px] font-medium text-error"
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
                className="w-full py-2.5 text-center text-[14px] font-medium text-ink border border-border rounded-control"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-[14px] font-medium bg-brand text-white rounded-control"
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
