'use client';

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileSpreadsheet,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  Search,
  ArrowLeft,
  ShieldCheck,
  Globe,
  Database,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Hospital, DestinationCountry, MedicalSpecialty, AccreditationType } from '@/types/medical-tourism';

const AVAILABLE_COUNTRIES: DestinationCountry[] = [
  'India',
  'Thailand',
  'Turkey',
  'Singapore',
  'Spain',
  'United Arab Emirates',
  'Mexico',
];

const AVAILABLE_SPECIALTIES: MedicalSpecialty[] = [
  'Cardiac Surgery',
  'Orthopedics & Joint Replacement',
  'Oncology & Cancer Care',
  'Cosmetic & Plastic Surgery',
  'IVF & Fertility',
  'Organ Transplant',
  'Dental Surgery & Implants',
  'Neuro & Spine Surgery',
  'Ophthalmology & Eye Surgery',
  'Ayurveda & Holistic Wellness',
];

const AVAILABLE_ACCREDITATIONS: AccreditationType[] = [
  'JCI',
  'NABH',
  'ISO 9001',
  'AACI',
  'TEMOS',
  'MTQUA',
];

const POPULAR_INDIAN_CITIES = [
  'Chennai',
  'New Delhi',
  'Gurgaon',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
  'Kolkata',
  'Ahmedabad',
  'Kochi',
  'Pune',
];

const SAMPLE_CSV = `name,city,country,accreditations,specialties,bed_count,established_year,starting_price,tagline,description,doctor_name,doctor_role
"Max Super Speciality Hospital Saket","New Delhi","India","JCI,NABH","Cardiac Surgery,Oncology & Cancer Care",530,2001,"$3,800","Pioneering Quaternary Care in North India","Leading institute renowned for heart transplants, CyberKnife, and Da Vinci robotic surgery.","Dr. Balbir Singh","Chairman Cardiology"
"Manipal Hospital Old Airport Road","Bangalore","India","NABH,JCI","Organ Transplant,Neuro & Spine Surgery",600,1991,"$3,500","Premier Organ Transplant and Complex Neuro Center","World-renowned living-donor organ transplant and stereotactic radiosurgery facility.","Dr. Sudarshan Ballal","Chief Medical Director"
"Kokilaben Dhirubhai Ambani Hospital","Mumbai","India","JCI,NABH","Orthopedics & Joint Replacement,Cardiac Surgery",750,2009,"$4,200","Western India's Quaternary Robotic Hospital","Full-time specialist system with Mako robotic knee arthroplasty center.","Dr. Ramakanta Panda Team","Cardiovascular Surgery"
"Yashoda Hospitals Hitec City","Hyderabad","India","NABH,JCI","Oncology & Cancer Care,Organ Transplant",800,2022,"$3,400","High-Tech Robotic Surgical Wings and Proton Therapy","Quaternary medical referral center with dedicated international patient pavilion.","Dr. P. Pawan Kumar","Senior Director Surgical Oncology"
"Artemis Hospital","Gurgaon","India","JCI,NABH","Cardiac Surgery,Orthopedics & Joint Replacement",400,2007,"$3,600","First JCI-Accredited Super Speciality Hospital in Gurgaon","Pioneers in high-risk pediatric heart surgeries and total hip revisions.","Dr. Murtaza Ahmed Chishti","Chief Cardiac Surgeon"`;

export default function HospitalUploadPage() {
  const [activeTab, setActiveTab] = useState<'bulk' | 'manual'>('bulk');
  const [csvContent, setCsvContent] = useState('');
  const [parsedHospitals, setParsedHospitals] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Database state
  const [dbHospitals, setDbHospitals] = useState<Hospital[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbSearch, setDbSearch] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('all');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('all');

  // Single Hospital Manual Form State
  const [manualForm, setManualForm] = useState({
    name: '',
    city: '',
    country: 'India' as DestinationCountry,
    accreditations: ['NABH', 'JCI'] as AccreditationType[],
    specialties: ['Cardiac Surgery'] as MedicalSpecialty[],
    bedCount: 350,
    establishedYear: 2010,
    startingPrice: '$3,500',
    tagline: '',
    description: '',
    imageUrl: '',
    doctorName: '',
    doctorRole: 'Chief Surgeon',
    doctorExperience: '20+ Years',
  });

  // Load existing hospitals from API
  const fetchDbHospitals = async () => {
    setIsLoadingDb(true);
    try {
      const res = await fetch('/api/hospitals');
      const data = await res.json();
      if (data.success && Array.isArray(data.hospitals)) {
        setDbHospitals(data.hospitals);
      }
    } catch (e) {
      console.warn('Failed to fetch hospitals from API:', e);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchDbHospitals();
  }, []);

  // Simple robust CSV parser
  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      setParseErrors(['CSV must have at least a header line and 1 data row.']);
      setParsedHospitals([]);
      return;
    }

    // Helper to parse line with quotes
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_-]+/g, ''));
    const rows: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || '';
      });

      const name = obj.name || obj.hospitalname || obj.hospital || '';
      const city = obj.city || '';
      const country = obj.country || 'India';

      if (!name || !city) {
        errors.push(`Row ${i}: Missing Name or City (${name || 'No Name'}, ${city || 'No City'})`);
        continue;
      }

      rows.push({
        name,
        city,
        country,
        accreditations: (obj.accreditations || 'NABH').split(/[,;|]/).map((s) => s.trim()),
        specialties: (obj.specialties || 'General').split(/[,;|]/).map((s) => s.trim()),
        bed_count: Number(obj.bedcount || obj.beds || 200),
        established_year: Number(obj.establishedyear || obj.year || 2005),
        starting_price: obj.startingprice || obj.price || '$3,000',
        tagline: obj.tagline || `Top accredited hospital in ${city}`,
        description: obj.description || `${name} is an internationally accredited hospital in ${city}, ${country}.`,
        doctor_name: obj.doctorname || obj.doctor || '',
        doctor_role: obj.doctorrole || obj.role || 'Senior Consultant',
      });
    }

    setParseErrors(errors);
    setParsedHospitals(rows);
  };

  // Handle CSV file selection
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvContent(text);
        parseCSV(text);
      }
    };
    reader.readAsText(file);
  };

  // Handle CSV paste change
  const handleCsvTextChange = (text: string) => {
    setCsvContent(text);
    if (text.trim()) {
      parseCSV(text);
    } else {
      setParsedHospitals([]);
      setParseErrors([]);
    }
  };

  // Download Sample Template
  const downloadSampleTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'medvantage_hospitals_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load sample data into text area
  const loadSampleIntoEditor = () => {
    setCsvContent(SAMPLE_CSV);
    parseCSV(SAMPLE_CSV);
  };

  // Commit Parsed Hospitals to API
  const handleBulkUpload = async () => {
    if (parsedHospitals.length === 0) return;
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitals: parsedHospitals }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload hospitals.');
      }

      setMessage({
        type: 'success',
        text: `Success! ${data.count} hospitals have been uploaded and synced into the Supabase database.`,
      });
      setCsvContent('');
      setParsedHospitals([]);
      fetchDbHospitals();
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'Upload failed.';
      setMessage({ type: 'error', text: errText });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Single Hospital Manual Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name.trim() || !manualForm.city.trim()) {
      setMessage({ type: 'error', text: 'Hospital name and city are required.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        name: manualForm.name.trim(),
        city: manualForm.city.trim(),
        country: manualForm.country,
        accreditations: manualForm.accreditations,
        specialties: manualForm.specialties,
        bedCount: manualForm.bedCount,
        establishedYear: manualForm.establishedYear,
        startingPrice: manualForm.startingPrice,
        tagline: manualForm.tagline.trim(),
        description: manualForm.description.trim(),
        image: manualForm.imageUrl.trim() || undefined,
        doctor_name: manualForm.doctorName.trim(),
        doctor_role: manualForm.doctorRole.trim(),
        doctor_experience: manualForm.doctorExperience.trim(),
      };

      const res = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add hospital.');
      }

      setMessage({
        type: 'success',
        text: `Success! ${manualForm.name} in ${manualForm.city} has been added to the database.`,
      });

      // Reset form
      setManualForm({
        name: '',
        city: '',
        country: 'India',
        accreditations: ['NABH', 'JCI'],
        specialties: ['Cardiac Surgery'],
        bedCount: 350,
        establishedYear: 2010,
        startingPrice: '$3,500',
        tagline: '',
        description: '',
        imageUrl: '',
        doctorName: '',
        doctorRole: 'Chief Surgeon',
        doctorExperience: '20+ Years',
      });

      fetchDbHospitals();
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'Submission failed.';
      setMessage({ type: 'error', text: errText });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Hospital
  const handleDeleteHospital = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the database?`)) return;

    try {
      const res = await fetch(`/api/hospitals?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDbHospitals((prev) => prev.filter((h) => h.id !== id));
        setMessage({ type: 'success', text: `Hospital "${name}" removed from database.` });
      }
    } catch (err: unknown) {
      alert('Failed to delete hospital: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Filtered DB Hospitals for Management Table
  const filteredDbHospitals = useMemo(() => {
    return dbHospitals.filter((h) => {
      if (selectedCountryFilter !== 'all' && h.country !== selectedCountryFilter) return false;
      if (selectedCityFilter !== 'all' && h.city.toLowerCase() !== selectedCityFilter.toLowerCase()) return false;
      if (dbSearch.trim()) {
        const q = dbSearch.toLowerCase();
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesCity = h.city.toLowerCase().includes(q);
        const matchesCountry = h.country.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesCountry) return false;
      }
      return true;
    });
  }, [dbHospitals, selectedCountryFilter, selectedCityFilter, dbSearch]);

  // Unique cities in current DB
  const distinctCities = useMemo(() => {
    return Array.from(new Set(dbHospitals.map((h) => h.city.trim()).filter(Boolean))).sort();
  }, [dbHospitals]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/hospitals"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Hospitals Directory
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/coordinator"
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
            >
              Coordinator Console
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Database className="w-4 h-4 text-blue-600" />
                Hospital & City Database Management
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Upload & Sync Hospital Directory
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
                Add accredited hospitals, clinics, and medical centers to the live Supabase database with city tags, JCI/NABH accreditations, and super-specialty data.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl font-black text-blue-600">{dbHospitals.length}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospitals Live</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl font-black text-emerald-600">{distinctCities.length}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cities Active</div>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-8 flex border-b border-slate-200 gap-6">
            <button
              onClick={() => setActiveTab('bulk')}
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'bulk'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Bulk CSV / JSON Upload
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'manual'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Single Hospital Form
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {message && (
          <div
            className={`p-4 rounded-2xl mb-8 border flex items-start gap-3 shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-sm font-semibold">{message.text}</div>
          </div>
        )}

        {/* TAB 1: BULK CSV UPLOAD */}
        {activeTab === 'bulk' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-blue-600" />
                    Upload CSV Hospital File
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a CSV file from your computer or paste CSV text directly below.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadSampleTemplate}
                    type="button"
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download CSV Template
                  </button>
                  <button
                    onClick={loadSampleIntoEditor}
                    type="button"
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load Sample Indian Hospitals
                  </button>
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50/50 mb-6">
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <FileSpreadsheet className="w-10 h-10 text-blue-500 mb-2" />
                  <span className="text-sm font-bold text-slate-800">
                    Click to select CSV file from your device
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Supports columns: name, city, country, accreditations, specialties, bed_count, price
                  </span>
                </label>
              </div>

              {/* Direct Paste Text Area */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Or Paste CSV Data Directly:
                </label>
                <textarea
                  rows={6}
                  value={csvContent}
                  onChange={(e) => handleCsvTextChange(e.target.value)}
                  placeholder="name,city,country,accreditations,specialties,bed_count,starting_price&#10;Apollo Greams,Chennai,India,JCI;NABH,Cardiac;Oncology,600,$4,500&#10;Fortis FMRI,Gurgaon,India,JCI,Robotic;Oncology,1000,$3,800"
                  className="w-full rounded-2xl border border-slate-200 p-4 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/30"
                />
              </div>

              {/* Parsing Warnings / Errors */}
              {parseErrors.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Parsing Warnings ({parseErrors.length}):
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {parseErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedHospitals.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Parsed {parsedHospitals.length} Hospital(s) Ready to Commit:
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleBulkUpload}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Uploading to Database...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          Commit {parsedHospitals.length} Hospitals to Database
                        </>
                      )}
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Hospital Name</th>
                          <th className="px-4 py-3 bg-blue-50/50 text-blue-900 font-extrabold">City</th>
                          <th className="px-4 py-3">Country</th>
                          <th className="px-4 py-3">Accreditations</th>
                          <th className="px-4 py-3">Specialties</th>
                          <th className="px-4 py-3">Beds</th>
                          <th className="px-4 py-3">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedHospitals.map((h, i) => (
                          <tr key={i} className="hover:bg-slate-50/80">
                            <td className="px-4 py-2.5 text-slate-400 font-mono">{i + 1}</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900">{h.name}</td>
                            <td className="px-4 py-2.5 font-bold text-blue-700 bg-blue-50/30">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-blue-600" />
                                {h.city}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">{h.country}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex flex-wrap gap-1">
                                {h.accreditations?.map((acc: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                                  >
                                    {acc}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 max-w-xs truncate">
                              {Array.isArray(h.specialties) ? h.specialties.join(', ') : h.specialties}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 font-mono">{h.bed_count}</td>
                            <td className="px-4 py-2.5 font-bold text-emerald-700">{h.starting_price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SINGLE MANUAL HOSPITAL FORM */}
        {activeTab === 'manual' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Add Single Hospital to Database
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Enter hospital specifications, city location, accreditations, and surgical specialties.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Hospital Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    placeholder="e.g. Max Super Speciality Hospital"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* City (Key Field) */}
                <div>
                  <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    City Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.city}
                    onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                    placeholder="e.g. Mumbai, New Delhi, Chennai, Bangalore"
                    className="w-full rounded-xl border border-blue-300 px-4 py-2.5 text-sm text-slate-900 bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {/* City Quick Pills */}
                  <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-400 font-semibold">Quick Suggestions:</span>
                    {POPULAR_INDIAN_CITIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setManualForm({ ...manualForm, city: c })}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                          manualForm.city === c
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Country Destination *
                  </label>
                  <select
                    value={manualForm.country}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, country: e.target.value as DestinationCountry })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {AVAILABLE_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Starting Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Starting Treatment Package Price
                  </label>
                  <input
                    type="text"
                    value={manualForm.startingPrice}
                    onChange={(e) => setManualForm({ ...manualForm, startingPrice: e.target.value })}
                    placeholder="e.g. $3,500"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Bed Count & Established Year */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Total Bed Capacity
                  </label>
                  <input
                    type="number"
                    value={manualForm.bedCount}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, bedCount: parseInt(e.target.value) || 100 })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Established Year
                  </label>
                  <input
                    type="number"
                    value={manualForm.establishedYear}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, establishedYear: parseInt(e.target.value) || 2000 })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Accreditations Multi-select Badges */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hospital Accreditations (JCI / NABH) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ACCREDITATIONS.map((acc) => {
                    const isSelected = manualForm.accreditations.includes(acc);
                    return (
                      <button
                        type="button"
                        key={acc}
                        onClick={() => {
                          const next = isSelected
                            ? manualForm.accreditations.filter((a) => a !== acc)
                            : [...manualForm.accreditations, acc];
                          setManualForm({ ...manualForm, accreditations: next });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && '✔ '}
                        {acc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specialties Multi-select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Key Medical Specialties *
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SPECIALTIES.map((spec) => {
                    const isSelected = manualForm.specialties.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => {
                          const next = isSelected
                            ? manualForm.specialties.filter((s) => s !== spec)
                            : [...manualForm.specialties, spec];
                          setManualForm({ ...manualForm, specialties: next });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && '✔ '}
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tagline & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tagline / One-Line Highlight
                  </label>
                  <input
                    type="text"
                    value={manualForm.tagline}
                    onChange={(e) => setManualForm({ ...manualForm, tagline: e.target.value })}
                    placeholder="e.g. Asia's Leading Institute for Robotic Cardiac Surgery"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Chief Surgeon / Specialist Name
                  </label>
                  <input
                    type="text"
                    value={manualForm.doctorName}
                    onChange={(e) => setManualForm({ ...manualForm, doctorName: e.target.value })}
                    placeholder="e.g. Dr. Ramakanta Panda"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Clinical Overview & Technology Description
                </label>
                <textarea
                  rows={3}
                  value={manualForm.description}
                  onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                  placeholder="Provide clinical achievements, robotic surgery equipment (Da Vinci, Mako, CyberKnife), ICU capabilities, and international patient services..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Hospital...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Hospital to Database
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION 3: LIVE ACTIVE HOSPITALS IN DATABASE */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Live Database Hospitals ({filteredDbHospitals.length} of {dbHospitals.length})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Showing all verified medical centers stored in Supabase with city coordinates.
              </p>
            </div>

            {/* Filter by City & Country */}
            <div className="flex flex-wrap items-center gap-3">
              {/* City Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-bold text-slate-500">City:</span>
                <select
                  value={selectedCityFilter}
                  onChange={(e) => setSelectedCityFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="all">All Cities ({distinctCities.length})</option>
                  {distinctCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <select
                value={selectedCountryFilter}
                onChange={(e) => setSelectedCountryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="all">All Countries</option>
                {AVAILABLE_COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search hospital or city..."
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                />
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchDbHospitals}
                type="button"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                title="Refresh Hospitals"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Hospitals Table */}
          {isLoadingDb ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm">Loading hospitals from Supabase...</p>
            </div>
          ) : filteredDbHospitals.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No hospitals match the selected filter criteria.</p>
              <button
                onClick={() => {
                  setSelectedCityFilter('all');
                  setSelectedCountryFilter('all');
                  setDbSearch('');
                }}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Hospital Name</th>
                    <th className="px-4 py-3 bg-blue-50/50 text-blue-900 font-extrabold">City Location</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Accreditations</th>
                    <th className="px-4 py-3">Specialties</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Est. Cost</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDbHospitals.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <div>{h.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{h.tagline}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-700 bg-blue-50/20">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100/60 text-blue-800">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          {h.city}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-slate-800 font-medium">
                          <span>{h.flag}</span>
                          <span>{h.country}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {h.accreditations.map((acc) => (
                            <span
                              key={acc}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                            >
                              {acc}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                        {h.specialties.slice(0, 2).join(', ')}
                        {h.specialties.length > 2 && ` +${h.specialties.length - 2} more`}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{h.bedCount} beds</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{h.startingPrice}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href="/hospitals"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View in Public Directory"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteHospital(h.id, h.name)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete from Database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
