import Link from 'next/link';
import {
  FileText,
  LayoutDashboard,
  Server,
  Database,
  CloudUpload,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  LogIn,
  UserPlus,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Med Vantage Clinical Suite
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Next-Generation Clinical Intake & Case Coordination
        </h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          Welcome to <strong className="text-slate-900 font-bold">Med Vantage</strong>. An enterprise-grade,
          open-source medical platform connecting patients and care coordinators with real-time triage,
          encrypted document exchange, and authenticated staff access.
        </p>

        {/* Auth CTA Banner */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register</span>
          </Link>
          <Link
            href="/intake"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Submit Intake Directly</span>
          </Link>
        </div>
      </div>

      {/* Main Portals CTA Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Patient Intake Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Patient Intake Portal</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Public clinical intake form allowing patients to describe current symptoms, select urgency
              tiers, and securely upload records to the private{' '}
              <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">patient-docs</code> cloud bucket.
            </p>
            <ul className="space-y-2.5 text-sm text-slate-600 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Encrypted submission protected by Supabase Row Level Security</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Multi-document attachments for lab results, imaging, & insurance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Automatic case tracking reference number (e.g., MC-1001)</span>
              </li>
            </ul>
          </div>
          <Link
            href="/intake"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition"
          >
            <span>Start Patient Intake</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Coordinator Dashboard Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md">
              <LayoutDashboard className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Care Coordinator Console</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Staff-only triage station. Clinical coordinators review symptoms, download
              confidential attachments via signed URLs, update triage status, and audit outgoing alerts.
            </p>
            <ul className="space-y-2.5 text-sm text-slate-600 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Triage filters by Urgency (Routine, Urgent, Critical, Emergency)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Time-limited signed URLs for confidential medical documents</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Automated audit trail in <code className="text-xs font-mono">notification_log</code></span>
              </li>
            </ul>
          </div>
          <Link
            href="/coordinator"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow transition"
          >
            <span>Access Coordinator Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Architecture & Deployment Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-12">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          Med Vantage Core Platform Architecture
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Supabase Cloud</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              PostgreSQL database, Row Level Security, user authentication, and secure encrypted storage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
              <CloudUpload className="w-4 h-4 text-blue-600" />
              <span>Vercel Edge</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Continuous deployment from GitHub with serverless API routes, instant CDN, and automated SSL.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Auth & RLS</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict access controls: anonymous public insert for intake; authenticated service role for coordinators.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>Capacitor Mobile</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Native Android container generated and ready for Play Store distribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
