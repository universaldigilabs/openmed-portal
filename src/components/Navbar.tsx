'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HeartPulse,
  Activity,
  Stethoscope,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
              Med Vantage
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                Care Portal
              </span>
            </span>
            <p className="text-[11px] text-slate-500 -mt-0.5">Clinical Intake & Triage System</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/intake"
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition ${
              pathname === '/intake'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Patient Intake</span>
            <span className="sm:hidden">Intake</span>
          </Link>

          <Link
            href="/coordinator"
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition ${
              pathname === '/coordinator'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Coordinator Portal</span>
            <span className="sm:hidden">Coordinator</span>
          </Link>

          {/* User Authentication Panel */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                  {user.fullName}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {user.role === 'coordinator' ? 'Care Staff' : 'Patient'}
                </div>
              </div>

              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                  user.role === 'coordinator'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
                title={user.email}
              >
                {user.fullName ? user.fullName[0] : user.email[0]}
              </div>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
