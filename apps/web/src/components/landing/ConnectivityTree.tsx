'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Cpu, ArrowRight, CheckCircle2, AlertTriangle, Layers, Radio, Sparkles } from 'lucide-react';

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
    title: 'SCADA Gateway Telemetry',
    badge: 'IoT Uplink',
    detail: 'Wellhead vs Ambient temperature weekly measurements across Permian Basin assets via GW-SW23/NE07.',
    connections: ['thermal-calc'],
    status: 'active',
  },
  {
    id: 'inspection-records',
    category: 'input',
    title: 'Weekly Field Inspections',
    badge: '40k Records',
    detail: 'Drone and manual inspections, surface temperature readings, and observed pad conditions.',
    connections: ['downtime-engine'],
    status: 'active',
  },
  {
    id: 'spill-reports',
    category: 'input',
    title: 'Environmental Events',
    badge: 'Spill SOP',
    detail: 'Crude oil releases, pad coverage percentages, and 24-hour statutory agency dispatch logs.',
    connections: ['spill-engine', 'conflict-engine'],
    status: 'warning',
  },
  {
    id: 'corrections-ledger',
    category: 'input',
    title: 'Operator Corrections',
    badge: 'Dual Memory',
    detail: 'Certified sensor recalibrations with author provenance, reason, and immutable raw values.',
    connections: ['downtime-engine', 'conflict-engine'],
    status: 'verified',
  },

  // Engines
  {
    id: 'thermal-calc',
    category: 'engine',
    title: 'Thermal Delta Engine',
    badge: 'T200 / T350',
    detail: 'Deterministic evaluation: T200 (ΔT ≥ 15°C), T350 (ΔT ≥ 20°C), Gas Lift (ΔT ≥ 15°F), ESP (ΔT ≥ 25°F).',
    connections: ['downtime-engine', 'gen-status-card'],
    status: 'verified',
  },
  {
    id: 'downtime-engine',
    category: 'engine',
    title: 'Inspection Downtime Engine',
    badge: '7d / 14d Rule',
    detail: '1 qualifying cold inspection = 7 days; 2 consecutive = 14 days; missed inspections = 0 days.',
    connections: ['gen-table', 'gen-heatmap'],
    status: 'active',
  },
  {
    id: 'spill-engine',
    category: 'engine',
    title: '24h Spill Compliance Auditor',
    badge: 'SR-01 Rule',
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
    title: 'Ranked Data Table',
    badge: 'data_table',
    detail: 'Sortable downtime and compliance ledgers with clickable record badges.',
    connections: [],
    status: 'verified',
  },
  {
    id: 'gen-heatmap',
    category: 'output',
    title: 'Monthly Heatmap Matrix',
    badge: 'heatmap',
    detail: 'Two-dimensional Area × Month matrix color-coded by cumulative downtime days.',
    connections: [],
    status: 'active',
  },
  {
    id: 'gen-status-card',
    category: 'output',
    title: 'Wellhead Status Twin',
    badge: 'status_card',
    detail: 'Live thermal delta gauge, lift status, and active mechanical repair badges.',
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
    <div className="relative rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-xl p-5 sm:p-7 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
              Asset Intelligence Data Lineage
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
            Interactive Operational Flow & Lineage Graph
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any node to trace raw SCADA telemetry through deterministic calculation rules to generative UI responses.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Verified Rule
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Conflict Check
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> Active Lineage
          </span>
        </div>
      </div>

      {/* 3-Column Node Connectivity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Column 1: Source Inputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pb-1">
            <span className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-indigo-600" /> 1. Field Records & SCADA
            </span>
            <span className="text-[10px] font-mono text-slate-400">Source Tier</span>
          </div>
          {inputs.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isConnectedToSelected = isConnected(node.id, selectedNodeId);
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-400/40'
                    : isConnectedToSelected
                    ? 'border-sky-300 bg-sky-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {node.title}
                  </span>
                  <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600">
                    {node.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {node.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Column 2: Analytical Engines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pb-1">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-emerald-600" /> 2. Calculation Engines
            </span>
            <span className="text-[10px] font-mono text-slate-400">Deterministic Tier</span>
          </div>
          {engines.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isConnectedToSelected = isConnected(node.id, selectedNodeId);
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-400/40'
                    : isConnectedToSelected
                    ? 'border-indigo-300 bg-indigo-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {node.title}
                  </span>
                  <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-700">
                    {node.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {node.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Column 3: Outputs / Generative UI */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pb-1">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-purple-600" /> 3. Generative UI Renderers
            </span>
            <span className="text-[10px] font-mono text-slate-400">Presentation Tier</span>
          </div>
          {outputs.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isConnectedToSelected = isConnected(node.id, selectedNodeId);
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/70 shadow-sm ring-1 ring-purple-400/40'
                    : isConnectedToSelected
                    ? 'border-indigo-300 bg-indigo-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    {node.title}
                  </span>
                  <span className="rounded-md border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[10px] font-mono font-medium text-purple-700">
                    {node.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {node.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Inspector Bar at Bottom */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Selected:</span>
          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
            {selectedNode.title}
          </span>
          <span className="text-slate-500 text-[11px]">({selectedNode.detail})</span>
        </div>

        <div className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1 shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5" /> Deterministic Lineage Verified
        </div>
      </div>
    </div>
  );
};
