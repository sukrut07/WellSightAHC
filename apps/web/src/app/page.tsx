'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
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
  CheckCircle2,
  Menu,
  X,
  Radio,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { ConnectivityTree } from '@/components/landing/ConnectivityTree';
import { WellSightLogo } from '@/components/WellSightLogo';

// Lazy load 3D hero canvas to ensure zero initial load penalty
const Hero3DCanvas = dynamic(
  () => import('@/components/landing/Hero3DCanvas').then((mod) => mod.Hero3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-white/70">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-bold">
          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          Initializing Asset 3D Model...
        </div>
      </div>
    ),
  }
);

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900 relative">
      {/* 1. Minimal Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Product Identity */}
          <WellSightLogo href="/dashboard" theme="light" badge="2026" />

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How it works
            </a>
            <a href="#lineage" className="hover:text-indigo-600 transition-colors">
              Data Lineage
            </a>
            <a href="#preview" className="hover:text-indigo-600 transition-colors">
              Generative UI
            </a>
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              Live Operations <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-all shadow-xs"
            >
              Operations Dashboard
            </Link>
            <Link
              href="/copilot"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-500/25"
            >
              <Bot className="h-4 w-4" />
              Open Copilot
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900"
            aria-label="Toggle mobile menu"
          >
            {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileNavOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileNavOpen(false)}
              className="block text-xs font-semibold text-slate-700 py-1"
            >
              Capabilities
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileNavOpen(false)}
              className="block text-xs font-semibold text-slate-700 py-1"
            >
              How it works
            </a>
            <a
              href="#lineage"
              onClick={() => setMobileNavOpen(false)}
              className="block text-xs font-semibold text-slate-700 py-1"
            >
              Data Lineage
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="w-full text-center rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-800"
              >
                Operations Dashboard
              </Link>
              <Link
                href="/copilot"
                className="w-full text-center rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white"
              >
                Open AI Copilot
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section with 3D Industrial Asset & Editorial Layout */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Plain-language Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-[11px] font-mono text-indigo-700 font-bold shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
                ASSET INTELLIGENCE · HACKTOBERFEST 2026
              </div>

              {/* Headings (Styled from editorial reference) */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Every well has a story.
                </h1>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-indigo-600">
                  Ask the data.
                </p>
              </div>

              {/* Supporting Plain-English Narrative */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
                Ask questions about well inspections, downtime rules, repair histories, and spill procedures.
                WellSight AI retrieves verified records, explains what the evidence shows, and generates dynamic charts and tables.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-3 text-sm font-bold text-white transition-all shadow-md cursor-pointer"
                >
                  Explore the dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition-all shadow-xs"
                >
                  See how it works
                </a>
              </div>

              {/* Operational Proof Highlights */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Deterministic Math</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-indigo-600 font-mono">12</div>
                  <div className="text-[11px] text-slate-500 font-medium">Generative UI Types</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-emerald-600 font-mono">0 Fake Data</div>
                  <div className="text-[11px] text-slate-500 font-medium">Clickable Citations</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Hero Focal Point */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl border border-slate-200/90 bg-white/80 p-3 shadow-xl backdrop-blur-xl">
                <Hero3DCanvas />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature Summary: 4 Clean Pastel Editorial Cards (Inspired by Reference 2) */}
      <section id="features" className="py-20 border-t border-slate-200/80 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
              Engineered For Industrial Reality
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Built to solve the Asset Intelligence Copilot challenge
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Oilfield operations cannot rely on probabilistic text completion alone. WellSight AI couples natural-language reasoning with verified calculation engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-[#E9D5FF] bg-gradient-to-br from-[#F5F3FF] to-white p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ask in plain English</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Query well histories, downtime rankings, and repair records using natural language. No SQL or syntax mastery required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-[#BAE6FD] bg-gradient-to-br from-[#F0F9FF] to-white p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Trace to source records</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every factual claim provides clickable badges linking to underlying inspection IDs, repair logs, or SOP manual sections.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-[#A7F3D0] bg-gradient-to-br from-[#ECFDF5] to-white p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Understand downtime trends</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates the 7-day non-producing inspection rule and thermal lift thresholds (T200 15°C, T350 20°C, Gas Lift 15°F) deterministically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-[#FDE68A] bg-gradient-to-br from-[#FFFBEB] to-white p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Preserve corrections & conflicts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sensor recalibrations update subsequent math without destroying raw records. Missing dispatch timestamps are surfaced honestly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Generative UI Live Preview */}
      <section id="preview" className="py-20 border-t border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
                Dynamic Generative Interface
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Generates the right visual for every question
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                The server provides verified numbers; the copilot selects the optimal visual component inline.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-mono text-slate-600 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Generative Visual Preview
            </span>
          </div>

          {/* Interactive Chat & Visual Preview Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl space-y-6">
            {/* Operator Question */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">
                MT
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-800 shadow-xs font-medium">
                &ldquo;Which wells in Area A had the longest downtime this summer, and show me as a table?&rdquo;
              </div>
            </div>

            {/* Copilot Response Snippet */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white text-xs font-bold">
                <Flame className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  In <strong>Area A</strong>, <strong>WELL-0007 (Eagle Eye 07)</strong> recorded the longest downtime at{' '}
                  <strong className="text-rose-600 font-bold">21 days</strong> (504 hours), followed by{' '}
                  <strong>WELL-0003</strong> at <strong>14 days</strong>. Two consecutive non-producing weekly inspections
                  on WELL-0007 contributed 14 days under Rule 2.1, with work ticket{' '}
                  <code className="text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded text-[11px] font-mono">
                    REP-2026-0041
                  </code>{' '}
                  confirming an eroded gas injection valve.
                </div>

                {/* Generated Mini Data Table */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>Summer 2026 Downtime Ranking — Area A</span>
                    <span className="font-mono text-[10px] text-indigo-600 font-bold">Spec: data_table</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-mono">
                        <tr>
                          <th className="px-4 py-2">Well Asset</th>
                          <th className="px-4 py-2">Lift Type</th>
                          <th className="px-4 py-2">Downtime Days</th>
                          <th className="px-4 py-2">Operating Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            WELL-0007 (Eagle Eye 07)
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 font-mono">Gas Lift</td>
                          <td className="px-4 py-2.5 font-mono font-bold text-rose-600">21 days (504h)</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                              Critical Downtime
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            WELL-0003 (Crestview 03)
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 font-mono">ESP</td>
                          <td className="px-4 py-2.5 font-mono font-bold text-amber-600">14 days (336h)</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                              Moderate Downtime
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            WELL-0001 (Eagle Ford 01)
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 font-mono">Rod Pump</td>
                          <td className="px-4 py-2.5 font-mono font-bold text-emerald-600">0 days (0h)</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
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
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">Evidence Citing:</span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-mono text-indigo-700 font-medium">
                    <FileCheck2 className="h-3 w-3" /> insp-007-1 (Aug 4)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-mono text-indigo-700 font-medium">
                    <FileCheck2 className="h-3 w-3" /> insp-007-2 (Aug 11)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-emerald-700 font-medium">
                    <FileCheck2 className="h-3 w-3" /> manuals/gas_lift_manual.md §3.2
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Asset Lineage & Connectivity Graph */}
      <section id="lineage" className="py-20 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <ConnectivityTree />
        </div>
      </section>

      {/* 6. How It Works: 3 Steps */}
      <section id="how-it-works" className="py-20 border-t border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
              Orchestration Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">How WellSight AI Works</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Three clear stages from your natural language question to an auditable operational answer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Ask your question</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Operator asks about downtime, root causes, compliance deadlines, or repairs in plain English.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Retrieves real evidence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Queries structured inspection records, runs deterministic calculations, and searches SOPs and manuals.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Generates dynamic UI</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Renders a ranked table, bar chart, status card, or heatmap inside the chat with record-level citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Closing CTA */}
      <section className="py-20 border-t border-slate-200/80 bg-gradient-to-b from-slate-50 to-indigo-50/40">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-mono text-indigo-700 font-bold">
            Ready for Hackathon Evaluation
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Asset Intelligence for the 2026 Fleet
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Every answer is backed by verifiable records, deterministic business logic, and transparent evidence trails.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white transition-all shadow-md shadow-indigo-500/25 cursor-pointer"
            >
              Launch Operational Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
