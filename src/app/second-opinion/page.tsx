'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Video,
  FileText,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  Upload,
  ArrowRight,
  Sparkles,
  Calendar,
  Languages,
  Award,
} from 'lucide-react';
import { SPECIALISTS } from '@/data/specialists';
import { MedicalSpecialty } from '@/types/medical-tourism';

export default function SecondOpinionPage() {
  const [selectedSpecialist, setSelectedSpecialist] = useState<(typeof SPECIALISTS)[0] | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  const filteredSpecialists = SPECIALISTS.filter((doc) => {
    if (specialtyFilter !== 'all' && doc.specialty !== specialtyFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Video className="w-4 h-4 text-indigo-600" />
            International Remote Consultations
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Virtual Second Opinions with World-Class Specialists
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Before undergoing major surgery or traveling abroad, have your MRI, CT scans, and biopsy reports independently reviewed by top surgeons, interventional cardiologists, and oncologists within 24 to 48 hours.
          </p>
        </div>

        {/* 4-Step Process Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-6 text-center">
            How Med Vantage Remote Second Opinions Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base mb-3 shadow-md shadow-blue-500/20">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Upload Diagnostics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Securely upload MRI/CT DICOM imaging, pathology slides, and clinical notes to our private cloud.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base mb-3 shadow-md shadow-indigo-500/20">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Expert Triage & Review</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our care coordinators match your case with a JCI-accredited chief of department or multidisciplinary board.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-base mb-3 shadow-md shadow-purple-500/20">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Written Opinion & Tele-Call</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive a comprehensive written treatment assessment plus a 30-min live secure video consultation.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base mb-3 shadow-md shadow-emerald-500/20">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Treatment & Travel Plan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Proceed with confirmed surgery quote, medical visa invitation, and hospital admission schedule if desired.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Specialists */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Consulting Specialists</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Top surgical directors available for 24-48h remote review
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter Specialty:</span>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Specialties</option>
              <option value="Cardiac Surgery">Cardiac Surgery</option>
              <option value="Orthopedics & Joint Replacement">Orthopedics</option>
              <option value="Oncology & Cancer Care">Oncology</option>
              <option value="IVF & Fertility">IVF & Fertility</option>
              <option value="Neuro & Spine Surgery">Neuro & Spine</option>
            </select>
          </div>
        </div>

        {/* Specialists Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredSpecialists.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">{doc.name}</h3>
                    <p className="text-xs text-blue-700 font-semibold mt-0.5">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{doc.hospital}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400 font-normal">({doc.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1.5 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-bold text-slate-800">{doc.experienceYears}+ Years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Track Record:</span>
                    <span className="font-bold text-slate-800 text-[11px]">{doc.proceduresPerformed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Turnaround:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Within {doc.turnaroundHours} Hours
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {doc.bio}
                </p>

                <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-4">
                  <Languages className="w-3.5 h-3.5 text-slate-400" />
                  <span>Languages: {doc.languages.join(', ')}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Review Fee</div>
                  <div className="text-base font-extrabold text-slate-900">
                    ${doc.consultationFeeUsd}{' '}
                    <span className="text-[10px] font-normal text-slate-400">or Free with Treatment</span>
                  </div>
                </div>
                <Link
                  href={`/intake?second_opinion=true&doctor=${encodeURIComponent(doc.name)}&specialty=${encodeURIComponent(doc.specialty)}`}
                  className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition flex items-center gap-1"
                >
                  <span>Request Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Free Second Opinion with Package Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              Guaranteed Credited Back
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              100% Free Second Opinion When You Book Treatment
            </h3>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed">
              Any consultation fee paid for an international second opinion is fully credited against your surgical or treatment package upon hospital admission.
            </p>
          </div>
          <Link
            href="/intake?second_opinion=true"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-slate-900 font-extrabold text-sm shadow-md transition flex-shrink-0 flex items-center gap-2"
          >
            <span>Upload Records for Case Review</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </Link>
        </div>
      </div>
    </div>
  );
}
