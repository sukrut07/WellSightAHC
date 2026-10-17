'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Bot,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Activity,
  Layers,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { api, WellItem } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

export default function OverviewPage() {
  const [wells, setWells] = useState<WellItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConflictsCount, setActiveConflictsCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [wellRes, confRes] = await Promise.all([
          api.getWells(),
          api.getConflicts().catch(() => []),
        ]);
        setWells(wellRes.wells || []);
        setActiveConflictsCount(confRes.length);
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalDowntime = wells.reduce((acc, w) => acc + (w.measured_downtime_days || 0), 0);
  const activeWellsCount = wells.filter((w) => w.status === 'Active').length;
  const topDowntimeWells = [...wells]
    .sort((a, b) => b.measured_downtime_days - a.measured_downtime_days)
    .slice(0, 5)
    .map((w) => ({
      name: w.id,
      wellName: w.name,
      downtime: w.measured_downtime_days,
      type: w.well_type,
    }));

  const examplePrompts = [
    'Which wells in Area A had the longest downtime this summer, what caused it, and show me the results as a chart.',
    'Why was WELL-0007 not producing?',
    'Which spills required reporting within 24 hours?',
    'Show monthly downtime by area as a heatmap.',
    'Compare repair costs by area this quarter.',
    'Which conclusions are uncertain because records conflict?',
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0C1527] via-[#0E1A33] to-[#0A1224] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 border border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" /> Hacktoberfest 2026 Asset Intelligence Copilot
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            WellSight AI
          </h1>
          <p className="text-base text-slate-300 font-medium">
            <span className="text-emerald-400 font-semibold">Every well has a story.</span> Ask the data.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            An agentic operations intelligence copilot retrieving verified inspection records, calculating downtime using thermal differential rules, enforcing environmental spill deadlines, remembering scoped corrections, and generating dynamic in-chat visualisations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/copilot"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950 transition-colors"
            >
              <Bot className="h-4 w-4" /> Open AI Copilot Chat <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition-colors"
            >
              Explore Analytics & Heatmaps
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monitored Wells</span>
            <Layers className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {loading ? '...' : wells.length}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {activeWellsCount} Active Production Wellheads
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Summer Downtime</span>
            <TrendingDown className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">
            {loading ? '...' : `${totalDowntime} days`}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            7 days / qualifying inspection rule
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Spill Compliance Rate</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            80.0%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            SOP-ENV-004 (24h rule, ≥ 5 bbl)
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Conflicts & Caveats</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {loading ? '...' : activeConflictsCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Contested claims & missing evidence
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Quick Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Downtime Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0E1626] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Summer 2026 Downtime Distribution</h3>
              <p className="text-xs text-slate-400">Top non-producing wells calculated under weekly inspection thermal rules</p>
            </div>
            <Link
              href="/wells"
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
            >
              View All Wells <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDowntimeWells} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} label={{ value: 'Downtime (Days)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, name: any, item: any) => [`${val} days (${item.payload.wellName})`, 'Measured Downtime']}
                />
                <Bar dataKey="downtime" fill="#10B981" radius={[4, 4, 0, 0]}>
                  {topDowntimeWells.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#F43F5E' : index === 1 ? '#F59E0B' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>Critical Wells: WELL-0007 (21d, sand erosion & scale), WELL-0003 (14d, ESP motor trip)</span>
          </div>
        </div>

        {/* Right Col: Quick Copilot Inquiry Prompts */}
        <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Bot className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Ask the Copilot</h3>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Click any verified operator question to launch directly into generative multi-modal reasoning:
            </p>

            <div className="mt-3 space-y-2">
              {examplePrompts.map((prompt, idx) => (
                <Link
                  key={idx}
                  href={`/copilot?q=${encodeURIComponent(prompt)}`}
                  className="block rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-xs text-slate-300 hover:border-emerald-700/80 hover:bg-slate-900 hover:text-white transition-all shadow-xs"
                >
                  <span className="text-emerald-400 font-mono text-[11px] mr-1">Q:</span> {prompt}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Provider: Deterministic Engine</span>
            <span className="text-emerald-400 font-bold">Audit-Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
