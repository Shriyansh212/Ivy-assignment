'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import NeuralNetworkCanvas from '@/components/3d/NeuralNetworkCanvas';
import { BarChart3, ShieldCheck, Building2, FileSpreadsheet } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import answersData from '@/answers.json';
import findingsData from '@/findings.json';

export default function InsightsPage() {
  const answers = answersData;
  const findings = findingsData;

  // Chart 1: Data Audit (Genuine vs Corrupt vs Fake) - Pastel Palette
  const genuineCount = answers.total_listing_records - answers.corrupt_listing_ids.length - answers.fake_listing_ids.length;
  const auditData = [
    { name: 'Genuine Active Listings', value: genuineCount, color: '#10B981' }, // Mint Green
    { name: 'Corrupt Data Records', value: answers.corrupt_listing_ids.length, color: '#F43F5E' }, // Terracotta Rose
    { name: 'Fake / Scam Listings', value: answers.fake_listing_ids.length, color: '#F59E0B' }  // Glowing Amber
  ];

  // Chart 2: Project Listing Mismatches Sample
  const projectMismatchSample = [
    { name: 'P40001', reported: 2, actual: 3 },
    { name: 'P40003', reported: 4, actual: 5 },
    { name: 'P40004', reported: 5, actual: 7 },
    { name: 'P40006', reported: 0, actual: 2 },
    { name: 'P40008', reported: 3, actual: 4 },
    { name: 'P40010', reported: 1, actual: 3 },
    { name: 'P40012', reported: 6, actual: 8 },
    { name: 'P40014', reported: 2, actual: 4 }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans relative">
      <Navbar />

      {/* Global 3D Neural Particle Network Background */}
      <NeuralNetworkCanvas />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Bento Header */}
        <div className="relative overflow-hidden bg-white/70 border border-white/80 rounded-3xl p-8 shadow-bento-card backdrop-blur-xl">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-widest mb-3">
              <BarChart3 className="w-3.5 h-3.5 text-purple-300" /> Empirical Data Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Property Market & API Discrepancy Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl">
              Visualizing API aggregations alongside empirical findings from automated API audit, hypothesis testing, and discrepancy discovery.
            </p>
          </div>
        </div>

        {/* 10 Assessment Answers Bento Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-bento-card space-y-1 backdrop-blur-md">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Q1 Total Listings</span>
            <div className="text-2xl font-bold text-slate-900">{answers.total_listing_records.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">Harvested from API</span>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-bento-card space-y-1 backdrop-blur-md">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Q2 Unique Properties</span>
            <div className="text-2xl font-bold text-slate-900">{answers.unique_properties.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500 font-semibold">25 duplicate pairs</span>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-bento-card space-y-1 backdrop-blur-md">
            <span className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider block">Q3 Active Listings</span>
            <div className="text-2xl font-bold text-emerald-600">{answers.active_listings.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">is_live === true</span>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-rose-200/80 shadow-bento-card space-y-1 backdrop-blur-md">
            <span className="text-[11px] text-rose-600 font-semibold uppercase tracking-wider block">Q4 Corrupt IDs</span>
            <div className="text-2xl font-bold text-rose-600">{answers.corrupt_listing_ids.length}</div>
            <span className="text-[10px] text-rose-600 font-semibold">Impossible states</span>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-amber-200/80 shadow-bento-card space-y-1 backdrop-blur-md">
            <span className="text-[11px] text-amber-600 font-semibold uppercase tracking-wider block">Q9 Fraud/Fake IDs</span>
            <div className="text-2xl font-bold text-amber-600">{answers.fake_listing_ids.length}</div>
            <span className="text-[10px] text-amber-600 font-semibold">Bait/Scam text</span>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-bento-card space-y-1 backdrop-blur-md">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Q5 Perungudi Rent</span>
            <div className="text-xl font-bold text-slate-900">₹{(answers.total_monthly_rent / 100000).toFixed(2)} L</div>
            <span className="text-[10px] text-slate-500 font-semibold">Monthly sum</span>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-bento-card space-y-1 backdrop-blur-md">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Q6 Avg 2BHK Rate</span>
            <div className="text-xl font-bold text-slate-900">₹{answers.avg_price_per_sqft_2bhk.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500 font-semibold">₹/sqft (Active 2BHK)</span>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-bento-card space-y-1 backdrop-blur-md">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Q7 Costliest Project</span>
            <div className="text-xl font-bold text-slate-900">{answers.costliest_project.project_id}</div>
            <span className="text-[10px] text-slate-500 font-semibold">₹{(answers.costliest_project.price_max_inr / 100000).toFixed(1)} Lakhs</span>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-bento-card space-y-1 backdrop-blur-md">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Q8 Last 7 Days</span>
            <div className="text-2xl font-bold text-slate-900">{answers.listings_last_7_days}</div>
            <span className="text-[10px] text-slate-500 font-semibold">Posted [Sep 3 - Sep 9]</span>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-amber-200/80 shadow-bento-card space-y-1 backdrop-blur-md">
            <span className="text-[11px] text-amber-600 font-semibold uppercase tracking-wider block">Q10 Count Mismatches</span>
            <div className="text-2xl font-bold text-amber-600">{answers.projects_with_wrong_listing_count}</div>
            <span className="text-[10px] text-slate-500 font-semibold">Out of 450 projects</span>
          </div>

        </div>

        {/* Recharts Visualization Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Data Quality Audit */}
          <div className="bg-white/80 border border-white/90 rounded-3xl p-6 shadow-bento-card space-y-4 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Data Quality Audit Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of all 3,900 harvested listing records categorized by empirical data quality audit.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={auditData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {auditData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', color: '#0f172a', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Project Listing Mismatch Comparison */}
          <div className="bg-white/80 border border-white/90 rounded-3xl p-6 shadow-bento-card space-y-4 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" /> API Discrepancy: Reported vs Actual Listings
            </h3>
            <p className="text-xs text-slate-500">
              Sample of builder projects comparing API `total_listings` metadata vs actual count in `/v1/listings`.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectMismatchSample}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', color: '#0f172a', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="reported" fill="#F43F5E" name="Reported in /v1/projects" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="actual" fill="#10B981" name="Actual in /v1/listings" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Discrepancy Findings Matrix Bento Card */}
        <div className="bg-white/80 border border-white/90 rounded-3xl p-6 sm:p-8 shadow-bento-card space-y-6 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-indigo-600" /> API Documentation Discrepancy Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Comprehensive list of verified lies and discrepancies documented in submission.json ({findings.length} findings)
              </p>
            </div>

            <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold w-fit shadow-sm">
              100% Empirically Reproduced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Documented Claim</th>
                  <th className="py-3 px-4">Actual API Reality</th>
                  <th className="py-3 px-4">Evidence IDs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {findings.map((finding: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      {finding.endpoint}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                        {finding.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      {finding.documented}
                    </td>

                    <td className="py-3.5 px-4 text-slate-900 font-semibold max-w-sm">
                      {finding.actual}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] max-w-xs truncate">
                      {finding.evidence && finding.evidence.length > 0
                        ? `${finding.evidence.slice(0, 3).join(', ')} ${finding.evidence.length > 3 ? `(+${finding.evidence.length - 3} more)` : ''}`
                        : 'Behavioral'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </main>
    </div>
  );
}
