'use client';

import React from 'react';
import Link from 'next/link';
import { WellStatusCardSpec } from '@/types/generative-ui';
import { VisualContainer } from './VisualContainer';
import { Activity, AlertTriangle, CheckCircle, ExternalLink, Flame, MapPin } from 'lucide-react';

interface WellStatusCardRendererProps {
  spec: WellStatusCardSpec;
  onCitationClick?: (recordId: string) => void;
}

export const WellStatusCardRenderer: React.FC<WellStatusCardRendererProps> = ({ spec, onCitationClick }) => {
  return (
    <VisualContainer spec={spec} onCitationClick={onCitationClick}>
      <div className="rounded-xl border border-slate-700/80 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-lg">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{spec.well_name}</h3>
                <span className="font-mono text-xs text-sky-400 bg-sky-950/60 border border-sky-800 px-2 py-0.5 rounded">
                  {spec.well_id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {spec.area} • {spec.well_type} • Formation: {spec.target_formation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                spec.status === 'Active'
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-900/60 text-amber-300 border border-amber-700'
              }`}
            >
              {spec.status}
            </span>
            <Link
              href={`/wells/${spec.well_id}`}
              className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Full Profile <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            <span className="text-[11px] text-slate-400">Summer Downtime</span>
            <div className="mt-1 text-lg font-bold font-mono text-rose-400">
              {spec.measured_downtime_days} days
            </div>
            <span className="text-[10px] text-slate-500">Weekly inspection rule</span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            <span className="text-[11px] text-slate-400">Active Conflicts</span>
            <div className={`mt-1 text-lg font-bold font-mono ${spec.active_conflicts_count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {spec.active_conflicts_count}
            </div>
            <span className="text-[10px] text-slate-500">Unresolved claims</span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            <span className="text-[11px] text-slate-400">Accepted Corrections</span>
            <div className="mt-1 text-lg font-bold font-mono text-sky-400">
              {spec.accepted_corrections_count}
            </div>
            <span className="text-[10px] text-slate-500">Audit overrides</span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            <span className="text-[11px] text-slate-400">GPS Location</span>
            <div className="mt-1 text-xs font-mono text-slate-300 truncate">
              {spec.latitude ? `${spec.latitude.toFixed(4)}, ${spec.longitude?.toFixed(4)}` : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" /> Wellhead surface
            </span>
          </div>
        </div>
      </div>
    </VisualContainer>
  );
};
