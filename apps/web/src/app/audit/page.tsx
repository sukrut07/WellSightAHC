'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api } from '@/lib/api';
import { ConflictNotice } from '@/types/generative-ui';

export default function AuditPage() {
  const [conflicts, setConflicts] = useState<ConflictNotice[]>([]);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [ingestionJobs, setIngestionJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [confs, evts, jobs] = await Promise.all([
          api.getConflicts(),
          api.getAuditEvents(),
          api.getIngestionJobs(),
        ]);
        setConflicts(confs);
        setAuditEvents(evts);
        setIngestionJobs(jobs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-200 pb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FFE4E6] text-[#BE123C]">
            <ShieldAlert className="h-3 w-3" /> Integrity Verification
          </span>
          <span className="text-xs text-slate-400 font-mono">Discrepancy Audit Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Operational Audit & Conflict Registry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Verifiable ingestion provenance, active operational contradictions, and deterministic Copilot tool execution traces.
        </p>
      </motion.div>

      {/* Conflict Registry Section */}
      <div className="glass-panel p-6 rounded-3xl border-amber-200/80 bg-amber-50/30 space-y-6">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Operational Discrepancy Registry</h3>
              <p className="text-xs text-slate-500 mt-0.5">Contested pumper reports, missing regulatory notices, and telemetry contradictions</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 font-mono text-xs text-amber-900 font-bold">
            {conflicts.length} Active Discrepancies
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {conflicts.map((conf, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-amber-200 bg-white p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">{conf.issue}</span>
                <span className="font-mono text-[10px] bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 font-bold">
                  {conf.target_id}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-slate-600 font-medium">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Primary Record:</span> {conf.primary_source}
                </div>
                <div className="text-amber-800 font-semibold">
                  <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Competing Claim:</span> {conf.competing_source}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono">
                <strong className="text-amber-800 font-bold font-sans">Uncertainty Notice: </strong>
                {conf.uncertainty_explanation}
              </p>

              {conf.precedence_rule && (
                <div className="text-[11px] text-slate-500 font-medium">
                  <span className="font-bold text-slate-700">Precedence Rule:</span> {conf.precedence_rule}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Ingestion Batches + Tool Traces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ingestion History */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
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
                  <span className="text-slate-400 text-[10px]">{job.created_at ? new Date(job.created_at).toLocaleString() : ''}</span>
                </div>
                <div className="text-slate-700 truncate font-mono text-[11px] font-semibold">{job.filename}</div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
                  <span className="text-emerald-700 font-bold">✓ {job.records_imported} imported</span>
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
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Copilot Tool Audit Traces</h3>
            </div>
            <span className="font-mono text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
              {auditEvents.length} events
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {auditEvents.map((ev) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
