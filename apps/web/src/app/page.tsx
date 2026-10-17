'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Flame,
  ArrowRight,
  Bot,
  Database,
  BarChart3,
  ShieldCheck,
  FileCheck2,
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink,
  Sparkles,
  GitMerge,
  Search,
  CheckCircle,
  Menu,
  X,
} from 'lucide-react';
import { ConnectivityTree } from '@/components/landing/ConnectivityTree';

// Lazy load 3D hero canvas to ensure zero initial load penalty
const Hero3DCanvas = dynamic(
  () => import('@/components/landing/Hero3DCanvas').then((mod) => mod.Hero3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-slate-800 bg-[#0A1224]/50">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Initializing Asset 3D Model...
        </div>
      </div>
    ),
  }
);

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070D19] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Minimal Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070D19]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Product Identity */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-700/80 text-emerald-400 group-hover:scale-105 transition-transform shadow-md">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                WellSight AI
                <span className="rounded bg-emerald-950/80 border border-emerald-800 px-1 py-0.2 text-[9px] font-mono font-semibold text-emerald-400">
                  2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Asset Intelligence Copilot</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-300 transition-colors">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:text-emerald-300 transition-colors">
              How it works
            </a>
            <a href="#lineage" className="hover:text-emerald-300 transition-colors">
              Data Lineage
            </a>
            <a href="#preview" className="hover:text-emerald-300 transition-colors">
              Generative UI
            </a>
            <Link href="/dashboard" className="hover:text-emerald-300 transition-colors flex items-center gap-1">
              Live Operations <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition-all shadow-xs"
            >
              Operations Dashboard
            </Link>
            <Link
              href="/copilot"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition-all shadow-md shadow-emerald-950/50"
            >
              <Bot className="h-4 w-4" />
              Open Copilot
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white"
            aria-label="Toggle mobile menu"
          >
            {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileNavOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#0B1220] px-4 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileNavOpen(false)}
              className="block text-xs font-medium text-slate-300 py-1"
            >
              Capabilities
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileNavOpen(false)}
              className="block text-xs font-medium text-slate-300 py-1"
            >
              How it works
            </a>
            <a
              href="#lineage"
              onClick={() => setMobileNavOpen(false)}
              className="block text-xs font-medium text-slate-300 py-1"
            >
              Data Lineage
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="w-full text-center rounded-lg border border-slate-700 bg-slate-900 py-2 text-xs font-medium text-slate-200"
              >
                Operations Dashboard
              </Link>
              <Link
                href="/copilot"
                className="w-full text-center rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-slate-950"
              >
                Open AI Copilot
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section with 3D Industrial Asset */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Plain-language Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-[11px] font-mono text-emerald-400 font-semibold shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                ASSET INTELLIGENCE · HACKTOBERFEST 2026
              </div>

              {/* Headings */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Every well has a story.
                </h1>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-emerald-400">
                  Ask the data.
                </p>
              </div>

              {/* Supporting Plain-English Narrative */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
                Ask questions about well inspections, downtime, repairs, and spill procedures.
                WellSight AI retrieves the verified records, explains what the evidence shows, and presents answers as
                dynamic charts or tables.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition-all shadow-lg shadow-emerald-950/60"
                >
                  Explore the dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800/90 px-5 py-3 text-sm font-semibold text-slate-200 transition-all"
                >
                  See how it works
                </a>
              </div>

              {/* Operational Proof Highlights */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <div className="text-lg font-bold text-white font-mono">100%</div>
                  <div className="text-[11px] text-slate-400">Deterministic Math</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">12</div>
                  <div className="text-[11px] text-slate-400">Generative UI Types</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-sky-400 font-mono">0 Fake Data</div>
                  <div className="text-[11px] text-slate-400">Clickable Citations</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Hero Focal Point */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl border border-slate-800/90 bg-[#0A1224] p-3 shadow-2xl glow-emerald-subtle">
                <Hero3DCanvas />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature Summary: 4 Clean Editorial Sections */}
      <section id="features" className="py-20 border-t border-slate-800/80 bg-[#0A1224]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Engineered For Industrial Reality
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Built to solve the Asset Intelligence Copilot challenge
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Oilfield operations cannot rely on probability and text completion alone. WellSight AI couples natural-language reasoning with verified calculation engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0F192B] p-6 space-y-3 hover:border-slate-700 transition-all shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-700/80 text-emerald-400">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Ask in plain English</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Query well histories, downtime rankings, and repair records using natural language. No SQL or syntax mastery required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0F192B] p-6 space-y-3 hover:border-slate-700 transition-all shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-950 border border-sky-700/80 text-sky-400">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Trace to source records</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every factual claim provides clickable badges linking to underlying inspection IDs, repair logs, or SOP manual sections.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0F192B] p-6 space-y-3 hover:border-slate-700 transition-all shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 border border-purple-700/80 text-purple-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Understand downtime trends</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates the 7-day non-producing inspection rule and thermal lift thresholds (Gas Lift 15°F, ESP 25°F) deterministically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0F192B] p-6 space-y-3 hover:border-slate-700 transition-all shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950 border border-amber-700/80 text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Preserve corrections & conflicts</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sensor recalibrations update subsequent math without destroying raw records. Missing dispatch timestamps are surfaced honestly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Generative UI Live Preview */}
      <section id="preview" className="py-20 border-t border-slate-800/80 bg-[#070D19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Dynamic Generative Interface
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                Generates the right UI for every question
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                The server provides verified numbers; the copilot selects the optimal visual component.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] font-mono text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Illustrative Live Component Preview
            </span>
          </div>

          {/* Interactive Chat & Visual Preview Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Operator Question */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-950 border border-sky-800 text-sky-300 text-xs font-bold">
                SC
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-xs sm:text-sm text-slate-200 shadow-xs">
                &ldquo;Which wells in Area A had the longest downtime this summer, and show me as a table?&rdquo;
              </div>
            </div>

            {/* Copilot Response Snippet */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-400 text-xs font-bold">
                <Flame className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  In <strong>Area A</strong>, <strong>WELL-0007 (Eagle Eye 07)</strong> recorded the longest downtime at{' '}
                  <strong className="text-emerald-400">21 days</strong> (504 hours), followed by{' '}
                  <strong>WELL-0003</strong> at <strong>14 days</strong>. Two consecutive non-producing weekly inspections
                  on WELL-0007 contributed 14 days under Rule 2.1, with work ticket{' '}
                  <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded text-[11px]">REP-2026-0041</code>{' '}
                  confirming an eroded gas injection valve.
                </div>

                {/* Generated Mini Data Table */}
                <div className="rounded-xl border border-slate-800/90 bg-[#070D19] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Summer 2026 Downtime Ranking — Area A</span>
                    <span className="font-mono text-[10px] text-emerald-400">Spec: data_table</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase font-mono">
                        <tr>
                          <th className="px-4 py-2">Well Asset</th>
                          <th className="px-4 py-2">Lift Type</th>
                          <th className="px-4 py-2">Downtime Days</th>
                          <th className="px-4 py-2">Operating Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-200">
                        <tr className="hover:bg-slate-900/40">
                          <td className="px-4 py-2.5 font-bold text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            WELL-0007 (Eagle Eye 07)
                          </td>
                          <td className="px-4 py-2.5 text-slate-400 font-mono">Gas Lift</td>
                          <td className="px-4 py-2.5 font-mono font-bold text-rose-400">21 days (504h)</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                              Critical Downtime
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-900/40">
                          <td className="px-4 py-2.5 font-bold text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            WELL-0003 (Crestview 03)
                          </td>
                          <td className="px-4 py-2.5 text-slate-400 font-mono">ESP</td>
                          <td className="px-4 py-2.5 font-mono font-bold text-amber-400">14 days (336h)</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                              Moderate Downtime
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-900/40">
                          <td className="px-4 py-2.5 font-bold text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            WELL-0001 (Eagle Ford 01)
                          </td>
                          <td className="px-4 py-2.5 text-slate-400 font-mono">Rod Pump</td>
                          <td className="px-4 py-2.5 font-mono font-bold text-emerald-400">0 days (0h)</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                              Producing Active
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Evidence Citations Chips */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">Evidence Citing:</span>
                  <span className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-sky-300">
                    <FileCheck2 className="h-3 w-3" /> insp-007-1 (Aug 4)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-sky-300">
                    <FileCheck2 className="h-3 w-3" /> insp-007-2 (Aug 11)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                    <FileCheck2 className="h-3 w-3" /> manuals/gas_lift_manual.md §3.2
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Asset Lineage & Connectivity Graph */}
      <section id="lineage" className="py-20 border-t border-slate-800/80 bg-[#0A1224]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <ConnectivityTree />
        </div>
      </section>

      {/* 6. How It Works: 3 Steps */}
      <section id="how-it-works" className="py-20 border-t border-slate-800/80 bg-[#070D19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Orchestration Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">How WellSight AI Works</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Three clear stages from your natural language question to an auditable operational answer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-800 bg-[#0F192B] p-6 space-y-4 shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-white">Ask your question</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Operator asks about downtime, root causes, compliance deadlines, or repairs in plain English.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-800 bg-[#0F192B] p-6 space-y-4 shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-sky-400 font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-white">Retrieves real evidence</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Queries structured inspection records, runs deterministic calculations, and searches SOPs and manuals.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-800 bg-[#0F192B] p-6 space-y-4 shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-purple-400 font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-white">Generates dynamic UI</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Renders a ranked table, bar chart, status card, or heatmap inside the chat with record-level citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Closing CTA & Attribution */}
      <section className="py-20 border-t border-slate-800/80 bg-gradient-to-b from-[#0A1224] to-[#070D19]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-xs font-mono text-emerald-300 font-semibold">
            Ready for Hackathon Evaluation
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to investigate a well?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto">
            Experience the live Asset Intelligence Copilot with real inspection records, deterministic downtime calculations, and audited memory.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/copilot"
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition-all shadow-lg shadow-emerald-950/50"
            >
              <Bot className="h-4 w-4" />
              Launch Copilot Chat
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 transition-all"
            >
              Operations Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Minimal Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070D19] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">WellSight AI</span>
            <span>— Asset Intelligence Copilot</span>
          </div>

          <div className="font-mono text-[11px] text-slate-400">
            Hacktoberfest 2026 Hack Day Pune × AI Hackers Collective
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-emerald-300">
              Dashboard
            </Link>
            <Link href="/wells" className="hover:text-emerald-300">
              Wells
            </Link>
            <Link href="/analytics" className="hover:text-emerald-300">
              Analytics
            </Link>
            <a
              href="https://github.com/sukrut07/WellSightAHC"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-300 flex items-center gap-1"
            >
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
