'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetId?: string;
  onCorrectionSubmitted?: () => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  onClose,
  initialTargetId = '',
  onCorrectionSubmitted,
}) => {
  const [scope, setScope] = useState<'record' | 'well' | 'well_type'>('record');
  const [targetId, setTargetId] = useState(initialTargetId);
  const [targetField, setTargetField] = useState('observed_production_status');
  const [correctedValue, setCorrectedValue] = useState('');
  const [author, setAuthor] = useState('Operator John (Lead Pumper)');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync initialTargetId if changed
  React.useEffect(() => {
    if (initialTargetId) {
      setTargetId(initialTargetId);
      if (initialTargetId.startsWith('WELL-')) {
        setScope('well');
        setTargetField('status');
      } else if (initialTargetId.startsWith('INSP-')) {
        setScope('record');
        setTargetField('observed_production_status');
      } else if (initialTargetId.startsWith('REG-')) {
        setScope('record');
        setTargetField('volume_barrels');
      }
    }
  }, [initialTargetId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || !targetField || !correctedValue || !reason) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.createCorrection({
        scope,
        target_id: targetId,
        target_field: targetField,
        corrected_value: correctedValue,
        author,
        reason,
      });

      setSuccessMsg('Correction successfully recorded! Subsequent queries will reflect this override while preserving raw immutable source data.');
      if (onCorrectionSubmitted) onCorrectionSubmitted();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0E1626] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Submit Verified Correction</h3>
              <p className="text-xs text-slate-400">Preserves original value in immutable audit trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-950/60 p-3 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-800 bg-rose-950/60 p-3 text-xs text-rose-200">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-300">Correction Scope:</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {(['record', 'well', 'well_type'] as const).map((sc) => (
                <button
                  type="button"
                  key={sc}
                  onClick={() => setScope(sc)}
                  className={`rounded border py-1.5 px-3 font-mono text-[11px] font-semibold uppercase transition-colors ${
                    scope === sc
                      ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300">Target Identifier:</label>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="e.g. INSP-2026-0017"
                className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300">Target Field:</label>
              <input
                type="text"
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                placeholder="e.g. observed_production_status"
                className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300">Corrected Value:</label>
            <input
              type="text"
              value={correctedValue}
              onChange={(e) => setCorrectedValue(e.target.value)}
              placeholder="e.g. Producing (or 4.2 bbl)"
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300">Author / Submitter:</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300">Engineering Audit Reason:</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the technical rationale, calibration sheet number, or work permit ID..."
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-700 bg-slate-800 px-3.5 py-1.5 font-medium text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-emerald-600 px-4 py-1.5 font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Save Correction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
