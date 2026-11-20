'use client';

import React, { useState } from 'react';
import { useDashboardData, useSimulation } from '@/lib/api';
import { MetricCard } from './MetricCard';
import { ThreatActivity } from './ThreatActivity';
import { ActiveIncidents } from './ActiveIncidents';
import { RecentEvents } from './RecentEvents';
import { IntegrationStatus } from './IntegrationStatus';
import { ThreatDistribution } from './ThreatDistribution';
import { ResponseActivity } from './ResponseActivity';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Play, Sparkles, RefreshCw, AlertCircle, X, ShieldAlert, ArrowRight, Radio, Bot, ShieldCheck } from 'lucide-react';
import { formatTimestamp } from '@/lib/formatters';

export function SecurityOverview() {
  const { data, isLoading, error, mode, refetch } = useDashboardData();
  const { isSimulating, runPrimaryAttack } = useSimulation();
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulationBanner, setSimulationBanner] = useState<string | null>(null);

  const handleSimulateAttack = () => {
    setShowSimulateModal(true);
  };

  const handleTriggerReplay = async (scenarioName: string) => {
    setShowSimulateModal(false);
    await runPrimaryAttack();
    await refetch();
    setSimulationBanner(
      `Scenario Staged: "${scenarioName}". Follow the end-to-end security journey below.`
    );
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-[#0d1524] rounded-lg w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-[#0d1524] rounded-xl border border-[#1b2a45]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-64 bg-[#0d1524] rounded-xl border border-[#1b2a45]" />
          <div className="h-64 bg-[#0d1524] rounded-xl border border-[#1b2a45]" />
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Error state if in LIVE mode with backend failure */}
      {error && mode === 'ERROR' && (
        <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-medium rounded-md"
          >
            Retry Connection
          </button>
        </div>
      )}
      {/* Simulation Banner Notification with End-to-End Demo Journey Links */}
      {simulationBanner && (
        <div className="p-4 bg-gradient-to-r from-blue-950/60 via-[#0d1524] to-[#0d1524] border border-blue-500/50 rounded-xl space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between gap-3 text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="font-semibold">{simulationBanner}</span>
            </div>
            <button
              onClick={() => setSimulationBanner(null)}
              className="p-1 hover:bg-blue-900/40 rounded text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-blue-500/20">
            <span className="text-slate-400 font-semibold text-[11px] mr-1">Demo Journey Path:</span>
            <Link
              href="/threats/live"
              className="px-2.5 py-1 rounded bg-[#090e17] hover:bg-slate-800 text-slate-200 border border-[#1b2a45] hover:border-blue-500/50 flex items-center gap-1 transition-colors"
            >
              <Radio className="h-3 w-3 text-emerald-400" />
              <span>1. Live Signals</span>
            </Link>
            <span className="text-slate-600">&rarr;</span>
            <Link
              href="/incidents/INC-2026-0841"
              className="px-2.5 py-1 rounded bg-[#090e17] hover:bg-slate-800 text-slate-200 border border-[#1b2a45] hover:border-red-500/50 flex items-center gap-1 transition-colors"
            >
              <ShieldAlert className="h-3 w-3 text-red-400" />
              <span>2. Incident Dossier</span>
            </Link>
            <span className="text-slate-600">&rarr;</span>
            <Link
              href="/investigate?incidentId=INC-2026-0841"
              className="px-2.5 py-1 rounded bg-[#090e17] hover:bg-slate-800 text-slate-200 border border-[#1b2a45] hover:border-cyan-500/50 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>3. AI Investigation</span>
            </Link>
            <span className="text-slate-600">&rarr;</span>
            <Link
              href="/operations/response"
              className="px-2.5 py-1 rounded bg-[#090e17] hover:bg-slate-800 text-slate-200 border border-[#1b2a45] hover:border-amber-500/50 flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="h-3 w-3 text-amber-400" />
              <span>4. Human Approval</span>
            </Link>
            <span className="text-slate-600">&rarr;</span>
            <Link
              href="/identity/agents?highlightTx=tx-agent-2026-8804"
              className="px-2.5 py-1 rounded bg-[#090e17] hover:bg-slate-800 text-slate-200 border border-[#1b2a45] hover:border-purple-500/50 flex items-center gap-1 transition-colors"
            >
              <Bot className="h-3 w-3 text-purple-400" />
              <span>5. Agent Verification (R8)</span>
            </Link>
            <span className="text-slate-600">&rarr;</span>
            <Link
              href="/operations/response#audit-trail"
              className="px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>6. Audit Ledger</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Top Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1b2a45]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">
              Security Overview
            </h2>
            <Badge
              variant={mode === 'LIVE' ? 'success' : mode === 'ERROR' ? 'error' : 'info'}
              size="sm"
              pulse={mode === 'LIVE'}
            >
              {mode === 'LIVE' ? 'LIVE DATA' : mode === 'ERROR' ? 'API DISCONNECTED' : 'DEMO MODE'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitor threats, investigate suspicious activity and protect customer data across your e-commerce ecosystem.
          </p>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#0d1524] px-3 py-1.5 rounded-md border border-[#1b2a45] font-mono">
            <RefreshCw className="h-3 w-3 text-slate-400" />
            <span>Updated: {formatTimestamp(summary.environment.lastUpdated)} UTC</span>
          </div>

          <button
            onClick={handleSimulateAttack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Simulate Attack (Demo)</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <MetricCard data={summary.kpis.activeIncidents} />
        <MetricCard data={summary.kpis.criticalThreats} />
        <MetricCard data={summary.kpis.suspiciousApiRequests} />
        <MetricCard data={summary.kpis.affectedRecords} />
        <MetricCard data={summary.kpis.pendingApprovals} />
      </div>

      {/* Row 2: Threat Activity Chart (2/3) & Threat Severity Distribution (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ThreatActivity data={data.threatActivity} />
        </div>
        <div className="lg:col-span-1">
          <ThreatDistribution distribution={data.severityDistribution} />
        </div>
      </div>

      {/* Row 3: Active Incidents (P0 / Correlated cases) */}
      <div>
        <ActiveIncidents incidents={summary.activeIncidents} />
      </div>

      {/* Row 4: Recent Security Events Table */}
      <div>
        <RecentEvents events={summary.recentEvents} />
      </div>

      {/* Row 5: Recent Response Activity & Integration Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ResponseActivity activities={data.recentActivity} />
        <IntegrationStatus integrations={summary.integrations} />
      </div>

      {/* Simulate Attack Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1524] border border-[#1b2a45] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Simulate Attack Scenario
                  </h3>
                  <p className="text-xs text-slate-400">
                    Synthetic attack replay for SOC verification and demonstration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Demo Safe Replay:</strong> This control will simulate high-fidelity synthetic telemetry in the local SOC without performing any real network or infrastructure attacks.
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Scenario Replay:
              </p>

              <button
                onClick={() =>
                  handleTriggerReplay('Account Takeover + High-Volume Order API Scraping')
                }
                className="w-full text-left p-3 rounded-lg bg-[#121d31] hover:bg-[#17253d] border border-red-500/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-300 group-hover:text-red-200">
                    Primary P0: Account Takeover & Order History Exfiltration
                  </span>
                  <Badge variant="critical" size="sm">P0 Demo</Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  7 credential stuffing attempts → login from RO → shipping address change → 420 order pagination calls dumping 4,520 records.
                </p>
              </button>

              <button
                onClick={() =>
                  handleTriggerReplay('Carding Velocity Attack on Checkout')
                }
                className="w-full text-left p-3 rounded-lg bg-[#121d31] hover:bg-[#17253d] border border-orange-500/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-300 group-hover:text-orange-200">
                    Scenario 2: Distributed Carding Attack & Velocity Spike
                  </span>
                  <Badge variant="high" size="sm">PCI Scope</Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  16 rapid card authorization declines with rotating BIN prefixes from proxy exit nodes.
                </p>
              </button>

              <button
                onClick={() =>
                  handleTriggerReplay('Third-Party Seller API Scope Violation')
                }
                className="w-full text-left p-3 rounded-lg bg-[#121d31] hover:bg-[#17253d] border border-[#1b2a45] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                    Scenario 3: Partner API Token Scope Abuse
                  </span>
                  <Badge variant="neutral" size="sm">Vendor Sec</Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Expired merchant token attempting cross-tenant pricing overrides with 88 repeated 403 responses.
                </p>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1b2a45]">
              <Link
                href="/threats/live"
                onClick={() => setShowSimulateModal(false)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Launch Live Feed Demo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={() => setShowSimulateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
