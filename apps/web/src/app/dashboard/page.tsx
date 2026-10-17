'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Bot,
  Database,
  BarChart3,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  Filter,
  Layers,
  Activity,
  FileCheck2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { api } from '@/lib/api';

export default function OperationsDashboard() {
  const router = useRouter();
  const [wells, setWells] = useState<any[]>([]);
  const [downtimeRanking, setDowntimeRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [activeOperator, setActiveOperator] = useState<string>('Sarah J. (Operations Lead)');

  useEffect(() => {
    // Read active user if stored
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wellsight_active_user');
      if (stored === 'demo_user_beta') setActiveOperator('John D. (Field Pumper)');
      else if (stored === 'demo_user_gamma') setActiveOperator('Carlos M. (Subsurface Geo)');
      else setActiveOperator('Sarah J. (Operations Lead)');
    }

    Promise.all([
      api.getWells().catch(() => ({ wells: [], total_count: 0 })),
      api.getDowntimeAnalytics(selectedArea === 'All' ? 'Area A' : selectedArea).catch(() => ({ ranked_wells: [] })),
    ])
      .then(([wellsData, downtimeData]) => {
        setWells(wellsData?.wells || []);
        setDowntimeRanking(downtimeData?.ranked_wells || []);
      })
      .finally(() => setLoading(false));
  }, [selectedArea]);

  // Filter wells by area
  const filteredWells =
    selectedArea === 'All'
      ? wells
      : wells.filter((w) => w.area.toLowerCase() === selectedArea.toLowerCase());

  // Top metrics calculated deterministically from real data
  const totalWellsCount = wells.length;
  const activeWellsCount = wells.filter((w) => w.status === 'active').length;
  const totalDowntimeDays = downtimeRanking.reduce((acc, curr) => acc + (curr.downtime_days || 0), 0);
  const highDowntimeWells = downtimeRanking.filter((d) => d.downtime_days >= 14).length;

  const quickPrompts = [
    {
      title: 'Area A Summer Downtime Ranking',
      prompt: 'Which wells in Area A had the longest downtime this summer, and show me as a table?',
    },
    {
      title: 'Investigate WELL-0007 Root Cause',
      prompt: 'Why was WELL-0007 not producing?',
    },
    {
      title: '24-Hour Spill Compliance Audit',
      prompt: 'Which spills required reporting within 24 hours, and were any deadlines missed?',
    },
    {
      title: 'Area Downtime Monthly Heatmap',
      prompt: 'Show monthly downtime by area as a heatmap.',
    },
  ];

  const handleLaunchPrompt = (promptText: string) => {
    router.push(`/copilot?q=${encodeURIComponent(promptText)}`);
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* 1. Header Banner & Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Live Operations Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Welcome back, {activeOperator.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Fleet overview: {totalWellsCount} monitored assets across 3 production fields. Rule-based downtime evaluation active.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {/* Area Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0A1224] p-1 text-xs">
            {['All', 'Area A', 'Area B', 'Area C'].map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  selectedArea === area
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          <Link
            href="/copilot"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition-all shadow-md shadow-emerald-950/50"
          >
            <Bot className="h-4 w-4" />
            <span>Ask Copilot</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards (High-Contrast Dark Industrial) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1224] p-5 shadow-md glow-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Monitored Assets</span>
            <Database className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {loading ? '—' : totalWellsCount}
            </span>
            <span className="text-xs text-slate-400">wells total</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{activeWellsCount} producing active</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1224] p-5 shadow-md glow-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Fleet Downtime (Summer)</span>
            <TrendingDown className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-rose-400">
              {loading ? '—' : totalDowntimeDays}
            </span>
            <span className="text-xs text-slate-400">days cumulative</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span>{highDowntimeWells} wells with ≥14d non-producing</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1224] p-5 shadow-md glow-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Spill Compliance Status</span>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">24h</span>
            <span className="text-xs text-slate-400">statutory limit</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            <span>1 spill missing dispatch timestamp</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1224] p-5 shadow-md glow-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Audited Overrides</span>
            <FileCheck2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">4 Active</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span>Preserving immutable raw logs</span>
          </div>
        </div>
      </div>

      {/* 3. Main Operational Grid: Downtime Chart & Copilot Quick Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Downtime Ranking Bar Chart (8 Columns) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-[#0A1224] p-5 sm:p-6 shadow-md glow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                Fleet Downtime Ranking by Asset (Summer 2026)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Rule 2.1: Weekly non-producing inspection = 7 days. Missed inspections = 0 days.
              </p>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Full Analytics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full pt-2">
            {loading ? (
              <div className="flex h-full items-center justify-center text-xs font-mono text-slate-500">
                Loading deterministic downtime calculations...
              </div>
            ) : downtimeRanking.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No downtime records found for current criteria.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={downtimeRanking.slice(0, 8)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="well_id"
                    stroke="#64748B"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    unit="d"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-xl backdrop-blur-md">
                          <div className="font-bold text-white">{d.well_id}</div>
                          <div className="text-[11px] text-slate-400">{d.well_name}</div>
                          <div className="mt-1 font-mono text-rose-400 font-semibold">
                            Downtime: {d.downtime_days} days ({d.downtime_hours}h)
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Non-producing inspections: {d.non_producing_inspections}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="downtime_days" radius={[4, 4, 0, 0]}>
                    {downtimeRanking.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.downtime_days >= 14 ? '#F43F5E' : entry.downtime_days > 0 ? '#F59E0B' : '#00D4A1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Compact "Ask the Copilot" Panel (4 Columns) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-[#0A1224] p-5 shadow-md glow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-700/80 text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight">Ask the Copilot</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Click any verified operational scenario to inspect real records with generative UI:
            </p>

            <div className="mt-4 space-y-2">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLaunchPrompt(q.prompt)}
                  className="w-full text-left rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-emerald-950/30 hover:border-emerald-600/60 p-3 transition-all group"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 flex items-center justify-between">
                    <span>{q.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                    &ldquo;{q.prompt}&rdquo;
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/copilot"
            className="w-full text-center rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 py-2.5 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <span>Open Free-Form Chat</span>
            <Bot className="h-4 w-4 text-emerald-400" />
          </Link>
        </div>
      </div>

      {/* 4. Fleet Attention & Well Status Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0A1224] p-5 sm:p-6 shadow-md glow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-400" />
              Fleet Status & Telemetry Directory
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Showing active lift mechanisms, field areas, and production classifications.
            </p>
          </div>
          <Link
            href="/wells"
            className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            View All Assets ({wells.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#070D19]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Well Asset</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Artificial Lift</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">API Number</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredWells.slice(0, 6).map((well) => (
                <tr key={well.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        well.status === 'active'
                          ? 'bg-emerald-400'
                          : well.status === 'planned-maintenance'
                          ? 'bg-sky-400'
                          : 'bg-rose-500'
                      }`}
                    />
                    <Link href={`/wells/${well.id}`} className="hover:text-emerald-400 transition-colors">
                      {well.id}
                    </Link>
                    <span className="text-slate-400 font-normal">({well.well_name})</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">{well.area}</td>
                  <td className="px-4 py-3 text-slate-400">
                    <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-[11px] border border-slate-800">
                      {well.lift_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        well.status === 'active'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                          : well.status === 'planned-maintenance'
                          ? 'bg-sky-950/80 text-sky-300 border border-sky-800/80'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                      }`}
                    >
                      {well.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{well.api_number}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleLaunchPrompt(`Why was ${well.id} not producing?`)}
                      className="rounded border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
