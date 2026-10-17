'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Flame,
  ArrowRight,
  Bot,
  BarChart3,
  ShieldCheck,
  FileCheck2,
  Menu,
  X,
  Cpu,
  Database,
  Layers,
  GitBranch,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Search,
  Brain,
  Activity,
  Eye,
  Lock,
  TriangleAlert,
  ClipboardList,
  MapPin,
  Thermometer,
  Droplets,
  Settings,
  GitMerge,
  ExternalLink,
  ChevronRight,
  Star,
  Globe,
} from 'lucide-react';
import { WellSightLogo } from '@/components/WellSightLogo';

const Hero3DCanvas = dynamic(
  () => import('@/components/landing/Hero3DCanvas').then((mod) => mod.Hero3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full min-h-[420px] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-bold">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          Initializing 3D Asset Model...
        </div>
      </div>
    ),
  }
);

/* ─── Animated counter ─────────────────────────────────────────────── */
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(value / 60);
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Floating particle background ────────────────────────────────── */
function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient blobs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-emerald-500/6 blur-[100px]" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-sky-500/5 blur-[90px]" />

      {/* Animated grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#6366F1" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floating orbs — fixed positions to avoid hydration mismatch */}
      {[
        { w: 4, h: 4, l: 12, t: 20, bg: '#6366F1' },
        { w: 3, h: 3, l: 35, t: 55, bg: '#10B981' },
        { w: 5, h: 5, l: 62, t: 15, bg: '#6366F1' },
        { w: 2, h: 2, l: 78, t: 70, bg: '#10B981' },
        { w: 4, h: 4, l: 90, t: 35, bg: '#6366F1' },
        { w: 3, h: 3, l: 48, t: 85, bg: '#10B981' },
      ].map(({ w, h, l, t, bg }, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: w, height: h, background: bg, left: `${l}%`, top: `${t}%`, opacity: 0.3 }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ─── Architecture node component ─────────────────────────────────── */
function ArchNode({ icon: Icon, label, sublabel, color, delay = 0 }: {
  icon: any; label: string; sublabel: string; color: string; delay?: number;
}) {
  const colors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`rounded-xl border ${c.border} ${c.bg} px-4 py-3 flex items-start gap-3 shadow-sm cursor-default`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-900 truncate">{label}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{sublabel}</p>
      </div>
      <span className={`shrink-0 h-2 w-2 rounded-full ${c.dot} mt-1`} />
    </motion.div>
  );
}

/* ─── Tech badge ───────────────────────────────────────────────────── */
function TechBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-mono font-semibold text-slate-600 shadow-xs">
      {label}
    </span>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-500/20 relative overflow-x-hidden">
      {/* ── GLOBAL SCROLL PROGRESS INDICATOR ───────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 z-[60] origin-left pointer-events-none"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ── STICKY NAV ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <WellSightLogo href="/dashboard" theme="light" badge="2026" />

          <nav className="hidden md:flex items-center gap-6 text-[11px] font-semibold text-slate-600">
            {[
              ['#about', 'About'],
              ['#how-it-works', 'Architecture'],
              ['#features', 'Capabilities'],
              ['#tech', 'Tech Stack'],
              ['#lineage', 'Data Flow'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="hover:text-indigo-600 transition-colors">{label}</a>
            ))}
            <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
              Live Demo <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </Link>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://github.com/sukrut07/WellSightAHC"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-all flex items-center gap-1.5"
            >
              <GitBranch className="h-3.5 w-3.5" /> GitHub
            </a>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/25"
            >
              <Bot className="h-4 w-4" /> Open App
            </Link>
          </div>

          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden p-1.5 text-slate-600">
            {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3">
            {[['#about','About'],['#how-it-works','Architecture'],['#features','Capabilities']].map(([h,l]) => (
              <a key={h} href={h} onClick={() => setMobileNavOpen(false)} className="block text-xs font-semibold text-slate-700 py-1">{l}</a>
            ))}
            <Link href="/dashboard" className="block text-center rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white">Open App</Link>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center pt-8 pb-20 overflow-hidden bg-gradient-to-br from-slate-950 via-[#0F1729] to-[#0B1120]">
        <ParticleBackground />

        {/* Decorative glows */}
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-indigo-600/15 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-56 h-56 rounded-full bg-emerald-500/10 blur-[70px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-7"
            >
              {/* Event badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-[11px] font-mono text-indigo-300 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                  HACKTOBERFEST 2026 · HACK DAY PUNE
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  7/7 Eval Passed
                </span>
              </div>

              {/* Main headline */}
              <div className="space-y-3">
                <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-black tracking-tight leading-[0.95] text-white">
                  Every well<br />
                  <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                    has a story.
                  </span>
                </h1>
                <p className="text-xl font-bold text-slate-300 mt-2">Ask the data.</p>
              </div>

              {/* Project description */}
              <div className="space-y-3">
                <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                  <strong className="text-white">WellSight AI</strong> is an <em>agentic</em> Asset Intelligence Copilot built for oilfield operations. It retrieves real records, runs deterministic calculations, resolves conflicting evidence, remembers corrections, and generates dynamic visual interfaces — all from natural language.
                </p>
                <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                  Built for the FlytBase Hack Day Pune × AI Hackers Collective challenge: <span className="text-slate-300 font-medium">"Asset Intelligence Copilot"</span> — a system that goes far beyond chatbots.
                </p>
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10 max-w-sm">
                {[
                  { val: 600, suffix: '+', label: 'Wells Indexed' },
                  { val: 7, suffix: '/7', label: 'Evals Passing' },
                  { val: 18, suffix: '+', label: 'Backend Tests' },
                ].map(({ val, suffix, label }) => (
                  <div key={label}>
                    <div className="text-xl font-black text-white font-mono">
                      <AnimatedCounter value={val} suffix={suffix} />
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/30"
                >
                  Launch Operations <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/copilot"
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 hover:bg-white/15 px-5 py-3 text-sm font-semibold text-white transition-all backdrop-blur-sm"
                >
                  <Bot className="h-4 w-4" /> Open AI Copilot
                </Link>
                <a
                  href="https://github.com/sukrut07/WellSightAHC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  <GitBranch className="h-4 w-4" /> Source Code
                </a>
              </div>
            </motion.div>

            {/* Right column — 3D canvas */}
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6"
            >
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl shadow-2xl shadow-black/40">
                {/* Status bar */}
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] font-mono text-white/30">WellSight · SCADA Twin v2.4</span>
                </div>
                <Hero3DCanvas />
                {/* Overlay label */}
                <div className="absolute bottom-5 left-6 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-mono text-white/80 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  WELLHEAD SENSOR TWIN · TELEMETRY ACTIVE
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Scroll to explore</span>
          <div className="h-8 w-0.5 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
        </motion.div>
      </section>

      {/* ── ABOUT / PROBLEM STATEMENT ──────────────────────── */}
      <section id="about" className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-600 font-bold">The Problem</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 leading-tight">
                Oilfield operators can't trust their own data
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Inspection records, SCADA telemetry, spill logs, and repair histories live in silos. When a regulator asks why a well was non-producing for 21 days, no one can produce a deterministic, auditable answer fast enough.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { icon: AlertTriangle, label: 'Conflicting sensor readings from uncalibrated equipment', color: 'text-rose-500' },
                  { icon: TriangleAlert, label: 'Missing dispatch timestamps for regulatory spill events', color: 'text-amber-500' },
                  { icon: Eye, label: 'No traceability from AI answers back to source records', color: 'text-slate-400' },
                  { icon: Lock, label: 'Private operator corrections overwriting shared ground truth', color: 'text-slate-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                    <span className="text-sm text-slate-600">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-bold">The Solution</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 leading-tight">
                Agentic AI that calculates, not just talks
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                WellSight AI pairs a large language model with deterministic calculation engines. Every answer is grounded in real data, every claim is backed by clickable citations, and every correction is preserved with full provenance.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { icon: CheckCircle2, label: 'Deterministic downtime math (7-day / 14-day inspection rules)', color: 'text-emerald-500' },
                  { icon: CheckCircle2, label: 'Real-time spill compliance with 24-hour statutory deadlines', color: 'text-emerald-500' },
                  { icon: CheckCircle2, label: 'Dual memory: shared well context + isolated user history', color: 'text-emerald-500' },
                  { icon: CheckCircle2, label: 'Scoped corrections engine with immutable audit provenance', color: 'text-emerald-500' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                    <span className="text-sm text-slate-600">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ───────────────────────────────────── */}
      <section className="py-12 bg-gradient-to-br from-slate-950 to-[#0F1729] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: 600, suffix: '+', label: 'Wells in Dataset', sub: 'FlytBase 600-well corpus' },
              { val: 100, suffix: '%', label: 'Compliance Score', sub: '7/7 checks passing' },
              { val: 18, suffix: '', label: 'Backend Tests', sub: 'All passing, 10s' },
              { val: 12, suffix: '', label: 'Generative UI Types', sub: 'Tables, charts, heatmaps…' },
            ].map(({ val, suffix, label, sub }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-4xl font-black font-mono text-white">
                  <AnimatedCounter value={val} suffix={suffix} />
                </div>
                <div className="text-sm font-bold text-white/80 mt-1">{label}</div>
                <div className="text-[11px] text-white/40 font-mono mt-0.5">{sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS / ARCHITECTURE ───────────────────── */}
      <section id="how-it-works" className="py-24 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-bold">System Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              How WellSight AI works end-to-end
            </h2>
            <p className="text-sm text-slate-500 mt-3">
              A full-stack agentic system: Next.js frontend, FastAPI backend, SQLite with RAG, and a Gemini-powered orchestrator that selects the right calculation tool for each query.
            </p>
          </motion.div>

          {/* Architecture flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 relative">
            {/* Connector lines (desktop) */}
            <div className="hidden md:block absolute top-8 left-[25%] right-[25%] h-0.5 bg-gradient-to-r from-indigo-200 via-sky-200 to-emerald-200 z-0" />

            {[
              {
                step: '01',
                icon: Bot,
                title: 'Natural Language Query',
                desc: 'Operator types a question in plain English: downtime rankings, compliance checks, root causes, or repair costs.',
                color: 'indigo',
              },
              {
                step: '02',
                icon: Brain,
                title: 'Gemini Orchestrator',
                desc: 'Gemini 2.5 Flash classifies intent, routes to the right tool, and generates a structured response with visual spec.',
                color: 'sky',
              },
              {
                step: '03',
                icon: Cpu,
                title: 'Deterministic Engines',
                desc: 'Calculation engines apply business rules: 7/14-day downtime, thermal thresholds, 24h spill compliance — no hallucination.',
                color: 'emerald',
              },
              {
                step: '04',
                icon: BarChart3,
                title: 'Generative UI Response',
                desc: 'Returns the optimal visual: ranked table, bar chart, heatmap, timeline, or conflict panel — with clickable evidence citations.',
                color: 'amber',
              },
            ].map(({ step, icon: Icon, title, desc, color }, i) => {
              const colorMap: Record<string, string> = {
                indigo: 'bg-indigo-600', sky: 'bg-sky-500', emerald: 'bg-emerald-600', amber: 'bg-amber-500',
              };
              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative z-10 flex flex-col items-center text-center px-4"
                >
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${colorMap[color]} text-white shadow-lg mb-4`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 font-bold mb-1">STEP {step}</div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Full architecture diagram as layered cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Full System Architecture</h3>
                <p className="text-xs text-slate-500 mt-0.5">Monorepo · Next.js 16 + FastAPI + SQLite + Gemini</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-mono text-emerald-700 font-bold">LIVE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Frontend */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
                  <Globe className="h-3 w-3" /> Frontend (apps/web)
                </div>
                <ArchNode icon={Layers} label="Next.js 16 App Router" sublabel="SSR, TypeScript, Turbopack" color="indigo" delay={0} />
                <ArchNode icon={BarChart3} label="Generative UI Components" sublabel="12 visual types: tables, charts, heatmaps" color="indigo" delay={0.05} />
                <ArchNode icon={Activity} label="Real-time Operations Dashboard" sublabel="KPIs, charts, well directory" color="indigo" delay={0.1} />
                <ArchNode icon={Bot} label="AI Copilot Interface" sublabel="Framer Motion animations, citations" color="indigo" delay={0.15} />
              </div>

              {/* Backend */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
                  <Terminal className="h-3 w-3" /> Backend (services/api)
                </div>
                <ArchNode icon={Zap} label="FastAPI + Uvicorn" sublabel="Async Python, OpenAPI docs" color="sky" delay={0.05} />
                <ArchNode icon={Brain} label="Gemini 2.5 Flash Orchestrator" sublabel="Tool-calling, intent routing" color="sky" delay={0.1} />
                <ArchNode icon={Cpu} label="Deterministic Calculation Engines" sublabel="Downtime, thermal, spill compliance" color="sky" delay={0.15} />
                <ArchNode icon={Database} label="SQLAlchemy + SQLite RAG" sublabel="600 wells, full inspection history" color="sky" delay={0.2} />
              </div>

              {/* Data / Memory */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
                  <Database className="h-3 w-3" /> Data & Memory
                </div>
                <ArchNode icon={GitBranch} label="Dual Memory Architecture" sublabel="Shared well context + private user history" color="emerald" delay={0.1} />
                <ArchNode icon={GitMerge} label="Scoped Corrections Engine" sublabel="Record / well / type scoping with provenance" color="emerald" delay={0.15} />
                <ArchNode icon={FileCheck2} label="Document RAG (SOPs, Manuals)" sublabel="Full-text search with chunk citations" color="emerald" delay={0.2} />
                <ArchNode icon={ShieldCheck} label="Honest Conflict Detection" sublabel="Surfaces missing evidence, not fabricates" color="emerald" delay={0.25} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ─────────────────────────────────── */}
      <section id="features" className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-bold">Core Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Built to solve every FlytBase challenge requirement
            </h2>
            <p className="text-sm text-slate-500 mt-3">
              Not a chatbot. A full agentic system with real calculation engines, auditable answers, and persistent memory.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Bot,
                color: 'purple',
                title: 'Natural Language Queries',
                body: 'Ask anything about well performance in plain English. No SQL, no dashboards — just ask "Which wells in Area A had the most downtime this summer?"',
                badge: 'Gemini 2.5 Flash',
              },
              {
                icon: Cpu,
                color: 'sky',
                title: 'Deterministic Downtime Math',
                body: '7-day rule per non-producing inspection, 14-day rule for two consecutive. Thermal thresholds: T200 (15°C), T350 (20°C), T500 (25°F), Gas Lift (15°F), ESP (25°F).',
                badge: 'Business Rules Engine',
              },
              {
                icon: Droplets,
                color: 'rose',
                title: '24-Hour Spill Compliance',
                body: 'Automatically flags spills ≥5 bbl against statutory 24-hour reporting deadlines. Surfaces "Insufficient Data" honestly when dispatch timestamps are missing.',
                badge: 'SR-01 Regulatory Rule',
              },
              {
                icon: Brain,
                color: 'indigo',
                title: 'Dual Memory Architecture',
                body: 'Shared well context broadcasts knowledge across the entire operations team. Private conversation history remains strictly isolated per user session.',
                badge: 'Redis-like Scoping',
              },
              {
                icon: GitMerge,
                color: 'emerald',
                title: 'Scoped Corrections Engine',
                body: 'Operators submit sensor recalibrations at record, well, or well-type scope. Corrections update downstream math without destroying raw immutable records.',
                badge: 'Audit Provenance',
              },
              {
                icon: ShieldCheck,
                color: 'amber',
                title: 'Evidence Citations',
                body: 'Every answer links to inspection IDs, repair work tickets, and SOP manual sections. Click any citation to open the source record — zero hallucinations.',
                badge: 'Clickable Sources',
              },
              {
                icon: BarChart3,
                color: 'sky',
                title: 'Generative Visual Interfaces',
                body: 'The AI selects the optimal visualization inline: ranked tables, bar charts, heatmaps, timelines, status cards, and conflict panels rendered in the chat.',
                badge: '12 Visual Types',
              },
              {
                icon: FileCheck2,
                color: 'emerald',
                title: 'Document RAG (SOPs & Manuals)',
                body: 'Full-text search across gas lift manuals, spill response SOPs, and regulatory procedures. Chunk-level citations with section references.',
                badge: 'Vector Search + BM25',
              },
              {
                icon: Eye,
                color: 'purple',
                title: 'Honest Conflict Detection',
                body: 'Detects contested corrections, contested sensor readings, and missing regulatory timestamps. Never fabricates conclusions when evidence is ambiguous.',
                badge: 'Trust Boundaries',
              },
            ].map(({ icon: Icon, color, title, body, badge }, i) => {
              const colorMap: Record<string, { bg: string; iconBg: string; text: string; border: string; badgeBg: string; badgeText: string }> = {
                purple: { bg: 'from-purple-50 to-white', iconBg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', badgeBg: 'bg-purple-50', badgeText: 'text-purple-700' },
                sky: { bg: 'from-sky-50 to-white', iconBg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200', badgeBg: 'bg-sky-50', badgeText: 'text-sky-700' },
                rose: { bg: 'from-rose-50 to-white', iconBg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', badgeBg: 'bg-rose-50', badgeText: 'text-rose-700' },
                indigo: { bg: 'from-indigo-50 to-white', iconBg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-700' },
                emerald: { bg: 'from-emerald-50 to-white', iconBg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
                amber: { bg: 'from-amber-50 to-white', iconBg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' },
              };
              const c = colorMap[color] || colorMap.indigo;
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.iconBg} ${c.text}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`rounded-md border ${c.border} ${c.badgeBg} px-2 py-0.5 text-[9px] font-mono font-bold ${c.badgeText}`}>
                      {badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO PREVIEW ─────────────────────────────── */}
      <section id="demo" className="py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-bold">Live Demo Preview</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                Ask — and get a verifiable, visual answer
              </h2>
              <p className="text-sm text-slate-500 mt-2 max-w-lg">
                This is a real conversation from the running WellSight AI copilot. Every number is calculated, every record is cited.
              </p>
            </div>
            <Link
              href="/copilot"
              className="shrink-0 flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition-all"
            >
              Try It Live <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
          >
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 text-white">
                <Flame className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">WellSight AI Copilot</span>
                <span className="ml-2 text-[10px] font-mono text-emerald-600 font-medium">● ACTIVE</span>
              </div>
              <div className="ml-auto text-[10px] font-mono text-slate-400">conv-2026-MT-0041</div>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* User query */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 text-xs font-black font-mono">MT</div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 font-medium shadow-xs max-w-xl">
                  "Which wells in Area A had the longest downtime this summer, what caused it, and show me a ranked table?"
                </div>
              </div>

              {/* AI response */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white text-xs font-bold">
                  <Flame className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-5 max-w-3xl">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    In <strong>Area A</strong>, <strong>WELL-0007 (Eagle Eye 07)</strong> had the longest downtime at{' '}
                    <strong className="text-rose-600">21 days (504 hours)</strong>. Two consecutive non-producing weekly inspections on{' '}
                    <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">2026-08-04</code> and{' '}
                    <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">2026-08-11</code> triggered Rule 2.1 (14 days). Work ticket{' '}
                    <code className="text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded text-[11px] font-mono">REP-2026-0041</code>{' '}
                    confirms an eroded gas injection valve as root cause.
                  </p>

                  {/* Generative table */}
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Summer 2026 Downtime Ranking — Area A</span>
                      <span className="font-mono text-[10px] text-indigo-600 font-bold border border-indigo-200 bg-indigo-50 rounded px-1.5 py-0.5">Spec: data_table</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-mono">
                          <tr>
                            <th className="px-4 py-2.5">#</th>
                            <th className="px-4 py-2.5">Well Asset</th>
                            <th className="px-4 py-2.5">Lift Type</th>
                            <th className="px-4 py-2.5">Downtime</th>
                            <th className="px-4 py-2.5">Root Cause</th>
                            <th className="px-4 py-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {[
                            { rank: 1, well: 'WELL-0007', name: 'Eagle Eye 07', lift: 'Gas Lift', days: '21d (504h)', cause: 'Eroded injection valve', status: 'Critical', statusColor: 'rose' },
                            { rank: 2, well: 'WELL-0003', name: 'Crestview 03', lift: 'ESP', days: '14d (336h)', cause: 'Pump seal failure', status: 'Moderate', statusColor: 'amber' },
                            { rank: 3, well: 'WELL-0012', name: 'Highpoint 12', lift: 'T350', days: '7d (168h)', cause: 'Thermal threshold breach', status: 'Resolved', statusColor: 'sky' },
                            { rank: 4, well: 'WELL-0001', name: 'Eagle Ford 01', lift: 'Rod Pump', days: '0d', cause: '—', status: 'Producing', statusColor: 'emerald' },
                          ].map(({ rank, well, name, lift, days, cause, status, statusColor }) => {
                            const sc: Record<string, string> = {
                              rose: 'bg-rose-50 border-rose-200 text-rose-700',
                              amber: 'bg-amber-50 border-amber-200 text-amber-700',
                              sky: 'bg-sky-50 border-sky-200 text-sky-700',
                              emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                            };
                            const dc: Record<string, string> = { rose: 'text-rose-600', amber: 'text-amber-600', sky: 'text-sky-600', emerald: 'text-emerald-600' };
                            return (
                              <tr key={well} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-4 py-2.5 font-mono text-slate-400">{rank}</td>
                                <td className="px-4 py-2.5 font-bold text-slate-900 font-mono text-[11px]">
                                  <div>{well}</div>
                                  <div className="text-slate-400 font-normal">{name}</div>
                                </td>
                                <td className="px-4 py-2.5 text-slate-500 font-mono">{lift}</td>
                                <td className={`px-4 py-2.5 font-mono font-bold ${dc[statusColor]}`}>{days}</td>
                                <td className="px-4 py-2.5 text-slate-600 max-w-[140px]">{cause}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${sc[statusColor]}`}>{status}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Evidence citations */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">Evidence:</span>
                    {[
                      { label: 'insp-007-1 (Aug 4)', color: 'indigo' },
                      { label: 'insp-007-2 (Aug 11)', color: 'indigo' },
                      { label: 'REP-2026-0041', color: 'emerald' },
                      { label: 'gas_lift_manual.md §3.2', color: 'purple' },
                    ].map(({ label, color }) => {
                      const bc: Record<string, string> = {
                        indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
                        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                        purple: 'border-purple-200 bg-purple-50 text-purple-700',
                      };
                      return (
                        <span key={label} className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium cursor-pointer hover:opacity-80 ${bc[color]}`}>
                          <FileCheck2 className="h-3 w-3" /> {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DATA FLOW / LINEAGE ───────────────────────────── */}
      <section id="lineage" className="py-24 bg-gradient-to-br from-slate-950 to-[#0F1729] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-xl mx-auto"
          >
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold">Data Flow & Lineage</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              From raw SCADA to auditable answer
            </h2>
            <p className="text-sm text-white/50 mt-3">
              Trace every calculation from source telemetry through deterministic engines to the final visual — no black boxes.
            </p>
          </motion.div>

          {/* Flow diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: '1. Source Tier — Raw Data Inputs',
                color: 'indigo',
                items: [
                  { icon: Thermometer, label: 'SCADA Gateway Telemetry', detail: 'Wellhead & ambient temperatures, GW-SW23/NE07' },
                  { icon: ClipboardList, label: 'Weekly Field Inspections', detail: '40k+ records, drone & manual surveys' },
                  { icon: Droplets, label: 'Environmental Spill Events', detail: 'Crude release volumes, dispatch timestamps' },
                  { icon: Settings, label: 'Operator Corrections Ledger', detail: 'Sensor recalibrations with author & reason' },
                ],
              },
              {
                title: '2. Calculation Tier — Deterministic Engines',
                color: 'sky',
                items: [
                  { icon: Thermometer, label: 'Thermal Delta Engine', detail: 'T200/T350/T500/Gas Lift/ESP thresholds' },
                  { icon: Activity, label: 'Inspection Downtime Engine', detail: '7d per inspection, 14d consecutive rule' },
                  { icon: ShieldCheck, label: '24h Spill Compliance Auditor', detail: 'SR-01 ≥5bbl statutory deadline check' },
                  { icon: AlertTriangle, label: 'Honest Conflict Engine', detail: 'Surfaces missing evidence, not guesses' },
                ],
              },
              {
                title: '3. Output Tier — Generative UI',
                color: 'emerald',
                items: [
                  { icon: BarChart3, label: 'Ranked Data Table', detail: 'Sortable downtime & compliance ledgers' },
                  { icon: Layers, label: 'Monthly Heatmap Matrix', detail: 'Area × Month downtime 2D visualization' },
                  { icon: Activity, label: 'Wellhead Status Twin', detail: 'Live thermal gauge, lift & repair status' },
                  { icon: Eye, label: 'Conflict & Evidence Panel', detail: 'Competing claims, cited transparently' },
                ],
              },
            ].map(({ title, color, items }, ti) => {
              const borderC: Record<string, string> = { indigo: 'border-indigo-500/20', sky: 'border-sky-500/20', emerald: 'border-emerald-500/20' };
              const bgC: Record<string, string> = { indigo: 'bg-indigo-500/8', sky: 'bg-sky-500/8', emerald: 'bg-emerald-500/8' };
              const textC: Record<string, string> = { indigo: 'text-indigo-400', sky: 'text-sky-400', emerald: 'text-emerald-400' };
              const iconC: Record<string, string> = { indigo: 'text-indigo-300', sky: 'text-sky-300', emerald: 'text-emerald-300' };
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: ti * 0.1 }}
                  className={`rounded-2xl border ${borderC[color]} ${bgC[color]} p-5 backdrop-blur-sm space-y-4`}
                >
                  <h3 className={`text-xs font-bold ${textC[color]} font-mono uppercase tracking-wider`}>{title}</h3>
                  <div className="space-y-3">
                    {items.map(({ icon: Icon, label, detail }) => (
                      <div key={label} className="flex items-start gap-3">
                        <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconC[color]}`} />
                        <div>
                          <div className="text-xs font-semibold text-white/80">{label}</div>
                          <div className="text-[10px] text-white/40 mt-0.5">{detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ───────────────────────────────────── */}
      <section id="tech" className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-bold">Tech Stack</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Production-grade monorepo stack
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Frontend',
                icon: Globe,
                color: 'indigo',
                techs: ['Next.js 16 (App Router)', 'TypeScript', 'Framer Motion', 'Tailwind CSS v4', 'Three.js (3D Canvas)', 'Lucide Icons', 'Recharts', 'SWR'],
              },
              {
                title: 'Backend',
                icon: Terminal,
                color: 'sky',
                techs: ['FastAPI (Python 3.14)', 'Uvicorn ASGI', 'SQLAlchemy ORM', 'SQLite + WAL', 'Pydantic v2', 'Pytest (18 tests)', 'httpx', 'python-multipart'],
              },
              {
                title: 'AI & Intelligence',
                icon: Brain,
                color: 'purple',
                techs: ['Gemini 2.5 Flash (tool-calling)', 'OpenAI GPT-4o-mini (fallback)', 'Deterministic rule engine', 'BM25 + keyword RAG', 'Intent classification', 'Visual spec generation'],
              },
              {
                title: 'Infrastructure',
                icon: Settings,
                color: 'emerald',
                techs: ['Vercel multi-service deploy', 'Docker + docker-compose', 'GitHub Actions CI/CD', 'Turbopack dev server', 'Monorepo (apps/ + services/)', 'CORS + internal service binding'],
              },
            ].map(({ title, icon: Icon, color, techs }, i) => {
              const colorMap: Record<string, { iconBg: string; iconText: string; header: string }> = {
                indigo: { iconBg: 'bg-indigo-100', iconText: 'text-indigo-700', header: 'border-indigo-200 bg-indigo-50/60' },
                sky: { iconBg: 'bg-sky-100', iconText: 'text-sky-700', header: 'border-sky-200 bg-sky-50/60' },
                purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-700', header: 'border-purple-200 bg-purple-50/60' },
                emerald: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-700', header: 'border-emerald-200 bg-emerald-50/60' },
              };
              const c = colorMap[color];
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`flex items-center gap-3 px-5 py-4 border-b ${c.header}`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.iconBg} ${c.iconText}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">{title}</span>
                  </div>
                  <div className="px-5 py-4 flex flex-wrap gap-2">
                    {techs.map((t) => <TechBadge key={t} label={t} />)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── EVALUATION RESULTS ──────────────────────────── */}
      <section className="py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-bold">Evaluation Results</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              7/7 benchmark queries. 100% compliance.
            </h2>
            <p className="text-sm text-slate-500 mt-3">All 7 official FlytBase evaluation queries pass with correct visual type, citations, and deterministic math.</p>
          </motion.div>

          <div className="space-y-3">
            {[
              { id: 'EVAL-01', cat: 'Downtime', query: 'Which wells in Area A had the longest downtime this summer?', visual: 'bar_chart', ms: 793 },
              { id: 'EVAL-02', cat: 'Root Cause', query: 'Why was WELL-0007 not producing?', visual: 'timeline', ms: 544 },
              { id: 'EVAL-03', cat: 'Spill Compliance', query: 'Which spills required reporting within 24 hours?', visual: 'data_table', ms: 1071 },
              { id: 'EVAL-04', cat: 'Cost Analysis', query: 'Compare repair costs by area this quarter.', visual: 'bar_chart', ms: 3 },
              { id: 'EVAL-05', cat: 'Spatial-Temporal', query: 'Show monthly downtime by area as a heatmap.', visual: 'heatmap', ms: 507 },
              { id: 'EVAL-06', cat: 'Conflict', query: 'Which conclusions are uncertain because records conflict?', visual: 'conflict_panel', ms: 311 },
              { id: 'EVAL-07', cat: 'Corrections', query: 'What changed after the latest correction?', visual: 'data_table', ms: 3 },
            ].map(({ id, cat, query, visual, ms }, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-xs hover:border-emerald-200 hover:shadow-sm transition-all"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{id}</span>
                    <span className="text-[10px] font-semibold text-slate-500 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">{cat}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5 truncate">&ldquo;{query}&rdquo;</p>
                </div>
                <div className="shrink-0 text-right hidden sm:block">
                  <div className="text-[10px] font-mono text-indigo-600 font-bold">{visual}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{ms}ms</div>
                </div>
                <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">PASS</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-br from-slate-950 via-[#0F1729] to-indigo-950 relative overflow-hidden">
        <ParticleBackground />
        <div className="absolute inset-0 bg-dot-matrix opacity-5 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-3xl mx-auto px-4 text-center space-y-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-mono text-indigo-300 font-bold">
            <Star className="h-3.5 w-3.5" />
            Hacktoberfest 2026 · Asset Intelligence Copilot Challenge
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Every answer backed by<br />
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">verifiable evidence</span>
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            WellSight AI doesn't hallucinate. It calculates. Every claim is traceable to a real inspection record, repair ticket, or SOP section.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-7 py-3.5 text-sm font-bold text-white transition-all shadow-xl shadow-indigo-500/30"
            >
              Launch Operations Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/copilot"
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 hover:bg-white/15 px-6 py-3.5 text-sm font-semibold text-white transition-all"
            >
              <Bot className="h-4 w-4" /> Open AI Copilot
            </Link>
          </div>
          <div className="flex justify-center gap-6 pt-4">
            <a
              href="https://github.com/sukrut07/WellSightAHC"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors font-mono"
            >
              <GitBranch className="h-3.5 w-3.5" /> sukrut07/WellSightAHC
            </a>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/40 font-mono">FlytBase AHC 2026 · Hacktoberfest</span>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <WellSightLogo href="/dashboard" theme="light" badge="2026" />
          <div className="flex items-center gap-6 text-[11px] text-slate-400 font-mono">
            <span>Built for Hacktoberfest 2026</span>
            <span>·</span>
            <a href="https://github.com/sukrut07/WellSightAHC" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <GitBranch className="h-3.5 w-3.5" /> GitHub
            </a>
            <span>·</span>
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
            <span>·</span>
            <Link href="/copilot" className="hover:text-indigo-600 transition-colors">Copilot</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
