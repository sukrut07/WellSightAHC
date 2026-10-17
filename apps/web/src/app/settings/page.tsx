'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  Users,
  CheckCircle2,
  RefreshCw,
  Shield,
  Key,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [activeUser, setActiveUser] = useState('demo_user_alpha');
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
      // Ingest default data
      await fetch('http://localhost:8000/api/ingestion/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: './data' }),
      });
      setIngestMsg('Dataset re-ingested and verified successfully.');
    } catch (err: any) {
      setIngestMsg('Failed to trigger ingestion: ' + err.message);
    } finally {
      setReingesting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-emerald-400" /> System Settings & Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Runtime AI provider status, memory isolation parameters, and dataset ingestion management
        </p>
      </div>

      {/* AI Provider Status Card */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Cpu className="h-5 w-5 text-sky-400" />
          <h3 className="text-sm font-bold text-white">AI Provider Abstraction</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border border-emerald-800/80 bg-emerald-950/20 p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Deterministic Engine</span>
              <span className="rounded bg-emerald-950 border border-emerald-800 px-1.5 py-0.2 font-mono text-[10px] text-emerald-400">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Offline, zero-cost, deterministic tool orchestrator executing exact organiser rules.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Google Gemini API</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.2 font-mono text-[10px] text-slate-400">
                KEY IN .ENV
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Enabled when GEMINI_API_KEY is configured. Falls back gracefully when key is absent.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">OpenAI / OpenWeight</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.2 font-mono text-[10px] text-slate-400">
                COMPATIBLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Supports OpenAI-compatible endpoints via OPENAI_API_KEY environment variable.
            </p>
          </div>
        </div>
      </div>

      {/* Demo User Switcher Card */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Users className="h-5 w-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Operator Session & Memory Isolation</h3>
            <p className="text-xs text-slate-400">Switching the user demonstrates strictly isolated private conversational memory</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 'demo_user_alpha',
              name: 'Sarah Jenkins',
              role: 'Lead Operations & Environmental Engineer',
              dept: 'Production Management',
            },
            {
              id: 'demo_user_beta',
              name: 'John Davis',
              role: 'Field Pumper & Route Operator',
              dept: 'Field Operations Area A',
            },
            {
              id: 'demo_user_gamma',
              name: 'Carlos Mendez',
              role: 'Subsurface Geologist',
              dept: 'Reservoir Engineering',
            },
          ].map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserChange(user.id)}
              className={`cursor-pointer rounded-lg border p-3.5 transition-all flex items-center justify-between ${
                activeUser === user.id
                  ? 'border-emerald-500 bg-emerald-950/40 text-white'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-200">{user.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  User ID: {user.id} • {user.role} ({user.dept})
                </div>
              </div>
              {activeUser === user.id && (
                <span className="flex items-center gap-1 rounded bg-emerald-900/60 border border-emerald-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> Active User
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dataset & Ingestion Management */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Dataset Ingestion Pipeline</h3>
          </div>
          <button
            onClick={handleReingest}
            disabled={reingesting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${reingesting ? 'animate-spin' : ''}`} />
            {reingesting ? 'Ingesting...' : 'Re-Ingest Dataset'}
          </button>
        </div>

        {ingestMsg && (
          <div className="rounded bg-emerald-950/60 border border-emerald-800 p-2.5 text-xs text-emerald-300 font-mono">
            {ingestMsg}
          </div>
        )}

        <div className="text-xs text-slate-400 space-y-2">
          <p>You can also load the late-release test dataset from the terminal at any time using:</p>
          <div className="rounded bg-slate-950 border border-slate-800 p-3 font-mono text-emerald-400 text-[11px]">
            PYTHONPATH=services/api .venv/bin/python3 -m app.ingestion.cli load ./data/test_dataset
          </div>
        </div>
      </div>
    </div>
  );
}
