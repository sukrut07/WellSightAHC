'use client';

import React from 'react';
import { ClarificationRequestSpec } from '@/types/generative-ui';
import { VisualContainer } from './VisualContainer';
import { HelpCircle, ArrowRight } from 'lucide-react';

interface ClarificationRequestRendererProps {
  spec: ClarificationRequestSpec;
  onOptionSelect?: (query: string) => void;
}

export const ClarificationRequestRenderer: React.FC<ClarificationRequestRendererProps> = ({
  spec,
  onOptionSelect,
}) => {
  return (
    <VisualContainer spec={spec}>
      <div className="rounded-xl border border-sky-800/80 bg-sky-950/20 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-sky-200">
          <HelpCircle className="h-4 w-4 text-sky-400" />
          <span>{spec.question}</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Please select an explicit operational scope to generate verified calculations:
        </p>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {spec.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onOptionSelect && onOptionSelect(opt.suggested_query)}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/80 p-2.5 text-left text-xs font-medium text-slate-200 hover:border-sky-500 hover:bg-sky-950/50 hover:text-white transition-all shadow-sm"
            >
              <span>{opt.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-sky-400" />
            </button>
          ))}
        </div>
      </div>
    </VisualContainer>
  );
};
