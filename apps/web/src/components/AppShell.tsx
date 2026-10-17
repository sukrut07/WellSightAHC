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
  ChevronLeft,
  ChevronRight,
  Globe,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [activeUser, setActiveUser] = useState('demo_user_alpha');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    // Read persisted active user
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wellsight_active_user');
      if (stored) setActiveUser(stored);
    }

    // Check backend health status
    api
      .getHealth()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  // When on the public landing page (/), do not render the operational sidebar layout
  if (pathname === '/') {
    return <main className="min-h-screen w-full bg-[#070D19]">{children}</main>;
  }

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: Activity },
    { label: 'AI Copilot', href: '/copilot', icon: Bot, highlight: true },
    { label: 'Well Directory', href: '/wells', icon: Database },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Ground Evidence', href: '/evidence', icon: FileCheck2 },
    { label: 'Corrections Audit', href: '/corrections', icon: Edit },
    { label: 'Conflicts & Audit', href: '/audit', icon: ShieldAlert },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleUserChange = (newUser: string) => {
    setActiveUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wellsight_active_user', newUser);
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#070D19] text-slate-100 overflow-hidden font-sans">
      {/* 1. Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800/80 bg-[#0B1220] p-3 justify-between shrink-0 transition-all duration-300 relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Logo & Product Identity */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-700/80 text-emerald-400 shadow-md">
                <Flame className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                    WellSight AI
                    <span className="rounded bg-emerald-950/80 border border-emerald-800 px-1 py-0.2 text-[9px] font-mono font-semibold text-emerald-400">
                      2026
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium truncate">Asset Intelligence Copilot</p>
                </div>
              )}
            </Link>

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
                (item.href === '/dashboard' && pathname === '/overview');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-sky-300 hover:bg-slate-900 hover:text-white'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Operator Switcher & Liveness */}
        <div className="border-t border-slate-800/80 pt-3 space-y-3">
          {/* Public Landing Link */}
          <Link
            href="/"
            title={isCollapsed ? 'Public Landing Page' : undefined}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <Globe className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            {!isCollapsed && <span className="text-[11px]">Public Landing Page</span>}
          </Link>

          {/* Operator Demo Switcher */}
          {!isCollapsed ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-sky-400" /> Operator
                </span>
                <span className="font-mono text-[9px] text-slate-500">Demo Role</span>
              </div>
              <select
                value={activeUser}
                onChange={(e) => handleUserChange(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-medium text-slate-200 focus:border-sky-500 focus:outline-none cursor-pointer"
              >
                <option value="demo_user_alpha">Sarah J. (Operations Lead)</option>
                <option value="demo_user_beta">John D. (Field Pumper)</option>
                <option value="demo_user_gamma">Carlos M. (Subsurface Geo)</option>
              </select>
              <p className="mt-1 text-[9px] text-slate-400 leading-tight">
                Simulates isolated conversational memory per user.
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title="Active Operator Switcher">
              <Users className="h-4 w-4 text-sky-400" />
            </div>
          )}

          {/* Real Backend Status Signal */}
          <div
            className={`flex items-center gap-2 text-[10px] font-mono text-slate-400 px-1 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Radio
                className={`h-2.5 w-2.5 shrink-0 ${
                  backendStatus === 'connected'
                    ? 'text-emerald-400 animate-pulse'
                    : backendStatus === 'offline'
                    ? 'text-rose-500'
                    : 'text-amber-400'
                }`}
              />
              {!isCollapsed && (
                <span>
                  {backendStatus === 'connected'
                    ? 'Core API Live'
                    : backendStatus === 'offline'
                    ? 'API Offline'
                    : 'Checking API...'}
                </span>
              )}
            </span>
            {!isCollapsed && <span className="text-slate-400 font-mono text-[9px]">v1.0.0</span>}
          </div>
        </div>
      </aside>

      {/* 2. Mobile Top Navigation Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-slate-800 bg-[#0B1220] px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-white text-sm">WellSight AI</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded p-1 text-slate-400 hover:text-white"
          aria-label="Toggle navigation drawer"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#0B1220] pt-16 p-6 flex flex-col justify-between">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800"
              >
                <item.icon className="h-5 w-5 text-emerald-400" />
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 hover:bg-slate-900"
            >
              <Globe className="h-5 w-5 text-slate-400" />
              <span>Public Landing Page</span>
            </Link>
          </nav>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Operator Role: </span>
              {activeUser === 'demo_user_alpha'
                ? 'Sarah J. (Operations Lead)'
                : activeUser === 'demo_user_beta'
                ? 'John D. (Field Pumper)'
                : 'Carlos M. (Subsurface Geo)'}
            </div>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <Radio className="h-3 w-3" /> API {backendStatus.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Scrollable Content Canvas */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#070D19] md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
};
