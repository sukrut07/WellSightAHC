'use client';

import React from 'react';
import Link from 'next/link';
import { BaseVisualSpec } from '@/types/generative-ui';
import { AlertTriangle, Download, ExternalLink, ShieldCheck } from 'lucide-react';

interface VisualContainerProps {
  spec: BaseVisualSpec;
  children: React.ReactNode;
  onExportCsv?: () => void;
  onCitationClick?: (recordId: string) => void;
}

export const VisualContainer: React.FC<VisualContainerProps> = ({
  spec,
  children,
  onExportCsv,
  onCitationClick,
}) => {
  return (
    <div className="my-4 rounded-xl border border-slate-800 bg-[#0E1626] p-4 shadow-xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-slate-100">{spec.title}</h4>
            {spec.units && (
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-emerald-400">
                {spec.units}
              </span>
            )}
            {spec.drill_down_id && (
              <Link
                href={`/wells/${spec.drill_down_id}`}
                className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
              >
                View Well <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
          {spec.description && (
            <p className="mt-1 text-xs text-slate-400">{spec.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {spec.date_range && (
            <span className="text-xs text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
              {spec.date_range}
            </span>
          )}
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1 rounded bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title="Export data as CSV"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          )}
        </div>
      </div>

      {/* Warnings Banner if any */}
      {spec.warnings && spec.warnings.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-900/50 bg-amber-950/30 p-2.5 text-xs text-amber-300">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Operational Caveats & Uncertainty Notice:</span>
          </div>
          <ul className="mt-1 list-disc pl-5 space-y-0.5 text-amber-200/90">
            {spec.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary Visual Content */}
      <div className="mt-4">{children}</div>

      {/* Citations Footer */}
      {spec.source_references && spec.source_references.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-800/80 pt-2.5 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1 font-medium text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Ground Evidence:
          </span>
          {spec.source_references.map((ref, idx) => (
            <button
              key={idx}
              onClick={() => onCitationClick && onCitationClick(ref)}
              className="rounded bg-slate-800/90 hover:bg-sky-950/60 hover:text-sky-300 hover:border-sky-700/60 border border-slate-700/60 px-2 py-0.5 font-mono text-[11px] text-slate-300 transition-colors"
            >
              {ref}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
