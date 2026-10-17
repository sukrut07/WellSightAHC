'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LocationMapSpec } from '@/types/generative-ui';
import { VisualContainer } from './VisualContainer';
import { MapPin, ExternalLink } from 'lucide-react';

interface LocationMapRendererProps {
  spec: LocationMapSpec;
  onCitationClick?: (recordId: string) => void;
}

export const LocationMapRenderer: React.FC<LocationMapRendererProps> = ({ spec, onCitationClick }) => {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // Geographic bounds
  const lats = spec.markers.map((m) => m.latitude);
  const lngs = spec.markers.map((m) => m.longitude);
  const minLat = Math.min(...lats, 31.7);
  const maxLat = Math.max(...lats, 32.3);
  const minLng = Math.min(...lngs, -103.4);
  const maxLng = Math.max(...lngs, -102.0);

  // Normalize lat/lng to 0-100% SVG box
  const getX = (lng: number) => {
    return ((lng - minLng) / (maxLng - minLng || 1)) * 80 + 10;
  };
  const getY = (lat: number) => {
    // Latitude increases upwards, SVG Y increases downwards
    return (1 - (lat - minLat) / (maxLat - minLat || 1)) * 70 + 15;
  };

  return (
    <VisualContainer spec={spec} onCitationClick={onCitationClick}>
      <div className="space-y-4">
        {/* Interactive SVG Oilfield Map */}
        <div className="relative h-72 w-full overflow-hidden rounded-xl border border-slate-800 bg-[#070D19] p-2">
          {/* Grid Background */}
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#162238" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />

            {/* Area Boundary Hints */}
            <text x="75" y="25" fill="#334155" fontSize="3" fontWeight="bold">AREA A (Midland)</text>
            <text x="15" y="55" fill="#334155" fontSize="3" fontWeight="bold">AREA B (Delaware)</text>
            <text x="45" y="85" fill="#334155" fontSize="3" fontWeight="bold">AREA C (Central)</text>

            {/* Wellhead Markers */}
            {spec.markers.map((m) => {
              const x = getX(m.longitude);
              const y = getY(m.latitude);
              const isSelected = selectedMarker === m.id;
              const isAreaA = m.area.includes('A');
              const isAreaB = m.area.includes('B');
              const markerColor = isAreaA ? '#10B981' : isAreaB ? '#38BDF8' : '#F59E0B';

              return (
                <g key={m.id} className="cursor-pointer" onClick={() => setSelectedMarker(m.id)}>
                  {isSelected && (
                    <circle cx={x} cy={y} r="4" fill="none" stroke="#F8FAFC" strokeWidth="0.5" strokeDasharray="1,1" />
                  )}
                  <circle cx={x} cy={y} r="2.2" fill={markerColor} stroke="#0B132B" strokeWidth="0.6" />
                  <text
                    x={x + 3}
                    y={y + 1}
                    fill={isSelected ? '#F8FAFC' : '#94A3B8'}
                    fontSize="2.5"
                    fontFamily="monospace"
                  >
                    {m.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Overlay Badge */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded bg-slate-900/90 border border-slate-800 px-2 py-1 text-[10px] text-slate-400 font-mono">
            <MapPin className="h-3 w-3 text-emerald-400" /> Permian Basin Grid (Area A / B / C)
          </div>
        </div>

        {/* Selected Marker Details Drawer or Table */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <div className="text-xs font-semibold text-slate-300 mb-2">Surface Coordinate Directory:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {spec.markers.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMarker(m.id)}
                className={`cursor-pointer rounded border p-2 transition-colors ${
                  selectedMarker === m.id
                    ? 'border-sky-500 bg-sky-950/40 text-sky-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold">{m.id}</span>
                  <Link href={`/wells/${m.id}`} className="text-slate-400 hover:text-sky-300">
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{m.name} ({m.area})</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Lat: {m.latitude.toFixed(4)}, Lng: {m.longitude.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualContainer>
  );
};
