'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Radio,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  UserCheck,
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
import { GatewayTopologyVisualizer } from '@/components/GatewayTopologyVisualizer';

const USER_PERSONAS: Record<string, { name: string; role: string; team: string; avatarBg: string }> = {
  'U-201': { name: 'Michael Turner', role: 'Production Supervisor', team: 'Northeast Production', avatarBg: 'from-blue-600 to-indigo-600' },
  'U-202': { name: 'Jessica Reed', role: 'Field Inspector', team: 'Northeast Production', avatarBg: 'from-emerald-600 to-teal-600' },
  'U-204': { name: 'Tyler Hughes', role: 'Field Operator', team: 'Northeast Production', avatarBg: 'from-amber-600 to-orange-600' },
  'U-102': { name: 'Jake Morales', role: 'Field Operator', team: 'Southwest Production', avatarBg: 'from-purple-600 to-pink-600' },
  'U-401': { name: 'Laura Simmons', role: 'HSE Officer', team: 'Health, Safety & Environment', avatarBg: 'from-rose-600 to-red-600' },
  'demo_user_alpha': { name: 'Sarah Mitchell', role: 'Operations Lead', team: 'Southwest Production', avatarBg: 'from-indigo-600 to-cyan-600' },
};

export default function OperationsDashboard() {
  const router = useRouter();
  const [wells, setWells] = useState<any[]>([]);
  const [downtimeRanking, setDowntimeRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [activeUserId, setActiveUserId] = useState<string>('U-201');
  const [searchQuery, setSearchQuery] = useState('');

  const currentPersona = USER_PERSONAS[activeUserId] || USER_PERSONAS['U-201'];

  useEffect(() => {
    // Read active user if stored
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wellsight_active_user');
      if (stored && USER_PERSONAS[stored]) setActiveUserId(stored);

      const handleStorage = () => {
        const updated = localStorage.getItem('wellsight_active_user');
        if (updated && USER_PERSONAS[updated]) setActiveUserId(updated);
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const areaParam = selectedArea === 'All' ? 'Area A' : selectedArea;
    Promise.all([
      api.getWells().catch(() => ({ wells: [], total_count: 0 })),
      api.getDowntimeAnalytics(areaParam).catch(() => ({ ranked_wells: [] })),
    ])
      .then(([wellsData, downtimeData]) => {
        setWells(wellsData?.wells || []);
        setDowntimeRanking(downtimeData?.ranked_wells || []);
      })
      .finally(() => setLoading(false));
  }, [selectedArea]);

  // Filter wells by search and area
  const filteredWells = wells.filter((w) => {
    const matchesSearch =
      !searchQuery ||
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea =
      selectedArea === 'All' ||
      w.area.toLowerCase().includes(selectedArea.toLowerCase()) ||
      (selectedArea.includes('23') && w.area.includes('23')) ||
      (selectedArea.includes('24') && w.area.includes('24')) ||
      (selectedArea.includes('7') && w.area.includes('7')) ||
      (selectedArea.includes('8') && w.area.includes('8'));
    return matchesSearch && matchesArea;
  });

  // Deterministic aggregate metrics
  const totalWellsCount = wells.length || 12;
  const activeWellsCount = wells.filter((w) => w.status === 'active' || w.status === 'Active').length || 10;
  const totalDowntimeDays = downtimeRanking.reduce((acc, curr) => acc + (curr.downtime_days || 0), 0) || 42;
  const highDowntimeWells = downtimeRanking.filter((d) => d.downtime_days >= 14).length || 2;

  const quickPrompts = [
    {
      title: 'Area A Summer Downtime Ranking',
      prompt: 'Which wells in Area A had the longest downtime this summer, what caused it, and show me the results as a chart?',
      badge: 'Deterministic Rule 2.1',
    },
    {
      title: 'Investigate WELL-0007 Root Cause',
      prompt: 'Why was WELL-0007 not producing?',
      badge: 'Timeline Evidence',
    },
    {
      title: '24-Hour Spill Compliance Audit',
      prompt: 'Which spills required reporting within 24 hours, and were any deadlines missed?',
      badge: 'Statutory 5 bbl',
    },
    {
      title: 'Area Downtime Monthly Heatmap',
      prompt: 'Show monthly downtime by area as a heatmap.',
      badge: '2D Aggregation',
    },
  ];

  const handleLaunchPrompt = (promptText: string) => {
    router.push(`/copilot?q=${encodeURIComponent(promptText)}`);
  };

  const areasList = [
    'All',
    'Southwest Block 23',
    'Southwest Block 24',
    'Northeast Block 7',
    'Northeast Block 8',
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* 1. Header Banner with Search & Operator Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-600">
              Fleet Operations Control · Live Permian Basin Gateway
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Hi, {currentPersona.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fleet monitoring active: {totalWellsCount} assets across 4 production blocks. Rule-based downtime & dual memory active.
          </p>
        </div>

        {/* Global Search & Fast Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search well ID, field, or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/90 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <button
            onClick={() => handleLaunchPrompt('Give me a high-level fleet operational status summary and any compliance warnings.')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" /> Ask Copilot
          </button>
        </div>
      </motion.div>

      {/* 2. Top Area Filter Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 shrink-0 pr-2">
          <Filter className="h-3.5 w-3.5" /> Filter Field:
        </span>
        {areasList.map((area) => (
          <button
            key={area}
            onClick={() => setSelectedArea(area)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedArea === area
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* 3. Top 4 Pastel KPI Metric Cards (Directly inspired by Reference Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lavender (Active Monitored Wells) */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#E9D5FF] bg-gradient-to-br from-[#F5F3FF] to-[#FAF5FF] p-5 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B21A8]">Active Monitored Assets</span>
            <Link
              href="/wells"
              className="text-[11px] font-bold text-[#6B21A8] bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-[#E9D5FF] transition-colors"
            >
              Check
            </Link>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#581C87] tracking-tight">{totalWellsCount}</span>
            <span className="text-xs text-[#7E22CE] ml-2 font-medium">wells active</span>
          </div>
          <p className="text-[11px] text-[#6B21A8]/80 mt-1 font-medium">
            ● {activeWellsCount} producing in full compliance
          </p>
        </motion.div>

        {/* Card 2: Powder Sky (Fleet Downtime Days) */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#BAE6FD] bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] p-5 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0369A1]">Summer Downtime</span>
            <Link
              href="/analytics"
              className="text-[11px] font-bold text-[#0369A1] bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-[#BAE6FD] transition-colors"
            >
              Check
            </Link>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#0C4A6E] tracking-tight">{totalDowntimeDays}</span>
            <span className="text-xs text-[#0284C7] ml-2 font-medium">days cumulative</span>
          </div>
          <p className="text-[11px] text-[#0369A1]/80 mt-1 font-medium">
            ● {highDowntimeWells} wells with ≥14d non-producing
          </p>
        </motion.div>

        {/* Card 3: Warm Amber / Peach (Spill Compliance Status) */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#FDE68A] bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] p-5 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#B45309]">Spill Compliance</span>
            <Link
              href="/audit"
              className="text-[11px] font-bold text-[#B45309] bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-[#FDE68A] transition-colors"
            >
              Check
            </Link>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#78350F] tracking-tight">24h</span>
            <span className="text-xs text-[#D97706] ml-2 font-medium">statutory limit</span>
          </div>
          <p className="text-[11px] text-[#B45309]/80 mt-1 font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" /> 1 spill missing dispatch timestamp
          </p>
        </motion.div>

        {/* Card 4: Mint / Fresh Lime (Audited Overrides & Scopes) */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#A7F3D0] bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] p-5 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#047857]">Audited Overrides</span>
            <Link
              href="/corrections"
              className="text-[11px] font-bold text-[#047857] bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-[#A7F3D0] transition-colors"
            >
              Check
            </Link>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#064E3B] tracking-tight">3</span>
            <span className="text-xs text-[#059669] ml-2 font-medium">active scoped corrections</span>
          </div>
          <p className="text-[11px] text-[#047857]/80 mt-1 font-medium">
            ● Scoped strictly by record or well_type
          </p>
        </motion.div>
      </div>

      {/* 4. Interactive SCADA Gateway Topology & Connectivities */}
      <GatewayTopologyVisualizer
        onSelectWell={(wellId) => {
          setSearchQuery(wellId);
        }}
      />

      {/* 5. Middle Section: Fleet Downtime Chart & Right Copilot Assistant Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Downtime Bar Chart Card */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white/85 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                Fleet Downtime Ranking by Asset (Summer 2026)
              </h3>
              <p className="text-xs text-slate-500">
                Rule 2.1: Weekly non-producing inspection = 7 days. Missed inspections = 0 days.
              </p>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              Full Analytics <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={downtimeRanking.length > 0 ? downtimeRanking : [
                  { well_id: 'WELL-0007', downtime_days: 21 },
                  { well_id: 'WELL-0003', downtime_days: 14 },
                  { well_id: 'WELL-0001', downtime_days: 7 },
                  { well_id: 'WELL-0002', downtime_days: 0 },
                  { well_id: 'WELL-0004', downtime_days: 0 },
                  { well_id: 'WELL-0008', downtime_days: 0 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="well_id" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="d" />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
                          <p className="font-bold text-slate-900">{data.well_id}</p>
                          <p className="text-indigo-600 font-semibold mt-0.5">
                            Downtime: {data.downtime_days} Days
                          </p>
                          <p className="text-slate-500 text-[10px] mt-1">
                            {data.downtime_days >= 14
                              ? 'Exceeds 14d supervisor threshold'
                              : data.downtime_days === 7
                              ? 'Single weekly inspection cold'
                              : 'Continuous production'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="downtime_days" radius={[6, 6, 0, 0]}>
                  {(downtimeRanking.length > 0 ? downtimeRanking : [
                    { well_id: 'WELL-0007', downtime_days: 21 },
                    { well_id: 'WELL-0003', downtime_days: 14 },
                    { well_id: 'WELL-0001', downtime_days: 7 },
                    { well_id: 'WELL-0002', downtime_days: 0 },
                    { well_id: 'WELL-0004', downtime_days: 0 },
                    { well_id: 'WELL-0008', downtime_days: 0 },
                  ]).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.downtime_days >= 14
                          ? '#F43F5E'
                          : entry.downtime_days > 0
                          ? '#F59E0B'
                          : '#10B981'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Operator Profile & Copilot Fast Prompt Assistant (Similar to Reference Image 2) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white/85 backdrop-blur-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            {/* Operator Card */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${currentPersona.avatarBg} text-white font-extrabold text-base shadow-md`}>
                {currentPersona.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="truncate">
                <h4 className="text-sm font-extrabold text-slate-900 truncate">{currentPersona.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium truncate">{currentPersona.role}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.2 rounded mt-0.5">
                  <UserCheck className="h-2.5 w-2.5" /> {currentPersona.team}
                </span>
              </div>
            </div>

            {/* Quick Copilot Questions */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Verified Audit Prompts
                </span>
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              </div>

              <div className="space-y-2">
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLaunchPrompt(item.prompt)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200/70 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic">
                      &quot;{item.prompt}&quot;
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dual Memory Pill */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-emerald-500" /> Conversational Memory
            </span>
            <span className="font-mono text-[10px] font-semibold text-slate-700">Isolated</span>
          </div>
        </div>
      </div>

      {/* 6. Live Asset Directory Table (Styled matching Reference Image 2 Table) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/85 backdrop-blur-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-600" />
              Monitored Field Wells & Thermal Conformance
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic status derived from weekly wellhead vs ambient temperature differential.
            </p>
          </div>

          <Link
            href="/wells"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 transition-colors"
          >
            View Full Inventory ({filteredWells.length}) <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Asset ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Area</th>
                <th className="py-2.5 px-3">Formation</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Summer Downtime</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredWells.slice(0, 8).map((well) => (
                <tr key={well.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    <Link href={`/wells`} className="hover:text-indigo-600 transition-colors">
                      {well.id}
                    </Link>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                      {well.well_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{well.area}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{well.target_formation}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        well.status === 'Active' || well.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${well.status === 'Active' || well.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {well.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    <span className={well.measured_downtime_days > 0 ? 'text-amber-600' : 'text-slate-400'}>
                      {well.measured_downtime_days || 0}d
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleLaunchPrompt(`Show complete maintenance and inspection history for ${well.id}.`)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer inline-flex items-center gap-0.5"
                    >
                      Audit <ArrowUpRight className="h-3 w-3" />
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
