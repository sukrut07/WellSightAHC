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
    <div className="my-4 rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-sm transition-all text-slate-800">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-900">{spec.title}</h4>
            {spec.units && (
              <span className="rounded-lg bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-xs font-mono font-semibold text-indigo-700">
                {spec.units}
              </span>
            )}
            {spec.drill_down_id && (
              <Link
                href={`/wells`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View Well <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
          {spec.description && (
            <p className="mt-1 text-xs text-slate-500">{spec.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {spec.date_range && (
            <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              {spec.date_range}
            </span>
          )}
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              title="Export data as CSV"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Warnings Banner if any */}
      {spec.warnings && spec.warnings.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Operational Caveats & Uncertainty Notice:</span>
          </div>
          <ul className="mt-1 list-disc pl-5 space-y-0.5 text-amber-800">
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
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Ground Evidence:
          </span>
          {spec.source_references.map((ref, idx) => (
            <button
              key={idx}
              onClick={() => onCitationClick && onCitationClick(ref)}
              className="rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 px-2.5 py-0.5 font-mono text-[11px] text-slate-700 transition-colors cursor-pointer"
            >
              {ref}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
