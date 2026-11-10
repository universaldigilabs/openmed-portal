'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Plane,
  Building2,
  FileBadge,
  ShieldCheck,
  CheckCircle2,
  Upload,
  AlertCircle,
  Clock,
  ArrowRight,
  FileText,
  User,
  HeartPulse,
  Sparkles,
  Car,
  Languages,
  Video,
  Trash2,
  DollarSign,
} from 'lucide-react';
import { supabaseClient } from '@/lib/supabase/client';
import { UrgencyLevel, Gender, DocumentAttachment } from '@/types/database';
import { DestinationCountry, MedicalSpecialty } from '@/types/medical-tourism';
import { useAuth } from '@/context/AuthContext';

function IntakeFormContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    date_of_birth: '',
    gender: 'prefer-not-to-say' as Gender,
    chief_complaint: '',
    symptoms_description: '',
    urgency_level: 'routine' as UrgencyLevel,

    // Medical Tourism Extensions
    procedure_specialty: 'Cardiac Surgery' as MedicalSpecialty | string,
    specific_procedure: '',
    destination_country: 'India' as DestinationCountry | string,
    target_timeline: 'Within 1 Month',
    patient_nationality: '',
    need_visa_assistance: true,
    need_airport_transfer: true,
    need_hotel_booking: true,
    need_translator: false,
    need_second_opinion: false,
  });

  // Pre-fill from query params and user profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        patient_name: prev.patient_name || user.fullName || '',
        patient_email: prev.patient_email || user.email || '',
      }));
    }

    const qSpecialty = searchParams.get('specialty');
    const qProcedure = searchParams.get('procedure');
    const qCountry = searchParams.get('country');
    const qHospital = searchParams.get('hospital');
    const qSecondOpinion = searchParams.get('second_opinion');
    const qDoctor = searchParams.get('doctor');
    const qService = searchParams.get('service');

    setFormData((prev) => ({
      ...prev,
      procedure_specialty: qSpecialty || prev.procedure_specialty,
      specific_procedure: qProcedure || (qHospital ? `Treatment at ${qHospital}` : prev.specific_procedure),
      destination_country: qCountry || prev.destination_country,
      need_second_opinion: qSecondOpinion === 'true' || Boolean(qDoctor) || prev.need_second_opinion,
      need_visa_assistance: qService === 'visa' || prev.need_visa_assistance,
      need_airport_transfer: qService === 'airport' || prev.need_airport_transfer,
      need_hotel_booking: qService === 'hotel' || prev.need_hotel_booking,
      need_translator: qService === 'translator' || prev.need_translator,
      chief_complaint: qDoctor
        ? `Requesting remote second opinion consultation with ${qDoctor} for ${qSpecialty || 'treatment'}.`
        : qHospital
        ? `Inquiry for medical treatment and quote at ${qHospital}.`
        : prev.chief_complaint,
    }));
  }, [searchParams, user]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedCase, setSubmittedCase] = useState<{
    case_number: string;
    patient_name: string;
    urgency_level: string;
    created_at: string;
    destination_country: string;
    procedure_specialty: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter((file) => {
        if (file.size > 20 * 1024 * 1024) {
          alert(`File "${file.name}" exceeds the 20MB limit and was removed.`);
          return false;
        }
        return true;
      });
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.patient_name.trim() || !formData.patient_email.trim() || !formData.chief_complaint.trim()) {
      setErrorMessage('Please provide your full name, email address, and medical inquiry details.');
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('Uploading medical diagnostic records...');

    const uploadedDocuments: DocumentAttachment[] = [];

    // Attempt file uploads to Supabase Storage if configured
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        try {
          const fileExt = file.name.split('.').pop();
          const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `cases/${Date.now()}_${cleanName}`;

          const { data, error } = await supabaseClient.storage
            .from('patient-docs')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (!error && data) {
            uploadedDocuments.push({
              name: file.name,
              path: data.path,
              size: file.size,
              type: file.type || `application/${fileExt}`,
              uploaded_at: new Date().toISOString(),
            });
          } else {
            // Local fallback simulation
            uploadedDocuments.push({
              name: file.name,
              path: `local_storage/${file.name}`,
              size: file.size,
              type: file.type,
              uploaded_at: new Date().toISOString(),
            });
          }
        } catch {
          uploadedDocuments.push({
            name: file.name,
            path: `local_storage/${file.name}`,
            size: file.size,
            type: file.type,
            uploaded_at: new Date().toISOString(),
          });
        }
      }
    }

    setUploadStatus('Submitting medical tourism case to JCI coordinator network...');

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          documents: uploadedDocuments,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit case.');
      }

      setSubmittedCase({
        case_number: result.case.case_number,
        patient_name: result.case.patient_name,
        urgency_level: result.case.urgency_level,
        created_at: result.case.created_at,
        destination_country: formData.destination_country,
        procedure_specialty: formData.procedure_specialty,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during submission.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  };

  // SUCCESS STATE
  if (submittedCase) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl max-w-2xl w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
            Inquiry Successfully Registered
          </span>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Case {submittedCase.case_number} Received!
          </h2>

          <p className="mt-3 text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
            Thank you, <strong className="text-slate-900">{submittedCase.patient_name}</strong>. Our international medical travel coordinators are reviewing your diagnostic files and matching you with accredited hospitals in{' '}
            <strong className="text-blue-700 font-bold">{submittedCase.destination_country}</strong> for{' '}
            <strong className="text-slate-900">{submittedCase.procedure_specialty}</strong>.
          </p>

          <div className="my-8 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Tracking Reference:</span>
              <span className="font-mono font-bold text-blue-700 text-sm">{submittedCase.case_number}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Destination Preference:</span>
              <span className="font-semibold text-slate-800">{submittedCase.destination_country}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Medical Specialty:</span>
              <span className="font-semibold text-slate-800">{submittedCase.procedure_specialty}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Next Action:</span>
              <span className="font-semibold text-emerald-700">Official Hospital Quote & Visa Letter within 24–48 Hours</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/coordinator"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              <span>View Case in Coordinator Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => {
                setSubmittedCase(null);
                setSelectedFiles([]);
              }}
              className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
            >
              Submit Another Inquiry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Plane className="w-4 h-4 text-blue-600" />
            Direct Treatment Quotes & Visa Facilitation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Request an Accredited Hospital Treatment Quote
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Fill in your medical details and upload existing scans or reports. Our medical tourism team will obtain itemized cost estimates from JCI/NABH hospitals in your chosen destination.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <div>
              <span className="font-bold">Submission Error:</span> {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Procedure & Destination */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Treatment & Destination Preference</h3>
                <p className="text-xs text-slate-500">What procedure do you need and where do you wish to travel?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Medical Specialty <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.procedure_specialty}
                  onChange={(e) => setFormData({ ...formData, procedure_specialty: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="Cardiac Surgery">Cardiac Surgery (Bypass, Valves, Stents)</option>
                  <option value="Orthopedics & Joint Replacement">Orthopedics (Knee, Hip, Shoulder)</option>
                  <option value="Oncology & Cancer Care">Oncology (Chemo, CyberKnife, Surgery)</option>
                  <option value="Cosmetic & Plastic Surgery">Cosmetic (Rhinoplasty, Liposuction, Facelift)</option>
                  <option value="IVF & Fertility">IVF & Assisted Reproduction</option>
                  <option value="Organ Transplant">Organ Transplant (Liver, Kidney, BMT)</option>
                  <option value="Dental Surgery & Implants">Dental Surgery & All-on-4 Implants</option>
                  <option value="Neuro & Spine Surgery">Neuro & Spine Surgery</option>
                  <option value="Ophthalmology & Eye Surgery">Ophthalmology & LASIK</option>
                  <option value="Ayurveda & Holistic Wellness">Ayurveda & Holistic Wellness</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferred Destination Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.destination_country}
                  onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="India">🇮🇳 India (Heal In India — JCI & NABH Hubs)</option>
                  <option value="Thailand">🇹🇭 Thailand (Bangkok, Phuket)</option>
                  <option value="Turkey">🇹🇷 Turkey (Istanbul, Antalya)</option>
                  <option value="Singapore">🇸🇬 Singapore (Gleneagles, Mount Elizabeth)</option>
                  <option value="Spain">🇪🇸 Spain (Madrid, Barcelona)</option>
                  <option value="United Arab Emirates">🇦🇪 UAE (Abu Dhabi, Dubai)</option>
                  <option value="Mexico">🇲🇽 Mexico (Mexico City, Tijuana, Cancun)</option>
                  <option value="Any Destination">🌍 Any Destination (Recommend Best Value)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Specific Procedure (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Off-Pump CABG, Robotic Total Knee, All-on-4"
                  value={formData.specific_procedure}
                  onChange={(e) => setFormData({ ...formData, specific_procedure: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Travel Timeline
                </label>
                <select
                  value={formData.target_timeline}
                  onChange={(e) => setFormData({ ...formData, target_timeline: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="Immediate (< 2 Weeks)">⚡ Immediate (&lt; 2 Weeks) — Urgent Triage</option>
                  <option value="Within 1 Month">Within 1 Month</option>
                  <option value="In 2 to 3 Months">In 2 to 3 Months</option>
                  <option value="Flexible / Exploring Options">Flexible / Exploring Options</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Patient Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Patient & Passport Profile</h3>
                <p className="text-xs text-slate-500">Essential for hospital record creation and visa invitation generation.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Patient Full Name (As in Passport) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David MacLeod"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. david.macleod@example.com"
                  value={formData.patient_email}
                  onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone / WhatsApp (With Country Code)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +44 7911 123456"
                  value={formData.patient_phone}
                  onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nationality / Passport Country
                </label>
                <input
                  type="text"
                  placeholder="e.g. British, American, Canadian, Nigerian, Emirati"
                  value={formData.patient_nationality}
                  onChange={(e) => setFormData({ ...formData, patient_nationality: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-Binary</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer Not to Say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Condition & Scans */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Diagnosis & Diagnostic Records</h3>
                <p className="text-xs text-slate-500">Share your clinical summary so surgeons can determine treatment feasibility.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Chief Medical Complaint / Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Severe Knee Osteoarthritis Grade IV, or Triple Vessel Heart Blockage"
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Symptoms & Medical History Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your current symptoms, previous surgeries, medications, or specific questions for the specialist..."
                  value={formData.symptoms_description}
                  onChange={(e) => setFormData({ ...formData, symptoms_description: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Document Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Upload Scans / Reports (MRI, CT, Angiogram, Biopsy, Blood Work)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.dicom"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    Click or drag & drop diagnostic reports here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports PDF, DICOM, JPEG, PNG (Up to 20MB per file)
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                          <span className="text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-slate-400 hover:text-red-600 transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: End-to-End Travel Coordination Assistance */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">End-to-End Travel Concierge Services</h3>
                <p className="text-xs text-slate-500">Select any complimentary or coordinated travel assistance you need.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition">
                <input
                  type="checkbox"
                  checked={formData.need_visa_assistance}
                  onChange={(e) => setFormData({ ...formData, need_visa_assistance: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileBadge className="w-3.5 h-3.5 text-blue-600" /> Medical Visa (e-Med) Invitation
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Official embassy letter for patient + up to 2 companions.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition">
                <input
                  type="checkbox"
                  checked={formData.need_airport_transfer}
                  onChange={(e) => setFormData({ ...formData, need_airport_transfer: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-emerald-600" /> VIP Airport Pickup / Transfer
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Complimentary private chauffeur direct to hospital.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition">
                <input
                  type="checkbox"
                  checked={formData.need_hotel_booking}
                  onChange={(e) => setFormData({ ...formData, need_hotel_booking: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" /> Companion Hotel Booking
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Discounted 4-star or serviced apartment near hospital.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition">
                <input
                  type="checkbox"
                  checked={formData.need_translator}
                  onChange={(e) => setFormData({ ...formData, need_translator: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-rose-600" /> Dedicated Language Interpreter
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Arabic, Russian, French, Spanish, Swahili, etc.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition sm:col-span-2">
                <input
                  type="checkbox"
                  checked={formData.need_second_opinion}
                  onChange={(e) => setFormData({ ...formData, need_second_opinion: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-indigo-600" /> Pre-Travel Specialist Second Opinion Video Consultation
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">30-min live video call with operating surgeon before booking flights (credited back upon surgery).</div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition duration-200 flex items-center justify-center gap-2 mx-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{uploadStatus || 'Processing Inquiry...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Request Free Hospital Treatment Quotes & Travel Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 mt-3">
              🔒 100% Free & No Obligation. Protected by Supabase Row-Level Security. JCI response within 24h.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PatientIntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading intake portal...</div>}>
      <IntakeFormContent />
    </Suspense>
  );
}
