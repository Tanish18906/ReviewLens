import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon, ChevronDown } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname, location.search]);

  // Close account menu on click outside
  useEffect(() => {
    if (!accountMenuOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [accountMenuOpen]);

  // Handle escape globally for account menu and mobile drawer
  useEffect(() => {
    if (!accountMenuOpen && !mobileMenuOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (accountMenuOpen) {
          setAccountMenuOpen(false);
          triggerButtonRef.current?.focus();
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [accountMenuOpen, mobileMenuOpen]);

  // Keyboard navigation for accessible account menu
  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = menuItemsRef.current.filter(Boolean) as (HTMLAnchorElement | HTMLButtonElement)[];
      if (!items.length) return;

      const activeIndex = items.findIndex((item) => item === document.activeElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
        items[nextIndex]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
        items[prevIndex]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
      } else if (e.key === 'Tab') {
        setAccountMenuOpen(false);
      }
    },
    []
  );

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
    `inline-flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-pill text-[13.5px] font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
      active
        ? 'bg-brand text-white font-semibold shadow-subtle'
        : 'text-muted hover:text-ink hover:bg-brand-pale'
    }`;

  const userInitial = user?.full_name ? user.full_name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-40 h-[72px] bg-surface/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-container mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        
        {/* Left: Brand Cluster & Desktop Navigation */}
        <div className="flex items-center gap-3 lg:gap-5 xl:gap-7 min-w-0 flex-1">
          <Link
            to="/products"
            className="flex items-center gap-2 sm:gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-control py-1 px-1 -ml-1 transition-colors flex-shrink-0"
            aria-label="Blush & Bloom home"
          >
            {/* Custom Flower Blossom Mark */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-pale border border-brand/20 flex items-center justify-center text-brand shadow-subtle group-hover:bg-brand-subtle transition-colors flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5 text-brand"
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

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[17px] sm:text-[20px] font-extrabold tracking-tight text-ink font-heading leading-tight">
                  Blush &amp; Bloom
                </span>
                <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-pill bg-brand-subtle text-brand border border-brand/20 flex-shrink-0">
                  Sem 3
                </span>
              </div>
              <span className="text-[11px] text-muted -mt-0.5 hidden xl:inline truncate max-w-[200px]">
                A little world of lovely things
              </span>
            </div>
          </Link>

          {/* Desktop Category Navigation (Visible on lg: 1024px+ screens) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 min-w-0" aria-label="Main Navigation">
            <Link
              to="/products"
              className={navItemClass(isActiveCategory(null))}
            >
              All products
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
                className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[13.5px] font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  location.pathname === '/admin'
                    ? 'bg-brand text-white font-semibold shadow-subtle'
                    : 'text-muted hover:text-ink hover:bg-brand-pale'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Desktop: Auth State & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {isAuthenticated && user ? (
            /* Authenticated Account Menu Dropdown */
            <div className="relative" ref={accountMenuRef}>
              <button
                ref={triggerButtonRef}
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                    if (!accountMenuOpen) {
                      e.preventDefault();
                      setAccountMenuOpen(true);
                      setTimeout(() => {
                        const first = menuItemsRef.current[0];
                        first?.focus();
                      }, 50);
                    }
                  }
                }}
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                aria-controls="account-menu-dropdown"
                aria-label={`Account menu for ${user.full_name}`}
                className="flex items-center gap-1.5 sm:gap-2 py-1 pl-1 pr-2 sm:pr-2.5 rounded-pill text-[13px] font-medium text-ink bg-surface hover:bg-brand-pale transition-colors border border-border shadow-subtle hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand min-h-[38px] sm:min-h-[40px]"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-subtle text-brand flex items-center justify-center font-bold text-xs border border-brand/20 flex-shrink-0">
                  {userInitial}
                </div>
                {/* On mobile screens (< sm), show avatar + chevron to avoid crowding the header */}
                <span className="font-semibold text-ink text-[13px] sm:text-[13.5px] truncate max-w-[70px] sm:max-w-[100px] xl:max-w-[140px] hidden xs:inline sm:inline">
                  {user.full_name}
                </span>
                <span
                  className={`text-[9.5px] xl:text-[10px] font-bold uppercase tracking-wider px-1.5 xl:px-2 py-0.5 rounded-pill hidden xl:inline-block ${
                    isAdmin
                      ? 'bg-amber-50 text-warning border border-warning/20'
                      : 'bg-brand-pale text-brand border border-brand/20'
                  }`}
                >
                  {user.role}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted transition-transform duration-200 flex-shrink-0 ${
                    accountMenuOpen ? 'rotate-180 text-brand' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Accessible Dropdown Popover */}
              {accountMenuOpen && (
                <div
                  id="account-menu-dropdown"
                  role="menu"
                  aria-label="Account options"
                  onKeyDown={handleMenuKeyDown}
                  className="absolute right-0 top-full mt-2 w-72 bg-surface rounded-2xl border border-border shadow-elevated py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* User Profile Header in Menu */}
                  <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-pale text-brand flex items-center justify-center font-bold text-base border border-brand/30 flex-shrink-0">
                      {userInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-ink text-[14px] leading-snug break-words">
                        {user.full_name}
                      </div>
                      <div className="text-[12px] text-muted truncate">{user.email}</div>
                      <div className="mt-1">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill ${
                            isAdmin
                              ? 'bg-amber-50 text-warning border border-warning/20'
                              : 'bg-brand-pale text-brand border border-brand/20'
                          }`}
                        >
                          {isAdmin ? 'Administrator' : 'Student Reviewer'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      role="menuitem"
                      ref={(el) => {
                        menuItemsRef.current[0] = el;
                      }}
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-ink hover:bg-brand-pale hover:text-brand transition-colors focus-visible:outline-none focus-visible:bg-brand-pale focus-visible:text-brand min-h-[44px]"
                    >
                      <UserIcon className="w-4 h-4 text-muted flex-shrink-0" />
                      <span>My profile</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        ref={(el) => {
                          menuItemsRef.current[1] = el;
                        }}
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-ink hover:bg-brand-pale hover:text-brand transition-colors focus-visible:outline-none focus-visible:bg-brand-pale focus-visible:text-brand min-h-[44px]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand flex-shrink-0" />
                        <span>Admin dashboard</span>
                      </Link>
                    )}
                  </div>

                  <hr className="my-1 border-border" />

                  {/* Sign Out Action */}
                  <div className="py-1">
                    <button
                      type="button"
                      role="menuitem"
                      ref={(el) => {
                        menuItemsRef.current[isAdmin ? 2 : 1] = el;
                      }}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-error hover:bg-error-subtle transition-colors focus-visible:outline-none focus-visible:bg-error-subtle text-left min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest / Unauthenticated Actions */
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-[13.5px] font-semibold text-muted hover:text-ink hover:bg-brand-pale rounded-pill transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand min-h-[40px] inline-flex items-center"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4.5 py-2 text-[13.5px] font-semibold text-white bg-brand hover:bg-brand-hover rounded-pill shadow-subtle hover:shadow-card transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand min-h-[40px] inline-flex items-center"
              >
                Join
              </Link>
            </div>
          )}

          {/* Navigation Toggle (Visible on < lg: 1024px screens) */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-control text-muted hover:text-ink hover:bg-brand-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-brand" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Visible on < lg screens when toggled) */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden bg-surface border-b border-border shadow-elevated px-4 pt-3 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted px-2">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-control bg-page hover:bg-brand-pale text-[13.5px] font-medium text-ink transition-colors min-h-[44px] flex items-center"
            >
              All products
            </Link>
            <Link
              to="/products?category=Plush+Toys"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-control bg-page hover:bg-brand-pale text-[13.5px] font-medium text-ink transition-colors min-h-[44px] flex items-center"
            >
              Plushies
            </Link>
            <Link
              to="/products?category=Fragrances"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-control bg-page hover:bg-brand-pale text-[13.5px] font-medium text-ink transition-colors min-h-[44px] flex items-center"
            >
              Fragrances
            </Link>
            <Link
              to="/products?category=Beauty+%26+Makeup"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-control bg-page hover:bg-brand-pale text-[13.5px] font-medium text-ink transition-colors min-h-[44px] flex items-center"
            >
              Beauty
            </Link>
            <Link
              to="/products?category=Accessories+%26+Gifts"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-control bg-page hover:bg-brand-pale text-[13.5px] font-medium text-ink transition-colors col-span-2 min-h-[44px] flex items-center"
            >
              Accessories &amp; Gifts
            </Link>
          </div>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-control bg-brand-pale text-brand text-[13.5px] font-semibold min-h-[44px]"
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>Admin dashboard</span>
            </Link>
          )}

          <hr className="border-border my-2" />

          {isAuthenticated && user ? (
            <div className="space-y-2 pt-1">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-control bg-page text-[13.5px] min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-brand-subtle text-brand flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {userInitial}
                  </div>
                  <span className="font-semibold text-ink truncate">{user.full_name}</span>
                </div>
                <span className="text-xs text-muted flex-shrink-0">View profile</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left p-2.5 rounded-control text-error hover:bg-error-subtle text-[13.5px] font-medium transition-colors min-h-[44px] flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 px-3 rounded-pill border border-border text-[13.5px] font-semibold text-ink min-h-[44px] flex items-center justify-center"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 px-3 rounded-pill bg-brand text-white text-[13.5px] font-semibold shadow-subtle min-h-[44px] flex items-center justify-center"
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
