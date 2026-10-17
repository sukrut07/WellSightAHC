'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Terminal,
  Database,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-emerald-400" /> Operational Audit & Conflict Registry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete system auditability: verifiable ingestion provenance, active data conflicts, and agent tool execution logs
        </p>
      </div>

      {/* Conflict Registry Section */}
      <div className="rounded-xl border border-amber-900/60 bg-[#0E1626] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Active Operational Contradiction Registry</h3>
              <p className="text-xs text-slate-400">Contested pumper claims, missing regulatory evidence, and directory mismatches</p>
            </div>
          </div>
          <span className="rounded bg-amber-950 border border-amber-800 px-2 py-0.5 font-mono text-xs text-amber-300 font-bold">
            {conflicts.length} Active Discrepancies
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conflicts.map((conf, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-amber-800/80 bg-slate-900/60 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">{conf.issue}</span>
                <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-amber-900 text-slate-300">
                  Target: {conf.target_id}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-slate-400">
                  <span className="text-slate-500 font-semibold">Source Record:</span> {conf.primary_source}
                </div>
                <div className="text-amber-200">
                  <span className="text-amber-400/80 font-semibold">Competing Claim:</span> {conf.competing_source}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-2.5 rounded border border-slate-800">
                <strong className="text-amber-400 font-medium">Uncertainty Notice: </strong>
                {conf.uncertainty_explanation}
              </p>

              {conf.precedence_rule && (
                <div className="text-[10px] text-slate-500 font-mono">
                  Precedence: {conf.precedence_rule}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Ingestion Batches + Tool Traces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ingestion History */}
        <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Dataset Ingestion Batches</h3>
            </div>
            <span className="font-mono text-xs text-slate-400">{ingestionJobs.length} batches</span>
          </div>

          <div className="space-y-2.5">
            {ingestionJobs.map((job) => (
              <div key={job.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-sky-400">{job.id}</span>
                  <span className="text-slate-500 text-[10px]">{job.created_at ? new Date(job.created_at).toLocaleString() : ''}</span>
                </div>
                <div className="text-slate-300 truncate font-mono text-[11px]">{job.filename}</div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                  <span className="text-emerald-400">✓ {job.records_imported} imported</span>
                  <span className={job.records_failed > 0 ? 'text-rose-400' : 'text-slate-500'}>
                    ✗ {job.records_failed} failed
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.2 uppercase text-slate-300">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Copilot Query Audit Logs */}
        <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Copilot Tool Audit Traces</h3>
            </div>
            <span className="font-mono text-xs text-slate-400">{auditEvents.length} events</span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {auditEvents.map((ev) => (
              <div key={ev.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-emerald-400">{ev.event_type}</span>
                  <span className="text-slate-500">{ev.created_at ? new Date(ev.created_at).toLocaleTimeString() : ''}</span>
                </div>
                {ev.details?.query && (
                  <div className="text-slate-200 font-medium">&ldquo;{ev.details.query}&rdquo;</div>
                )}
                {ev.details?.tools_executed && ev.details.tools_executed.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono text-slate-400">
                    <span>Tools:</span>
                    {ev.details.tools_executed.map((tName: string, tIdx: number) => (
                      <span key={tIdx} className="rounded bg-slate-800 border border-slate-700 px-1 text-sky-300">
                        {tName}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-slate-500 font-mono">
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
