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
    <div className="min-h-screen bg-[#080d16] text-slate-100 flex flex-col antialiased selection:bg-blue-600/30 selection:text-blue-200">
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
        <footer className="px-6 py-4 border-t border-[#1b2a45]/40 text-center text-xs text-slate-500 bg-[#080d16]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>CARTGUARD AI • QALA LABS E-Commerce Security Platform</span>
            <span className="font-mono text-[11px] text-slate-400">
              Demo Environment • Local Fixtures Active • Ready for Ingestion APIs
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
