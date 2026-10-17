'use client';

import React, { useState } from 'react';
import { Database, Cpu, FileCheck2, ShieldCheck, Zap, ArrowRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface NodeItem {
  id: string;
  category: 'input' | 'engine' | 'output';
  title: string;
  badge: string;
  detail: string;
  connections: string[];
  status: 'active' | 'warning' | 'verified';
}

const NODES: NodeItem[] = [
  // Inputs
  {
    id: 'scada-temp',
    category: 'input',
    title: 'SCADA Thermal Logs',
    badge: 'Telemetry',
    detail: 'Wellhead (98°F) vs Ambient (88°F) weekly measurements across 12 field assets.',
    connections: ['thermal-calc'],
    status: 'active',
  },
  {
    id: 'inspection-records',
    category: 'input',
    title: 'Weekly Field Inspections',
    badge: '27 Records',
    detail: 'Pumper visual observations, operating states, and recorded mechanical notes.',
    connections: ['downtime-engine'],
    status: 'active',
  },
  {
    id: 'spill-reports',
    category: 'input',
    title: 'Environmental Events',
    badge: 'Spill Logs',
    detail: 'Field barrel releases, containment logs, and regulatory notification dispatch times.',
    connections: ['spill-engine', 'conflict-engine'],
    status: 'warning',
  },
  {
    id: 'corrections-ledger',
    category: 'input',
    title: 'Operator Corrections',
    badge: 'Audited Overrides',
    detail: 'Certified sensor recalibrations with author provenance, reason, and immutable raw values.',
    connections: ['downtime-engine', 'conflict-engine'],
    status: 'verified',
  },

  // Engines
  {
    id: 'thermal-calc',
    category: 'engine',
    title: 'Thermal Lift Threshold Engine',
    badge: 'Rule 2.2',
    detail: 'Deterministic evaluation: Gas Lift (ΔT ≥ 15°F), ESP (ΔT ≥ 25°F), Rod Pump (ΔT ≥ 12°F).',
    connections: ['downtime-engine', 'gen-status-card'],
    status: 'verified',
  },
  {
    id: 'downtime-engine',
    category: 'engine',
    title: 'Inspection Downtime Calculator',
    badge: '7d / 14d Rule',
    detail: '1 qualifying inspection = 7 days; 2 consecutive = 14 days; missed inspections = 0 days.',
    connections: ['gen-table', 'gen-heatmap'],
    status: 'active',
  },
  {
    id: 'spill-engine',
    category: 'engine',
    title: '24h Spill Compliance Auditor',
    badge: 'SOP-ENV-004',
    detail: 'Spills ≥ 5.0 bbl flagged against 24-hour statutory reporting deadline. No false violations.',
    connections: ['gen-table', 'conflict-engine'],
    status: 'active',
  },
  {
    id: 'conflict-engine',
    category: 'engine',
    title: 'Honest Conflict & Evidence Engine',
    badge: 'Trust Boundary',
    detail: 'Surfaces missing regulatory timestamps as Insufficient Data; detects contested overrides.',
    connections: ['gen-conflict'],
    status: 'warning',
  },

  // Outputs / Generative UI
  {
    id: 'gen-table',
    category: 'output',
    title: 'Dynamic Ranked Data Table',
    badge: 'data_table',
    detail: 'Sortable downtime and compliance ledgers with clickable record badges.',
    connections: [],
    status: 'active',
  },
  {
    id: 'gen-heatmap',
    category: 'output',
    title: '2D Monthly Area Heatmap',
    badge: 'heatmap',
    detail: 'Matrix comparing operational downtime hot-spots across Area A, Area B, and Area C.',
    connections: [],
    status: 'active',
  },
  {
    id: 'gen-status-card',
    category: 'output',
    title: 'Wellhead Telemetry Status Card',
    badge: 'well_status_card',
    detail: 'Root-cause diagnostic card linking work tickets, SOP thresholds, and sensor values.',
    connections: [],
    status: 'verified',
  },
  {
    id: 'gen-conflict',
    category: 'output',
    title: 'Conflict & Evidence Panel',
    badge: 'conflict_panel',
    detail: 'Transparent alert comparing competing claims and highlighting missing evidence.',
    connections: [],
    status: 'warning',
  },
];

export const ConnectivityTree: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('downtime-engine');

  const selectedNode = NODES.find((n) => n.id === selectedNodeId) || NODES[1];

  // Helper to determine if a connection is active
  const isConnected = (sourceId: string, targetId: string) => {
    if (selectedNodeId === sourceId) {
      return NODES.find((n) => n.id === sourceId)?.connections.includes(targetId);
    }
    if (selectedNodeId === targetId) {
      return NODES.find((n) => n.id === sourceId)?.connections.includes(targetId);
    }
    return false;
  };

  const inputs = NODES.filter((n) => n.category === 'input');
  const engines = NODES.filter((n) => n.category === 'engine');
  const outputs = NODES.filter((n) => n.category === 'output');

  return (
    <div className="relative rounded-2xl border border-slate-800/80 bg-[#0A1224] p-5 sm:p-7 shadow-2xl overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Asset Intelligence Data Lineage
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight mt-1">
            Interactive Operational Flow & Connectivity Graph
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any node to trace raw SCADA logs through deterministic calculation rules to generative UI responses.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Verified Rule
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Conflict Check
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> Active Flow
          </span>
        </div>
      </div>

      {/* 3-Column Node Connectivity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Column 1: Source Inputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1">
            <span className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-sky-400" /> 1. Field Records & SCADA
            </span>
            <span className="text-[10px] font-mono text-slate-500">Source Tier</span>
          </div>
          {inputs.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? 'border-emerald-500/80 bg-emerald-950/40 shadow-lg ring-1 ring-emerald-500/40'
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {node.title}
                  </span>
                  <span className="rounded-md border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                    {node.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {node.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Column 2: Deterministic Calculation Engines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" /> 2. Deterministic Engines
            </span>
            <span className="text-[10px] font-mono text-slate-500">Rules Tier</span>
          </div>
          {engines.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const connectedToSelected =
              selectedNode.connections.includes(node.id) || node.connections.includes(selectedNodeId);

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? 'border-emerald-500/80 bg-emerald-950/40 shadow-lg ring-1 ring-emerald-500/40'
                    : connectedToSelected
                    ? 'border-sky-500/60 bg-sky-950/30'
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {node.title}
                  </span>
                  <span className="rounded-md border border-emerald-800/80 bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300">
                    {node.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {node.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Column 3: Generative UI Presentations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-purple-400" /> 3. Generative UI Presentation
            </span>
            <span className="text-[10px] font-mono text-slate-500">Output Tier</span>
          </div>
          {outputs.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const connectedToSelected = selectedNode.connections.includes(node.id);

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? 'border-emerald-500/80 bg-emerald-950/40 shadow-lg ring-1 ring-emerald-500/40'
                    : connectedToSelected
                    ? 'border-emerald-500/60 bg-emerald-950/30'
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {node.title}
                  </span>
                  <span className="rounded-md border border-purple-800/80 bg-purple-950/80 px-1.5 py-0.5 text-[10px] font-mono text-purple-300">
                    {node.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {node.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Lineage Detail Banner */}
      <div className="mt-6 rounded-xl border border-slate-700/80 bg-slate-950/90 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-600/60 text-emerald-400">
            {selectedNode.status === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              Selected Node: {selectedNode.title}
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                Tier: {selectedNode.category.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{selectedNode.detail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 shrink-0">
          <span>Active Lineage: {selectedNode.connections.length} Branch(es)</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
