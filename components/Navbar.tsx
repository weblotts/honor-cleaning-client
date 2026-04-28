'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import colouredLogo from '@/assets/HonorCleaners-ColouredLogo.png';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    function handleClick(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case UserRole.Admin:
        return '/admin';
      case UserRole.Staff:
        return '/staff';
      default:
        return '/dashboard';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    switch (user.role) {
      case UserRole.Admin:
        return 'Admin Panel';
      case UserRole.Staff:
        return 'Staff Portal';
      default:
        return 'My Dashboard';
    }
  };

  const navLinks = [
    { href: '/#services', label: 'Services' },
    { href: '/about', label: 'About Us' },
    { href: '/#pricing', label: 'Get a Quote' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0 group">
              <Image
                src={colouredLogo}
                alt="Honor Cleaning Co."
                height={36}
                style={{ width: 'auto', height: '36px' }}
                className="group-hover:opacity-80 transition-opacity"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <div className="w-px h-6 mx-2 bg-gray-200" />

              {isAuthenticated ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {getDashboardLabel()}
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              )}

              <Link
                href="/booking"
                className="ml-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                Free Quote
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mobile right side */}
            <div className="flex lg:hidden items-center gap-2">
              {isAuthenticated && (
                <Link
                  href={getDashboardLink()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 transition-colors"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{getDashboardLabel()}</span>
                  <span className="sm:hidden">Dashboard</span>
                </Link>
              )}
              <button
                className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay + drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div
            ref={mobileMenuRef}
            className="absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl animate-slide-in-right flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <Image
                  src={colouredLogo}
                  alt="Honor Cleaning Co."
                  height={32}
                  style={{ width: 'auto', height: '32px' }}
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {/* Dashboard CTA — prominent at top for logged-in users */}
              {isAuthenticated && (
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-semibold mb-4 transition-colors hover:bg-brand-100"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                    <LayoutDashboard className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{getDashboardLabel()}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-brand-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              {/* Nav links */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-2 pb-1">Menu</p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:text-brand-700 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <>
                  <div className="h-px bg-gray-100 my-3" />
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    Sign In
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  <div className="h-px bg-gray-100 my-3" />
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-gray-400 font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Drawer footer — book CTA */}
            <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50">
              <Link
                href="/booking"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Free Quote
                <ChevronRight className="h-4 w-4" />
              </Link>
              <p className="text-center text-[11px] text-gray-400 mt-2">
                Call us: <a href="tel:+15083331838" className="text-brand-600 font-medium">(508) 333-1838</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
