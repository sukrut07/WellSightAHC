'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Flame,
  Bot,
  Database,
  BarChart3,
  FileCheck2,
  Edit,
  ShieldAlert,
  Settings,
  Users,
  Radio,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [activeUser, setActiveUser] = useState('demo_user_alpha');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  useEffect(() => {
    // Check backend health
    api
      .getHealth()
      .then(() => setBackendReady(true))
      .catch(() => setBackendReady(false));
  }, []);

  const navItems = [
    { label: 'Overview', href: '/', icon: Flame },
    { label: 'AI Copilot', href: '/copilot', icon: Bot, highlight: true },
    { label: 'Well Directory', href: '/wells', icon: Database },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Ground Evidence', href: '/evidence', icon: FileCheck2 },
    { label: 'Corrections Audit', href: '/corrections', icon: Edit },
    { label: 'Conflict & Audit Log', href: '/audit', icon: ShieldAlert },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-[#070D19] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-[#0A1224] p-4 justify-between shrink-0">
        <div>
          {/* Logo & Product Identity */}
          <Link href="/" className="flex items-center gap-2.5 pb-4 border-b border-slate-800/80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-700/80 text-emerald-400 shadow-md">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                WellSight AI
                <span className="rounded bg-emerald-950 border border-emerald-800 px-1 py-0.2 text-[9px] font-mono font-semibold text-emerald-400">
                  2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Asset Intelligence Copilot</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-sky-300 hover:bg-slate-900/80 hover:text-white'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Switcher & Backend Liveness */}
        <div className="border-t border-slate-800/80 pt-4 space-y-3">
          {/* Demo User Switcher for Private vs Shared Memory */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 text-sky-400" /> Active Operator
              </span>
              <span className="font-mono text-[9px] text-slate-500">Memory Scope</span>
            </div>
            <select
              value={activeUser}
              onChange={(e) => {
                setActiveUser(e.target.value);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('wellsight_active_user', e.target.value);
                  window.dispatchEvent(new Event('storage'));
                }
              }}
              className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-medium text-slate-200 focus:border-sky-500 focus:outline-none cursor-pointer"
            >
              <option value="demo_user_alpha">Sarah J. (Operations Lead)</option>
              <option value="demo_user_beta">John D. (Field Pumper)</option>
              <option value="demo_user_gamma">Carlos M. (Subsurface Geo)</option>
            </select>
            <p className="mt-1 text-[9px] text-slate-500 leading-tight">
              Switching users demonstrates strictly isolated private conversational memory.
            </p>
          </div>

          {/* System Liveness Badge */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <Radio className={`h-2.5 w-2.5 ${backendReady ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
              API: {backendReady ? 'Connected' : 'Offline'}
            </span>
            <span>Port 8000</span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-slate-800 bg-[#0A1224] px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-white text-sm">WellSight AI</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded p-1 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-[#0A1224] pt-16 p-6 flex flex-col justify-between">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                <item.icon className="h-5 w-5 text-emerald-400" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#070D19] md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
};
