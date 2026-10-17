'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Database,
  Search,
  Filter,
  ExternalLink,
  Flame,
  AlertTriangle,
  ArrowUpDown,
  Download,
  ArrowUpRight,
  ShieldAlert,
  Edit,
  Radio,
} from 'lucide-react';
import { api, WellItem } from '@/lib/api';

export default function WellsDirectoryPage() {
  const [wells, setWells] = useState<WellItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [liftFilter, setLiftFilter] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getWells({
          area: areaFilter || undefined,
          well_type: liftFilter || undefined,
          search: search || undefined,
        });
        setWells(res.wells || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [areaFilter, liftFilter, search]);

  const handleExportCsv = () => {
    const headers = 'ID,Name,Area,Field,Lift Type,Formation,Status,Downtime (Days),Inspections\n';
    const rows = wells
      .map(
        (w) =>
          `"${w.id}","${w.name}","${w.area}","${w.field}","${w.well_type}","${w.target_formation}","${w.status}",${w.measured_downtime_days},${w.recent_inspections_count}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wells_directory.csv';
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <Database className="h-6 w-6 text-indigo-600" /> Wellhead Asset Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete inventory of producing, shut-in, and artificial lift wellheads across Permian Basin sectors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" /> Export Directory CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/85 backdrop-blur-xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by well name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="">All Operational Areas</option>
            <option value="Southwest Block 23">Southwest Block 23</option>
            <option value="Southwest Block 24">Southwest Block 24</option>
            <option value="Northeast Block 7">Northeast Block 7</option>
            <option value="Northeast Block 8">Northeast Block 8</option>
            <option value="Area A">Area A (Midland)</option>
            <option value="Area B">Area B (Delaware)</option>
            <option value="Area C">Area C (Central)</option>
          </select>

          <select
            value={liftFilter}
            onChange={(e) => setLiftFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="">All Lift Mechanisms</option>
            <option value="T200">T200 Rod-Lift (15°C threshold)</option>
            <option value="T350">T350 Deep Rod-Lift (20°C threshold)</option>
            <option value="Gas Lift">Gas Lift (15°F threshold)</option>
            <option value="Electric Submersible Pump">ESP (25°F threshold)</option>
            <option value="Rod Pump">Rod Pump (12°F threshold)</option>
            <option value="Flowing">Natural Flowing (18°F threshold)</option>
          </select>
        </div>
      </div>

      {/* Wells Grid / Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/85 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-mono text-[11px]">
              <tr>
                <th className="px-4 py-3">Well ID</th>
                <th className="px-4 py-3">Well Name</th>
                <th className="px-4 py-3">Area & Field</th>
                <th className="px-4 py-3">Lift Mechanism</th>
                <th className="px-4 py-3">Target Formation</th>
                <th className="px-4 py-3 text-right">Summer Downtime</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Audited Overrides</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    Loading well directory records...
                  </td>
                </tr>
              ) : wells.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No wells match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                wells.map((well) => (
                  <tr key={well.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      {well.id}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{well.name}</td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div>{well.area}</div>
                      <div className="text-[10px] text-slate-400">{well.field}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700">
                        {well.well_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px]">{well.target_formation}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold">
                      <span className={well.measured_downtime_days >= 14 ? 'text-rose-600' : well.measured_downtime_days > 0 ? 'text-amber-600' : 'text-slate-400'}>
                        {well.measured_downtime_days}d
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          well.status === 'Active' || well.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${well.status === 'Active' || well.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {well.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {well.accepted_corrections_count > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-mono text-indigo-700 font-semibold">
                          <Edit className="h-3 w-3" /> {well.accepted_corrections_count} Overrides
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/copilot?q=${encodeURIComponent(`Why was ${well.id} not producing and show complete history?`)}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Ask Copilot <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
