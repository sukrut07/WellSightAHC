'use client';

import React from 'react';
import { MetricCardsSpec } from '@/types/generative-ui';
import { VisualContainer } from './VisualContainer';

interface MetricCardsRendererProps {
  spec: MetricCardsSpec;
  onCitationClick?: (recordId: string) => void;
}

export const MetricCardsRenderer: React.FC<MetricCardsRendererProps> = ({ spec, onCitationClick }) => {
  return (
    <VisualContainer spec={spec} onCitationClick={onCitationClick}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {spec.metrics.map((m, idx) => {
          let statusBorder = 'border-slate-800 bg-slate-900/80';
          let valColor = 'text-slate-100';
          if (m.status === 'good') {
            statusBorder = 'border-emerald-900/50 bg-emerald-950/20';
            valColor = 'text-emerald-400';
          } else if (m.status === 'warning') {
            statusBorder = 'border-amber-900/50 bg-amber-950/20';
            valColor = 'text-amber-400';
          } else if (m.status === 'danger') {
            statusBorder = 'border-rose-900/50 bg-rose-950/20';
            valColor = 'text-rose-400';
          }

          return (
            <div key={idx} className={`rounded-xl border p-4 shadow-sm ${statusBorder}`}>
              <div className="text-xs text-slate-400 font-medium">{m.label}</div>
              <div className={`mt-1.5 text-2xl font-bold font-mono ${valColor}`}>{m.value}</div>
              {m.subtext && <div className="mt-1 text-[11px] text-slate-500">{m.subtext}</div>}
              {m.delta && (
                <div className="mt-1 text-[10px] font-mono text-emerald-400 font-semibold">
                  {m.delta}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </VisualContainer>
  );
};
