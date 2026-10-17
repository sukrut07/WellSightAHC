'use client';

import React from 'react';
import { X, ShieldCheck, FileText, Calendar, User, Edit3 } from 'lucide-react';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string | null;
  onOpenCorrectionForm: (targetId: string) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  recordId,
  onOpenCorrectionForm,
}) => {
  if (!isOpen || !recordId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="h-full w-full max-w-md border-l border-slate-800 bg-[#0B132B] p-6 shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Ground Evidence Inspector</h3>
                <span className="font-mono text-xs text-sky-400">{recordId}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Record Details Body */}
          <div className="mt-5 space-y-4 text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Provenance & Verification:
              </span>
              <p className="mt-1 text-slate-200 font-mono text-[12px] leading-relaxed">
                Record was ingested from immutable field batch log and validated against regulatory business rules.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded border border-slate-800/80 bg-slate-900/40 p-2.5">
                <span className="text-slate-400">Identifier:</span>
                <span className="font-mono font-bold text-sky-400">{recordId}</span>
              </div>

              <div className="flex items-center justify-between rounded border border-slate-800/80 bg-slate-900/40 p-2.5">
                <span className="text-slate-400">Verification Engine:</span>
                <span className="font-mono text-emerald-400">Deterministic Rule Engine v1.0</span>
              </div>

              <div className="flex items-center justify-between rounded border border-slate-800/80 bg-slate-900/40 p-2.5">
                <span className="text-slate-400">Audit Status:</span>
                <span className="rounded bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 font-medium text-emerald-300">
                  Verified In Source
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <span className="text-[11px] font-medium text-slate-400">Audit Rule Explanation:</span>
              <p className="mt-1.5 text-slate-300 leading-relaxed">
                Weekly inspections account for 7 days (168h) of downtime; consecutive non-producing inspections account for 14 days (336h); missed inspections account for 0 days. Spills ≥ 5.0 bbl must be reported to the regulator within 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenCorrectionForm(recordId);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-950/50 transition-colors"
          >
            <Edit3 className="h-4 w-4" /> Submit Record Correction
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
