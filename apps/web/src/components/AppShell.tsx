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
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import { RippleDotBackground } from './RippleDotBackground';
import { WellSightLogo } from './WellSightLogo';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [activeUser, setActiveUser] = useState('U-201'); // Default to Michael Turner (Production Supervisor)
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

  // When on the public landing page (/), render the landing layout directly
  if (pathname === '/') {
    return (
      <main className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 relative">
        <RippleDotBackground theme="light" />
        <div className="relative z-10">{children}</div>
      </main>
    );
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
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      {/* 1. Desktop Sleek Contrast Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800/80 bg-[#111625] text-slate-100 p-3.5 justify-between shrink-0 transition-all duration-300 relative z-20 shadow-xl ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Logo & Product Identity */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <WellSightLogo collapsed={isCollapsed} href="/dashboard" badge="v2.4" />

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0"
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25'
                      : item.highlight
                      ? 'text-indigo-300 hover:bg-slate-800/60 hover:text-white'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Operator Switcher & Liveness */}
        <div className="border-t border-slate-800/80 pt-3.5 space-y-3">
          {/* Public Landing Link */}
          <Link
            href="/"
            title={isCollapsed ? 'Public Landing Page' : undefined}
            className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {!isCollapsed && <span className="text-[11px] font-medium">Public Showcase</span>}
          </Link>

          {/* Operator Persona Switcher (FlytBase official personas) */}
          {!isCollapsed ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-indigo-400" /> Operator
                </span>
                <span className="font-mono text-[9px] text-indigo-300 bg-indigo-950/60 border border-indigo-800 px-1 py-0.5 rounded">
                  Dual Memory
                </span>
              </div>
              <select
                value={activeUser}
                onChange={(e) => handleUserChange(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs font-semibold text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="U-201">Michael Turner (Prod. Supervisor)</option>
                <option value="U-202">Jessica Reed (Field Inspector)</option>
                <option value="U-204">Tyler Hughes (Field Operator)</option>
                <option value="U-102">Jake Morales (Field Operator · SW)</option>
                <option value="U-401">Laura Simmons (HSE Officer)</option>
                <option value="demo_user_alpha">Sarah J. (Operations Lead)</option>
              </select>
              <p className="mt-1 text-[9px] text-slate-400 leading-tight">
                Simulates private conversational memory & shared well knowledge.
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title="Active Operator Switcher">
              <Users className="h-4 w-4 text-indigo-400" />
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
                    ? 'Engine Online'
                    : backendStatus === 'offline'
                    ? 'API Offline'
                    : 'Checking API...'}
                </span>
              )}
            </span>
            {!isCollapsed && <span className="text-slate-400 font-mono text-[9px]">FastAPI 8000</span>}
          </div>
        </div>
      </aside>

      {/* 2. Mobile Top Navigation Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-2.5">
        <WellSightLogo collapsed={false} href="/dashboard" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-1 text-slate-600 hover:text-slate-900"
          aria-label="Toggle navigation drawer"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white pt-16 p-6 flex flex-col justify-between">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200"
              >
                <item.icon className="h-5 w-5 text-indigo-600" />
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <Globe className="h-5 w-5 text-slate-500" />
              <span>Public Showcase</span>
            </Link>
          </nav>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Operator: </span>
              {activeUser}
            </div>
            <div className="text-[11px] font-mono text-emerald-600 flex items-center gap-1.5 font-semibold">
              <Radio className="h-3 w-3" /> API {backendStatus.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Scrollable Content Canvas with Interactive Ripple Background */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#F8FAFC] md:pt-0 pt-14 relative">
        <RippleDotBackground theme="light" />
        <div className="relative z-10 w-full min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
