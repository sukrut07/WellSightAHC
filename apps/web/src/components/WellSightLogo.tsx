'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface WellSightLogoProps {
  collapsed?: boolean;
  className?: string;
  href?: string;
  badge?: string;
  theme?: 'dark' | 'light';
}

export const WellSightLogo: React.FC<WellSightLogoProps> = ({
  collapsed = false,
  className = '',
  href = '/dashboard',
  badge = 'v2.4',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl ${className}`}
      title="WellSight AI — Return to Operations Dashboard"
    >
      {/* 1. Custom High-Precision Vector Emblem */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4338CA] via-[#2563EB] to-[#059669] p-0.5 shadow-md shadow-indigo-950/20 overflow-hidden"
      >
        {/* Subtle Ambient Backlight Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/25 via-transparent to-transparent opacity-80 pointer-events-none" />

        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-white drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="well-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>

          {/* Precision Wellhead & Telemetry Sensor Monogram */}
          {/* Base Platform */}
          <path
            d="M8 28.5H28"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />

          {/* Derrick Structural Legs */}
          <path
            d="M10.5 28L15.5 12H20.5L25.5 28"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Horizontal Crossbeam & Support Struts */}
          <path
            d="M12.8 22H23.2"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M14.2 17H21.8"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Diagonal Reinforcement Truss */}
          <path
            d="M13 22L23 17"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          <path
            d="M23 22L13 17"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* AI Core Pulse (Telemetry Beacon at Wellhead Top) */}
          <circle
            cx="18"
            cy="9.5"
            r="3"
            fill="url(#well-glow)"
          />
          <circle
            cx="18"
            cy="9.5"
            r="1.2"
            fill="#FFFFFF"
          />

          {/* Telemetry Sensor Wave Emission */}
          <path
            d="M13 6C14.5 4.8 16.2 4 18 4C19.8 4 21.5 4.8 23 6"
            stroke="#38BDF8"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />
        </svg>
      </motion.div>

      {/* 2. Brand Identity Typography */}
      {!collapsed && (
        <div className="flex flex-col text-left truncate">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[14px] font-black tracking-tight transition-colors ${
                isDark
                  ? 'text-white group-hover:text-indigo-200'
                  : 'text-slate-900 group-hover:text-indigo-600'
              }`}
            >
              WellSight AI
            </span>
            {badge && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                  isDark
                    ? 'bg-indigo-500/25 border border-indigo-400/40 text-indigo-300'
                    : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-medium transition-colors truncate ${
              isDark
                ? 'text-slate-400 group-hover:text-slate-300'
                : 'text-slate-500 group-hover:text-slate-700'
            }`}
          >
            Asset Intelligence Copilot
          </span>
        </div>
      )}
    </Link>
  );
};
