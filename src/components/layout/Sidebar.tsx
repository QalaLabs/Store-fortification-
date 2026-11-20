'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Radio,
  Radar,
  FileWarning,
  Sparkles,
  Users,
  Lock,
  FileCheck2,
  Zap,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavigationItem } from './NavigationItem';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0a0f1a] border-r border-[#1b2a45] transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64',
          // Mobile state
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#1b2a45] bg-[#0a0f1a]">
          <Link
            href="/"
            className="flex items-center gap-2.5 overflow-hidden group"
            onClick={onCloseMobile}
          >
            <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-400 group-hover:border-blue-400 transition-colors">
              <ShieldAlert className="h-5 w-5" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-wider text-slate-100 uppercase truncate">
                  CARTGUARD <span className="text-blue-400 font-extrabold">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                  QALA LABS
                </span>
              </div>
            )}
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Environment Badge */}
        {!isCollapsed && (
          <div className="px-4 py-2.5 border-b border-[#1b2a45]/60 bg-[#0d1524]/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold tracking-wider text-slate-200">DEMO / LOCAL</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
              REPLAY
            </span>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {/* OVERVIEW */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Overview
              </p>
            )}
            <nav className="space-y-0.5">
              <NavigationItem
                label="Security Overview"
                href="/"
                icon={ShieldCheck}
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
            </nav>
          </div>

          {/* MONITOR */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Monitor
              </p>
            )}
            <nav className="space-y-0.5">
              <NavigationItem
                label="Live Threat Feed"
                href="/threats/live"
                icon={Radio}
                badge="LIVE"
                badgeVariant="info"
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
              <NavigationItem
                label="Threat Detection"
                href="/threats/detection"
                icon={Radar}
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
            </nav>
          </div>

          {/* INVESTIGATE */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Investigate
              </p>
            )}
            <nav className="space-y-0.5">
              <NavigationItem
                label="Incidents"
                href="/incidents"
                icon={FileWarning}
                badge="3"
                badgeVariant="critical"
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
              <NavigationItem
                label="AI Investigation"
                href="/investigate"
                icon={Sparkles}
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
              <NavigationItem
                label="Identity & Access"
                href="/identity"
                icon={Users}
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
            </nav>
          </div>

          {/* GOVERNANCE */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Governance
              </p>
            )}
            <nav className="space-y-0.5">
              <NavigationItem
                label="Data Privacy"
                href="/governance/privacy"
                icon={Lock}
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
              <NavigationItem
                label="Compliance Centre"
                href="/governance/compliance"
                icon={FileCheck2}
                badge="DPDP"
                badgeVariant="neutral"
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
            </nav>
          </div>

          {/* OPERATIONS */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Operations
              </p>
            )}
            <nav className="space-y-0.5">
              <NavigationItem
                label="Response Centre"
                href="/operations/response"
                icon={Zap}
                badge="2"
                badgeVariant="high"
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
              <NavigationItem
                label="Integrations"
                href="/operations/integrations"
                icon={Network}
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
              <NavigationItem
                label="Settings"
                href="/settings"
                icon={Settings}
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
            </nav>
          </div>
        </div>

        {/* Sidebar Collapse Toggle Button (Desktop) */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-[#1b2a45] bg-[#0a0f1a]">
          {!isCollapsed && (
            <span className="text-[11px] text-slate-400 font-mono">v0.1.0-alpha</span>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
