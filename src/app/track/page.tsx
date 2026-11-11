'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  SearchCheck,
  Search,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  FileBadge,
  BedDouble,
  CreditCard,
  Car,
  Languages,
  Video,
  DollarSign,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import { MedicalCase } from '@/types/database';
import { formatDateTime } from '@/lib/utils';

const STATUS_STAGES = [
  { key: 'submitted', label: 'Inquiry Received', desc: 'Medical records logged' },
  { key: 'under_review', label: 'Medical Review', desc: 'Specialists evaluating scans' },
  { key: 'quote_prepared', label: 'Hospital Quote Ready', desc: 'Package cost confirmed' },
  { key: 'visa_processing', label: 'Visa & Travel Sync', desc: 'e-Visa & hotel coordination' },
  { key: 'scheduled', label: 'Treatment Scheduled', desc: 'Admission & pickup confirmed' },
];

function getStageIndex(status: string): number {
  const idx = STATUS_STAGES.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function CaseTrackerContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('case') || '';

  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [trackedCase, setTrackedCase] = useState<MedicalCase | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performLookup = async (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) {
      setErrorMsg('Please enter a Case Reference (e.g. MC-1008) or your Email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setTrackedCase(null);

    try {
      const res = await fetch(`/api/cases?search=${encodeURIComponent(clean)}`);
      const data = await res.json();
      const cases: MedicalCase[] = data.cases || [];

      if (cases.length === 0) {
        setErrorMsg(`No inquiry found matching "${clean}". Please verify your case reference or email.`);
      } else {
        // Prefer exact match on case_number if present
        const exact = cases.find(
          (c) =>
            c.case_number?.toLowerCase() === clean.toLowerCase() ||
            c.patient_email?.toLowerCase() === clean.toLowerCase()
        );
        setTrackedCase(exact || cases[0]);
      }
    } catch {
      setErrorMsg('Unable to reach the case tracking server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performLookup(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(query);
  };

  const activeStageIndex = trackedCase ? getStageIndex(trackedCase.status) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <SearchCheck className="w-4 h-4 text-blue-600" />
            Real-Time Patient Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Track Your Medical Travel Case
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Check the live status of your specialist second opinion, verified hospital treatment quote, medical visa invitation letter, and hotel concierge arrangements.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Case Reference (e.g. MC-1008) or Patient Email..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/40"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Track Status</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Test Shortcuts */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold">Quick Sample Lookups:</span>
            {['MC-1008', 'MC-1007', 'MC-1004'].map((ref) => (
              <button
                key={ref}
                type="button"
                onClick={() => {
                  setQuery(ref);
                  performLookup(ref);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-mono font-bold text-slate-700 border border-slate-200 transition-colors"
              >
                {ref}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 mb-8 flex items-center gap-3 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tracked Case Result Card */}
        {trackedCase && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Case Header & Progress Stepper */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-lg font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                      {trackedCase.case_number}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {trackedCase.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-3">
                    {trackedCase.patient_name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submitted on {formatDateTime(trackedCase.created_at)}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left sm:text-right">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Treatment & Hub
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {trackedCase.procedure_specialty || trackedCase.travel_preferences?.procedure_specialty || 'Specialist Care'}
                  </div>
                  <div className="text-xs font-semibold text-blue-600 flex items-center sm:justify-end gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{trackedCase.destination_country || trackedCase.travel_preferences?.destination_country || 'India'}</span>
                  </div>
                </div>
              </div>

              {/* 5-Step Progress Bar */}
              <div className="mb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Live Coordination Progress
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {STATUS_STAGES.map((stage, idx) => {
                    const completed = idx <= activeStageIndex;
                    const current = idx === activeStageIndex;
                    return (
                      <div
                        key={stage.key}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          current
                            ? 'bg-blue-50 border-blue-300 shadow-sm'
                            : completed
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                              current
                                ? 'bg-blue-600 text-white'
                                : completed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {completed && !current ? '✓' : idx + 1}
                          </span>
                          {current && (
                            <span className="text-[10px] font-bold text-blue-700 uppercase">Active</span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">{stage.label}</div>
                        <div className="text-[10px] text-slate-500 mt-1 leading-snug">{stage.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hospital Quote & Coordinator Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Official Hospital Quote & Plan
                </h3>
                {trackedCase.quoted_hospital || trackedCase.estimated_cost_usd ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                        Verified Partner Hospital
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-0.5">
                        {trackedCase.quoted_hospital || 'Matched Accredited Hospital'}
                      </div>
                      {trackedCase.estimated_cost_usd && (
                        <div className="mt-2 flex items-center gap-1.5 text-lg font-black text-emerald-700">
                          <DollarSign className="w-5 h-5" />
                          <span>${trackedCase.estimated_cost_usd.toLocaleString()} USD</span>
                          <span className="text-xs font-semibold text-emerald-600 ml-1">(Est. All-Inclusive)</span>
                        </div>
                      )}
                    </div>
                    {trackedCase.assigned_coordinator && (
                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        <span>
                          Care Coordinator: <strong className="text-slate-900">{trackedCase.assigned_coordinator}</strong>
                        </span>
                      </div>
                    )}
                    {trackedCase.coordinator_notes && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <strong className="block text-slate-900 mb-1">Coordinator Remarks:</strong>
                        {trackedCase.coordinator_notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-sm font-bold text-slate-800">Medical Review in Progress</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Our clinical coordinators are compiling comparative quotes from JCI/NABH-accredited hospitals. Expected within 24 hours.
                    </p>
                  </div>
                )}
              </div>

              {/* Concierge & Travel Checklist */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Requested Concierge & Travel Support
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <BedDouble className="w-4 h-4 text-indigo-600" />
                      <span>Hotel & Recovery Stay</span>
                    </div>
                    {trackedCase.travel_preferences?.need_hotel_booking ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                        Active ({trackedCase.travel_preferences.accommodation_type?.replace(/_/g, ' ') || 'Confirmed'})
                      </span>
                    ) : (
                      <span className="text-slate-400">Not requested</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <FileBadge className="w-4 h-4 text-emerald-600" />
                      <span>Medical Visa & Invitation Letter</span>
                    </div>
                    {trackedCase.travel_preferences?.need_visa_assistance ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Active ({trackedCase.travel_preferences.visa_attendants_count || 1} Attendant)
                      </span>
                    ) : (
                      <span className="text-slate-400">Not requested</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      <span>Health Insurance / Cashless TPA</span>
                    </div>
                    {trackedCase.travel_preferences?.need_insurance_assistance ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                        {trackedCase.travel_preferences.insurance_provider || 'TPA Active'}
                      </span>
                    ) : (
                      <span className="text-slate-400">Self-Pay</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <Car className="w-4 h-4 text-blue-600" />
                      <span>VIP Airport Pickup</span>
                    </div>
                    {trackedCase.travel_preferences?.need_airport_transfer ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">Included</span>
                    ) : (
                      <span className="text-slate-400">Not requested</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <Video className="w-4 h-4 text-purple-600" />
                      <span>Remote Second Opinion</span>
                    </div>
                    {trackedCase.travel_preferences?.need_second_opinion ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">Scheduled</span>
                    ) : (
                      <span className="text-slate-400">Standard Quote</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="text-center pt-4">
              <Link
                href="/travel-services"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                <span>View Visa Checklists, Hotel Partner Tiers & Insurance Guides</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackCasePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-slate-500 text-sm font-semibold">Loading Patient Case Tracker...</div>
        </div>
      }
    >
      <CaseTrackerContent />
    </Suspense>
  );
}
