'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldAlert,
  ChevronDown,
  Database,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useApiContext } from '@/lib/api';

export interface HeaderProps {
  onOpenMobileSidebar: () => void;
  isCollapsed: boolean;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showApiMenu, setShowApiMenu] = useState(false);

  const {
    dataMode,
    dataSource,
    modePreference,
    setModePreference,
    backendStatus,
    isChecking,
    checkHealth,
    baseUrl,
  } = useApiContext();

  // Derive route title
  const getPageTitle = (path: string | null) => {
    if (!path || path === '/') return 'Security Overview';
    if (path.startsWith('/threats/live')) return 'Live Threat Feed';
    if (path.startsWith('/threats/detection')) return 'Threat Detection Rules (R1–R8)';
    if (path.startsWith('/incidents')) return 'Security Incidents';
    if (path.startsWith('/investigate')) return 'AI Investigation Workspace';
    if (path.startsWith('/identity/agents')) return 'Agent Payment Verification (R8)';
    if (path.startsWith('/identity')) return 'Identity & Access Monitoring';
    if (path.startsWith('/governance/privacy')) return 'Data Privacy Controls';
    if (path.startsWith('/governance/compliance')) return 'Compliance Readiness';
    if (path.startsWith('/operations/response')) return 'Response & Containment';
    if (path.startsWith('/operations/integrations')) return 'Telemetry Integrations';
    if (path.startsWith('/simulation/red-team')) return 'Red Team Attack Simulator';
    if (path.startsWith('/settings')) return 'SOC System Settings';
    return 'Dashboard';
  };

  const getBreadcrumbs = (path: string | null) => {
    if (!path || path === '/') return ['CARTGUARD', 'Overview'];
    const parts = path.split('/').filter(Boolean);
    return ['CARTGUARD', ...parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1))];
  };

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[#100E0D]/95 backdrop-blur border-b border-[#302A28]">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-[#A79B96] hover:text-[#F3EEEC] hover:bg-[#1D1A19] rounded-md"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          {/* Breadcrumb line */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#756B67] font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[#4D4440]">/</span>}
                <span className={cn(idx === breadcrumbs.length - 1 ? 'text-[#D0C4C0]' : 'text-[#756B67]')}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          <h1 className="text-base font-semibold text-[#F3EEEC] tracking-tight">
            {getPageTitle(pathname)}
          </h1>
        </div>
      </div>

      {/* Middle: Global Search (Visual interaction) */}
      <div className="hidden md:flex items-center max-w-sm w-full mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#756B67]" />
          <input
            type="text"
            readOnly
            placeholder="Search events, incidents, IPs (Ctrl+K)..."
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-[#141211] border border-[#302A28] rounded-md text-[#F3EEEC] placeholder-[#756B67] focus:outline-none focus:border-[#A20903]/60 transition-colors cursor-pointer"
            onClick={() => alert('Global SOC Search: Filtering synthetic alerts and incident dossiers')}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#756B67] bg-[#1D1A19] px-1.5 py-0.5 rounded border border-[#302A28]">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right: Telemetry Status, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Centralized API & Environment Data Mode Pill */}
        <div className="relative">
          <button
            onClick={() => {
              setShowApiMenu(!showApiMenu);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className={cn(
              'hidden sm:flex items-center gap-2 px-2.5 py-1 rounded border text-xs transition-colors',
              dataMode === 'LIVE'
                ? 'bg-[#26502B]/30 border-[#26502B] text-[#86EFAC] hover:bg-[#26502B]/50'
                : dataMode === 'ERROR'
                ? 'bg-[#5C1811]/30 border-[#A20903] text-[#FCA5A5] hover:bg-[#5C1811]/50'
                : 'bg-[#1D1A19] border-[#302A28] text-[#D0C4C0] hover:bg-[#221E1D]'
            )}
            title="Click to view API integration status and data mode options"
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                dataMode === 'LIVE'
                  ? 'bg-[#4ADE80] animate-pulse'
                  : dataMode === 'ERROR'
                  ? 'bg-[#A20903]'
                  : 'bg-[#A2847B]'
              )}
            />
            <span className="font-semibold text-[11px] tracking-wide">
              {dataMode === 'LIVE' ? 'LIVE MODE' : dataMode === 'ERROR' ? 'API ERROR' : 'DEMO MODE'}
            </span>
            <span className="text-[10px] text-[#756B67] font-mono">
              ({dataSource === 'backend' ? 'API' : 'Fixtures'})
            </span>
            <ChevronDown className="h-3 w-3 text-[#756B67] ml-0.5" />
          </button>

          {/* API & Data Mode Popover */}
          {showApiMenu && (
            <div className="absolute right-0 mt-2 w-84 bg-[#141211] border border-[#302A28] rounded-lg shadow-2xl z-50 p-3.5 text-xs animate-in fade-in-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#302A28]">
                <div className="flex items-center gap-1.5 font-semibold text-[#F3EEEC]">
                  <Database className="h-4 w-4 text-[#A2847B]" />
                  <span>Frontend Data Layer</span>
                </div>
                <Badge
                  variant={dataMode === 'LIVE' ? 'success' : dataMode === 'ERROR' ? 'error' : 'neutral'}
                  size="sm"
                >
                  {dataMode}
                </Badge>
              </div>

              {/* Mode Details */}
              <div className="py-2.5 space-y-2 text-[11px]">
                <div className="flex justify-between items-center text-[#D0C4C0]">
                  <span className="text-[#756B67]">Data Provider:</span>
                  <span className="font-medium text-[#F3EEEC]">
                    {dataSource === 'backend' ? 'Verified Backend API' : 'Synthetic Fixtures (Demo Safe)'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#D0C4C0]">
                  <span className="text-[#756B67]">Backend Endpoint:</span>
                  <span className="font-mono text-[10px] text-[#A79B96] truncate max-w-[170px]" title={baseUrl}>
                    {baseUrl}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#D0C4C0]">
                  <span className="text-[#756B67]">Connection:</span>
                  <span
                    className={cn(
                      'font-medium flex items-center gap-1',
                      backendStatus.online ? 'text-[#86EFAC]' : 'text-[#FDBA74]'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        backendStatus.online ? 'bg-[#4ADE80]' : 'bg-[#D97706]'
                      )}
                    />
                    {backendStatus.online ? 'Online' : 'Offline / Local Fixtures'}
                  </span>
                </div>
              </div>

              {/* Preference selector */}
              <div className="pt-2 border-t border-[#302A28]">
                <p className="text-[10px] text-[#756B67] uppercase tracking-wider mb-1.5 font-semibold">
                  Data Mode Preference
                </p>
                <div className="grid grid-cols-3 gap-1 bg-[#100E0D] p-1 rounded border border-[#302A28]">
                  <button
                    onClick={() => setModePreference('auto')}
                    className={cn(
                      'py-1 text-[10px] rounded font-medium transition-colors text-center',
                      modePreference === 'auto'
                        ? 'bg-[#1D1A19] text-[#F3EEEC] border border-[#A20903]/60'
                        : 'text-[#756B67] hover:text-[#F3EEEC]'
                    )}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setModePreference('demo')}
                    className={cn(
                      'py-1 text-[10px] rounded font-medium transition-colors text-center',
                      modePreference === 'demo'
                        ? 'bg-[#1D1A19] text-[#F3EEEC] border border-[#A20903]/60'
                        : 'text-[#756B67] hover:text-[#F3EEEC]'
                    )}
                  >
                    Demo
                  </button>
                  <button
                    onClick={() => setModePreference('live')}
                    className={cn(
                      'py-1 text-[10px] rounded font-medium transition-colors text-center',
                      modePreference === 'live'
                        ? 'bg-[#1D1A19] text-[#F3EEEC] border border-[#A20903]/60'
                        : 'text-[#756B67] hover:text-[#F3EEEC]'
                    )}
                  >
                    Live API
                  </button>
                </div>
              </div>

              {/* Footer actions & disclaimer */}
              <div className="mt-3 pt-2 border-t border-[#302A28] flex items-center justify-between text-[10px]">
                <button
                  onClick={() => checkHealth()}
                  disabled={isChecking}
                  className="flex items-center gap-1 text-[#756B67] hover:text-[#F3EEEC] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={cn('h-3 w-3', isChecking && 'animate-spin')} />
                  <span>{isChecking ? 'Checking...' : 'Check Connection'}</span>
                </button>
                <button
                  onClick={() => setShowApiMenu(false)}
                  className="text-[#A2847B] hover:text-[#D0C4C0] font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-[#A79B96] hover:text-[#F3EEEC] hover:bg-[#1D1A19] rounded-md transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#A20903] animate-ping" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#A20903]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#141211] border border-[#302A28] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in-50">
              <div className="p-3 border-b border-[#302A28] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F3EEEC]">Security Notifications</span>
                <Badge variant="critical" size="sm">3 Active</Badge>
              </div>
              <div className="divide-y divide-[#302A28] max-h-72 overflow-y-auto text-xs">
                <div className="p-3 hover:bg-[#1D1A19] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between text-[#756B67] text-[10px]">
                    <span className="text-[#FCA5A5] font-semibold">CRITICAL INCIDENT</span>
                    <span>12m ago</span>
                  </div>
                  <p className="text-[#F3EEEC] font-medium mt-1">INC-2026-0841: Account Takeover</p>
                  <p className="text-[#A79B96] text-[11px] truncate">420 API calls exfiltrated 4,520 records</p>
                </div>
                <div className="p-3 hover:bg-[#1D1A19] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between text-[#756B67] text-[10px]">
                    <span className="text-[#FDBA74] font-semibold">HIGH ALERT</span>
                    <span>32m ago</span>
                  </div>
                  <p className="text-[#F3EEEC] font-medium mt-1">Carding Attack Burst</p>
                  <p className="text-[#A79B96] text-[11px] truncate">16 failed attempts from SG exit node</p>
                </div>
                <div className="p-3 hover:bg-[#1D1A19] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between text-[#756B67] text-[10px]">
                    <span className="text-[#D0C4C0] font-semibold">POLICY ENFORCED</span>
                    <span>48m ago</span>
                  </div>
                  <p className="text-[#F3EEEC] font-medium mt-1">Seller API Token Quarantined</p>
                  <p className="text-[#A79B96] text-[11px] truncate">Vertex Global cross-tenant access blocked</p>
                </div>
              </div>
              <div className="p-2 bg-[#100E0D] border-t border-[#302A28] text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-[#A2847B] hover:text-[#D0C4C0] font-medium"
                >
                  Close notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-[#1D1A19] transition-colors"
          >
            <div className="h-7 w-7 rounded-md bg-[#1D1A19] border border-[#302A28] flex items-center justify-center text-[#D0C4C0] text-xs font-bold">
              AY
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#F3EEEC] leading-tight">Aayash</span>
              <span className="text-[10px] text-[#756B67] leading-tight">SecOps Lead</span>
            </div>
            <ChevronDown className="h-3 w-3 text-[#756B67] hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#141211] border border-[#302A28] rounded-lg shadow-2xl z-50 overflow-hidden py-1">
              <div className="px-3 py-2 border-b border-[#302A28]">
                <p className="text-xs font-semibold text-[#F3EEEC]">Aayash</p>
                <p className="text-[11px] text-[#756B67]">aayash@qalalabs.internal</p>
                <div className="mt-1">
                  <Badge variant="neutral" size="sm">Role: SecOps Lead</Badge>
                </div>
              </div>
              <div className="py-1 text-xs text-[#D0C4C0]">
                <div className="px-3 py-1.5 hover:bg-[#1D1A19] cursor-pointer">Security Session Logs</div>
                <div className="px-3 py-1.5 hover:bg-[#1D1A19] cursor-pointer">Simulation Preferences</div>
                <div className="px-3 py-1.5 hover:bg-[#1D1A19] cursor-pointer text-[#756B67]">Role: SOC Analyst (Triage & Approvals)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
