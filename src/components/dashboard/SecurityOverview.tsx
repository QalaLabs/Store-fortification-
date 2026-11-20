'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useDashboardData } from '@/lib/api';
import { MetricCard } from './MetricCard';
import { ThreatActivity } from './ThreatActivity';
import { ActiveIncidents } from './ActiveIncidents';
import { RecentEvents } from './RecentEvents';
import { IntegrationStatus } from './IntegrationStatus';
import { ThreatDistribution } from './ThreatDistribution';
import { ResponseActivity } from './ResponseActivity';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Play, RefreshCw, AlertCircle, X, ShieldAlert, ArrowRight, Bot, RotateCcw, Check, Ban } from 'lucide-react';
import { formatTimestamp } from '@/lib/formatters';
import { syntheticDashboardSummary, threatActivityData, severityDistribution, recentResponseActivities } from '@/data/fixtures/dashboard';
import { SCENARIOS, APPROVAL_SECONDS, type ScenarioId } from '@/lib/sim/scenarios';
import { useAttackRun, type Baseline, type BannerKind } from '@/lib/sim/useAttackRun';

const FALLBACK: Baseline = {
  summary: syntheticDashboardSummary,
  threatActivity: threatActivityData,
  severityDistribution,
  recentActivity: recentResponseActivities,
};

const BANNER_STYLE: Record<BannerKind, string> = {
  attack: 'bg-[#A20903] border-[#FCA5A5]/60 text-white sim-pulse',
  approval: 'bg-[#92400E] border-[#FDE047]/60 text-white',
  contained: 'bg-[#166534] border-[#86EFAC]/60 text-white',
  escalating: 'bg-[#A20903] border-[#FCA5A5]/60 text-white sim-pulse',
  unresolved: 'bg-[#7F1D1D] border-[#FCA5A5]/60 text-white sim-pulse',
};

const STAGE_COLOR: Record<string, string> = {
  Detected: 'text-[#FCA5A5]',
  Correlated: 'text-[#FDBA74]',
  'AI investigating': 'text-[#A2847B]',
  'Proposed response': 'text-[#FDE047]',
  Containment: 'text-[#86EFAC]',
  Alert: 'text-[#F87171]',
};

export function SecurityOverview() {
  const { data, error, mode, refetch } = useDashboardData();

  // Baseline: live/API data when present, otherwise fixtures, so the sim never depends on the network.
  const baseline: Baseline = useMemo(() => {
    if (data && data.summary && data.summary.kpis && Array.isArray(data.summary.recentEvents) && data.summary.recentEvents.length > 0) {
      return {
        summary: data.summary,
        threatActivity: data.threatActivity?.length ? data.threatActivity : FALLBACK.threatActivity,
        severityDistribution: data.severityDistribution?.length ? data.severityDistribution : FALLBACK.severityDistribution,
        recentActivity: data.recentActivity?.length ? data.recentActivity : FALLBACK.recentActivity,
      };
    }
    return FALLBACK;
  }, [data]);

  const { state, view, start, decide, reset } = useAttackRun(baseline);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [pick, setPick] = useState<ScenarioId>('S1');

  const summary = baseline.summary;
  const running = state.phase !== 'idle';
  const sc = view.scenario;

  return (
    <div className="space-y-6">
      {/* Sticky attack banner */}
      {view.banner && (
        <div className={`sticky top-0 z-40 px-4 py-2.5 rounded-lg border text-sm font-bold tracking-wide flex items-center justify-between gap-3 shadow-lg ${BANNER_STYLE[view.banner.kind]}`} role="status">
          <span className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            {view.banner.text}
          </span>
          <span className="text-[11px] font-mono opacity-90">DEMO / SIMULATED - T+{state.tick}s</span>
        </div>
      )}

      {error && mode === 'ERROR' && (
        <div className="p-4 bg-[#5C1811]/30 border border-[#A20903]/40 rounded-xl flex items-center justify-between text-xs text-[#FCA5A5]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#A20903] shrink-0" />
            <span>{error} (showing built-in demo data)</span>
          </div>
          <button onClick={() => refetch()} className="px-3 py-1 bg-[#A20903] hover:bg-[#850702] text-[#F3EEEC] font-medium rounded-md">
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#302A28]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#F3EEEC]">Security Overview</h2>
            <Badge variant={mode === 'LIVE' ? 'success' : mode === 'ERROR' ? 'error' : 'neutral'} size="sm" pulse={mode === 'LIVE'}>
              {mode === 'LIVE' ? 'LIVE DATA' : mode === 'ERROR' ? 'API DISCONNECTED' : 'DEMO MODE'}
            </Badge>
          </div>
          <p className="text-xs text-[#A79B96] mt-1 max-w-2xl leading-relaxed">
            Monitor threats, investigate suspicious activity and protect customer data across your e-commerce ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-[#756B67] bg-[#141211] px-3 py-1.5 rounded-md border border-[#302A28] font-mono">
            <RefreshCw className="h-3 w-3 text-[#756B67]" />
            <span>Updated: {formatTimestamp(view.lastUpdated)} UTC</span>
          </div>

          {running && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#1D1A19] hover:bg-[#221E1D] text-[#D0C4C0] border border-[#302A28] text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={() => setShowSimulateModal(true)}
            disabled={running}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#A20903] hover:bg-[#850702] disabled:opacity-40 disabled:cursor-not-allowed text-[#F3EEEC] text-xs font-semibold shadow-md transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Simulate Attack (Demo)</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <MetricCard data={view.kpis.activeIncidents} />
        <MetricCard data={view.kpis.criticalThreats} />
        <MetricCard data={view.kpis.suspiciousApiRequests} />
        <MetricCard data={view.kpis.affectedRecords} />
        <MetricCard data={view.kpis.pendingApprovals} />
      </div>

      {/* Defender Agent live log */}
      {running && sc && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Bot className="h-4 w-4 text-[#A2847B]" />
              <span>Defender Agent - Live Log</span>
            </CardTitle>
            <p className="text-xs text-[#A79B96] mt-1">{sc.name}: scripted client-side simulation. AI steps are SIMULATED/MOCK; no real systems are touched.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-52 overflow-y-auto divide-y divide-[#302A28] font-mono text-[11px]">
              {view.logs.length === 0 && <div className="px-4 py-3 text-[#756B67]">Monitoring telemetry... no detections yet.</div>}
              {[...view.logs].reverse().map((l, i) => (
                <div key={`${l.t}-${l.stage}-${i}`} className="px-4 py-2 flex gap-3 items-start sim-slide-in">
                  <span className="text-[#756B67] shrink-0">T+{l.t}s</span>
                  <span className={`shrink-0 w-32 font-bold ${STAGE_COLOR[l.stage] ?? 'text-[#D0C4C0]'}`}>{l.stage}</span>
                  <span className="text-[#D0C4C0] font-sans">{l.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ThreatActivity data={view.chart} />
        </div>
        <div className="lg:col-span-1">
          <ThreatDistribution distribution={view.distribution} />
        </div>
      </div>

      <div>
        <ActiveIncidents incidents={view.incidents} />
      </div>

      <div>
        <RecentEvents events={view.events} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ResponseActivity activities={view.responses} />
        <IntegrationStatus integrations={summary.integrations} />
      </div>

      {/* Toasts (derived: events from the last 4s) */}
      <div className="fixed bottom-4 right-4 z-40 space-y-2 w-80 pointer-events-none" aria-live="polite">
        {view.toasts.slice(-4).map((x) => (
          <div key={x.event.id} className="sim-toast bg-[#141211] border border-[#A20903]/60 rounded-lg p-3 shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#FCA5A5] uppercase">{x.event.severity} - {x.event.eventType.replace(/_/g, ' ')}</span>
              <span className="text-[10px] font-mono text-[#756B67]">{x.event.responseStatus}</span>
            </div>
            <p className="text-[11px] text-[#D0C4C0] mt-1 leading-snug">{x.event.description}</p>
          </div>
        ))}
      </div>

      {/* Scenario picker */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141211] border border-[#302A28] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#1D1A19] text-[#A20903] border border-[#302A28]">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F3EEEC]">Simulate Live Attack</h3>
                  <p className="text-xs text-[#A79B96]">~45s scripted run, entirely in your browser</p>
                </div>
              </div>
              <button onClick={() => setShowSimulateModal(false)} className="text-[#756B67] hover:text-[#F3EEEC] p-1 rounded" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-[#1D1A19] border border-[#302A28] rounded-lg text-xs text-[#D0C4C0] flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#D97706]" />
              <span>
                <strong className="text-[#F3EEEC]">Demo safe:</strong> synthetic telemetry only. No network calls, no real attacks, AI steps are simulated.
              </span>
            </div>

            <div className="space-y-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPick(s.id)}
                  className={`w-full text-left p-3 rounded-lg bg-[#1D1A19] hover:bg-[#221E1D] border transition-all ${pick === s.id ? 'border-[#A20903]' : 'border-[#302A28]'}`}
                >
                  <span className="text-xs font-bold text-[#F3EEEC]">{s.name}</span>
                  <p className="text-[11px] text-[#A79B96] mt-1">{s.blurb}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#302A28]">
              <Link href="/threats/live" onClick={() => setShowSimulateModal(false)} className="text-xs text-[#A79B96] hover:text-[#F3EEEC] flex items-center gap-1">
                <span>Live feed</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div className="flex gap-2">
                <button onClick={() => setShowSimulateModal(false)} className="px-4 py-2 bg-[#1D1A19] hover:bg-[#221E1D] text-[#A79B96] text-xs font-medium rounded-lg border border-[#302A28]">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSimulateModal(false);
                    start(pick);
                  }}
                  className="px-4 py-2 bg-[#A20903] hover:bg-[#850702] text-[#F3EEEC] text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BLOCKING approval modal: no backdrop/ESC close; run is paused until chosen */}
      {state.phase === 'awaiting' && sc && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="approval-title" className="bg-[#141211] border-2 border-[#D97706] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold text-[#FDE047] uppercase tracking-wider">Human approval required - attack paused</p>
                <h3 id="approval-title" className="text-lg font-bold text-[#F3EEEC] mt-1">{sc.action.label}</h3>
              </div>
              <div className="text-center shrink-0">
                <div className="text-3xl font-extrabold font-mono text-[#FDE047]">{state.countdown}</div>
                <div className="text-[10px] text-[#756B67] uppercase">of {APPROVAL_SECONDS}s</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#1D1A19] border border-[#302A28] rounded-lg">
                <p className="font-semibold text-[#A79B96] uppercase text-[10px] tracking-wider mb-1">What it affects</p>
                <p className="text-[#D0C4C0]">{sc.action.affects}</p>
              </div>
              <div className="p-3 bg-[#5C1811]/20 border border-[#A20903]/40 rounded-lg">
                <p className="font-semibold text-[#FCA5A5] uppercase text-[10px] tracking-wider mb-1">Risk if skipped</p>
                <p className="text-[#D0C4C0]">{sc.action.riskIfSkipped}</p>
              </div>
              <p className="text-[11px] text-[#756B67]">
                If the window expires, <strong className="text-[#F3EEEC]">nothing is executed</strong> and the attack continues. Containment here is mocked (simulated).
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => decide('approved')} autoFocus className="flex-1 px-4 py-2.5 bg-[#166534] hover:bg-[#15803D] text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                Approve
              </button>
              <button onClick={() => decide('rejected')} className="flex-1 px-4 py-2.5 bg-[#1D1A19] hover:bg-[#221E1D] text-[#FCA5A5] text-sm font-bold rounded-lg border border-[#A20903]/60 flex items-center justify-center gap-2">
                <Ban className="h-4 w-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
