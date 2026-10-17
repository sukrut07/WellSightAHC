'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Terminal,
  Database,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  Search,
  Filter,
  Flame,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ConflictNotice } from '@/types/generative-ui';

export default function AuditPage() {
  const [conflicts, setConflicts] = useState<ConflictNotice[]>([]);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [ingestionJobs, setIngestionJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'spill' | 'status'>('all');
  const [search, setSearch] = useState('');
  const [conflictPage, setConflictPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    async function load() {
      try {
        const [confs, evts, jobs] = await Promise.all([
          api.getConflicts(),
          api.getAuditEvents(),
          api.getIngestionJobs(),
        ]);
        setConflicts(confs || []);
        setAuditEvents(evts || []);
        setIngestionJobs(jobs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredConflicts = useMemo(() => {
    return conflicts.filter((c) => {
      const matchesSearch =
        !search ||
        c.target_id.toLowerCase().includes(search.toLowerCase()) ||
        c.issue.toLowerCase().includes(search.toLowerCase()) ||
        c.primary_source.toLowerCase().includes(search.toLowerCase());

      const isSpill = c.issue.toLowerCase().includes('spill');
      if (selectedCategory === 'spill') return matchesSearch && isSpill;
      if (selectedCategory === 'status') return matchesSearch && !isSpill;
      return matchesSearch;
    });
  }, [conflicts, selectedCategory, search]);

  const totalPages = Math.ceil(filteredConflicts.length / pageSize) || 1;
  const paginatedConflicts = useMemo(() => {
    const start = (conflictPage - 1) * pageSize;
    return filteredConflicts.slice(start, start + pageSize);
  }, [filteredConflicts, conflictPage, pageSize]);

  const spillViolationCount = useMemo(
    () => conflicts.filter((c) => c.issue.toLowerCase().includes('spill')).length,
    [conflicts]
  );
  const totalIngestedRecords = useMemo(
    () => ingestionJobs.reduce((acc, j) => acc + (j.records_imported || 0), 0),
    [ingestionJobs]
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200/60">
              <ShieldAlert className="h-3 w-3" /> Data Integrity Verification
            </span>
            <span className="text-xs text-slate-400 font-mono">Discrepancy Audit Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Operational Audit & Conflict Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifiable dataset ingestion provenance, regulatory compliance contradictions, and deterministic Copilot traces.
          </p>
        </div>

        <Link
          href="/copilot?q=Which conclusions are uncertain because records conflict, and what are the specific discrepancies?"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition-all"
        >
          Ask Copilot to Audit <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
        </Link>
      </motion.div>

      {/* 2. KPI Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/80 shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Discrepancies</span>
            <div className="text-xl font-extrabold text-amber-600 mt-0.5">
              {loading ? '—' : conflicts.length}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/80 shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Spill Violations (&gt;=5 bbl)</span>
            <div className="text-xl font-extrabold text-rose-600 mt-0.5">
              {loading ? '—' : spillViolationCount}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flame className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/80 shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ingested Records</span>
            <div className="text-xl font-extrabold text-indigo-600 mt-0.5">
              {loading ? '—' : totalIngestedRecords.toLocaleString()}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Database className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/80 shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Copilot Tool Traces</span>
            <div className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {loading ? '—' : auditEvents.length}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Terminal className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* 3. Conflict Registry Section */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-200/80 bg-amber-50/20 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-200/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Operational Discrepancy Registry</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Surfaced contradictions between sensor telemetry, pumper inspection logs, and statutory spill notices
              </p>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs">
            <button
              onClick={() => { setSelectedCategory('all'); setConflictPage(1); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedCategory === 'all' ? 'bg-amber-100 text-amber-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({conflicts.length})
            </button>
            <button
              onClick={() => { setSelectedCategory('spill'); setConflictPage(1); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedCategory === 'spill' ? 'bg-rose-100 text-rose-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Spill Notices ({spillViolationCount})
            </button>
            <button
              onClick={() => { setSelectedCategory('status'); setConflictPage(1); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedCategory === 'status' ? 'bg-indigo-100 text-indigo-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Production Contradictions ({conflicts.length - spillViolationCount})
            </button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search discrepancies by record ID or keyword..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setConflictPage(1); }}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none transition-all shadow-xs"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-slate-400 text-xs">
              Loading conflict records...
            </div>
          ) : paginatedConflicts.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-400 text-xs">
              No discrepancies match the active filter.
            </div>
          ) : (
            paginatedConflicts.map((conf, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-amber-200/90 bg-white p-4.5 space-y-3 shadow-xs hover:border-amber-300 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-900">{conf.issue}</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 font-bold shrink-0">
                    {conf.target_id}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-600">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Primary Record:</span> {conf.primary_source}
                  </div>
                  <div className="text-amber-800 font-medium">
                    <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Competing Claim:</span> {conf.competing_source}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono text-[11px]">
                  <strong className="text-amber-800 font-bold font-sans">Uncertainty Notice: </strong>
                  {conf.uncertainty_explanation}
                </p>

                {conf.precedence_rule && (
                  <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>
                      <span className="font-bold text-slate-700">Precedence:</span> {conf.precedence_rule}
                    </span>
                    <Link
                      href={`/copilot?q=${encodeURIComponent(`Explain conflict on ${conf.target_id} and show which rule takes precedence.`)}`}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] inline-flex items-center gap-0.5"
                    >
                      Audit in Copilot <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        {!loading && filteredConflicts.length > pageSize && (
          <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-xs text-slate-500 font-medium">
            <span>
              Showing {(conflictPage - 1) * pageSize + 1} to{' '}
              {Math.min(conflictPage * pageSize, filteredConflicts.length)} of {filteredConflicts.length} discrepancies
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setConflictPage((p) => Math.max(1, p - 1))}
                disabled={conflictPage === 1}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-xs">
                {conflictPage} / {totalPages}
              </span>
              <button
                onClick={() => setConflictPage((p) => Math.min(totalPages, p + 1))}
                disabled={conflictPage === totalPages}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Two Column Grid: Ingestion Batches + Tool Traces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ingestion History */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Dataset Ingestion Batches</h3>
            </div>
            <span className="font-mono text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
              {ingestionJobs.length} batches
            </span>
          </div>

          <div className="space-y-3">
            {ingestionJobs.map((job) => (
              <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-xs space-y-2 shadow-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-indigo-700">{job.id}</span>
                  <span className="text-slate-400 text-[10px]">
                    {job.created_at ? new Date(job.created_at).toLocaleString() : ''}
                  </span>
                </div>
                <div className="text-slate-700 truncate font-mono text-[11px] font-semibold">{job.filename}</div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
                  <span className="text-emerald-700 font-bold">✓ {job.records_imported?.toLocaleString()} imported</span>
                  <span className={job.records_failed > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                    ✗ {job.records_failed} failed
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 uppercase text-slate-700 font-bold">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Copilot Query Audit Logs */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Copilot Tool Audit Traces</h3>
            </div>
            <span className="font-mono text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
              {auditEvents.length} events
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {auditEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No copilot queries logged yet. Ask queries in Copilot to see live deterministic audit traces!
              </div>
            ) : (
              auditEvents.map((ev) => (
                <div key={ev.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-xs space-y-2 shadow-xs">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-emerald-700">{ev.event_type}</span>
                    <span className="text-slate-400">{ev.created_at ? new Date(ev.created_at).toLocaleTimeString() : ''}</span>
                  </div>
                  {ev.details?.query && (
                    <div className="text-slate-900 font-semibold">&ldquo;{ev.details.query}&rdquo;</div>
                  )}
                  {ev.details?.tools_executed && ev.details.tools_executed.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <span className="font-sans font-medium">Tools:</span>
                      {ev.details.tools_executed.map((tName: string, tIdx: number) => (
                        <span key={tIdx} className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-slate-700 font-bold">
                          {tName}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 font-mono">
                    Operator: {ev.user_id || 'anonymous'} • Visual: {ev.details?.visual_type || 'text'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
