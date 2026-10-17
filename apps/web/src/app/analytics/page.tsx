'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Bot,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function AnalyticsPage() {
  const [selectedArea, setSelectedArea] = useState('Area A');
  const [downtimeData, setDowntimeData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [repairData, setRepairData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [dt, hm, rep] = await Promise.all([
          api.getDowntimeAnalytics(selectedArea),
          api.getHeatmapAnalytics(),
          api.getRepairsAnalytics(selectedArea),
        ]);
        setDowntimeData(dt);
        setHeatmapData(hm);
        setRepairData(rep);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedArea]);

  const xMonths = heatmapData?.months || ['June 2026', 'July 2026', 'August 2026'];
  const yAreas = heatmapData?.areas || ['Area A', 'Area B', 'Area C'];

  const getHeatmapColor = (val: number) => {
    if (val === 0) return 'bg-slate-50 text-slate-500 border-slate-200';
    if (val < 10) return 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200 font-semibold';
    if (val < 20) return 'bg-[#FEF3C7] text-[#B45309] border-amber-300 font-bold';
    return 'bg-[#FFE4E6] text-[#E11D48] border-rose-300 font-extrabold';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E0E7FF] text-[#4338CA]">
              <Activity className="h-3 w-3" /> Telemetry Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">SCADA Engine 2.1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Operational Analytics & Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Deterministic downtime calculations, thermodynamic thresholds, and verified maintenance ledger analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/copilot?q=Show monthly downtime by area as a heatmap."
            className="inline-flex items-center gap-2 rounded-full bg-[#111625] hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Bot className="h-3.5 w-3.5 text-emerald-400" /> Ask Copilot to Analyze
          </Link>
        </div>
      </motion.div>

      {/* Area Selector Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Production Sector:</span>
          {['Area A', 'Area B', 'Area C'].map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`rounded-full px-4 py-1.5 font-bold text-xs transition-all ${
                selectedArea === area
                  ? 'bg-[#111625] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Evaluation Horizon: Summer 2026 (June 1 - Aug 31)</span>
        </div>
      </div>

      {/* Top 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Downtime by Well in Area */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Summer 2026 Downtime by Well ({selectedArea})</h3>
              <p className="text-xs text-slate-400 mt-0.5">7 days per non-producing inspection; 14 days consecutive</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-mono text-xs font-bold">
              Total: {downtimeData?.total_area_downtime_days || 0}d
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={downtimeData?.ranked_wells || []}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="well_id" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111625', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="downtime_days" fill="#FF4D6D" radius={[6, 6, 0, 0]} name="Downtime (Days)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Repair Costs by Category */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Maintenance Expenditure by Category</h3>
              <p className="text-xs text-slate-400 mt-0.5">Verified work orders ({selectedArea})</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold">
              Total: ${repairData?.total_repair_cost_usd?.toLocaleString() || '0'}
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  repairData?.cost_by_category
                    ? Object.entries(repairData.cost_by_category).map(([k, v]) => ({
                        category: k,
                        cost: v,
                      }))
                    : []
                }
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="category" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111625', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Cost']}
                />
                <Bar dataKey="cost" fill="#38BDF8" radius={[6, 6, 0, 0]} name="Cost (USD)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2D Aggregated Heatmap: Area vs Month */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Downtime Aggregation Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">Two-dimensional cross-tabulation: Operational Sector vs Summer Calendar Months</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="font-sans font-semibold text-slate-600">Scale:</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200"></span> 0d
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-400"></span> &lt;10d
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span> 10-20d
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> &gt;20d
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left font-mono text-xs text-slate-400 uppercase tracking-wider">
                  Operational Sector
                </th>
                {xMonths.map((m: string) => (
                  <th key={m} className="p-3 text-center font-mono text-xs text-slate-700 font-bold">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yAreas.map((area: string) => (
                <tr key={area} className="border-t border-slate-100">
                  <td className="p-4 font-bold text-xs text-slate-900">
                    {area}
                  </td>
                  {xMonths.map((month: string) => {
                    const cell = heatmapData?.cells?.find((c: any) => c.x === month && c.y === area);
                    const val = cell ? cell.value : 0;
                    return (
                      <td key={month} className="p-3 text-center">
                        <div
                          className={`rounded-2xl border p-4 text-center transition-all hover:scale-105 shadow-sm ${getHeatmapColor(
                            val
                          )}`}
                        >
                          <div className="text-lg font-mono font-black tracking-tight">
                            {val} <span className="text-xs font-medium">days</span>
                          </div>
                          <div className="text-[10px] opacity-80 mt-1 uppercase font-bold tracking-wider">
                            {val === 0 ? 'Optimal Flow' : val > 14 ? 'Critical Non-producing' : 'Moderate'}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
