'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  Users,
  CheckCircle2,
  RefreshCw,
  Shield,
  Key,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [activeUser, setActiveUser] = useState('U-201');
  const [loading, setLoading] = useState(true);
  const [reingesting, setReingesting] = useState(false);
  const [ingestMsg, setIngestMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('wellsight_active_user');
    if (saved) setActiveUser(saved);

    api
      .getHealth()
      .then((h) => setHealth(h))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUserChange = (u: string) => {
    setActiveUser(u);
    localStorage.setItem('wellsight_active_user', u);
    window.dispatchEvent(new Event('storage'));
  };

  const handleReingest = async () => {
    setReingesting(true);
    setIngestMsg(null);
    try {
      await api.reingestData('./data');
      setIngestMsg('Dataset re-ingested and verified successfully.');
    } catch (err: any) {
      setIngestMsg('Failed to trigger ingestion: ' + err.message);
    } finally {
      setReingesting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-200 pb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E0E7FF] text-[#4338CA]">
            <SettingsIcon className="h-3 w-3" /> System Configuration
          </span>
          <span className="text-xs text-slate-400 font-mono">v1.2.0 SCADA Node</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Settings & Environment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Multi-tenant user persona switching, AI provider configuration, and FlytBase asset dataset management.
        </p>
      </motion.div>

      {/* AI Provider Status Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">AI Provider Abstraction</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950">Deterministic Engine</span>
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
              Zero-token deterministic tool orchestrator executing exact physical calculations and challenge rules.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Google Gemini</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 font-bold">
                KEY IN .ENV
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Gemini 1.5 Pro / Flash multi-turn reasoning with generative UI schema emission.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">OpenAI / OpenWeight</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 font-bold">
                SUPPORTED
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Plug-and-play compatibility with any OpenAI-compliant endpoint or self-hosted LLM.
            </p>
          </div>
        </div>
      </div>

      {/* Demo User Switcher Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">FlytBase Operator Personas & Private Memory</h3>
              <p className="text-xs text-slate-500 mt-0.5">Switching personas proves conversational memory isolation across users</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {activeUser}
          </span>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 'U-201',
              name: 'Michael Turner',
              role: 'Lead Operations Engineer',
              dept: 'Fleet Intelligence & Area Oversight',
            },
            {
              id: 'U-202',
              name: 'Jessica Reed',
              role: 'Environmental & Spill Specialist',
              dept: 'Statutory Compliance 24h',
            },
            {
              id: 'U-101',
              name: 'Tyler Hughes',
              role: 'Field Pumper Lead',
              dept: 'Area A Daily Routes',
            },
            {
              id: 'U-102',
              name: 'Jake Morales',
              role: 'Route Specialist',
              dept: 'Area B & C Thermal Guns',
            },
            {
              id: 'U-301',
              name: 'Laura Simmons',
              role: 'Compliance Director',
              dept: 'Regulatory Invariance Division',
            },
          ].map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserChange(user.id)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-center justify-between shadow-xs ${
                activeUser === user.id
                  ? 'border-indigo-500 bg-[#EEF2FF] text-indigo-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-900">{user.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  ID: <span className="font-mono font-bold text-indigo-600">{user.id}</span> • {user.role} ({user.dept})
                </div>
              </div>
              {activeUser === user.id && (
                <span className="flex items-center gap-1.5 rounded-full bg-indigo-100 border border-indigo-200 px-3 py-1 text-[11px] font-bold text-indigo-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" /> Active Session
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dataset & Ingestion Management */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Dataset Ingestion Pipeline</h3>
          </div>
          <button
            onClick={handleReingest}
            disabled={reingesting}
            className="inline-flex items-center gap-2 rounded-full bg-[#111625] hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${reingesting ? 'animate-spin' : ''}`} />
            {reingesting ? 'Ingesting...' : 'Re-Ingest Dataset'}
          </button>
        </div>

        {ingestMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-mono font-medium">
            {ingestMsg}
          </div>
        )}

        <div className="text-xs text-slate-500 space-y-2 font-medium">
          <p>Load the official challenge asset directory from the terminal at any time using:</p>
          <div className="rounded-xl bg-[#111625] p-3 font-mono text-emerald-400 text-[11px] shadow-xs">
            PYTHONPATH=services/api .venv/bin/python3 -m app.ingestion.cli load ./data
          </div>
        </div>
      </div>
    </div>
  );
}
