import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import Avatar from '../components/Avatar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { getApiError } from '../services/api.js';
import { cn } from '../lib/cn.js';

const navLinkClass = ({ isActive }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-forest-50 text-forest-800' : 'text-ink/70 hover:bg-ink/[0.04] hover:text-ink'
  );

export default function Navbar() {
  const { user, booting, isAdmin, logout } = useAuth();
  const { count: favoriteCount } = useFavorites();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function close(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  async function handleLogout() {
    try {
      await logout();
      notify.success('You have been signed out.');
      navigate('/');
    } catch (error) {
      notify.error(getApiError(error, 'Could not sign out cleanly.'));
    }
  }

  const accountLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/favorites', label: 'Favourites', icon: Heart },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin area', icon: ShieldCheck }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/95 backdrop-blur-md">
      <a
        href="#main-content"
        className="absolute left-3 top-2 -translate-y-16 rounded-lg bg-forest-700 px-3 py-2 text-xs font-semibold text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="container-page flex h-[72px] items-center gap-4">
        <Logo />

        <div className="mx-auto hidden w-full max-w-sm lg:block">
          <SearchBar />
        </div>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          <NavLink to="/marketplace" className={navLinkClass}>
            Browse
          </NavLink>
          <NavLink to="/sell" className={navLinkClass}>
            Sell an Item
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          {booting ? (
            <span className="h-9 w-20 animate-pulse rounded-xl bg-ink/5" aria-label="Loading account" />
          ) : user ? (
            <>
              <Link
                to="/favorites"
                className="relative hidden rounded-lg p-2.5 text-ink/70 transition hover:bg-ink/5 hover:text-ink sm:inline-flex"
                aria-label={`Favourites${favoriteCount ? `, ${favoriteCount} saved` : ''}`}
              >
                <Heart className="h-5 w-5" />
                {favoriteCount > 0 && (
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-forest-600 px-1 text-[9px] font-bold text-white">
                    {favoriteCount}
                  </span>
                )}
              </Link>
              <Link
                to="/messages"
                className="hidden rounded-lg p-2.5 text-ink/70 transition hover:bg-ink/5 hover:text-ink sm:inline-flex"
                aria-label="Messages"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>
              <Link
                to="/sell"
                className="btn-primary hidden md:inline-flex"
                aria-label="Create a listing"
              >
                <Plus className="h-4 w-4" /> Sell
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex items-center gap-1.5 rounded-xl p-1 transition hover:bg-ink/5"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <Avatar name={user.name} size="sm" />
                  <span className="hidden max-w-24 truncate text-xs font-semibold lg:block">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-muted lg:block" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-paper p-1.5 shadow-lift animate-fade-in"
                    role="menu"
                  >
                    <div className="border-b border-line px-3 py-2.5">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
                    </div>
                    {accountLinks.map(({ to, label, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink/75 transition hover:bg-forest-50 hover:text-forest-800"
                      >
                        <Icon className="h-4 w-4" /> {label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-700 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost hidden sm:inline-flex">
                Log in
              </Link>
              <Link to="/register" className="btn-primary hidden sm:inline-flex">
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="rounded-lg p-2.5 text-ink transition hover:bg-ink/5 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto border-t border-line bg-canvas px-5 py-5 md:hidden">
          <SearchBar />
          <nav className="mt-5 grid gap-1" aria-label="Mobile navigation">
            {[
              { to: '/marketplace', label: 'Browse marketplace' },
              { to: '/sell', label: 'Sell an item' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-xl px-3 py-3 text-base font-medium transition hover:bg-forest-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="my-5 h-px bg-line" />
          {user ? (
            <div className="grid gap-1">
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-paper p-3">
                <Avatar name={user.name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted">{user.college}</p>
                </div>
              </div>
              {accountLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-forest-50"
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link to="/login" className="btn-secondary">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
