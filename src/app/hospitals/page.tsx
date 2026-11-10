'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Award,
  MapPin,
  Star,
  Users,
  CheckCircle2,
  FileCheck,
  Search,
  Filter,
  ArrowRight,
  Globe2,
  HeartPulse,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Info,
  Plus,
  UploadCloud,
} from 'lucide-react';
import { HOSPITALS, ACCREDITATION_INFO } from '@/data/hospitals';
import { Hospital, DestinationCountry, MedicalSpecialty, AccreditationType } from '@/types/medical-tourism';

const COUNTRIES: { label: string; value: DestinationCountry | 'all'; flag: string }[] = [
  { label: 'All Destinations', value: 'all', flag: '🌍' },
  { label: 'India (Heal in India)', value: 'India', flag: '🇮🇳' },
  { label: 'Thailand', value: 'Thailand', flag: '🇹🇭' },
  { label: 'Turkey', value: 'Turkey', flag: '🇹🇷' },
  { label: 'Singapore', value: 'Singapore', flag: '🇸🇬' },
  { label: 'Spain', value: 'Spain', flag: '🇪🇸' },
  { label: 'UAE (Abu Dhabi)', value: 'United Arab Emirates', flag: '🇦🇪' },
  { label: 'Mexico', value: 'Mexico', flag: '🇲🇽' },
];

const SPECIALTIES: { label: string; value: MedicalSpecialty | 'all' }[] = [
  { label: 'All Specialties', value: 'all' },
  { label: 'Cardiac Surgery', value: 'Cardiac Surgery' },
  { label: 'Orthopedics & Joint Replacement', value: 'Orthopedics & Joint Replacement' },
  { label: 'Oncology & Cancer Care', value: 'Oncology & Cancer Care' },
  { label: 'Cosmetic & Plastic Surgery', value: 'Cosmetic & Plastic Surgery' },
  { label: 'IVF & Fertility', value: 'IVF & Fertility' },
  { label: 'Organ Transplant', value: 'Organ Transplant' },
  { label: 'Dental Surgery & Implants', value: 'Dental Surgery & Implants' },
  { label: 'Neuro & Spine Surgery', value: 'Neuro & Spine Surgery' },
];

export default function HospitalsDirectoryPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>(HOSPITALS);
  const [selectedCountry, setSelectedCountry] = useState<DestinationCountry | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<MedicalSpecialty | 'all'>('all');
  const [selectedAccreditation, setSelectedAccreditation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalHospital, setActiveModalHospital] = useState<Hospital | null>(null);

  useEffect(() => {
    fetch('/api/hospitals')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.hospitals) && data.hospitals.length > 0) {
          setHospitals(data.hospitals);
        }
      })
      .catch((err) => console.warn('Could not load dynamic hospitals from API:', err));
  }, []);

  const availableCities = useMemo(() => {
    return Array.from(new Set(hospitals.map((h) => h.city.trim()).filter(Boolean))).sort();
  }, [hospitals]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      if (selectedCountry !== 'all' && hospital.country !== selectedCountry) {
        return false;
      }
      if (selectedCity !== 'all' && hospital.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (selectedSpecialty !== 'all' && !hospital.specialties.includes(selectedSpecialty)) {
        return false;
      }
      if (
        selectedAccreditation !== 'all' &&
        !hospital.accreditations.includes(selectedAccreditation as AccreditationType)
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = hospital.name.toLowerCase().includes(q);
        const matchesCity = hospital.city.toLowerCase().includes(q);
        const matchesCountry = hospital.country.toLowerCase().includes(q);
        const matchesDoctor = hospital.topDoctors.some((d) => d.name.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesCountry && !matchesDoctor) {
          return false;
        }
      }
      return true;
    });
  }, [hospitals, selectedCountry, selectedCity, selectedSpecialty, selectedAccreditation, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Accreditation & Safety Verification
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Accredited International Hospitals & Clinics
            </h1>
            <p className="mt-3 text-base text-slate-600 max-w-3xl leading-relaxed">
              Every hospital listed on Med Vantage is strictly verified for international standards. We only partner with facilities holding gold-standard accreditations such as{' '}
              <strong className="text-slate-900">JCI (Joint Commission International)</strong> or{' '}
              <strong className="text-slate-900">NABH (ISQua-benchmarked)</strong>, ensuring clinical excellence, patient rights, and rigorous infection control.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/hospitals/upload"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Hospital & City List
            </Link>
          </div>
        </div>

        {/* Accreditation Standards Callout Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              JCI
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">JCI Gold Seal</div>
              <div className="text-xs text-slate-500 mt-0.5">1,000+ measurable global clinical safety standards</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              NABH
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">NABH Accredited</div>
              <div className="text-xs text-slate-500 mt-0.5">Heal in India premier healthcare benchmark</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              ISO
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">ISO 9001:2015</div>
              <div className="text-xs text-slate-500 mt-0.5">Certified surgical & operational quality processes</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              TEMOS
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">TEMOS / MTQUA</div>
              <div className="text-xs text-slate-500 mt-0.5">Dedicated medical traveler continuum & hospitality</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Search Hospital or Doctor
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Apollo, Bumrungrad, Dr. Trehan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Destination Country Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Destination Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value as DestinationCountry | 'all')}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter (New) */}
            <div>
              <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600" />
                City Location
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full py-2.5 px-3 bg-blue-50/30 border border-blue-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="all">All Cities ({availableCities.length})</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Medical Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value as MedicalSpecialty | 'all')}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                {SPECIALTIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Accreditation Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Accreditation Filter
              </label>
              <select
                value={selectedAccreditation}
                onChange={(e) => setSelectedAccreditation(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="all">All Accredited Facilities</option>
                <option value="JCI">JCI Gold Seal Only</option>
                <option value="NABH">NABH Accredited (India)</option>
                <option value="ISO 9001">ISO 9001 Certified</option>
                <option value="AACI">AACI Certified</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{filteredHospitals.length}</strong> verified healthcare centers
              {selectedCity !== 'all' && (
                <span className="text-blue-700 font-semibold ml-1">in {selectedCity}</span>
              )}
            </span>
            {(selectedCountry !== 'all' || selectedCity !== 'all' || selectedSpecialty !== 'all' || selectedAccreditation !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCountry('all');
                  setSelectedCity('all');
                  setSelectedSpecialty('all');
                  setSelectedAccreditation('all');
                  setSearchQuery('');
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Hospital Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredHospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Card Image & Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Country Flag & City */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
                  <span>{hospital.flag}</span>
                  <span>{hospital.city}, {hospital.country}</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{hospital.rating}</span>
                  <span className="text-slate-400 text-[10px]">({hospital.reviewCount})</span>
                </div>

                {/* Bottom Accreditations Over Image */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                  {hospital.accreditations.map((acc) => (
                    <span
                      key={acc}
                      className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-sm text-[11px] font-extrabold text-slate-900 shadow-sm flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      {acc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                    {hospital.name}
                  </h3>
                  <p className="text-xs text-blue-700 font-medium mt-1 mb-3 line-clamp-1">
                    {hospital.tagline}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {hospital.description}
                  </p>

                  {/* Key Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl text-center mb-4 border border-slate-100">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Beds</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">{hospital.bedCount}</div>
                    </div>
                    <div className="border-x border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Intl Patients</div>
                      <div className="text-xs font-bold text-blue-700 mt-0.5">{hospital.internationalPatientsPerYear}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Starting At</div>
                      <div className="text-xs font-bold text-emerald-700 mt-0.5">{hospital.startingPrice}</div>
                    </div>
                  </div>

                  {/* Specialties Pills */}
                  <div className="mb-4">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Key Specialties
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                      {hospital.specialties.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium">
                          +{hospital.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalHospital(hospital)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
                  >
                    View Details
                  </button>
                  <Link
                    href={`/intake?hospital=${encodeURIComponent(hospital.name)}&country=${encodeURIComponent(hospital.country)}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs text-center shadow-sm shadow-blue-500/20 transition flex items-center justify-center gap-1"
                  >
                    <span>Get Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hospital Detail Modal */}
        {activeModalHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
              <button
                onClick={() => setActiveModalHospital(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                <span>{activeModalHospital.flag}</span>
                <span>{activeModalHospital.city}, {activeModalHospital.country}</span>
                <span>•</span>
                <span>Est. {activeModalHospital.establishedYear}</span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                {activeModalHospital.name}
              </h2>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                {activeModalHospital.description}
              </p>

              {/* Accreditations list */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Official Accreditations & Quality Certifications
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {activeModalHospital.accreditations.map((acc) => {
                    const info = ACCREDITATION_INFO[acc];
                    return (
                      <div key={acc} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          {info ? info.badge : acc}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {info ? info.description : 'Verified global clinical safety benchmark.'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Specialists */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Featured Chief Specialists & Surgeons
                </h4>
                <div className="space-y-2">
                  {activeModalHospital.topDoctors.map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{doc.name}</div>
                        <div className="text-[11px] text-blue-700">{doc.role}</div>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                        {doc.experience}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* International Patient Amenities */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  End-to-End International Patient Amenities
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {activeModalHospital.amenities.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveModalHospital(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                >
                  Close
                </button>
                <Link
                  href={`/intake?hospital=${encodeURIComponent(activeModalHospital.name)}&country=${encodeURIComponent(activeModalHospital.country)}`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-md shadow-blue-500/25 transition"
                >
                  Request Official Treatment Quote from {activeModalHospital.name}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
