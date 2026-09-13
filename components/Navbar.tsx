'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { getSavedListingIds } from '@/lib/savedListings';
import { Home, Building2, KeyRound, Heart, BarChart3, LogOut, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { session, isAuthenticated, logout } = useAuth();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    function updateSavedCount() {
      const list = getSavedListingIds();
      setSavedCount(list.length);
    }

    updateSavedCount();
    window.addEventListener('storage', updateSavedCount);
    window.addEventListener('saved_listings_change', updateSavedCount);
    window.addEventListener('auth_state_change', updateSavedCount);
    return () => {
      window.removeEventListener('storage', updateSavedCount);
      window.removeEventListener('saved_listings_change', updateSavedCount);
      window.removeEventListener('auth_state_change', updateSavedCount);
    };
  }, [session]);

  const navItems = [
    { href: '/', label: 'Listings', icon: Home },
    { href: '/rentals', label: 'Rentals', icon: KeyRound },
    { href: '/projects', label: 'Projects', icon: Building2 },
    { href: '/saved', label: 'Saved', icon: Heart, badge: savedCount > 0 ? savedCount : null },
    { href: '/insights', label: 'Insights & Lies', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-50 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/70 border border-white/80 rounded-2xl px-5 py-3 shadow-xl shadow-purple-900/5 flex items-center justify-between transition-all">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
            <Building2 className="w-5 h-5 text-white font-bold" />
          </div>
          <div>
            <span className="font-sans text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
              Ivy Homes
            </span>
            <span className="text-[10px] font-semibold text-purple-600 block -mt-1 tracking-widest uppercase font-mono">
              AI Real Estate Platform
            </span>
          </div>
        </Link>

        {/* Floating Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all relative ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge !== null && (
                  <span className="ml-1 bg-violet-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth User Section */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest flex items-center gap-1 justify-end font-semibold">
                  <Sparkles className="w-3 h-3 text-emerald-500" /> Active Session
                </span>
                <span className="text-xs font-semibold text-slate-800 font-mono">
                  {session?.user.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 transition-all hover:scale-105"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
