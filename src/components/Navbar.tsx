import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Shield, Sparkles } from 'lucide-react';
import { RealtimeIndicator } from './RealtimeIndicator';
import { useAuth } from '../lib/hooks';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: 'Projects', path: '/projects' },
  { name: 'Research', path: '/research' },
  { name: 'Resources', path: '/resources' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Committee', path: '/committee' },
  { name: 'Contact', path: '/contact' },
];

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Top institution bar */}
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-md px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <Link to="/" className="text-base sm:text-lg font-bold text-white hover:text-cyan-300 transition tracking-tight block leading-tight">
                IEEE CIS <span className="text-cyan-400">VVCE</span>
              </Link>
              <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
                Vidya Vardhaka College of Engineering — Mysuru
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <RealtimeIndicator />

            {/* Institution Logos */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/15">
              <img
                src="https://msyblaohdkpztytpbszp.supabase.co/storage/v1/object/public/gallery/IEEE%20CIS%20logo.jpg"
                alt="IEEE CIS Logo"
                className="h-7 sm:h-9 w-auto object-contain rounded bg-white/5 p-1"
                loading="lazy"
              />
              <img
                src="https://msyblaohdkpztytpbszp.supabase.co/storage/v1/object/public/gallery/vvce-logo.png"
                alt="VVCE Logo"
                className="h-7 sm:h-9 w-auto object-contain rounded bg-white/5 p-1"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main floating navigation pill */}
      <nav className="sticky top-16 z-30 mx-4 sm:mx-8 mt-3">
        <div className="max-w-6xl mx-auto backdrop-blur-xl bg-slate-900/65 border border-white/15 rounded-2xl shadow-2xl px-5 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-sm tracking-wide text-white md:hidden">
            IEEE CIS VVCE
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-3 text-sm mx-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-xl font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'text-cyan-300 bg-white/10 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-cyan-400 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Admin link */}
          <div className="hidden md:flex items-center">
            <Link
              to={isAuthenticated ? '/admin' : '/admin-login'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/15 hover:border-cyan-400/40 transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? 'Console' : 'Admin'}</span>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile slide-down menu */}
        {mobileOpen && (
          <div className="md:hidden mt-2 p-4 rounded-2xl backdrop-blur-2xl bg-slate-950/95 border border-white/15 shadow-2xl flex flex-col gap-2 animate-fade-in">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl font-medium text-sm transition ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-white/10 mt-1">
              <Link
                to={isAuthenticated ? '/admin' : '/admin-login'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-cyan-300 bg-white/5 hover:bg-white/10 transition"
              >
                <Shield className="w-4 h-4" />
                <span>{isAuthenticated ? 'Admin Console' : 'Admin Login'}</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
