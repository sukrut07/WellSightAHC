'use client';

import React from 'react';
import { ConflictPanelSpec } from '@/types/generative-ui';
import { VisualContainer } from './VisualContainer';
import { AlertTriangle, HelpCircle, ShieldAlert } from 'lucide-react';

interface ConflictPanelRendererProps {
  spec: ConflictPanelSpec;
  onCitationClick?: (recordId: string) => void;
  onResolveClick?: (conflictId: string) => void;
}

export const ConflictPanelRenderer: React.FC<ConflictPanelRendererProps> = ({
  spec,
  onCitationClick,
  onResolveClick,
}) => {
  return (
    <VisualContainer spec={spec} onCitationClick={onCitationClick}>
      <div className="space-y-3">
        {spec.conflicts.map((conf, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-amber-800/80 bg-gradient-to-br from-amber-950/30 to-slate-950 p-4 shadow-md"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/40 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-200">{conf.issue}</span>
                <span className="font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-amber-900/60 text-slate-300">
                  Target: {conf.target_id}
                </span>
              </div>
              <span className="rounded bg-amber-900/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-100">
                {conf.status}
              </span>
            </div>

            {/* Competing Claims Comparison */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                <span className="font-semibold text-slate-400">Primary Source Record:</span>
                <p className="mt-1 text-slate-200 font-mono text-[11px]">{conf.primary_source}</p>
              </div>

              <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3">
                <span className="font-semibold text-amber-300">Competing Claim / Correction:</span>
                <p className="mt-1 text-amber-100 font-mono text-[11px]">{conf.competing_source}</p>
              </div>
            </div>

            {/* Uncertainty Rationale */}
            <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-800/80">
              <span className="font-medium text-amber-400">Honest Uncertainty Disclosure: </span>
              {conf.uncertainty_explanation}
            </div>

            {/* Precedence Policy */}
            {conf.precedence_rule && (
              <div className="mt-2 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <HelpCircle className="h-3 w-3 text-sky-400" />
                <span>Precedence Rule: {conf.precedence_rule}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </VisualContainer>
  );
};
