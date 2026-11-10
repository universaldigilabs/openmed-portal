'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  X,
  Mail,
  User,
  Phone,
  Calendar,
  Save,
  Shield,
  Layers,
  ArrowLeft,
  AlertCircle,
  Lock,
  LogIn,
  Plane,
  Building2,
  FileBadge,
  Car,
  Languages,
  Video,
  DollarSign,
  Globe2,
  BedDouble,
  CreditCard,
  Users,
  UploadCloud,
} from 'lucide-react';
import { MedicalCase, CaseStatus, UrgencyLevel, NotificationLog } from '@/types/database';
import { formatDateTime, formatDateOnly } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function CoordinatorDashboardPage() {
  const { user, loading: authLoading, quickLogin } = useAuth();
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [assistanceFilter, setAssistanceFilter] = useState('all');

  // Selected Case for Review Modal / Drawer
  const [selectedCase, setSelectedCase] = useState<MedicalCase | null>(null);
  const [caseNotifications, setCaseNotifications] = useState<NotificationLog[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [savingUpdates, setSavingUpdates] = useState(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);

  // Form states inside modal
  const [editStatus, setEditStatus] = useState<CaseStatus>('submitted');
  const [editUrgency, setEditUrgency] = useState<UrgencyLevel>('routine');
  const [editCoordinator, setEditCoordinator] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editQuotedHospital, setEditQuotedHospital] = useState('');
  const [editEstimatedCost, setEditEstimatedCost] = useState('');

  // Fetch Cases from API
  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (urgencyFilter !== 'all') params.set('urgency', urgencyFilter);
      if (countryFilter !== 'all') params.set('country', countryFilter);
      if (specialtyFilter !== 'all') params.set('specialty', specialtyFilter);
      if (assistanceFilter !== 'all') params.set('assistance', assistanceFilter);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const res = await fetch(`/api/cases?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch medical cases.');
      }

      setCases(data.cases || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching cases';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, urgencyFilter, countryFilter, specialtyFilter, assistanceFilter, searchTerm]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Open Case Details Modal & Fetch associated notifications
  const handleSelectCase = async (c: MedicalCase) => {
    setSelectedCase(c);
    setEditStatus(c.status);
    setEditUrgency(c.urgency_level);
    setEditCoordinator(c.assigned_coordinator || user?.fullName || 'International Coordinator');
    setEditNotes(c.coordinator_notes || '');
    setEditQuotedHospital(c.quoted_hospital || '');
    setEditEstimatedCost(c.estimated_cost_usd ? String(c.estimated_cost_usd) : '');
    setUpdateSuccessMsg(null);
    setLoadingDetails(true);

    try {
      const res = await fetch(`/api/cases/${c.id}`);
      const data = await res.json();
      if (res.ok && data.notifications) {
        setCaseNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('Error fetching case notifications:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Save Case Updates (PATCH API)
  const handleSaveUpdates = async () => {
    if (!selectedCase) return;
    setSavingUpdates(true);
    setUpdateSuccessMsg(null);

    try {
      const res = await fetch(`/api/cases/${selectedCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          urgency_level: editUrgency,
          assigned_coordinator: editCoordinator,
          coordinator_notes: editNotes,
          quoted_hospital: editQuotedHospital || null,
          estimated_cost_usd: editEstimatedCost ? parseFloat(editEstimatedCost) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update case.');
      }

      setUpdateSuccessMsg('Case, hospital quote & travel plan updated successfully!');
      setSelectedCase(data.case);
      fetchCases();

      const notifRes = await fetch(`/api/cases/${selectedCase.id}`);
      const notifData = await notifRes.json();
      if (notifData.notifications) {
        setCaseNotifications(notifData.notifications);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving updates';
      alert(msg);
    } finally {
      setSavingUpdates(false);
    }
  };

  // Generate Signed Storage URL for secure document viewing
  const handleViewDocument = async (filePath: string) => {
    try {
      const res = await fetch('/api/documents/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath }),
      });
      const data = await res.json();
      if (res.ok && data.signedUrl) {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert(data.error || 'Could not generate signed access URL.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to obtain secure file access URL.');
    }
  };

  // Metrics Counters
  const totalCount = cases.length;
  const hotelCount = cases.filter((c) => c.travel_preferences?.need_hotel_booking).length;
  const visaCount = cases.filter((c) => c.travel_preferences?.need_visa_assistance).length;
  const insuranceCount = cases.filter((c) => c.travel_preferences?.need_insurance_assistance).length;

  // Authentication Gate
  if (!authLoading && !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Staff Authentication Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto mb-8">
            Access to the Med Vantage Care Coordinator & Travel Concierge Console is restricted to authorized medical facilitators. Please sign in to manage patient cases.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login?redirect=/coordinator"
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition inline-flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Staff Console</span>
            </Link>
            <button
              onClick={() => quickLogin('coordinator')}
              className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition inline-flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Demo Staff Access</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                International Patient Facilitation
              </span>
              <span className="text-xs text-slate-400">• JCI / NABH Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
              <span>Medical Tourism Coordinator Console</span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/hospitals/upload"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
              title="Upload & Sync Hospitals Database"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload Hospitals</span>
            </Link>
            <button
              onClick={fetchCases}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
              title="Refresh Cases"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/intake"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition"
            >
              <span>+ New Patient Inquiry</span>
            </Link>
          </div>
        </div>

        {/* Metrics Row (Total, Hotel, Visa, Insurance) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Total Inquiries</span>
              <Plane className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Active international patients</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Hotel / Lodging Needed</span>
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-600">{hotelCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Serviced apartments / hotels</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Medical Visa Needed</span>
              <FileBadge className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-600">{visaCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Hospital invitation required</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Health Insurance / TPA</span>
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{insuranceCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Cashless TPA / claim assist</div>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, case #, procedure, insurance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Assistance Filter (Hotel, Visa, Insurance) */}
            <div>
              <select
                value={assistanceFilter}
                onChange={(e) => setAssistanceFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Concierge Needs</option>
                <option value="hotel">🏨 Needs Hotel / Lodging</option>
                <option value="visa">🛂 Needs Medical Visa</option>
                <option value="insurance">🛡️ Needs Health Insurance / TPA</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Case Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="quote_prepared">Quote Prepared</option>
                <option value="visa_processing">Visa Processing</option>
                <option value="scheduled">Scheduled / Booked</option>
                <option value="resolved">Resolved / Discharged</option>
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Destinations</option>
                <option value="India">🇮🇳 India</option>
                <option value="Thailand">🇹🇭 Thailand</option>
                <option value="Turkey">🇹🇷 Turkey</option>
                <option value="Singapore">🇸🇬 Singapore</option>
                <option value="Spain">🇪🇸 Spain</option>
                <option value="United Arab Emirates">🇦🇪 UAE</option>
                <option value="Mexico">🇲🇽 Mexico</option>
              </select>
            </div>

            {/* Specialty Filter */}
            <div>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Specialties</option>
                <option value="Cardiac Surgery">Cardiac Surgery</option>
                <option value="Orthopedics & Joint Replacement">Orthopedics</option>
                <option value="Oncology & Cancer Care">Oncology</option>
                <option value="Cosmetic & Plastic Surgery">Cosmetic</option>
                <option value="Dental Surgery & Implants">Dental</option>
                <option value="IVF & Fertility">IVF</option>
                <option value="Organ Transplant">Transplant</option>
                <option value="Neuro & Spine Surgery">Spine</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-12">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading patient cases...</div>
          ) : error ? (
            <div className="p-8 text-center text-xs text-red-600">{error}</div>
          ) : cases.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No cases matching the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Case #</th>
                    <th className="py-3.5 px-4">Patient / Nationality</th>
                    <th className="py-3.5 px-4">Specialty & Diagnosis</th>
                    <th className="py-3.5 px-4">Destination</th>
                    <th className="py-3.5 px-4">Quote / Hospital</th>
                    <th className="py-3.5 px-4">Hotel / Visa / Insurance</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map((c) => {
                    const countryFlag =
                      c.destination_country === 'India'
                        ? '🇮🇳'
                        : c.destination_country === 'Thailand'
                        ? '🇹🇭'
                        : c.destination_country === 'Turkey'
                        ? '🇹🇷'
                        : c.destination_country === 'Singapore'
                        ? '🇸🇬'
                        : c.destination_country === 'Spain'
                        ? '🇪🇸'
                        : c.destination_country === 'United Arab Emirates'
                        ? '🇦🇪'
                        : c.destination_country === 'Mexico'
                        ? '🇲🇽'
                        : '🌍';

                    return (
                      <tr key={c.id} className="hover:bg-blue-50/40 transition">
                        {/* Case Number */}
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {c.case_number}
                          <div className="text-[10px] text-slate-400 font-sans font-normal">
                            {formatDateOnly(c.created_at)}
                          </div>
                        </td>

                        {/* Patient */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{c.patient_name}</div>
                          <div className="text-[11px] text-slate-500">{c.patient_email}</div>
                          {c.travel_preferences?.patient_nationality && (
                            <span className="text-[10px] text-slate-400">
                              Nationality: {c.travel_preferences.patient_nationality}
                            </span>
                          )}
                        </td>

                        {/* Specialty & Diagnosis */}
                        <td className="py-3.5 px-4 max-w-[220px]">
                          <div className="font-semibold text-slate-800">
                            {c.procedure_specialty || 'General Inquiry'}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate" title={c.chief_complaint}>
                            {c.chief_complaint}
                          </div>
                        </td>

                        {/* Destination */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                            <span>{countryFlag}</span>
                            <span>{c.destination_country || 'Any'}</span>
                          </div>
                        </td>

                        {/* Quoted Hospital */}
                        <td className="py-3.5 px-4">
                          {c.quoted_hospital ? (
                            <div>
                              <div className="font-bold text-slate-900 truncate max-w-[150px]">
                                {c.quoted_hospital}
                              </div>
                              <div className="text-[11px] font-extrabold text-emerald-700">
                                {c.estimated_cost_usd ? `$${c.estimated_cost_usd.toLocaleString()} USD` : 'Pending'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not Quoted Yet</span>
                          )}
                        </td>

                        {/* Travel, Hotel, Visa & Insurance Pills */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {c.travel_preferences?.need_hotel_booking && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center gap-0.5" title="Hotel / Accommodation Needed">
                                <Building2 className="w-2.5 h-2.5" /> Hotel
                              </span>
                            )}
                            {c.travel_preferences?.need_visa_assistance && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center gap-0.5" title="e-Medical Visa Invitation Needed">
                                <FileBadge className="w-2.5 h-2.5" /> Visa
                              </span>
                            )}
                            {c.travel_preferences?.need_insurance_assistance && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-0.5" title="Health Insurance / Cashless Claim Needed">
                                <Shield className="w-2.5 h-2.5" /> Insurance
                              </span>
                            )}
                            {c.travel_preferences?.need_airport_transfer && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]" title="Airport Transfer">
                                Car
                              </span>
                            )}
                            {c.travel_preferences?.need_translator && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px]" title="Language Interpreter">
                                Lang
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-[11px] font-bold capitalize ${
                              c.status === 'quote_prepared'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'visa_processing'
                                ? 'bg-amber-100 text-amber-800'
                                : c.status === 'scheduled'
                                ? 'bg-indigo-100 text-indigo-800'
                                : c.status === 'under_review'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.status.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleSelectCase(c)}
                            className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition inline-flex items-center gap-1"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Case Review Drawer / Modal */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                      Case #{selectedCase.case_number}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      {selectedCase.patient_name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Inquiry received on {formatDateTime(selectedCase.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>

                {updateSuccessMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    ✓ {updateSuccessMsg}
                  </div>
                )}

                {/* Patient Summary */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block">Email:</span>
                      <span className="font-semibold text-slate-800">{selectedCase.patient_email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone / WhatsApp:</span>
                      <span className="font-semibold text-slate-800">{selectedCase.patient_phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Destination Country:</span>
                      <span className="font-bold text-blue-700">{selectedCase.destination_country || 'Any'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Specialty / Procedure:</span>
                      <span className="font-bold text-slate-800">{selectedCase.procedure_specialty}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block font-medium">Chief Complaint:</span>
                    <p className="text-slate-800 mt-0.5">{selectedCase.chief_complaint}</p>
                  </div>

                  {selectedCase.symptoms_description && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block font-medium">Symptoms / History:</span>
                      <p className="text-slate-600 mt-0.5">{selectedCase.symptoms_description}</p>
                    </div>
                  )}
                </div>

                {/* Specific Hotel, Visa & Health Insurance Assistance Breakdown */}
                <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Hotel, Visa & Health Insurance Coordination</span>
                    <Plane className="w-3.5 h-3.5 text-blue-600" />
                  </h4>

                  {/* 1. Hotel Assistance Detail */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-purple-600" /> Hotel / Accommodation:
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${selectedCase.travel_preferences?.need_hotel_booking ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedCase.travel_preferences?.need_hotel_booking ? 'Assistance Requested' : 'Not Requested'}
                      </span>
                    </div>
                    {selectedCase.travel_preferences?.need_hotel_booking ? (
                      <div className="text-slate-600 text-[11px] space-y-0.5">
                        <div>Tier: <strong className="text-slate-800 capitalize">{selectedCase.travel_preferences.accommodation_type?.replace(/_/g, ' ') || 'Serviced Family Apartment'}</strong></div>
                        <div>Guests / Attendants: <strong className="text-slate-800">{selectedCase.travel_preferences.companion_count || '1'} companion(s)</strong></div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">Patient arranging own lodging or hospital inpatient room only.</div>
                    )}
                  </div>

                  {/* 2. Medical Visa Assistance Detail */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <FileBadge className="w-3.5 h-3.5 text-blue-600" /> Medical Visa (e-Visa):
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${selectedCase.travel_preferences?.need_visa_assistance ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedCase.travel_preferences?.need_visa_assistance ? 'Visa Letters Required' : 'Not Needed'}
                      </span>
                    </div>
                    {selectedCase.travel_preferences?.need_visa_assistance ? (
                      <div className="text-slate-600 text-[11px]">
                        Hospital invitation letters needed for: <strong className="text-slate-800">{selectedCase.travel_preferences.visa_attendants_count || '1'} person(s)</strong> (Patient + Attendants).
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">Visa exemption or patient already holds valid visa.</div>
                    )}
                  </div>

                  {/* 3. Health Insurance Assistance Detail */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" /> Health Insurance & TPA:
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${selectedCase.travel_preferences?.need_insurance_assistance ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedCase.travel_preferences?.need_insurance_assistance ? 'Insurance Assist Needed' : 'Self-Pay / Not Requested'}
                      </span>
                    </div>
                    {selectedCase.travel_preferences?.need_insurance_assistance ? (
                      <div className="text-slate-600 text-[11px] space-y-0.5">
                        <div>Type: <strong className="text-slate-800 capitalize">{selectedCase.travel_preferences.insurance_type?.replace(/_/g, ' ') || 'International Cashless Claim'}</strong></div>
                        {selectedCase.travel_preferences.insurance_provider && (
                          <div>Provider: <strong className="text-emerald-700">{selectedCase.travel_preferences.insurance_provider}</strong></div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">Direct hospital cash/wire settlement.</div>
                    )}
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Diagnostic Reports & Imaging ({selectedCase.documents?.length || 0})
                  </h4>
                  {(!selectedCase.documents || selectedCase.documents.length === 0) ? (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-400 text-center italic">
                      No files uploaded with this inquiry.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedCase.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                          </div>
                          <button
                            onClick={() => handleViewDocument(doc.path)}
                            className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hospital Quote & Status Controls */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Hospital Quote & Coordinator Actions
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Case Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as CaseStatus)}
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="quote_prepared">Quote Prepared</option>
                        <option value="visa_processing">Visa Processing</option>
                        <option value="scheduled">Scheduled / Booked</option>
                        <option value="resolved">Resolved / Discharged</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Urgency Tier
                      </label>
                      <select
                        value={editUrgency}
                        onChange={(e) => setEditUrgency(e.target.value as UrgencyLevel)}
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent (&lt; 2 Weeks)</option>
                        <option value="critical">Critical</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Quoted Accredited Hospital
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Apollo Chennai or Bumrungrad"
                        value={editQuotedHospital}
                        onChange={(e) => setEditQuotedHospital(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Package Estimate (USD $)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 5500"
                        value={editEstimatedCost}
                        onChange={(e) => setEditEstimatedCost(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Coordinator Internal Notes / Treatment Plan
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Add notes about hospital physician feedback, visa invitation issue date, or patient calls..."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <button
                    onClick={handleSaveUpdates}
                    disabled={savingUpdates}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingUpdates ? 'Saving...' : 'Save Hospital Quote & Case Updates'}</span>
                  </button>
                </div>

                {/* Audit & Notification Trail */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Notification & Audit Trail
                  </h4>
                  {caseNotifications.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-400 italic text-center">
                      No automated notification events logged yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {caseNotifications.map((notif) => (
                        <div key={notif.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>{notif.subject || notif.event_type}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {formatDateTime(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{notif.message_body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Drawer Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Med Vantage International Care Platform</span>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
