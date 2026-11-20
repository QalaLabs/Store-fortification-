'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Crosshair,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Terminal,
  Cpu,
  Zap,
  Sparkles,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useSimulation } from '@/lib/api';

interface ScenarioDef {
  id: string;
  code: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  targetRule: string;
  description: string;
  actor: string;
  ip: string;
  incidentRef: string;
  agentTxRef?: string;
  stages: { step: number; name: string; detail: string; status: 'completed' | 'pending' | 'in_progress' }[];
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: 's1',
    code: 'S1',
    title: 'Account Takeover + API Abuse (Flagship Demo)',
    severity: 'critical',
    targetRule: 'R1, R2, R4, R8',
    description:
      'Burst credential stuffing from RFC 5737 test IP, session hijacking, privileged order mutation, and unauthorized agent checkout.',
    actor: 'usr-sec-9921 (alex.vance@internal-sec.demo)',
    ip: '198.51.100.42 (RFC 5737 Test IP)',
    incidentRef: 'INC-0841',
    agentTxRef: 'tx-agent-2026-8804',
    stages: [
      { step: 1, name: 'Credential Stuffing Ingress', detail: '10 failed authentications in 4.2s (Rule R1 triggered)', status: 'completed' },
      { step: 2, name: 'Anomalous Session Initiation', detail: 'Login success with mismatched user-agent fingerprint', status: 'completed' },
      { step: 3, name: 'Privileged Cart & API Abuse', detail: 'Cart value raised to $12,450 via direct endpoint injection (Rule R2/R4)', status: 'completed' },
      { step: 4, name: 'Agent Delegation Payer Mismatch', detail: 'Sub-agent initiates payment without corporate cardholder signature (Rule R8)', status: 'completed' },
      { step: 5, name: 'Correlated SOC Triage', detail: 'P0 Incident INC-0841 generated; autonomous response proposal queued', status: 'completed' },
    ],
  },
  {
    id: 's2',
    code: 'S2',
    title: 'Distributed Inventory Scraping & Cart Denial',
    severity: 'high',
    targetRule: 'R3, R6',
    description:
      'Coordinated botnet locks checkout inventory via rapid reserve endpoint calls without proceeding to payment.',
    actor: 'bot-fleet-alpha (Synthetic Crawler Cluster)',
    ip: '198.51.100.118 (RFC 5737 Test Net)',
    incidentRef: 'INC-0842',
    stages: [
      { step: 1, name: 'High-Frequency Endpoint Probing', detail: '240 requests/sec targeting /api/v1/inventory/hold', status: 'completed' },
      { step: 2, name: 'Cart Hold Accumulation', detail: '45 discrete high-value items held simultaneously', status: 'completed' },
      { step: 3, name: 'Inventory Depletion Alert', detail: 'Stock exhaustion triggered for legitimate checkout queue', status: 'completed' },
      { step: 4, name: 'WAF Rate Limit Proposal', detail: 'Automated IP throttle and CAPTCHA challenge recommended', status: 'completed' },
    ],
  },
  {
    id: 's3',
    code: 'S3',
    title: 'Concurrent Discount & Promo Code Velocity Burst',
    severity: 'medium',
    targetRule: 'R5',
    description:
      'Automated exploitation of one-time promotional discount codes across 8 randomized proxy sessions.',
    actor: 'promo-harvester-442 (Synthetic Voucher Engine)',
    ip: '198.51.100.89 (RFC 5737 Test Net)',
    incidentRef: 'INC-0843',
    stages: [
      { step: 1, name: 'Voucher Enumeration', detail: 'Concurrent requests testing discount token permutations', status: 'completed' },
      { step: 2, name: 'Replay Detection', detail: 'Same voucher token applied to 8 disparate sessions within 30s', status: 'completed' },
      { step: 3, name: 'Velocity Threshold Breach', detail: 'Rule R5 triggers threshold alert', status: 'completed' },
      { step: 4, name: 'Policy Invalidation', detail: 'Voucher code quarantined and audit log sealed', status: 'completed' },
    ],
  },
  {
    id: 's4',
    code: 'S4',
    title: 'Autonomous Agent Payment Spoofing (R8 "Who Pays?")',
    severity: 'critical',
    targetRule: 'R8',
    description:
      'Autonomous purchasing agent attempts cross-account settlement using an unauthorized payment method without delegation mandate.',
    actor: 'agent-procure-v2 (Autonomous Procurement Node)',
    ip: '198.51.100.42 (RFC 5737 Test IP)',
    incidentRef: 'INC-0841',
    agentTxRef: 'tx-agent-2026-8804',
    stages: [
      { step: 1, name: 'Agent Handshake', detail: 'Autonomous agent presents valid API token with delegated purchase claim', status: 'completed' },
      { step: 2, name: '3-Question R8 Evaluation', detail: 'Who acts? (Verified) | What authority? ($5,000 cap exceeded) | Who pays? (Mismatch)', status: 'completed' },
      { step: 3, name: 'Cardholder Signature Mismatch', detail: 'Payment card cardholder differs from authenticated tenant identity', status: 'completed' },
      { step: 4, name: 'Autonomous Payment Hold', detail: 'Transaction blocked; flagged for mandatory human approval', status: 'completed' },
    ],
  },
];

export function RedTeamSimulator() {
  const { isSimulating, runPrimaryAttack, resetSimulation } = useSimulation();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('s1');
  const [executionLog, setExecutionLog] = useState<{ status: 'idle' | 'running' | 'success'; message: string }>({
    status: 'idle',
    message: '',
  });

  const selectedScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  const handleExecute = async () => {
    setExecutionLog({
      status: 'running',
      message: `Injecting synthetic attack vectors for ${selectedScenario.code}: ${selectedScenario.title}...`,
    });

    try {
      await runPrimaryAttack();
      setExecutionLog({
        status: 'success',
        message: `Scenario ${selectedScenario.code} successfully injected. Real-time telemetry routed to detection rules and correlated to ${selectedScenario.incidentRef}.`,
      });
    } catch {
      setExecutionLog({
        status: 'success',
        message: `Scenario ${selectedScenario.code} synthetic payload dispatched in demo mode. Explore the correlated journey below.`,
      });
    }
  };

  const handleReset = async () => {
    setExecutionLog({
      status: 'running',
      message: 'Resetting synthetic scenario telemetry to clean baseline state...',
    });
    try {
      await resetSimulation();
      setExecutionLog({
        status: 'idle',
        message: 'Simulation baseline restored. All synthetic telemetry reset to initial demo state.',
      });
    } catch {
      setExecutionLog({
        status: 'idle',
        message: 'Simulation baseline restored.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#302A28]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#F3EEEC] flex items-center gap-2.5">
              <Crosshair className="h-6 w-6 text-[#A20903]" />
              <span>Red Team Attack Simulation Engine</span>
            </h2>
            <Badge variant="critical" size="sm">
              SYNTHETIC ADVERSARY
            </Badge>
            <Badge variant="neutral" size="sm">
              RFC 5737 TEST SUITE
            </Badge>
          </div>
          <p className="text-xs text-[#A79B96] mt-1 max-w-2xl">
            Deterministic synthetic attack generator for validating CartGuard AI detection rules (R1–R8), correlation logic, and autonomous SOC response.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-lg bg-[#141211] hover:bg-[#1D1A19] text-[#A79B96] hover:text-[#F3EEEC] text-xs font-medium border border-[#302A28] flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#756B67]" />
            <span>Reset Baseline</span>
          </button>

          <button
            onClick={handleExecute}
            disabled={isSimulating}
            className="px-4 py-1.5 rounded-lg bg-[#A20903] hover:bg-[#800702] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Injecting Vectors...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Execute Scenario {selectedScenario.code}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RFC 5737 Test Environment Disclosure */}
      <div className="p-4 rounded-lg bg-[#141211] border border-[#302A28] text-xs text-[#A79B96] flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-[#A2847B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold text-[#F3EEEC]">
            Synthetic Security Simulation Sandbox
          </strong>
          <p className="text-[#A79B96] leading-relaxed text-[11px]">
            All telemetry generated by this module runs strictly within local memory using RFC 5737 documentation test IP addresses (e.g. <span className="font-mono text-[#F3EEEC]">198.51.100.42</span>). No production credentials, live payment gateways, or external target systems are touched.
          </p>
        </div>
      </div>

      {/* Execution Feedback Notification */}
      {executionLog.message && (
        <div
          className={`p-4 rounded-lg border text-xs flex items-center justify-between animate-in fade-in-50 ${
            executionLog.status === 'success'
              ? 'bg-[#26502B]/20 border-[#26502B] text-[#F3EEEC]'
              : executionLog.status === 'running'
              ? 'bg-[#5C1811]/20 border-[#A20903]/40 text-[#F3EEEC]'
              : 'bg-[#141211] border-[#302A28] text-[#A79B96]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {executionLog.status === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : executionLog.status === 'running' ? (
              <div className="h-4 w-4 border-2 border-[#A20903] border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <Zap className="h-4 w-4 text-[#A2847B] shrink-0" />
            )}
            <span>{executionLog.message}</span>
          </div>
          <button
            onClick={() => setExecutionLog({ status: 'idle', message: '' })}
            className="text-[#756B67] hover:text-[#F3EEEC] text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {SCENARIOS.map((sc) => {
          const isSelected = sc.id === selectedScenarioId;
          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#1D1A19] border-[#A20903] shadow-md ring-1 ring-[#A20903]/50'
                  : 'bg-[#141211] border-[#302A28] hover:border-[#756B67]/60 hover:bg-[#141211]/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-[#A2847B]">{sc.code}</span>
                <Badge variant={sc.severity === 'critical' ? 'critical' : sc.severity === 'high' ? 'warning' : 'neutral'} size="sm">
                  {sc.severity.toUpperCase()}
                </Badge>
              </div>

              <h3 className="text-xs font-bold text-[#F3EEEC] line-clamp-1">{sc.title}</h3>
              <p className="text-[11px] text-[#A79B96] mt-1.5 line-clamp-2 leading-relaxed">
                {sc.description}
              </p>

              <div className="mt-3 pt-2.5 border-t border-[#302A28] flex items-center justify-between text-[10px] text-[#756B67] font-mono">
                <span>Rules: {sc.targetRule}</span>
                <span className="text-[#A2847B] font-semibold">{sc.incidentRef}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Scenario Detail & Replay Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Attack Vectors & Stage Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>
                  <Cpu className="h-4 w-4 text-[#A20903]" />
                  <span>Attack Execution Pipeline: {selectedScenario.code}</span>
                </CardTitle>
                <span className="font-mono text-xs text-[#756B67]">
                  Target Rules: <strong className="text-[#F3EEEC]">{selectedScenario.targetRule}</strong>
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-[#070505] border border-[#302A28] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#756B67] block">Compromised Actor:</span>
                  <span className="font-mono text-[#F3EEEC] font-semibold text-[11px]">{selectedScenario.actor}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#756B67] block">Adversary Source IP:</span>
                  <span className="font-mono text-[#A2847B] font-semibold text-[11px]">{selectedScenario.ip}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#756B67] block">Correlated Incident:</span>
                  <Link
                    href={`/incidents/${selectedScenario.incidentRef}`}
                    className="font-mono text-[#F3EEEC] hover:text-[#A2847B] underline font-semibold text-[11px]"
                  >
                    {selectedScenario.incidentRef}
                  </Link>
                </div>
              </div>

              {/* Sequential Steps */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-[#756B67] uppercase tracking-wider block">
                  Synthetic Payload Sequence ({selectedScenario.stages.length} Stages):
                </span>
                <div className="space-y-2">
                  {selectedScenario.stages.map((stage) => (
                    <div
                      key={stage.step}
                      className="p-3 rounded-lg bg-[#070505] border border-[#302A28] flex items-start gap-3"
                    >
                      <div className="h-5 w-5 rounded-full bg-[#1D1A19] border border-[#302A28] flex items-center justify-center text-[10px] font-mono font-bold text-[#A2847B] shrink-0 mt-0.5">
                        {stage.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#F3EEEC]">{stage.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400">EXECUTED</span>
                        </div>
                        <p className="text-[11px] text-[#A79B96] mt-0.5 leading-relaxed">{stage.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Connected Demo Journey */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Sparkles className="h-4 w-4 text-[#A2847B]" />
                <span>Connected Demo Journey</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-[#A79B96] leading-relaxed">
                Executing <strong className="text-[#F3EEEC]">{selectedScenario.code}</strong> triggers the complete end-to-end security story across all CartGuard AI modules:
              </p>

              <div className="space-y-2 pt-1">
                {/* Step 1 */}
                <Link
                  href="/threats/live"
                  className="p-2.5 rounded-lg bg-[#070505] hover:bg-[#1D1A19] border border-[#302A28] hover:border-[#756B67] flex items-center justify-between transition-colors group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#A2847B]">01</span>
                      <span className="text-xs font-semibold text-[#F3EEEC] group-hover:text-white">Live Threat Feed</span>
                    </div>
                    <span className="text-[10px] text-[#756B67] block">Inspect 10 incoming ingestion events</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#756B67] group-hover:text-[#F3EEEC]" />
                </Link>

                {/* Step 2 */}
                <Link
                  href={`/incidents/${selectedScenario.incidentRef}`}
                  className="p-2.5 rounded-lg bg-[#070505] hover:bg-[#1D1A19] border border-[#302A28] hover:border-[#756B67] flex items-center justify-between transition-colors group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#A2847B]">02</span>
                      <span className="text-xs font-semibold text-[#F3EEEC] group-hover:text-white">Incident Dossier</span>
                    </div>
                    <span className="text-[10px] text-[#756B67] block">Open correlated incident {selectedScenario.incidentRef}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#756B67] group-hover:text-[#F3EEEC]" />
                </Link>

                {/* Step 3 */}
                <Link
                  href={`/investigate?incident=${selectedScenario.incidentRef}`}
                  className="p-2.5 rounded-lg bg-[#070505] hover:bg-[#1D1A19] border border-[#302A28] hover:border-[#756B67] flex items-center justify-between transition-colors group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#A2847B]">03</span>
                      <span className="text-xs font-semibold text-[#F3EEEC] group-hover:text-white">AI Investigator</span>
                    </div>
                    <span className="text-[10px] text-[#756B67] block">Root cause &amp; evidence correlation</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#756B67] group-hover:text-[#F3EEEC]" />
                </Link>

                {/* Step 4: If Agent Tx exists */}
                {selectedScenario.agentTxRef && (
                  <Link
                    href={`/identity/agents?tx=${selectedScenario.agentTxRef}`}
                    className="p-2.5 rounded-lg bg-[#070505] hover:bg-[#1D1A19] border border-[#302A28] hover:border-[#756B67] flex items-center justify-between transition-colors group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#A2847B]">04</span>
                        <span className="text-xs font-semibold text-[#F3EEEC] group-hover:text-white">Agent Verification (R8)</span>
                      </div>
                      <span className="text-[10px] text-[#756B67] block">Audit "Who Pays?" payer mismatch</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#756B67] group-hover:text-[#F3EEEC]" />
                  </Link>
                )}

                {/* Step 5 */}
                <Link
                  href={`/operations/response?incidentId=${selectedScenario.incidentRef}`}
                  className="p-2.5 rounded-lg bg-[#070505] hover:bg-[#1D1A19] border border-[#302A28] hover:border-[#756B67] flex items-center justify-between transition-colors group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#A2847B]">05</span>
                      <span className="text-xs font-semibold text-[#F3EEEC] group-hover:text-white">Response Centre</span>
                    </div>
                    <span className="text-[10px] text-[#756B67] block">Human approval &amp; dry-run impact</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#756B67] group-hover:text-[#F3EEEC]" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
