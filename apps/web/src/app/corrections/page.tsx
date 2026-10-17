'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Edit,
  ShieldCheck,
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Sparkles,
} from 'lucide-react';
import { api, CorrectionItem } from '@/lib/api';
import { CorrectionModal } from '@/components/CorrectionModal';

export default function CorrectionsPage() {
  const [corrections, setCorrections] = useState<CorrectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scopeFilter, setScopeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCorrections = async () => {
    setLoading(true);
    try {
      const res = await api.getCorrections({
        scope: scopeFilter || undefined,
        status: statusFilter || undefined,
      });
      setCorrections(res.corrections || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorrections();
  }, [scopeFilter, statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateCorrectionStatus(id, newStatus);
      loadCorrections();
    } catch (err) {
      console.error(err);
    }
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FEF3C7] text-[#92400E]">
              <History className="h-3 w-3" /> Audit Invariance
            </span>
            <span className="text-xs text-slate-400 font-mono">Immutable Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Human Corrections & Audit Provenance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Verifiable overrides across record, well, and well-type scopes. Raw source files remain untouched.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#111625] hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 text-emerald-400" /> Submit New Correction
        </button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Accepted Overrides</span>
          <div className="text-2xl font-extrabold text-emerald-950 font-mono">
            {corrections.filter((c) => c.status === 'Accepted').length}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Takes mathematical precedence in downtime math</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Contested Claims</span>
          <div className="text-2xl font-extrabold text-amber-950 font-mono">
            {corrections.filter((c) => c.status === 'Contested').length}
          </div>
          <p className="text-[11px] text-amber-700 font-medium">Flagged in Conflict Registry for supervisor review</p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">Scoped Granularity</span>
          <div className="text-2xl font-extrabold text-indigo-950 font-mono">3 Tiers</div>
          <p className="text-[11px] text-indigo-700 font-medium">Record-level, well-level, and well-type overrides</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Raw Data Invariance</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">100% Immutable</div>
          <p className="text-[11px] text-slate-500 font-medium">Zero in-place modifications to dataset files</p>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="rounded-2xl border border-sky-200 bg-[#E0F2FE]/40 p-4 text-xs text-sky-900 space-y-1">
        <span className="font-bold flex items-center gap-1.5 text-sky-950">
          <ShieldCheck className="h-4 w-4 text-sky-600" /> Organiser Invariance Rule:
        </span>
        <p className="text-slate-600 leading-relaxed font-medium">
          Corrections never overwrite raw files. Accepted overrides take mathematical precedence in downstream downtime and compliance calculations, while contested claims are flagged in the Conflict Registry.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Scope:</span>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-semibold focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Scopes</option>
              <option value="record">Record-Scoped (Single inspection or spill)</option>
              <option value="well">Well-Scoped (Applies to targeted well)</option>
              <option value="well_type">Well-Type Scoped (Applies to entire lift class)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-semibold focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Accepted">Accepted (Active in calculations)</option>
              <option value="Contested">Contested (Flagged as conflict)</option>
              <option value="Pending">Pending (Under review)</option>
            </select>
          </div>
        </div>

        <span className="font-mono text-xs text-slate-500 font-bold bg-white px-3 py-1 rounded-full border border-slate-200">
          {corrections.length} recorded corrections
        </span>
      </div>

      {/* Corrections Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Correction ID</th>
                <th className="px-5 py-3.5">Scope</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">Field</th>
                <th className="px-5 py-3.5">Original Value</th>
                <th className="px-5 py-3.5">Corrected Value</th>
                <th className="px-5 py-3.5">Author & Reason</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-400 font-medium">
                    Loading corrections...
                  </td>
                </tr>
              ) : corrections.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-400 font-medium">
                    No corrections match the current filters.
                  </td>
                </tr>
              ) : (
                corrections.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-indigo-700">{c.id}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-mono text-slate-700 font-bold uppercase">
                        {c.scope}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-900 font-bold">{c.target_id}</td>
                    <td className="px-5 py-4 font-mono text-slate-500">{c.target_field}</td>
                    <td className="px-5 py-4 font-mono text-rose-500 line-through font-semibold">{c.original_value}</td>
                    <td className="px-5 py-4 font-mono text-emerald-600 font-bold">{c.corrected_value}</td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-bold text-slate-900">{c.author}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{c.reason}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold ${
                          c.status === 'Accepted'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            : c.status === 'Contested'
                            ? 'bg-amber-50 border border-amber-200 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5">
                      {c.status !== 'Accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'Accepted')}
                          className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Accept correction"
                        >
                          Accept
                        </button>
                      )}
                      {c.status !== 'Contested' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'Contested')}
                          className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                          title="Flag as contested"
                        >
                          Contest
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CorrectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCorrectionSubmitted={loadCorrections}
      />
    </div>
  );
}
