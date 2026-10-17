'use client';

import React, { useState, useEffect } from 'react';
import {
  Edit,
  ShieldCheck,
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  History,
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Edit className="h-6 w-6 text-emerald-400" /> Persistent Corrections & Audit Provenance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable raw source values vs verified operational overrides across record, well, and well-type scopes
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow transition-colors"
        >
          <Plus className="h-4 w-4" /> Submit New Correction
        </button>
      </div>

      {/* Rules Notice */}
      <div className="rounded-xl border border-sky-900/60 bg-sky-950/20 p-4 text-xs text-sky-200 space-y-1">
        <span className="font-bold flex items-center gap-1.5 text-sky-300">
          <ShieldCheck className="h-4 w-4 text-sky-400" /> Organiser Invariance Rule:
        </span>
        <p className="text-slate-300 leading-relaxed">
          Corrections never overwrite raw files. Accepted overrides take precedence in downstream downtime and compliance calculations, while contested claims are flagged in the Conflict Registry.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0E1626] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Filter Scope:</span>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Scopes</option>
              <option value="record">Record-Scoped (Single inspection or spill)</option>
              <option value="well">Well-Scoped (Applies to targeted well)</option>
              <option value="well_type">Well-Type Scoped (Applies to entire lift class)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Accepted">Accepted (Active in calculations)</option>
              <option value="Contested">Contested (Flagged as conflict)</option>
              <option value="Pending">Pending (Under review)</option>
            </select>
          </div>
        </div>

        <span className="font-mono text-xs text-slate-400">
          {corrections.length} recorded corrections
        </span>
      </div>

      {/* Corrections Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono">
              <tr>
                <th className="px-4 py-3">Correction ID</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3">Field</th>
                <th className="px-4 py-3">Original Value</th>
                <th className="px-4 py-3">Corrected Value</th>
                <th className="px-4 py-3">Author & Reason</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Review Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    Loading corrections...
                  </td>
                </tr>
              ) : corrections.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No corrections match the current filters.
                  </td>
                </tr>
              ) : (
                corrections.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-sky-400">{c.id}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-300 uppercase">
                        {c.scope}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-200 font-semibold">{c.target_id}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{c.target_field}</td>
                    <td className="px-4 py-3 font-mono text-rose-400 line-through">{c.original_value}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{c.corrected_value}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-white">{c.author}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{c.reason}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-semibold ${
                          c.status === 'Accepted'
                            ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                            : c.status === 'Contested'
                            ? 'bg-amber-950 border border-amber-800 text-amber-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      {c.status !== 'Accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'Accepted')}
                          className="rounded bg-emerald-950 border border-emerald-800 px-2 py-1 text-[10px] text-emerald-300 hover:bg-emerald-900"
                          title="Accept correction"
                        >
                          Accept
                        </button>
                      )}
                      {c.status !== 'Contested' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'Contested')}
                          className="rounded bg-amber-950 border border-amber-800 px-2 py-1 text-[10px] text-amber-300 hover:bg-amber-900"
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
