'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plane,
  FileBadge,
  Building,
  Car,
  Languages,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar,
  HeartHandshake,
  Luggage,
  Sparkles,
} from 'lucide-react';

export default function TravelServicesPage() {
  const [activeTab, setActiveTab] = useState<'visa' | 'transfer' | 'hotel' | 'translators'>('visa');

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Plane className="w-4 h-4 text-blue-600" />
            Full Concierge & Logistics
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            End-to-End Travel, Visa & Local Coordination
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Medical travel shouldn&apos;t be stressful. Med Vantage takes care of everything outside the operating room: official medical visa invitation letters, airport tarmac ambulance pick-up, partner hotels, and in-person medical interpreters.
          </p>
        </div>

        {/* 4 Pillars Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveTab('visa')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'visa'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileBadge className="w-4 h-4" />
            <span>1. Medical Visa (e-Visa)</span>
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'transfer'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>2. VIP Airport Transfers</span>
          </button>
          <button
            onClick={() => setActiveTab('hotel')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'hotel'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>3. Partner Accommodations</span>
          </button>
          <button
            onClick={() => setActiveTab('translators')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'translators'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>4. Dedicated Interpreters</span>
          </button>
        </div>

        {/* Tab 1: Medical Visa */}
        {activeTab === 'visa' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                  Priority Clearance
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
                  Medical Visa & Invitation Letters (e-Medical Visa)
                </h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Most governments, including India (under the Heal in India initiative), Thailand, and Turkey, provide fast-tracked <strong className="text-slate-900">e-Medical Visas (e-Med)</strong> for patients and up to 2 medical attendants.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">Hospital Visa Invitation Letter Issued in 24h</div>
                      <div className="text-xs text-slate-500">Official letter from JCI/NABH hospital submitted directly to the embassy.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">Covers Patient + 2 Medical Attendants</div>
                      <div className="text-xs text-slate-500">Family members receive linked Medical Attendant Visas with triple entry permissions.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">In-Country Visa Extension & FRRO Assistance</div>
                      <div className="text-xs text-slate-500">If your post-op recovery takes longer, our hospital desk handles local residency extensions.</div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/intake?service=visa"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition"
                >
                  <span>Request Hospital Visa Letter</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Visa Checklist Card */}
              <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
                <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                  <FileBadge className="w-5 h-5 text-blue-600" />
                  Standard Medical Visa Requirements
                </h3>
                <ul className="space-y-3 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Valid Passport with at least 6 months validity</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Recent passport-style digital photographs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Home country doctor&apos;s referral or diagnostic report</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Hospital Invitation Letter (Med Vantage coordinates this for free)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Proof of sufficient funds for medical stay</span>
                  </li>
                </ul>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <span className="font-bold">⚡ Fast-Track Notice:</span> Typical processing time for e-Medical Visa is 48–72 hours after hospital letter issuance.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Airport Transfers */}
        {activeTab === 'transfer' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                  Door-to-Door Care
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
                  VIP Airport Transfers & Ambulance Escort
                </h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Stepping off a long-haul flight can be exhausting. Our airport representative welcomes you right at the arrival terminal with a name board, assists with luggage and local SIM cards, and drives you directly to the hospital or your hotel.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">Private Chauffeur Sedan or Minivan (Complimentary)</div>
                      <div className="text-xs text-slate-500">Air-conditioned Mercedes, Toyota Innova, or executive van for you and your companions.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">Advanced Cardiac Life Support (ACLS) Ambulance Transfer</div>
                      <div className="text-xs text-slate-500">For critically ill or stretcher-bound patients needing tarmac-to-ICU transit.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">Local SIM Card & Currency Exchange Assistance</div>
                      <div className="text-xs text-slate-500">Immediate mobile connectivity so you can message family back home without roaming fees.</div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/intake?service=airport"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition"
                >
                  <span>Book Airport Pickup with Case</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
                  Airside & Arrival Protocol
                </div>
                <h3 className="text-xl font-bold mb-4">Arrival Experience Summary</h3>
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="font-bold text-white block mb-1">Step 1: Arrival Terminal Meet & Greet</span>
                    Coordinator meets you outside customs with your name and Med Vantage case ID.
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="font-bold text-white block mb-1">Step 2: Smooth Luggage & Porter Care</span>
                    Porters handle all luggage, wheelchairs provided for limited mobility patients.
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="font-bold text-white block mb-1">Step 3: Direct Transfer</span>
                    30–45 min direct transit to the hospital international reception desk or hotel check-in.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Hotel Accommodations */}
        {activeTab === 'hotel' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                  Rest & Recovery
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
                  Partner Hotels & Serviced Recovery Suites
                </h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  While the patient stays in the hospital during surgery, accompanying family members need safe, hygienic, and affordable lodging within walking distance or 5 minutes of the hospital.
                </p>

                <div className="space-y-3 mb-8 text-xs text-slate-700">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-sm text-slate-900 mb-1">Serviced Family Apartments ($35 – $75/night)</div>
                    <p className="text-slate-500">Fully equipped kitchens to prepare dietary food, washing machine, WiFi, and 24/7 security.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-sm text-slate-900 mb-1">4-Star & 5-Star Partner Hotels ($60 – $140/night)</div>
                    <p className="text-slate-500">Hyatt, Marriott, Novotel, and boutique partner hotels with negotiated patient corporate discounts.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-sm text-slate-900 mb-1">Nursing Visits & Post-Discharge Monitoring</div>
                    <p className="text-slate-500">Arranged visiting nurse for wound dressing and physiotherapy sessions in your hotel room.</p>
                  </div>
                </div>

                <Link
                  href="/intake?service=hotel"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition"
                >
                  <span>Select Lodging Options with Intake</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
                <h3 className="font-bold text-base text-slate-900 mb-4">
                  Why Book Through Med Vantage?
                </h3>
                <ul className="space-y-3 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Up to 40% discounted corporate hospital patient rates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Free cancellation if surgery schedule or flight date changes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Wheelchair-accessible rooms with roll-in showers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Daily complimentary hospital shuttle service</span>
                  </li>
                </ul>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  <span className="font-bold">🌿 Holistic Wellness Add-On:</span> Combine surgery with an Ayurvedic retreat in Kerala, India or a medical spa in Chiang Mai, Thailand for post-op recuperation.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Language Interpreters */}
        {activeTab === 'translators' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                  Zero Language Barrier
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
                  In-Person Medical Interpreters Across 15+ Languages
                </h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Medical terminology is nuanced. We provide trained medical interpreters who accompany you into doctor consultations, surgical briefings, and pharmacy discussions so you always have 100% clarity.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {['Arabic', 'Russian', 'French', 'Spanish', 'Swahili', 'Uzbek', 'Bengali', 'Japanese', 'German'].map((lang) => (
                    <div key={lang} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-xs text-slate-800">
                      🗣️ {lang}
                    </div>
                  ))}
                </div>

                <Link
                  href="/intake?service=translator"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition"
                >
                  <span>Request Dedicated Translator</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
                <h3 className="font-bold text-base text-slate-900 mb-3">
                  Medical Translation Services Include:
                </h3>
                <ul className="space-y-3 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>In-person companion for all specialist consultations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Complete translation of discharge summaries into your native tongue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Explanation of post-op medications, dosage, and dietary dos & don&apos;ts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>24/7 on-call translation via WhatsApp during your entire stay</span>
                  </li>
                </ul>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                  ✓ Complimentary with all bundled JCI/NABH surgery packages.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Facilitation Benchmark Resources */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl mb-12">
          <div className="max-w-3xl mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Government & Global Industry Benchmarks
            </span>
            <h3 className="text-2xl font-bold mt-1">
              Aligned with Leading International Medical Facilitation Standards
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Med Vantage adheres to guidelines benchmarked by the world&apos;s most respected healthcare facilitation platforms:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
              <div className="font-bold text-sm text-white mb-1 flex items-center justify-between">
                <span>Heal In India</span>
                <span className="text-[10px] text-emerald-400 font-normal">Govt of India</span>
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Official Ministry of Health portal powered by SEPC featuring hundreds of JCI & NABH accredited hospitals and multi-specialty wellness packages.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
              <div className="font-bold text-sm text-white mb-1 flex items-center justify-between">
                <span>MedicalTourism.com</span>
                <span className="text-[10px] text-blue-400 font-normal">Global MTA</span>
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Independent global authority for researching procedures, patient rights, safety checklists, and accredited hospitals worldwide.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
              <div className="font-bold text-sm text-white mb-1 flex items-center justify-between">
                <span>Medical Tourism India</span>
                <span className="text-[10px] text-purple-400 font-normal">Super-Specialists</span>
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Direct facilitation connecting international patients with top surgeons and quaternary care hubs across Delhi NCR, Chennai, Mumbai, and Bangalore.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
