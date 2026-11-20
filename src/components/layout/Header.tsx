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
    if (path.startsWith('/threats/detection')) return 'Threat Detection Rules';
    if (path.startsWith('/incidents')) return 'Security Incidents';
    if (path.startsWith('/investigate')) return 'AI Investigation';
    if (path.startsWith('/identity')) return 'Identity & Access Monitoring';
    if (path.startsWith('/governance/privacy')) return 'Data Privacy Controls';
    if (path.startsWith('/governance/compliance')) return 'Compliance Readiness';
    if (path.startsWith('/operations/response')) return 'Response & Containment';
    if (path.startsWith('/operations/integrations')) return 'Telemetry Integrations';
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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[#0a0f1a]/95 backdrop-blur border-b border-[#1b2a45]">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          {/* Breadcrumb line */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-500">/</span>}
                <span className={cn(idx === breadcrumbs.length - 1 ? 'text-slate-200' : 'text-slate-400')}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          <h1 className="text-base font-semibold text-slate-100 tracking-tight">
            {getPageTitle(pathname)}
          </h1>
        </div>
      </div>

      {/* Middle: Global Search (Visual interaction) */}
      <div className="hidden md:flex items-center max-w-sm w-full mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            readOnly
            placeholder="Search events, incidents, IPs (Ctrl+K)..."
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-[#0d1524] border border-[#1b2a45] rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            onClick={() => alert('Global SOC Search (Synthetic Demo: Enter query in search bar in next phase)')}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
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
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                : dataMode === 'ERROR'
                ? 'bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/50'
                : 'bg-blue-950/40 border-blue-500/40 text-blue-300 hover:bg-blue-900/50'
            )}
            title="Click to view API integration status and data mode options"
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                dataMode === 'LIVE'
                  ? 'bg-emerald-400 animate-pulse'
                  : dataMode === 'ERROR'
                  ? 'bg-red-400'
                  : 'bg-blue-400'
              )}
            />
            <span className="font-semibold text-[11px] tracking-wide">
              {dataMode === 'LIVE' ? 'LIVE MODE' : dataMode === 'ERROR' ? 'API ERROR' : 'DEMO MODE'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({dataSource === 'backend' ? 'API' : 'Fixtures'})
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
          </button>

          {/* API & Data Mode Popover */}
          {showApiMenu && (
            <div className="absolute right-0 mt-2 w-84 bg-[#0d1524] border border-[#1b2a45] rounded-lg shadow-2xl z-50 p-3 text-xs animate-in fade-in-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b2a45]">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <Database className="h-4 w-4 text-blue-400" />
                  <span>Frontend Data Layer</span>
                </div>
                <Badge
                  variant={dataMode === 'LIVE' ? 'success' : dataMode === 'ERROR' ? 'error' : 'info'}
                  size="sm"
                >
                  {dataMode}
                </Badge>
              </div>

              {/* Mode Details */}
              <div className="py-2.5 space-y-2 text-[11px]">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Data Provider:</span>
                  <span className="font-medium text-slate-200">
                    {dataSource === 'backend' ? 'Verified Backend API' : 'Synthetic Fixtures (Demo Safe)'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Backend Endpoint:</span>
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[170px]" title={baseUrl}>
                    {baseUrl}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Connection:</span>
                  <span
                    className={cn(
                      'font-medium flex items-center gap-1',
                      backendStatus.online ? 'text-emerald-400' : 'text-amber-400'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        backendStatus.online ? 'bg-emerald-400' : 'bg-amber-400'
                      )}
                    />
                    {backendStatus.online ? 'Online' : 'Offline / Unreachable'}
                  </span>
                </div>
              </div>

              {/* Preference selector */}
              <div className="pt-2 border-t border-[#1b2a45]">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                  Data Mode Preference
                </p>
                <div className="grid grid-cols-3 gap-1 bg-[#090e17] p-1 rounded border border-[#1b2a45]">
                  <button
                    onClick={() => setModePreference('auto')}
                    className={cn(
                      'py-1 text-[10px] rounded font-medium transition-colors text-center',
                      modePreference === 'auto'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setModePreference('demo')}
                    className={cn(
                      'py-1 text-[10px] rounded font-medium transition-colors text-center',
                      modePreference === 'demo'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    Demo
                  </button>
                  <button
                    onClick={() => setModePreference('live')}
                    className={cn(
                      'py-1 text-[10px] rounded font-medium transition-colors text-center',
                      modePreference === 'live'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    Live API
                  </button>
                </div>
              </div>

              {/* Footer actions & disclaimer */}
              <div className="mt-3 pt-2 border-t border-[#1b2a45] flex items-center justify-between text-[10px]">
                <button
                  onClick={() => checkHealth()}
                  disabled={isChecking}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={cn('h-3 w-3', isChecking && 'animate-spin')} />
                  <span>{isChecking ? 'Checking...' : 'Check Connection'}</span>
                </button>
                <button
                  onClick={() => setShowApiMenu(false)}
                  className="text-blue-400 hover:text-blue-300 font-medium"
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
            className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d1524] border border-[#1b2a45] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in-50">
              <div className="p-3 border-b border-[#1b2a45] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Security Notifications</span>
                <Badge variant="critical" size="sm">3 Active</Badge>
              </div>
              <div className="divide-y divide-[#1b2a45]/60 max-h-72 overflow-y-auto text-xs">
                <div className="p-3 hover:bg-[#121d31] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="text-red-400 font-semibold">CRITICAL INCIDENT</span>
                    <span>12m ago</span>
                  </div>
                  <p className="text-slate-200 font-medium mt-1">INC-2026-0841: Account Takeover</p>
                  <p className="text-slate-400 text-[11px] truncate">420 API calls exfiltrated 4,520 records</p>
                </div>
                <div className="p-3 hover:bg-[#121d31] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="text-orange-400 font-semibold">HIGH ALERT</span>
                    <span>32m ago</span>
                  </div>
                  <p className="text-slate-200 font-medium mt-1">Carding Attack Burst</p>
                  <p className="text-slate-400 text-[11px] truncate">16 failed attempts from SG exit node</p>
                </div>
                <div className="p-3 hover:bg-[#121d31] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="text-blue-400 font-semibold">POLICY ENFORCED</span>
                    <span>48m ago</span>
                  </div>
                  <p className="text-slate-200 font-medium mt-1">Seller API Token Quarantined</p>
                  <p className="text-slate-400 text-[11px] truncate">Vertex Global cross-tenant access blocked</p>
                </div>
              </div>
              <div className="p-2 bg-[#0a0f1a] border-t border-[#1b2a45] text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
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
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 text-xs font-bold">
              AY
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">Aayash</span>
              <span className="text-[10px] text-slate-400 leading-tight">SecOps Lead</span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0d1524] border border-[#1b2a45] rounded-lg shadow-2xl z-50 overflow-hidden py-1">
              <div className="px-3 py-2 border-b border-[#1b2a45]">
                <p className="text-xs font-semibold text-slate-200">Aayash</p>
                <p className="text-[11px] text-slate-400">aayash@qalalabs.internal</p>
                <div className="mt-1">
                  <Badge variant="info" size="sm">Role: Frontend Dev</Badge>
                </div>
              </div>
              <div className="py-1 text-xs text-slate-300">
                <div className="px-3 py-1.5 hover:bg-[#121d31] cursor-pointer">Security Session Logs</div>
                <div className="px-3 py-1.5 hover:bg-[#121d31] cursor-pointer">Simulation Preferences</div>
                <div className="px-3 py-1.5 hover:bg-[#121d31] cursor-pointer text-slate-400">Role: Frontend Developer (Read/Triage)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
