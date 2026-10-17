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
    <html lang="en" className="h-full bg-[#070D19]">
      <body className="h-full bg-[#070D19] text-slate-100 antialiased overflow-hidden">
        <Suspense fallback={<div className="h-full w-full bg-[#070D19]" />}>
          <AppShell>{children}</AppShell>
        </Suspense>
      </body>
    </html>
  );
}
