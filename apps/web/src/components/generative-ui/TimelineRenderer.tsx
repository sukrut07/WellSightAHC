'use client';

import React from 'react';
import { TimelineSpec } from '@/types/generative-ui';
import { VisualContainer } from './VisualContainer';
import { Activity, AlertCircle, Wrench, FileText, CheckCircle2 } from 'lucide-react';

interface TimelineRendererProps {
  spec: TimelineSpec;
  onCitationClick?: (recordId: string) => void;
}

export const TimelineRenderer: React.FC<TimelineRendererProps> = ({ spec, onCitationClick }) => {
  const getIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'inspection':
        return <Activity className="h-4 w-4 text-emerald-400" />;
      case 'repair':
        return <Wrench className="h-4 w-4 text-amber-400" />;
      case 'spill':
        return <AlertCircle className="h-4 w-4 text-rose-400" />;
      default:
        return <FileText className="h-4 w-4 text-sky-400" />;
    }
  };

  return (
    <VisualContainer spec={spec} onCitationClick={onCitationClick}>
      <div className="relative pl-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-[2px] before:bg-slate-800">
        <div className="space-y-4">
          {spec.events.map((ev, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[27px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 shadow">
                {getIcon(ev.category || 'operational')}
              </div>

              {/* Card */}
              <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 hover:border-slate-700 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-400">{ev.date}</span>
                    <span className="text-xs font-medium text-slate-200">{ev.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {ev.status && (
                      <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                        {ev.status}
                      </span>
                    )}
                    {ev.record_id && (
                      <button
                        onClick={() => onCitationClick && onCitationClick(ev.record_id!)}
                        className="rounded bg-sky-950/80 border border-sky-800/70 px-1.5 py-0.5 font-mono text-[10px] text-sky-300 hover:bg-sky-900 transition-colors"
                      >
                        {ev.record_id}
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{ev.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </VisualContainer>
  );
};
