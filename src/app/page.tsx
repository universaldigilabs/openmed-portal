'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building2,
  TrendingDown,
  Video,
  Plane,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Star,
  Globe2,
  Sparkles,
  Award,
  HeartHandshake,
  DollarSign,
  Clock,
  ExternalLink,
  ChevronRight,
  FileBadge,
  Car,
  Languages,
} from 'lucide-react';
import { HOSPITALS } from '@/data/hospitals';
import { PROCEDURES } from '@/data/procedures';

export default function HomePage() {
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState('Cardiac Surgery');
  const [selectedCountry, setSelectedCountry] = useState('India');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/hospitals?country=${encodeURIComponent(selectedCountry)}&specialty=${encodeURIComponent(selectedSpecialty)}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 text-white pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider mb-5 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Accredited International Healthcare Facilitation
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15]">
              World-Class Surgery & Care Abroad. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-emerald-300">
                Save 60% – 85% with Total Peace of Mind.
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Connect with JCI and NABH accredited hospitals worldwide. Research transparent costs, receive virtual second opinions, and get complete medical visa and travel coordination.
            </p>
          </div>

          {/* Interactive Procedure & Destination Search Box */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-900 mb-8 border border-slate-100">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              {/* Specialty / Procedure */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  1. What procedure or specialty?
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full py-3 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Cardiac Surgery">❤️ Cardiac Surgery (CABG, Valves)</option>
                  <option value="Orthopedics & Joint Replacement">🦴 Orthopedics (Knee, Hip Robotic)</option>
                  <option value="Oncology & Cancer Care">🎗️ Oncology (Chemo, CyberKnife)</option>
                  <option value="Cosmetic & Plastic Surgery">✨ Cosmetic (Rhinoplasty, Lipo)</option>
                  <option value="IVF & Fertility">👶 IVF & Fertility Treatment</option>
                  <option value="Organ Transplant">🫀 Organ Transplant (Liver, Kidney)</option>
                  <option value="Dental Surgery & Implants">🦷 Dental Surgery & All-on-4</option>
                  <option value="Neuro & Spine Surgery">🧠 Neuro & Spine Fusion</option>
                  <option value="Ayurveda & Holistic Wellness">🌿 Ayurveda & Holistic Wellness</option>
                </select>
              </div>

              {/* Destination Country */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  2. Preferred destination country?
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full py-3 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="India">🇮🇳 India (Heal In India — JCI & NABH)</option>
                  <option value="Thailand">🇹🇭 Thailand (Bangkok, Phuket)</option>
                  <option value="Turkey">🇹🇷 Turkey (Istanbul, Antalya)</option>
                  <option value="Singapore">🇸🇬 Singapore (Gleneagles, Mount E)</option>
                  <option value="Spain">🇪🇸 Spain (Madrid, Quirónsalud)</option>
                  <option value="United Arab Emirates">🇦🇪 UAE (Cleveland Clinic Abu Dhabi)</option>
                  <option value="Mexico">🇲🇽 Mexico (Médica Sur, Tijuana)</option>
                  <option value="all">🌍 Any Destination (Compare All)</option>
                </select>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Hospitals & Compare</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% JCI & NABH Accredited Facilities
            </span>
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              No Hidden Fees — Transparent Bundled Quotes
            </span>
            <span className="flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-400" />
              24–48h Remote Second Opinions
            </span>
            <span className="flex items-center gap-2">
              <FileBadge className="w-4 h-4 text-amber-400" />
              Official e-Medical Visa Invitation Letters
            </span>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            The 4 Pillars of Safe & Effortless Medical Travel
          </h2>
          <p className="mt-3 text-slate-600 text-sm leading-relaxed">
            From initial research and multi-hospital price quotes to medical visa clearance and airport pickup, Med Vantage coordinates every step of your international care journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Hospital Verification */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-5 font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                1. Hospital & Clinic Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                We strictly audit facilities against gold standards like JCI (Joint Commission International) and NABH. Check doctor credentials, surgical volumes, infection rates, and safety records before committing.
              </p>
            </div>
            <Link
              href="/hospitals"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mt-2"
            >
              <span>Explore Verified Hospitals</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pillar 2: Cost Transparency */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-5 font-bold">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                2. Cost Transparency & Direct Quotes
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                No surprise facility bills or hidden anesthesiologist fees. Get itemized bundled quotes covering surgical fees, implants, ICU stay, and pre-op tests with average savings of 70% to 85%.
              </p>
            </div>
            <Link
              href="/cost-comparison"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 mt-2"
            >
              <span>Compare Procedure Prices</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pillar 3: Second Opinions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-5 font-bold">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                3. Specialist Second Opinions
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Have your MRI, CT, and biopsy reports reviewed remotely by department chiefs and multidisciplinary tumor boards within 24 to 48 hours. Receive a written plan and live video consultation.
              </p>
            </div>
            <Link
              href="/second-opinion"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2"
            >
              <span>Consult an International Specialist</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pillar 4: Travel & Concierge */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-5 font-bold">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                4. End-to-End Travel Coordination
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                We handle official hospital e-Medical Visa invitation letters for patient and attendants, airport pickup in private sedans or ambulances, partner hotel bookings, and native language interpreters.
              </p>
            </div>
            <Link
              href="/travel-services"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mt-2"
            >
              <span>View Travel & Visa Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Global Platforms & Benchmarks */}
      <section className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Industry Benchmarks
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
                Aligned with Global Medical Tourism Authorities
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-md">
              Med Vantage incorporates the directory standards and facilitation guidelines established by the world&apos;s leading medical travel authorities:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-base text-white">Heal In India</div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Government Initiative
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Official Indian government portal powered by SEPC featuring hundreds of JCI- and NABH-accredited tertiary care hospitals, AYUSH holistic centers, and multi-specialty wellness packages.
              </p>
              <div className="text-[11px] text-blue-300 font-medium flex items-center gap-1">
                <span>Integrated into Med Vantage Indian partner network</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-base text-white">MedicalTourism.com</div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Global Authority
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                An independent global resource for researching surgical procedures, evaluating international accreditation standards, and finding verified hospitals across Asia, Europe, and the Americas.
              </p>
              <div className="text-[11px] text-blue-300 font-medium flex items-center gap-1">
                <span>Gold-standard procedure cost comparison models</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-base text-white">Medical Tourism India</div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Super-Specialists
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Premier patient facilitation network linking international individuals directly to renowned super-specialists across Delhi NCR, Chennai, Mumbai, Hyderabad, and Bangalore.
              </p>
              <div className="text-[11px] text-blue-300 font-medium flex items-center gap-1">
                <span>Direct specialist second opinions & video consults</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hospitals Showcase */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Verified Centers
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Featured Accredited International Hospitals
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top global destinations selected for high success rates and dedicated international wings.
            </p>
          </div>
          <Link
            href="/hospitals"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            <span>View All Partner Hospitals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOSPITALS.slice(0, 3).map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
                  <span>{hospital.flag}</span>
                  <span>{hospital.city}, {hospital.country}</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <div className="flex gap-1.5">
                    {hospital.accreditations.map((acc) => (
                      <span key={acc} className="px-2 py-0.5 rounded bg-blue-600 font-extrabold text-[10px]">
                        {acc}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{hospital.rating}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition">
                    {hospital.name}
                  </h3>
                  <p className="text-xs text-blue-700 font-medium mt-0.5 mb-2 line-clamp-1">
                    {hospital.tagline}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {hospital.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Starts at</span>
                    <div className="text-sm font-extrabold text-emerald-700">{hospital.startingPrice}</div>
                  </div>
                  <Link
                    href={`/intake?hospital=${encodeURIComponent(hospital.name)}&country=${encodeURIComponent(hospital.country)}`}
                    className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1"
                  >
                    <span>Get Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Comparison Teaser Banner */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                Transparent Pricing
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                See How Much You Can Save on Major Surgery
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Compare typical costs across the US, UK, India, Thailand, Turkey, and Mexico for over 15 major surgical procedures. Calculate total savings on implants, surgeon fees, and inpatient care.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Heart Bypass: Save ~$119,000
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Robotic Knee: Save ~$43,000
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full IVF Cycle: Save ~$20,000
                </span>
              </div>
            </div>

            <Link
              href="/cost-comparison"
              className="py-4 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition flex items-center gap-2 flex-shrink-0"
            >
              <span>Launch Cost Comparison Tool</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
          <Plane className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Ready to Explore Your Medical Travel Options?
        </h2>
        <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Share your medical reports with our facilitation team. We will present you with itemized hospital quotes, specialist credentials, and medical visa assistance within 24 hours — free of charge.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/intake"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition flex items-center justify-center gap-2"
          >
            <span>Request Free Hospital Treatment Quotes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/second-opinion"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-sm transition"
          >
            <span>Get a Specialist Second Opinion</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
