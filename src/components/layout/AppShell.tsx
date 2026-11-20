'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070505] text-[#F3EEEC] flex flex-col antialiased selection:bg-[#A20903]/30 selection:text-[#F3EEEC]">
      {/* Sidebar (Desktop and Mobile drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        {/* Top Header */}
        <Header
          isCollapsed={isCollapsed}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="px-6 py-4 border-t border-[#302A28] text-center text-xs text-[#756B67] bg-[#070505]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>CARTGUARD AI • QALA LABS Security Operations Centre</span>
            <span className="font-mono text-[11px] text-[#A79B96]">
              CyFocus SOC Platform • Continuous Telemetry • R1–R8 Guardrails Active
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
