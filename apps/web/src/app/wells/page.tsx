'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database,
  Search,
  Filter,
  ExternalLink,
  Flame,
  AlertTriangle,
  ArrowUpDown,
  Download,
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-400" /> Wellhead Asset Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete inventory of producing, shut-in, and artificial lift wellheads across operational sectors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export Directory
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0E1626] p-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by well name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Areas</option>
            <option value="Area A">Area A (Midland)</option>
            <option value="Area B">Area B (Delaware)</option>
            <option value="Area C">Area C (Central)</option>
          </select>

          <select
            value={liftFilter}
            onChange={(e) => setLiftFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Lift Types</option>
            <option value="Gas Lift">Gas Lift (15°F threshold)</option>
            <option value="Electric Submersible Pump">ESP (25°F threshold)</option>
            <option value="Rod Pump">Rod Pump (12°F threshold)</option>
            <option value="Flowing">Natural Flowing (18°F threshold)</option>
          </select>
        </div>
      </div>

      {/* Wells Grid / Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono">
              <tr>
                <th className="px-4 py-3">Well ID</th>
                <th className="px-4 py-3">Well Name</th>
                <th className="px-4 py-3">Area & Field</th>
                <th className="px-4 py-3">Lift Mechanism</th>
                <th className="px-4 py-3">Target Formation</th>
                <th className="px-4 py-3 text-right">Summer Downtime</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Caveats</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    Loading well inventory...
                  </td>
                </tr>
              ) : wells.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No wells match the current filters.
                  </td>
                </tr>
              ) : (
                wells.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-sky-400">{w.id}</td>
                    <td className="px-4 py-3 font-medium text-white">{w.name}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {w.area} <span className="text-slate-600">({w.field})</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300">
                        {w.well_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">{w.target_formation}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span className={w.measured_downtime_days > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {w.measured_downtime_days} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          w.status === 'Active'
                            ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                            : 'bg-amber-950 border border-amber-800 text-amber-400'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {w.active_conflicts_count > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-950/70 border border-amber-800 px-2 py-0.5 text-[10px] text-amber-300" title="Active operational conflict">
                          <AlertTriangle className="h-3 w-3 text-amber-400" /> {w.active_conflicts_count}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/wells/${w.id}`}
                        className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] text-sky-400 transition-colors"
                      >
                        Profile <ExternalLink className="h-3 w-3" />
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
