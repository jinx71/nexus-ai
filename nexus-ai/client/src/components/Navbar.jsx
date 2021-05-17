import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NexusMark } from './icons';
import Button from './Button';
import { cx } from '../utils/format';

const linkClass = ({ isActive }) =>
  cx(
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
  );

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <NexusMark />
          <span className="font-display text-lg font-bold tracking-tight text-ink-900">
            Nexus<span className="text-gradient"> AI</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/tools" className={linkClass}>
            Tools
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}
          <span className="mx-2 h-5 w-px bg-ink-200" />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-ink-500 lg:inline">{user?.email}</span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button as={Link} to="/register" size="sm">
                Get started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-ink-100 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            <NavLink to="/tools" className={linkClass} onClick={() => setOpen(false)}>
              Tools
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
            )}
            <div className="mt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button variant="secondary" fullWidth onClick={handleLogout}>
                  Sign out
                </Button>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="secondary" fullWidth onClick={() => setOpen(false)}>
                    Sign in
                  </Button>
                  <Button as={Link} to="/register" fullWidth onClick={() => setOpen(false)}>
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
