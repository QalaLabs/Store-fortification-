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
  CreditCard,
  Lock,
  FileCheck2,
  Zap,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Crosshair,
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#100E0D] border-r border-[#302A28] transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64',
          // Mobile state
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#302A28] bg-[#100E0D]">
          <Link
            href="/"
            className="flex items-center gap-2.5 overflow-hidden group"
            onClick={onCloseMobile}
          >
            <div className="h-8 w-8 rounded-md bg-[#1D1A19] border border-[#302A28] flex items-center justify-center shrink-0 text-[#A20903] group-hover:border-[#A20903]/60 transition-colors">
              <ShieldAlert className="h-4 w-4" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-wider text-[#F3EEEC] uppercase truncate">
                  CARTGUARD <span className="text-[#A20903] font-extrabold">AI</span>
                </span>
                <span className="text-[10px] text-[#756B67] font-semibold tracking-widest uppercase">
                  QALA LABS SOC
                </span>
              </div>
            )}
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-[#A79B96] hover:text-[#F3EEEC] hover:bg-[#1D1A19]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Environment Badge */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-b border-[#302A28] bg-[#141211] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-[#A79B96]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#26502B] ring-2 ring-[#4ADE80]/30 animate-pulse" />
              <span className="font-semibold tracking-wider text-[#D0C4C0]">SOC ACTIVE</span>
            </div>
            <span className="text-[10px] text-[#A79B96] uppercase tracking-widest bg-[#1D1A19] px-1.5 py-0.5 rounded border border-[#302A28]">
              DEMO
            </span>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5 scrollbar-thin scrollbar-thumb-[#302A28]">
          {/* OVERVIEW */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-[#756B67] uppercase tracking-wider mb-1.5">
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

          {/* THREAT INTELLIGENCE */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-[#756B67] uppercase tracking-wider mb-1.5">
                Threat Intelligence
              </p>
            )}
            <nav className="space-y-0.5">
              <NavigationItem
                label="Live Threats"
                href="/threats/live"
                icon={Radio}
                badge="LIVE"
                badgeVariant="critical"
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
              <NavigationItem
                label="Detection Rules"
                href="/threats/detection"
                icon={Radar}
                badge="R1-R8"
                badgeVariant="neutral"
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
            </nav>
          </div>

          {/* INVESTIGATION */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-[#756B67] uppercase tracking-wider mb-1.5">
                Investigation
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
                label="AI Investigator"
                href="/investigate"
                icon={Sparkles}
                badge="AI"
                badgeVariant="info"
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
            </nav>
          </div>

          {/* IDENTITY & TRUST */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-[#756B67] uppercase tracking-wider mb-1.5">
                Identity & Trust
              </p>
            )}
            <nav className="space-y-0.5">
              <NavigationItem
                label="Identity & Access"
                href="/identity"
                icon={Users}
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
              <NavigationItem
                label="Agent Verification"
                href="/identity/agents"
                icon={CreditCard}
                badge="R8"
                badgeVariant="info"
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
            </nav>
          </div>

          {/* GOVERNANCE */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-[#756B67] uppercase tracking-wider mb-1.5">
                Governance
              </p>
            )}
            <nav className="space-y-0.5">
              <NavigationItem
                label="Privacy Centre"
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
              <p className="px-3 text-[10px] font-bold text-[#756B67] uppercase tracking-wider mb-1.5">
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
            </nav>
          </div>

          {/* SIMULATION */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-[#756B67] uppercase tracking-wider mb-1.5">
                Simulation
              </p>
            )}
            <nav className="space-y-0.5">
              <NavigationItem
                label="Red Team Simulator"
                href="/simulation/red-team"
                icon={Crosshair}
                badge="S1-S4"
                badgeVariant="critical"
                isCollapsed={isCollapsed}
                onNavigate={onCloseMobile}
              />
            </nav>
          </div>

          {/* SYSTEM */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-[#756B67] uppercase tracking-wider mb-1.5">
                System
              </p>
            )}
            <nav className="space-y-0.5">
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
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-[#302A28] bg-[#100E0D]">
          {!isCollapsed && (
            <span className="text-[11px] text-[#756B67] font-mono">v1.0.0-soc</span>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-[#A79B96] hover:text-[#F3EEEC] hover:bg-[#1D1A19] transition-colors ml-auto"
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
