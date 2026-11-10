import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Med Vantage - Clinical Intake & Care Coordination Portal',
  description: 'Secure patient intake, triage coordination, and medical case management powered by Next.js and Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <AuthProvider>
          {/* Main Global Navigation */}
          <Navbar />

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Med Vantage Portal • HIPAA-conscious architecture with Supabase Row Level Security & Encrypted Storage</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Next.js 16</span>
                <span>•</span>
                <span>Tailwind CSS</span>
                <span>•</span>
                <span>Capacitor Native Mobile</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
