import Link from 'next/link';
import {
  FileText,
  LayoutDashboard,
  ShieldAlert,
  Server,
  Database,
  CloudUpload,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  GitBranch,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free Tier & Open Source Architecture
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Clinical Intake & Case Coordination Portal
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Deploy an end-to-end, HIPAA-conscious medical case management platform at zero cost using
          Next.js, Supabase PostgreSQL with RLS, Supabase Storage, and Vercel.
        </p>
      </div>

      {/* Main Portals CTA Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Patient Intake Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Patient Intake Form</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Public-facing triage form allowing patients to describe complaints, choose urgency levels,
              and upload medical files (lab reports, scans, insurance) directly to the secure{' '}
              <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">patient-docs</code> bucket.
            </p>
            <ul className="space-y-2.5 text-sm text-slate-600 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Anonymous public submission via protected Supabase RLS</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Direct multi-file upload for PDF, PNG, JPG, and DICOM</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Instant automated case reference tracking number</span>
              </li>
            </ul>
          </div>
          <Link
            href="/intake"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow transition"
          >
            <span>Launch Patient Intake</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Coordinator Dashboard Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md">
              <LayoutDashboard className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Coordinator Dashboard</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Internal care coordination console powered by the server-side{' '}
              <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">service_role</code> key.
              Review patient complaints, inspect private documents via signed URLs, and update triage status.
            </p>
            <ul className="space-y-2.5 text-sm text-slate-600 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Filter by Urgency (Routine, Urgent, Critical, Emergency)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Secure time-limited signed download URLs for private documents</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Audit trail logging in <code className="text-xs font-mono">notification_log</code> table</span>
              </li>
            </ul>
          </div>
          <Link
            href="/coordinator"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow transition"
          >
            <span>Open Coordinator Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Architecture & Deployment Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-12">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          Zero-Cost Infrastructure Stack
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Supabase Free</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides 500MB PostgreSQL database, 1GB file storage, Row Level Security, and edge APIs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
              <CloudUpload className="w-4 h-4 text-blue-600" />
              <span>Vercel Hobby</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero-config automated CI/CD directly from GitHub with edge CDN and free live HTTPS domain.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>RLS + Service Role</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Public anon keys are restricted to inserts; server routes use private service role to manage cases securely.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>Capacitor Mobile</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Package the existing React UI into native iOS & Android binaries at zero additional code cost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
