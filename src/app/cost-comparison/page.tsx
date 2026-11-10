'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Plane,
  Sparkles,
  HelpCircle,
  Clock,
  Calendar,
  Layers,
} from 'lucide-react';
import { PROCEDURES } from '@/data/procedures';

export default function CostComparisonPage() {
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>(PROCEDURES[0].id);
  const [homeCountry, setHomeCountry] = useState<'us' | 'uk'>('us');

  const selectedProcedure = PROCEDURES.find((p) => p.id === selectedProcedureId) || PROCEDURES[0];
  const benchmarkCost = homeCountry === 'us' ? selectedProcedure.costs.us : selectedProcedure.costs.uk;
  const benchmarkLabel = homeCountry === 'us' ? 'United States' : 'United Kingdom (Private)';

  const destinations = [
    { name: 'India (Heal in India)', flag: '🇮🇳', cost: selectedProcedure.costs.india, accredited: 'JCI / NABH' },
    { name: 'Thailand', flag: '🇹🇭', cost: selectedProcedure.costs.thailand, accredited: 'JCI / AACI' },
    { name: 'Turkey', flag: '🇹🇷', cost: selectedProcedure.costs.turkey, accredited: 'JCI / ISO' },
    { name: 'Mexico', flag: '🇲🇽', cost: selectedProcedure.costs.mexico, accredited: 'JCI / ISO' },
    { name: 'Spain', flag: '🇪🇸', cost: selectedProcedure.costs.spain, accredited: 'JCI / EU' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            Global Cost Transparency Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Compare Treatment Costs & Save 60% – 85%
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            International hospitals deliver the same FDA-approved prosthetics, robotic surgical suites, and JCI-accredited protocols at a fraction of US and European prices.
          </p>
        </div>

        {/* Procedure Selector & Home Country Toggle */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Select Medical or Surgical Procedure
              </label>
              <select
                value={selectedProcedureId}
                onChange={(e) => setSelectedProcedureId(e.target.value)}
                className="w-full py-3.5 px-4 bg-slate-50 border border-slate-300 rounded-2xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                {PROCEDURES.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.specialty}] — {p.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                {selectedProcedure.description}
              </p>
            </div>

            {/* Benchmark Toggle */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                Compare Against Your Country
              </div>
              <div className="flex rounded-xl bg-slate-200 p-1">
                <button
                  type="button"
                  onClick={() => setHomeCountry('us')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    homeCountry === 'us'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇺🇸 United States
                </button>
                <button
                  type="button"
                  onClick={() => setHomeCountry('uk')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    homeCountry === 'uk'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇬🇧 United Kingdom
                </button>
              </div>
              <div className="text-center mt-3">
                <span className="text-xs text-slate-500">Benchmark Avg Price:</span>
                <div className="text-xl font-extrabold text-slate-900">
                  ${benchmarkCost.toLocaleString()} USD
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Cards Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Cost Comparison for <span className="text-blue-600">{selectedProcedure.name}</span>
            </h2>
            <span className="text-xs text-slate-500 hidden sm:inline">
              *Typical all-inclusive bundled hospital packages
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, idx) => {
              const savingsUsd = benchmarkCost - dest.cost;
              const savingsPercent = Math.round((savingsUsd / benchmarkCost) * 100);
              const isBestValue = idx === 0; // India typically highest value

              return (
                <div
                  key={dest.name}
                  className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between relative ${
                    isBestValue ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
                  }`}
                >
                  {isBestValue && (
                    <div className="absolute -top-3 right-6 bg-blue-600 text-white px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Best Value Destination
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{dest.flag}</span>
                        <div>
                          <div className="font-bold text-base text-slate-900">{dest.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            Accredited: {dest.accredited}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price and Savings Callout */}
                    <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500 font-medium">Estimated Package Price</div>
                      <div className="text-3xl font-black text-slate-900 mt-0.5">
                        ${dest.cost.toLocaleString()}{' '}
                        <span className="text-xs text-slate-400 font-normal">USD</span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <TrendingDown className="w-4 h-4 text-emerald-600" />
                          <span>Save ${savingsUsd.toLocaleString()}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                          {savingsPercent}% OFF
                        </span>
                      </div>
                    </div>

                    {/* Key Procedure Specs */}
                    <div className="space-y-2 text-xs text-slate-600 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-blue-500" /> Hospital Stay:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {selectedProcedure.durationHospitalDays} Days
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Total City Recovery:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {selectedProcedure.durationStayDays} Days
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Clinical Success:
                        </span>
                        <span className="font-semibold text-emerald-700">
                          {selectedProcedure.successRate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/intake?procedure=${encodeURIComponent(selectedProcedure.name)}&specialty=${encodeURIComponent(selectedProcedure.specialty)}&country=${encodeURIComponent(dest.name.split(' ')[0])}`}
                    className={`w-full py-3 px-4 rounded-xl text-center font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 ${
                      isBestValue
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Request Direct Quote in {dest.name.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* What's Included in Bundled International Packages */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-12">
          <div className="max-w-3xl mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              What Is Included in an All-Inclusive Hospital Quote?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unlike domestic US/UK healthcare where hidden facility fees and separate physician bills arrive months later, international medical travel quotes are comprehensively packaged and transparent:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedProcedure.inclusions.map((inc, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 font-medium leading-relaxed">{inc}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Have specific diagnostic scans (MRI/CT)? Request a custom multi-hospital comparative quote.
            </div>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
            >
              <span>Upload Records for Exact Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
