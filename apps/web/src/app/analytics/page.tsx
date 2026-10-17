'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Bot,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Calendar,
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
  Legend,
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
    if (val === 0) return 'bg-slate-900 text-slate-500 border-slate-800';
    if (val < 10) return 'bg-emerald-950 text-emerald-300 border-emerald-800 font-medium';
    if (val < 20) return 'bg-amber-950 text-amber-200 border-amber-800 font-semibold';
    return 'bg-rose-950 text-rose-200 border-rose-800 font-bold';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-400" /> Operational Analytics & Trends
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Query-driven deterministic analytics, downtime accounting, and maintenance expenditure metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/copilot?q=Show monthly downtime by area as a heatmap."
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow"
          >
            <Bot className="h-3.5 w-3.5" /> Ask Copilot to Analyze
          </Link>
        </div>
      </div>

      {/* Area Selector */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0E1626] p-3 text-xs">
        <span className="text-slate-400 font-medium">Select Operational Sector:</span>
        {['Area A', 'Area B', 'Area C'].map((area) => (
          <button
            key={area}
            onClick={() => setSelectedArea(area)}
            className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
              selectedArea === area
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Top 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Downtime by Well in Area */}
        <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Summer 2026 Downtime by Well ({selectedArea})</h3>
              <p className="text-xs text-slate-400">7 days per non-producing inspection, 14 days consecutive</p>
            </div>
            <span className="font-mono text-xs text-rose-400 font-bold">
              Total: {downtimeData?.total_area_downtime_days || 0} days
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={downtimeData?.ranked_wells || []}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="well_id" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="downtime_days" fill="#10B981" radius={[4, 4, 0, 0]} name="Downtime Days" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Repair Costs by Category */}
        <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Maintenance Expenditure by Category</h3>
              <p className="text-xs text-slate-400">Verified work tickets ({selectedArea})</p>
            </div>
            <span className="font-mono text-xs text-emerald-400 font-bold">
              Total: ${repairData?.total_repair_cost_usd?.toLocaleString() || '0'}
            </span>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="category" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Cost']}
                />
                <Bar dataKey="cost" fill="#38BDF8" radius={[4, 4, 0, 0]} name="Cost (USD)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2D Aggregated Heatmap: Area vs Month */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Monthly Downtime Matrix (Heatmap)</h3>
            <p className="text-xs text-slate-400">Two-dimensional aggregation: Operational Area vs Summer Calendar Months</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>Color Scale:</span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-slate-900 border border-slate-800"></span> 0d
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-emerald-950 border border-emerald-800"></span> &lt;10d
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-amber-950 border border-amber-800"></span> 10-20d
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-rose-950 border border-rose-800"></span> &gt;20d
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
                  <th key={m} className="p-3 text-center font-mono text-xs text-slate-300 font-semibold">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yAreas.map((area: string) => (
                <tr key={area} className="border-t border-slate-800/80">
                  <td className="p-3 font-semibold text-xs text-white bg-slate-900/30">
                    {area}
                  </td>
                  {xMonths.map((month: string) => {
                    const cell = heatmapData?.cells?.find((c: any) => c.x === month && c.y === area);
                    const val = cell ? cell.value : 0;
                    return (
                      <td key={month} className="p-2 text-center">
                        <div
                          className={`rounded-lg border p-4 text-center transition-transform hover:scale-105 shadow-sm ${getHeatmapColor(
                            val
                          )}`}
                        >
                          <div className="text-base font-mono font-bold tracking-tight">
                            {val} days
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5 font-sans">
                            {val === 0 ? 'Optimal Flow' : val > 14 ? 'Critical Anomaly' : 'Moderate'}
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
