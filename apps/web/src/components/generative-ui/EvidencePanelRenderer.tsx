'use client';

import React from 'react';
import { EvidencePanelSpec } from '@/types/generative-ui';
import { VisualContainer } from './VisualContainer';
import { BookOpen, FileCheck, Shield } from 'lucide-react';

interface EvidencePanelRendererProps {
  spec: EvidencePanelSpec;
  onCitationClick?: (recordId: string) => void;
}

export const EvidencePanelRenderer: React.FC<EvidencePanelRendererProps> = ({ spec, onCitationClick }) => {
  return (
    <VisualContainer spec={spec} onCitationClick={onCitationClick}>
      <div className="space-y-3">
        {spec.citations.map((cite, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-xs text-slate-200">{cite.title}</span>
              </div>
              <button
                onClick={() => onCitationClick && onCitationClick(cite.record_id)}
                className="font-mono text-[10px] text-sky-400 bg-sky-950/60 border border-sky-800 px-2 py-0.5 rounded hover:bg-sky-900 transition-colors"
              >
                {cite.record_id}
              </button>
            </div>

            <div className="mt-2 text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded border border-slate-800/80 font-mono text-[11px] leading-relaxed">
              &ldquo;{cite.excerpt}&rdquo;
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-mono">
              {cite.document_name && <span>Document: {cite.document_name}</span>}
              {cite.section_title && <span>Section: {cite.section_title}</span>}
              {cite.timestamp && <span>Timestamp: {cite.timestamp}</span>}
            </div>
          </div>
        ))}
      </div>
    </VisualContainer>
  );
};
