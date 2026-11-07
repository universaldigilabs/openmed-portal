import type { Metadata } from 'next';
import Link from 'next/link';
import { Activity, ShieldCheck, HeartPulse, Stethoscope } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenMed - Zero-Cost Medical Intake & Coordination Portal',
  description: 'Open-source, secure patient intake and clinical care coordinator dashboard powered by Next.js and Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  OpenMed <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Free Tier</span>
                </span>
                <p className="text-xs text-slate-500 -mt-0.5">Triage & Coordination System</p>
              </div>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
              >
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Patient Intake</span>
              </Link>

              <Link
                href="/coordinator"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition"
              >
                <Stethoscope className="w-4 h-4 text-blue-400" />
                <span>Coordinator Portal</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-cost open-source deployment: Supabase Free Tier (PostgreSQL + RLS + Storage) & Vercel Hobby</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Next.js 16</span>
              <span>•</span>
              <span>Tailwind CSS</span>
              <span>•</span>
              <span>Capacitor Mobile Ready</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
