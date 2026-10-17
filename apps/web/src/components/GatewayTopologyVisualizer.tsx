'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Wifi,
  Thermometer,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Info,
} from 'lucide-react';

interface TelemetryNode {
  wellId: string;
  name: string;
  area: string;
  gateway: string;
  wellType: 'T200' | 'T350';
  wellheadTempC: number;
  ambientTempC: number;
  deltaC: number;
  thresholdC: number;
  isProducing: boolean;
  spillStatus: 'clean' | 'detected';
  signalDbm: number;
  latencyMs: number;
  flowlinePsi: number;
  statusText: string;
}

const SAMPLE_GATEWAY_NODES: TelemetryNode[] = [
  {
    wellId: 'WELL-0001',
    name: 'SW-23 Well 001',
    area: 'Southwest Block 23',
    gateway: 'GW-SW23-ALPHA',
    wellType: 'T200',
    wellheadTempC: 38.4,
    ambientTempC: 22.1,
    deltaC: 16.3,
    thresholdC: 15.0,
    isProducing: true,
    spillStatus: 'clean',
    signalDbm: -68,
    latencyMs: 14,
    flowlinePsi: 142,
    statusText: 'Producing (+1.3°C above T200 threshold)',
  },
  {
    wellId: 'WELL-0007',
    name: 'SW-23 Well 007',
    area: 'Southwest Block 23',
    gateway: 'GW-SW23-ALPHA',
    wellType: 'T200',
    wellheadTempC: 22.8,
    ambientTempC: 22.5,
    deltaC: 0.3,
    thresholdC: 15.0,
    isProducing: false,
    spillStatus: 'clean',
    signalDbm: -72,
    latencyMs: 16,
    flowlinePsi: 28,
    statusText: 'Cold / Shut-In (Planned maintenance window)',
  },
  {
    wellId: 'WELL-0082',
    name: 'SW-24 Well 082',
    area: 'Southwest Block 24',
    gateway: 'GW-SW24-BRAVO',
    wellType: 'T200',
    wellheadTempC: 37.1,
    ambientTempC: 21.0,
    deltaC: 16.1,
    thresholdC: 15.0,
    isProducing: true,
    spillStatus: 'detected',
    signalDbm: -65,
    latencyMs: 12,
    flowlinePsi: 155,
    statusText: 'Pad Spill Detected (SR-02 containment alert)',
  },
  {
    wellId: 'WELL-0121',
    name: 'NE-07 Well 121',
    area: 'Northeast Block 7',
    gateway: 'GW-NE07-CHARLIE',
    wellType: 'T350',
    wellheadTempC: 44.8,
    ambientTempC: 23.2,
    deltaC: 21.6,
    thresholdC: 20.0,
    isProducing: true,
    spillStatus: 'clean',
    signalDbm: -70,
    latencyMs: 15,
    flowlinePsi: 380,
    statusText: 'Producing (+1.6°C above T350 threshold)',
  },
  {
    wellId: 'WELL-0151',
    name: 'NE-08 Well 151',
    area: 'Northeast Block 8',
    gateway: 'GW-NE08-DELTA',
    wellType: 'T350',
    wellheadTempC: 43.1,
    ambientTempC: 22.0,
    deltaC: 21.1,
    thresholdC: 20.0,
    isProducing: true,
    spillStatus: 'detected',
    signalDbm: -63,
    latencyMs: 11,
    flowlinePsi: 365,
    statusText: 'Spill Detected (5.4 bbl corrected · SR-01 reportable)',
  },
  {
    wellId: 'WELL-0164',
    name: 'NE-08 Well 164',
    area: 'Northeast Block 8',
    gateway: 'GW-NE08-DELTA',
    wellType: 'T200',
    wellheadTempC: 41.0,
    ambientTempC: 19.9,
    deltaC: 21.1,
    thresholdC: 15.0,
    isProducing: true,
    spillStatus: 'clean',
    signalDbm: -69,
    latencyMs: 13,
    flowlinePsi: 160,
    statusText: 'Producing (Corrected by M. Turner 41.0°C)',
  },
];

interface GatewayTopologyVisualizerProps {
  onSelectWell?: (wellId: string) => void;
  className?: string;
}

export const GatewayTopologyVisualizer: React.FC<GatewayTopologyVisualizerProps> = ({
  onSelectWell,
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<TelemetryNode>(SAMPLE_GATEWAY_NODES[0]);
  const [selectedGateway, setSelectedGateway] = useState<string>('All');

  const gateways = ['All', 'GW-SW23-ALPHA', 'GW-SW24-BRAVO', 'GW-NE07-CHARLIE', 'GW-NE08-DELTA'];

  const filteredNodes =
    selectedGateway === 'All'
      ? SAMPLE_GATEWAY_NODES
      : SAMPLE_GATEWAY_NODES.filter((n) => n.gateway === selectedGateway);

  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05)] p-5 transition-all ${className}`}>
      {/* 1. Header with Gateway Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-600">
              SCADA Telemetry Connectivities & Gateway Ingestion
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Fleet Gateway Topology & Field Uplinks
          </h2>
          <p className="text-xs text-slate-500">
            Real-time IoT modbus polling across wireless gateway transceivers. Click any node to inspect gateway delta.
          </p>
        </div>

        {/* Gateway Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
          {gateways.map((gw) => (
            <button
              key={gw}
              onClick={() => setSelectedGateway(gw)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                selectedGateway === gw
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {gw === 'All' ? 'All Gateways' : gw.replace('GW-', '')}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Connectivity Stream & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Left Column: Flowing Gateway Node List */}
        <div className="lg:col-span-7 space-y-2.5">
          {filteredNodes.map((node) => {
            const isSelected = selectedNode.wellId === node.wellId;
            return (
              <motion.div
                key={node.wellId}
                whileHover={{ scale: 1.01, x: 2 }}
                onClick={() => {
                  setSelectedNode(node);
                  if (onSelectWell) onSelectWell(node.wellId);
                }}
                className={`relative flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-400/80 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-400/20'
                    : 'border-slate-200/70 bg-white/90 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Node Identity & Gateway Route */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      node.isProducing
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                        : 'border-rose-200 bg-rose-50 text-rose-600'
                    }`}
                  >
                    {node.isProducing ? <Flame className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono tracking-tight">
                        {node.wellId}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200/60">
                        {node.wellType}
                      </span>
                      {node.spillStatus === 'detected' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-md border border-amber-300/60 flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" /> Spill
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      via <span className="font-mono text-slate-700">{node.gateway}</span> · {node.latencyMs}ms ping
                    </p>
                  </div>
                </div>

                {/* Live Telemetry Differential Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Thermometer className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-bold font-mono text-slate-800">
                        Δ {node.deltaC.toFixed(1)}°C
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Req: ≥{node.thresholdC}°C
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight border ${
                      node.isProducing
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {node.isProducing ? 'Producing' : 'Cold'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column: Active Node Deep Telemetry Card */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                  {selectedNode.gateway} Telemetry Feed
                </span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> 99.8% Uplink
              </span>
            </div>

            {/* Well Details */}
            <div className="mt-3.5">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-extrabold text-slate-900">{selectedNode.wellId}</h3>
                <span className="text-xs text-slate-500 font-medium">{selectedNode.area}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium bg-slate-100/70 p-2 rounded-lg border border-slate-200/60">
                {selectedNode.statusText}
              </p>
            </div>

            {/* Telemetry Metric Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-3.5">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                <p className="text-[10px] uppercase font-semibold text-slate-500">Wellhead Temp</p>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {selectedNode.wellheadTempC.toFixed(1)} °C
                </p>
                <p className="text-[10px] text-slate-400">Surface reading</p>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                <p className="text-[10px] uppercase font-semibold text-slate-500">Ambient Temp</p>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {selectedNode.ambientTempC.toFixed(1)} °C
                </p>
                <p className="text-[10px] text-slate-400">Pad sensor</p>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                <p className="text-[10px] uppercase font-semibold text-slate-500">Thermal Delta (ΔT)</p>
                <p
                  className={`text-base font-bold font-mono mt-0.5 ${
                    selectedNode.deltaC >= selectedNode.thresholdC ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  +{selectedNode.deltaC.toFixed(1)} °C
                </p>
                <p className="text-[10px] text-slate-400">{selectedNode.wellType} limit: {selectedNode.thresholdC}°C</p>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                <p className="text-[10px] uppercase font-semibold text-slate-500">Flowline Pressure</p>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {selectedNode.flowlinePsi} psi
                </p>
                <p className="text-[10px] text-slate-400">Discharge line</p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Signal: {selectedNode.signalDbm} dBm
            </span>

            <a
              href={`/copilot?q=${encodeURIComponent(`Why was ${selectedNode.wellId} ${selectedNode.isProducing ? 'producing' : 'not producing'}?`)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Ask Copilot <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
