'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Database,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  Edit,
  Activity,
  Flame,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { api, WellItem } from '@/lib/api';

export default function WellsDirectoryPage() {
  const [wells, setWells] = useState<WellItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [liftFilter, setLiftFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'downtime' | 'name'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getWells({
          area: areaFilter || undefined,
          well_type: liftFilter || undefined,
          status: statusFilter || undefined,
          search: search || undefined,
        });
        setWells(res.wells || []);
        setCurrentPage(1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [areaFilter, liftFilter, statusFilter, search]);

  // Sorting
  const sortedWells = useMemo(() => {
    const list = [...wells];
    list.sort((a, b) => {
      if (sortBy === 'downtime') {
        return sortOrder === 'desc'
          ? b.measured_downtime_days - a.measured_downtime_days
          : a.measured_downtime_days - b.measured_downtime_days;
      }
      if (sortBy === 'name') {
        return sortOrder === 'desc'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      }
      return sortOrder === 'desc'
        ? b.id.localeCompare(a.id)
        : a.id.localeCompare(b.id);
    });
    return list;
  }, [wells, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedWells.length / pageSize) || 1;
  const paginatedWells = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedWells.slice(start, start + pageSize);
  }, [sortedWells, currentPage, pageSize]);

  // Aggregate stats
  const totalDowntime = useMemo(
    () => wells.reduce((acc, w) => acc + (w.measured_downtime_days || 0), 0),
    [wells]
  );
  const activeCount = useMemo(
    () => wells.filter((w) => w.status === 'Active' || w.status === 'active').length,
    [wells]
  );
  const overrideCount = useMemo(
    () => wells.reduce((acc, w) => acc + (w.accepted_corrections_count || 0), 0),
    [wells]
  );

  const handleExportCsv = () => {
    const headers = 'ID,Name,Area,Field,Lift Type,Formation,Status,Downtime (Days),Inspections,Overrides\n';
    const rows = sortedWells
      .map(
        (w) =>
          `"${w.id}","${w.name}","${w.area}","${w.field}","${w.well_type}","${w.target_formation}","${w.status}",${w.measured_downtime_days},${w.recent_inspections_count},${w.accepted_corrections_count}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wells_directory_${areaFilter || 'all'}.csv`;
    link.click();
  };

  const toggleSort = (field: 'id' | 'downtime' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              <Database className="h-3 w-3" /> Asset Inventory
            </span>
            <span className="text-xs text-slate-400 font-mono">600 Permian Basin Wells</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Wellhead Asset Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified inventory of producing, shut-in, and artificial lift wellheads with deterministic downtime tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={wells.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" /> Export CSV ({wells.length})
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/80 shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filtered Assets</span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {loading ? '—' : wells.length}
              <span className="text-xs text-slate-400 font-normal ml-1">/ 600</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Database className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/80 shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Producing</span>
            <div className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {loading ? '—' : activeCount}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/80 shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Summer Downtime</span>
            <div className="text-xl font-extrabold text-rose-600 mt-0.5">
              {loading ? '—' : `${totalDowntime.toLocaleString()}d`}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/80 shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Human Overrides</span>
            <div className="text-xl font-extrabold text-purple-600 mt-0.5">
              {loading ? '—' : overrideCount}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by well name or ID (e.g. WELL-0007)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Area Selector */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="">All Operational Sectors (600 Wells)</option>
            <option value="Southwest Block 23">Southwest Block 23 (Area A · 63 wells)</option>
            <option value="Southwest Block 24">Southwest Block 24 (Area B · 65 wells)</option>
            <option value="Northeast Block 7">Northeast Block 7 (Area C · 70 wells)</option>
            <option value="Northeast Block 8">Northeast Block 8 (Area D · 72 wells)</option>
            <option value="Northwest Block 12">Northwest Block 12 (100 wells)</option>
            <option value="Southeast Block 31">Southeast Block 31 (110 wells)</option>
            <option value="Southeast Block 32">Southeast Block 32 (120 wells)</option>
          </select>

          {/* Lift Mechanism */}
          <select
            value={liftFilter}
            onChange={(e) => setLiftFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="">All Lift Mechanisms</option>
            <option value="T200">T200 Rod-Lift (ΔT ≥ 15°C)</option>
            <option value="T350">T350 Deep Rod-Lift (ΔT ≥ 20°C)</option>
            <option value="T500">T500 High-Capacity (ΔT ≥ 25°C)</option>
            <option value="Gas Lift">Gas Lift (ΔT ≥ 15°F)</option>
            <option value="Electric Submersible Pump">ESP (ΔT ≥ 25°F)</option>
            <option value="Rod Pump">Rod Pump (ΔT ≥ 12°F)</option>
            <option value="Flowing">Natural Flowing (ΔT ≥ 18°F)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Shut-In">Shut-In / Inactive</option>
          </select>
        </div>
      </div>

      {/* 4. Wells Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/90 text-slate-600 font-mono text-[11px]">
              <tr>
                <th
                  onClick={() => toggleSort('id')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Well ID</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Well Name</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Area & Field</th>
                <th className="px-4 py-3">Lift Mechanism</th>
                <th className="px-4 py-3">Target Formation</th>
                <th
                  onClick={() => toggleSort('downtime')}
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Summer Downtime</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Audited Overrides</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="inline-flex items-center gap-2.5 rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                      Loading verified well records...
                    </div>
                  </td>
                </tr>
              ) : paginatedWells.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    No well records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedWells.map((well) => (
                  <tr key={well.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {well.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{well.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="font-medium text-slate-800">{well.area}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{well.field}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700">
                        {well.well_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{well.target_formation}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          well.measured_downtime_days >= 21
                            ? 'bg-rose-50 text-rose-700 font-extrabold'
                            : well.measured_downtime_days >= 7
                            ? 'bg-amber-50 text-amber-700 font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {well.measured_downtime_days}d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
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
                    <td className="px-4 py-3 text-center">
                      {well.accepted_corrections_count > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-mono text-purple-700 font-semibold">
                          <Edit className="h-3 w-3" /> {well.accepted_corrections_count} Overrides
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/copilot?q=${encodeURIComponent(`Why was ${well.id} not producing? Show complete inspection timeline and repair causes.`)}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Ask Copilot <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar */}
        {!loading && sortedWells.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 font-medium">
            <div>
              Showing <span className="font-bold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-slate-700">
                {Math.min(currentPage * pageSize, sortedWells.length)}
              </span>{' '}
              of <span className="font-bold text-slate-700">{sortedWells.length}</span> wells
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <span className="px-2 font-mono text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
