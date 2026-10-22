import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');
  const isProducts = location.pathname === '/products' || location.pathname === '/';

  const isActiveCategory = (catName: string | null) => {
    if (!isProducts) return false;
    if (catName === null) {
      return !currentCategory || currentCategory.toLowerCase() === 'all';
    }
    return currentCategory?.toLowerCase() === catName.toLowerCase();
  };

  const navItemClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[13.5px] font-medium transition-all ${
      active
        ? 'bg-brand text-white font-semibold shadow-subtle'
        : 'text-muted hover:text-ink hover:bg-brand-pale'
    }`;

  return (
    <header className="sticky top-0 z-40 h-[72px] bg-surface/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-container mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Brand Cluster */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            to="/products"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-control py-1 px-1.5 -ml-1.5 transition-colors"
          >
            {/* Custom Flower Blossom Mark */}
            <div className="w-9 h-9 rounded-full bg-brand-pale border border-brand/20 flex items-center justify-center text-brand shadow-subtle group-hover:bg-brand-subtle transition-colors flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-brand"
                aria-hidden="true"
              >
                {/* 5-Petal Flower Blossom with center pistil */}
                <circle cx="12" cy="7" r="3.2" fill="#F4AFC4" />
                <circle cx="16.5" cy="10.5" r="3.2" fill="#F4AFC4" />
                <circle cx="15" cy="16" r="3.2" fill="#F4AFC4" />
                <circle cx="9" cy="16" r="3.2" fill="#F4AFC4" />
                <circle cx="7.5" cy="10.5" r="3.2" fill="#F4AFC4" />
                <circle cx="12" cy="12" r="2.8" fill="#D96B93" />
                <circle cx="12" cy="12" r="1.2" fill="#FFFFFF" />
              </svg>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[20px] font-extrabold tracking-tight text-ink font-heading">
                  Blush &amp; Bloom
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill bg-brand-subtle text-brand border border-brand/20">
                  Sem 3
                </span>
              </div>
              <span className="text-[11px] text-muted -mt-0.5 hidden sm:inline">
                A little world of lovely things
              </span>
            </div>
          </Link>

          {/* Desktop Category Navigation */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            <Link
              to="/products"
              className={navItemClass(isActiveCategory(null))}
            >
              All Lovely Finds
            </Link>
            <Link
              to="/products?category=Plush+Toys"
              className={navItemClass(isActiveCategory('Plush Toys'))}
            >
              Plushies
            </Link>
            <Link
              to="/products?category=Fragrances"
              className={navItemClass(isActiveCategory('Fragrances'))}
            >
              Fragrances
            </Link>
            <Link
              to="/products?category=Beauty+%26+Makeup"
              className={navItemClass(isActiveCategory('Beauty & Makeup'))}
            >
              Beauty
            </Link>
            <Link
              to="/products?category=Accessories+%26+Gifts"
              className={navItemClass(isActiveCategory('Accessories & Gifts'))}
            >
              Accessories
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-pill text-[13.5px] font-medium transition-all ${
                  location.pathname === '/admin'
                    ? 'bg-brand text-white font-semibold shadow-subtle'
                    : 'text-muted hover:text-ink hover:bg-brand-pale'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Right Desktop: Auth State */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/profile"
                className="flex items-center gap-2.5 py-1 px-3 rounded-pill text-[13px] font-medium text-ink bg-surface hover:bg-brand-pale transition-colors border border-border shadow-subtle hover:border-brand/30"
              >
                <div className="w-6 h-6 rounded-full bg-brand-subtle text-brand flex items-center justify-center font-bold text-xs border border-brand/20">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-ink">{user.full_name}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill ${
                    isAdmin ? 'bg-amber-50 text-warning border border-warning/20' : 'bg-brand-pale text-brand border border-brand/20'
                  }`}
                >
                  {user.role}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                className="p-2 text-muted hover:text-error rounded-pill hover:bg-brand-pale transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-[13.5px] font-semibold text-muted hover:text-ink hover:bg-brand-pale rounded-pill transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-[13.5px] font-semibold text-white bg-brand hover:bg-brand-hover rounded-pill shadow-subtle hover:shadow-card transition-all"
              >
                Join
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2 rounded-control text-muted hover:text-ink hover:bg-brand-pale focus:outline-none transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-brand" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border shadow-elevated px-4 pt-3 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted px-2">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-control bg-page hover:bg-brand-pale text-[13px] font-medium text-ink transition-colors"
            >
              All Finds
            </Link>
            <Link
              to="/products?category=Plush+Toys"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-control bg-page hover:bg-brand-pale text-[13px] font-medium text-ink transition-colors"
            >
              Plushies
            </Link>
            <Link
              to="/products?category=Fragrances"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-control bg-page hover:bg-brand-pale text-[13px] font-medium text-ink transition-colors"
            >
              Fragrances
            </Link>
            <Link
              to="/products?category=Beauty+%26+Makeup"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-control bg-page hover:bg-brand-pale text-[13px] font-medium text-ink transition-colors"
            >
              Beauty
            </Link>
            <Link
              to="/products?category=Accessories+%26+Gifts"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-control bg-page hover:bg-brand-pale text-[13px] font-medium text-ink transition-colors col-span-2"
            >
              Accessories &amp; Gifts
            </Link>
          </div>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-control bg-brand-pale text-brand text-[13px] font-semibold"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Analytics Dashboard
            </Link>
          )}

          <hr className="border-border my-2" />

          {isAuthenticated && user ? (
            <div className="space-y-2 pt-1">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-control bg-page text-[13px]"
              >
                <span className="font-semibold text-ink">{user.full_name}</span>
                <span className="text-xs text-muted">View profile</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left p-2 rounded-control text-error hover:bg-error-subtle text-[13px] font-medium transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 px-3 rounded-pill border border-border text-[13px] font-semibold text-ink"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 px-3 rounded-pill bg-brand text-white text-[13px] font-semibold shadow-subtle"
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
