import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'WellSight AI — Asset Intelligence Copilot',
  description: 'Every well has a story. Ask the data. Hacktoberfest 2026 Asset Intelligence Copilot Challenge.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#F8FAFC]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[#F8FAFC] text-slate-900 antialiased overflow-hidden font-sans">
        <Suspense fallback={<div className="h-full w-full bg-[#F8FAFC]" />}>
          <AppShell>{children}</AppShell>
        </Suspense>
      </body>
    </html>
  );
}
