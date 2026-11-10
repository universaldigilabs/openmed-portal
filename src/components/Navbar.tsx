'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HeartPulse,
  Building2,
  TrendingDown,
  Video,
  Plane,
  FileText,
  Stethoscope,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/hospitals', label: 'Hospitals & Clinics', icon: Building2 },
    { href: '/cost-comparison', label: 'Cost Transparency', icon: TrendingDown },
    { href: '/second-opinion', label: 'Second Opinions', icon: Video },
    { href: '/travel-services', label: 'Travel & Visa', icon: Plane },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              Med Vantage
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                Medical Tourism
              </span>
            </span>
            <p className="text-[11px] text-slate-500 -mt-0.5">Accredited International Healthcare</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Auth */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/intake"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Get Quote</span>
          </Link>

          <Link
            href="/coordinator"
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition ${
              pathname === '/coordinator'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Coordinator Triage Console"
          >
            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
            <span>Coordinator</span>
          </Link>

          {/* User Authentication Panel */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                  {user.fullName || user.email}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {user.role === 'coordinator' ? 'Care Staff' : 'Patient'}
                </div>
              </div>

              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                  user.role === 'coordinator' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                }`}
                title={user.email}
              >
                {user.fullName ? user.fullName[0] : user.email[0]}
              </div>

              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition border border-slate-200"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 shadow-xl">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/intake"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Request Treatment Quote</span>
            </Link>
            <Link
              href="/coordinator"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              <Stethoscope className="w-4 h-4 text-blue-400" />
              <span>Care Coordinator Console</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
