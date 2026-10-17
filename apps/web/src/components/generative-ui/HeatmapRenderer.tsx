'use client';

import React from 'react';
import { HeatmapSpec } from '@/types/generative-ui';
import { VisualContainer } from './VisualContainer';

interface HeatmapRendererProps {
  spec: HeatmapSpec;
  onCitationClick?: (recordId: string) => void;
}

export const HeatmapRenderer: React.FC<HeatmapRendererProps> = ({ spec, onCitationClick }) => {
  // Extract unique X and Y categories
  const xLabels = Array.from(new Set(spec.cells.map((c) => c.x)));
  const yLabels = Array.from(new Set(spec.cells.map((c) => c.y)));

  const min = spec.min_value ?? 0;
  const max = spec.max_value ?? Math.max(...spec.cells.map((c) => c.value), 20);

  const getCellColor = (val: number) => {
    if (val === 0) return 'bg-slate-900 text-slate-500';
    const ratio = Math.min(Math.max((val - min) / (max - min || 1), 0), 1);
    if (ratio < 0.3) {
      return 'bg-emerald-950 text-emerald-300 border-emerald-900/60';
    } else if (ratio < 0.7) {
      return 'bg-amber-950 text-amber-300 border-amber-900/60 font-semibold';
    } else {
      return 'bg-rose-950 text-rose-200 border-rose-900 font-bold';
    }
  };

  return (
    <VisualContainer spec={spec} onCitationClick={onCitationClick}>
      <div className="overflow-x-auto p-2">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left font-mono text-xs text-slate-500 uppercase tracking-wider">
                  {spec.y_label} \ {spec.x_label}
                </th>
                {xLabels.map((x) => (
                  <th key={x} className="p-2 text-center font-mono text-xs text-slate-300 font-semibold">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yLabels.map((y) => (
                <tr key={y} className="border-t border-slate-800/60">
                  <td className="p-2.5 font-medium text-xs text-slate-300 bg-slate-900/40 rounded-l">
                    {y}
                  </td>
                  {xLabels.map((x) => {
                    const cell = spec.cells.find((c) => c.x === x && c.y === y);
                    const val = cell ? cell.value : 0;
                    const annot = cell?.annotation;
                    return (
                      <td key={x} className="p-1.5 text-center">
                        <div
                          className={`rounded-lg border p-3 text-center transition-transform hover:scale-105 shadow-sm ${getCellColor(
                            val
                          )}`}
                          title={`${y} in ${x}: ${val} ${spec.units || 'days'}`}
                        >
                          <div className="text-sm font-mono tracking-tight">
                            {annot || `${val} ${spec.units || 'days'}`}
                          </div>
                          <div className="text-[10px] opacity-75 font-sans mt-0.5">
                            {val === 0 ? 'Optimal' : val > 14 ? 'Severe Alert' : 'Moderate'}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-3 text-[11px] text-slate-400 font-mono">
        <span>Intensity:</span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-slate-900 border border-slate-800"></span> 0
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-emerald-950 border border-emerald-800"></span> Low
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-amber-950 border border-amber-800"></span> Med
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-rose-950 border border-rose-800"></span> High
        </span>
      </div>
    </VisualContainer>
  );
};
