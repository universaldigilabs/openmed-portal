import type { Metadata } from 'next';
import { ShieldCheck, Globe2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Med Vantage - Global Medical Tourism & Accredited Healthcare Facilitation',
  description: 'Connect with JCI and NABH accredited hospitals worldwide. Transparent surgical cost comparisons, virtual second opinions, and end-to-end medical visa and travel coordination.',
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
          <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Med Vantage Global Medical Tourism • JCI & NABH Verified Healthcare Network</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                  <span>Heal In India Partner Hubs</span>
                  <span>•</span>
                  <span>MedicalTourism.com Standard Guidelines</span>
                  <span>•</span>
                  <span>Encrypted Patient Data</span>
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>© 2026 Med Vantage. Empowering international patients with transparent, high-acuity medical care abroad.</span>
                <span>Supported Destinations: India • Thailand • Turkey • Singapore • Spain • UAE • Mexico</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
