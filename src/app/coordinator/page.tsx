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
} from 'lucide-react';
import { MedicalCase, CaseStatus, UrgencyLevel, NotificationLog } from '@/types/database';
import { formatDateTime, formatDateOnly } from '@/lib/utils';

export default function CoordinatorDashboardPage() {
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

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

  // Fetch Cases from API
  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (urgencyFilter !== 'all') params.set('urgency', urgencyFilter);
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
  }, [statusFilter, urgencyFilter, searchTerm]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Open Case Details Modal & Fetch associated notifications
  const handleSelectCase = async (c: MedicalCase) => {
    setSelectedCase(c);
    setEditStatus(c.status);
    setEditUrgency(c.urgency_level);
    setEditCoordinator(c.assigned_coordinator || '');
    setEditNotes(c.coordinator_notes || '');
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update case.');
      }

      setUpdateSuccessMsg('Case updated & notification logged successfully!');
      // Update local item
      setSelectedCase(data.case);
      // Refresh cases list
      fetchCases();

      // Refresh notification log
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
  const pendingCount = cases.filter((c) => c.status === 'submitted' || c.status === 'under_review').length;
  const criticalCount = cases.filter((c) => c.urgency_level === 'critical' || c.urgency_level === 'emergency').length;
  const resolvedCount = cases.filter((c) => c.status === 'resolved' || c.status === 'closed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Service Role Authorized
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Stethoscope className="w-7 h-7 text-blue-600" />
            Care Coordinator Triage Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Secure clinical review station bypassing Row Level Security via server credentials.
          </p>
        </div>

        <button
          onClick={fetchCases}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Cases</div>
          <div className="text-3xl font-black text-slate-900">{totalCount}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-500" /> Loaded from Supabase
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">Awaiting Review</div>
          <div className="text-3xl font-black text-amber-700">{pendingCount}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Needs coordinator action
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">Critical / Emergency</div>
          <div className="text-3xl font-black text-red-700">{criticalCount}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Immediate triage required
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Resolved / Closed</div>
          <div className="text-3xl font-black text-emerald-700">{resolvedCount}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completed workflow
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by case #, patient name, email, or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Urgency:</span>
          </div>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Urgencies</option>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
            <option value="emergency">Emergency</option>
          </select>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="action_required">Action Required</option>
            <option value="scheduled">Scheduled</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Cases List / Table */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold">Unable to fetch cases from Supabase</p>
            <p className="text-xs text-red-700 mt-0.5">{error}. Ensure your .env.local file has valid credentials and the schema is deployed.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
          <p className="text-sm font-medium">Querying Supabase database...</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No medical cases found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            There are no cases matching the selected filters. You can submit a test case via the patient intake form.
          </p>
          <Link
            href="/intake"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            Create Test Case
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Case #</th>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Complaint</th>
                  <th className="px-5 py-3 font-semibold">Urgency</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Submitted</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4 font-mono font-bold text-blue-600 text-xs">
                      {c.case_number}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{c.patient_name}</div>
                      <div className="text-xs text-slate-400">{c.patient_email}</div>
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate font-medium text-slate-800">
                      {c.chief_complaint}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          c.urgency_level === 'emergency'
                            ? 'bg-red-100 text-red-700'
                            : c.urgency_level === 'critical'
                            ? 'bg-amber-100 text-amber-800'
                            : c.urgency_level === 'urgent'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {c.urgency_level}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium capitalize ${
                          c.status === 'resolved' || c.status === 'closed'
                            ? 'bg-slate-100 text-slate-700'
                            : c.status === 'submitted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(c.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleSelectCase(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition"
                      >
                        Review
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Case Review Modal / Drawer */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {selectedCase.case_number}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                      selectedCase.urgency_level === 'emergency'
                        ? 'bg-red-100 text-red-700'
                        : selectedCase.urgency_level === 'critical'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedCase.urgency_level === 'urgent'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {selectedCase.urgency_level}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedCase.patient_name}</h2>
                <p className="text-xs text-slate-400">Submitted on {formatDateTime(selectedCase.created_at)}</p>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateSuccessMsg && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{updateSuccessMsg}</span>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column: Patient & Symptoms */}
              <div className="md:col-span-2 space-y-6">
                {/* Patient Profile Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Patient Demographics
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Email Address</span>
                      <span className="font-semibold text-slate-800">{selectedCase.patient_email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone</span>
                      <span className="font-semibold text-slate-800">{selectedCase.patient_phone || 'None provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Date of Birth</span>
                      <span className="font-semibold text-slate-800">{formatDateOnly(selectedCase.date_of_birth)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Gender</span>
                      <span className="font-semibold text-slate-800 capitalize">{selectedCase.gender || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Clinical Complaint */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Chief Complaint</h3>
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedCase.chief_complaint}
                  </p>

                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-4 mb-2">Detailed Symptoms & History</h3>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {selectedCase.symptoms_description || 'No extended symptom descriptions provided by patient.'}
                  </p>
                </div>

                {/* Uploaded Documents */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Attached Medical Documents ({selectedCase.documents?.length || 0})
                  </h3>
                  {!selectedCase.documents || selectedCase.documents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No attachments were uploaded with this case.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCase.documents.map((doc, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div className="truncate">
                              <span className="font-medium text-slate-800 block truncate">{doc.name}</span>
                              <span className="text-[10px] text-slate-400">{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleViewDocument(doc.path)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audit Trail / Notification Logs */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500" /> Automated Notification Audit Trail
                  </h3>
                  {loadingDetails ? (
                    <p className="text-xs text-slate-400 animate-pulse">Loading notification history...</p>
                  ) : caseNotifications.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No notifications logged for this case yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {caseNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 capitalize">
                              {notif.event_type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">{formatDateTime(notif.created_at)}</span>
                          </div>
                          <div className="text-slate-600 text-[11px]">{notif.message_body}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Recipient: {notif.recipient}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">Status: {notif.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Coordinator Actions */}
              <div className="space-y-6">
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-blue-400" /> Triage Control Panel
                  </h3>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Case Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as CaseStatus)}
                      className="w-full text-xs bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="action_required">Action Required</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={editUrgency}
                      onChange={(e) => setEditUrgency(e.target.value as UrgencyLevel)}
                      className="w-full text-xs bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Assigned Coordinator
                    </label>
                    <input
                      type="text"
                      value={editCoordinator}
                      onChange={(e) => setEditCoordinator(e.target.value)}
                      placeholder="e.g. Dr. Sarah Chen, RN"
                      className="w-full text-xs bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Internal Clinical Notes
                    </label>
                    <textarea
                      rows={5}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Record clinical observations, referral actions, or patient phone notes..."
                      className="w-full text-xs bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveUpdates}
                    disabled={savingUpdates}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition flex items-center justify-center gap-2"
                  >
                    {savingUpdates ? (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Case...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Triage Updates</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
