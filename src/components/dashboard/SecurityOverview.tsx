'use client';

import React, { useState } from 'react';
import { syntheticDashboardSummary } from '@/data/fixtures/dashboard';
import { MetricCard } from './MetricCard';
import { ThreatActivity } from './ThreatActivity';
import { ActiveIncidents } from './ActiveIncidents';
import { RecentEvents } from './RecentEvents';
import { IntegrationStatus } from './IntegrationStatus';
import { ThreatDistribution } from './ThreatDistribution';
import { ResponseActivity } from './ResponseActivity';
import { Badge } from '@/components/ui/Badge';
import { Play, Sparkles, RefreshCw, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { formatTimestamp } from '@/lib/formatters';

export function SecurityOverview() {
  const [data, setData] = useState(syntheticDashboardSummary);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulationBanner, setSimulationBanner] = useState<string | null>(null);

  const handleSimulateAttack = () => {
    setShowSimulateModal(true);
  };

  const handleTriggerReplay = (scenarioName: string) => {
    setShowSimulateModal(false);
    setSimulationBanner(
      `Scenario Replay Triggered: "${scenarioName}". Replay events staged. Full live execution pipeline will stream in Phase 2.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notification */}
      {simulationBanner && (
        <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-lg flex items-center justify-between gap-3 text-xs text-blue-200 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
            <span>{simulationBanner}</span>
          </div>
          <button
            onClick={() => setSimulationBanner(null)}
            className="p-1 hover:bg-blue-900/40 rounded text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1b2a45]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">
              Security Overview
            </h2>
            <Badge variant="info" size="sm" pulse>
              {data.environment.mode}
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
            <span>Updated: {formatTimestamp(data.environment.lastUpdated)} UTC</span>
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
        <MetricCard data={data.kpis.activeIncidents} />
        <MetricCard data={data.kpis.criticalThreats} />
        <MetricCard data={data.kpis.suspiciousApiRequests} />
        <MetricCard data={data.kpis.affectedRecords} />
        <MetricCard data={data.kpis.pendingApprovals} />
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
        <ActiveIncidents incidents={data.activeIncidents} />
      </div>

      {/* Row 4: Recent Security Events Table */}
      <div>
        <RecentEvents events={data.recentEvents} />
      </div>

      {/* Row 5: Recent Response Activity & Integration Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ResponseActivity activities={data.recentResponses} />
        <IntegrationStatus integrations={data.integrations} />
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

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSimulateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
