'use client';

/**
 * CARTGUARD AI - client-side attack run (DEMO / SIMULATED).
 * One reducer holds (scenario, tick, decision); everything else is derived.
 * No network calls, no timers other than a single 1s interval while running.
 */
import { useEffect, useMemo, useReducer, useCallback } from 'react';
import type { DashboardSummary, KPICardData, RecentResponseActivity, SeverityDistributionItem, ThreatActivityDataPoint } from '@/types/dashboard';
import type { SecurityEvent, EventSeverity } from '@/types/events';
import type { Incident } from '@/types/incidents';
import { APPROVAL_SECONDS, APPROVAL_T, END_T, getScenario, type Scenario, type ScenarioId, type Step, type LogStage } from './scenarios';

export type Phase = 'idle' | 'running' | 'awaiting' | 'done';
export type Decision = 'approved' | 'rejected' | 'timeout' | null;

export interface RunState {
  phase: Phase;
  scenarioId: ScenarioId | null;
  tick: number;
  decision: Decision;
  decidedTick: number;
  countdown: number;
}

type Action =
  | { type: 'START'; scenarioId: ScenarioId }
  | { type: 'TICK' }
  | { type: 'DECIDE'; decision: 'approved' | 'rejected' }
  | { type: 'RESET' };

const INITIAL: RunState = { phase: 'idle', scenarioId: null, tick: 0, decision: null, decidedTick: 0, countdown: 0 };

function reducer(s: RunState, a: Action): RunState {
  switch (a.type) {
    case 'START':
      return { ...INITIAL, phase: 'running', scenarioId: a.scenarioId };
    case 'RESET':
      return INITIAL;
    case 'DECIDE':
      if (s.phase !== 'awaiting') return s;
      return { ...s, phase: 'running', decision: a.decision, decidedTick: s.tick };
    case 'TICK': {
      if (s.phase === 'running') {
        const n = s.tick + 1;
        if (n >= END_T) return { ...s, tick: n, phase: 'done' };
        if (n === APPROVAL_T && s.decision === null) return { ...s, tick: n, phase: 'awaiting', countdown: APPROVAL_SECONDS };
        return { ...s, tick: n };
      }
      if (s.phase === 'awaiting') {
        const c = s.countdown - 1;
        // Timeout NEVER executes anything: it only records 'timeout' and the attack continues.
        if (c <= 0) return { ...s, phase: 'running', decision: 'timeout', decidedTick: s.tick, countdown: 0 };
        return { ...s, countdown: c };
      }
      return s;
    }
    default:
      return s;
  }
}

export interface Baseline {
  summary: DashboardSummary;
  threatActivity: ThreatActivityDataPoint[];
  severityDistribution: SeverityDistributionItem[];
  recentActivity: RecentResponseActivity[];
}

export interface LogLine {
  t: number;
  stage: LogStage;
  text: string;
}
export interface SimEvent {
  event: SecurityEvent;
  t: number;
}
export type BannerKind = 'attack' | 'approval' | 'contained' | 'escalating' | 'unresolved';

export interface RunView {
  active: boolean;
  scenario: Scenario | null;
  banner: { kind: BannerKind; text: string } | null;
  events: SecurityEvent[];
  toasts: SimEvent[];
  chart: ThreatActivityDataPoint[];
  incidents: Incident[];
  kpis: DashboardSummary['kpis'];
  distribution: SeverityDistributionItem[];
  responses: RecentResponseActivity[];
  logs: LogLine[];
  lastUpdated: string;
}

const num = (v: string | number): number => (typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]/g, '')) || 0);
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const pad = (n: number) => String(n).padStart(2, '0');
const hms = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
};

export function deriveView(state: RunState, base: Baseline): RunView {
  const t0 = Date.parse(base.summary.environment.lastUpdated);
  const clock = (t: number) => new Date(t0 + t * 1000).toISOString();
  const k = base.summary.kpis;

  const idleView: RunView = {
    active: false,
    scenario: null,
    banner: null,
    events: base.summary.recentEvents,
    toasts: [],
    chart: base.threatActivity,
    incidents: base.summary.activeIncidents,
    kpis: k,
    distribution: base.severityDistribution,
    responses: base.recentActivity,
    logs: [],
    lastUpdated: base.summary.environment.lastUpdated,
  };
  if (state.phase === 'idle' || !state.scenarioId) return idleView;

  const sc = getScenario(state.scenarioId);
  const { tick, decision } = state;
  const branch: Step[] = decision === 'approved' ? sc.approve : decision === 'rejected' || decision === 'timeout' ? sc.reject : [];
  const allSteps = [...sc.pre, ...branch].sort((a, b) => a.t - b.t);
  const steps = allSteps.filter((s) => s.t <= tick);

  // events (ids sim-N, shared clock)
  const simEvents: SimEvent[] = [];
  let n = 0;
  for (const s of steps) {
    if (!s.ev) continue;
    n += 1;
    const e = s.ev;
    simEvents.push({
      t: s.t,
      event: {
        id: `sim-${n}`,
        timestamp: clock(s.t),
        source: e.src,
        eventType: e.type,
        severity: e.sev,
        userId: e.user,
        sessionId: e.session,
        sourceIp: e.ip,
        geoCountry: e.geo,
        endpoint: e.ep,
        httpMethod: e.m,
        responseStatus: e.status,
        requestCount: e.reqs,
        resourceType: e.res,
        recordCount: e.status >= 400 ? 0 : e.rec,
        dataCategory: e.cat,
        description: e.desc,
        metadata: { simulated: true, scenario: sc.id },
      },
    });
  }
  const events = [...simEvents.map((x) => x.event).reverse(), ...base.summary.recentEvents];
  const toasts = simEvents.filter((x) => tick - x.t < 4);

  // chart: one point per tick, carry the latest rate forward
  const points: ThreatActivityDataPoint[] = [];
  for (let i = 1; i <= tick; i++) {
    let rate = [0, 0, 0, 0];
    for (const s of allSteps) if (s.t <= i && s.rate) rate = s.rate;
    points.push({ time: hms(clock(i)), authAnomalies: rate[0], apiSpikes: rate[1], dataAccessAnomalies: rate[2], paymentAnomalies: rate[3] });
  }
  const chart = [...base.threatActivity, ...points].slice(-12);

  // incident
  let risk: number | undefined;
  let firstRiskT = 0;
  for (const s of steps) {
    if (s.risk !== undefined) {
      risk = s.risk;
      if (!firstRiskT) firstRiskT = s.t;
    }
  }
  const contained = decision === 'approved' && tick >= 27;
  const exists = risk !== undefined;
  const proposed = tick >= APPROVAL_T;
  let incidents = base.summary.activeIncidents;
  if (exists) {
    const status: Incident['status'] = contained ? 'contained' : proposed ? 'containment_pending' : 'investigating';
    const inc: Incident = {
      id: sc.incidentId,
      title: sc.incidentTitle,
      type: sc.incidentType,
      severity: (risk as number) >= 80 ? 'critical' : 'high',
      status,
      createdAt: clock(firstRiskT),
      updatedAt: clock(tick),
      affectedIdentities: [sc.identity],
      affectedResources: [sc.resource],
      relatedEventIds: simEvents.map((x) => x.event.id),
      evidenceSummary: `Simulated live attack (${sc.name}). ${simEvents.length} correlated events so far. DEMO DATA - no real systems affected.`,
      riskScore: risk as number,
      recommendedAction: {
        id: `act-${sc.incidentId}`,
        actionType: sc.action.actionType,
        label: sc.action.label,
        description: sc.action.affects,
        requiresApproval: true,
        status: decision === 'approved' ? 'executed' : decision === 'rejected' ? 'cancelled' : 'pending_approval',
        riskReduction: sc.action.riskIfSkipped,
      },
      timeline: steps
        .filter((s) => s.log)
        .map((s, i) => ({
          id: `tl-${i}`,
          timestamp: clock(s.t),
          title: (s.log as { stage: string }).stage,
          description: (s.log as { text: string }).text,
          type: 'detection' as const,
        })),
      aiAnalysisSummary: 'SIMULATED / MOCK analysis - deterministic demo output, not a live model call.',
    };
    incidents = [inc, ...base.summary.activeIncidents];
  }

  // KPIs
  const decay = decision === 'approved' ? Math.max(0, Math.min(1, 1 - (tick - state.decidedTick) / 5)) : 1;
  const cumReqs = simEvents.reduce((a, x) => a + x.event.requestCount, 0);
  const cumRec = simEvents.reduce((a, x) => a + (x.event.responseStatus >= 400 ? 0 : x.event.recordCount), 0);
  const pendingNow = state.phase === 'awaiting' || decision === 'timeout';
  const kpi = (src: KPICardData, value: string | number): KPICardData => ({ ...src, value });
  const kpis: DashboardSummary['kpis'] = {
    activeIncidents: kpi(k.activeIncidents, num(k.activeIncidents.value) + (exists && !contained ? 1 : 0)),
    criticalThreats: kpi(k.criticalThreats, num(k.criticalThreats.value) + (exists && (risk as number) >= 80 ? 1 : 0)),
    suspiciousApiRequests: kpi(k.suspiciousApiRequests, fmt(1284 + cumReqs * decay)),
    affectedRecords: kpi(k.affectedRecords, fmt(4520 + cumRec * decay)),
    pendingApprovals: kpi(k.pendingApprovals, num(k.pendingApprovals.value) + (pendingNow ? 1 : 0)),
  };

  // severity distribution
  const counts: Record<EventSeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const d of base.severityDistribution) counts[d.severity] += d.count;
  for (const x of simEvents) counts[x.event.severity] += 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const distribution: SeverityDistributionItem[] = (['critical', 'high', 'medium', 'low'] as EventSeverity[]).map((sev) => ({
    severity: sev,
    count: counts[sev],
    percentage: Math.round((counts[sev] / total) * 1000) / 10,
    label: sev.charAt(0).toUpperCase() + sev.slice(1),
  }));

  // response activity
  let responses = base.recentActivity;
  if (proposed) {
    const st: RecentResponseActivity['status'] = decision === 'approved' ? 'simulated_success' : decision === 'rejected' ? 'reverted' : 'pending_approval';
    const sim: RecentResponseActivity = {
      id: `resp-sim-${sc.id}`,
      timestamp: clock(APPROVAL_T),
      action: sc.action.label,
      target: sc.identity,
      actor: decision === 'approved' ? 'SecOps Analyst (approved)' : decision === 'rejected' ? 'SecOps Analyst (rejected)' : 'CARTGUARD Defender Agent (proposed)',
      status: st,
      incidentId: sc.incidentId,
      details:
        decision === 'approved'
          ? 'Approved by analyst; mock containment executed (simulated).'
          : decision === 'rejected'
          ? 'Rejected by analyst; action NOT executed.'
          : decision === 'timeout'
          ? 'Approval window expired; action NOT executed.'
          : 'Proposed by Defender Agent. Awaiting analyst approval.',
    };
    responses = [sim, ...base.recentActivity];
  }

  // logs
  const logs: LogLine[] = steps.filter((s) => s.log).map((s) => ({ t: s.t, ...(s.log as { stage: LogStage; text: string }) }));
  if (decision === 'timeout') logs.push({ t: APPROVAL_T, stage: 'Alert', text: 'Approval window expired - action NOT executed. Attack continues.' });

  // banner
  let banner: RunView['banner'];
  if (state.phase === 'awaiting') banner = { kind: 'approval', text: 'APPROVAL REQUIRED - attack paused' };
  else if (decision === 'approved') banner = { kind: 'contained', text: 'CONTAINED' };
  else if (decision === 'rejected') banner = { kind: 'escalating', text: 'ESCALATING' };
  else if (decision === 'timeout') banner = { kind: 'unresolved', text: 'UNRESOLVED - approval timed out, action NOT executed' };
  else banner = { kind: 'attack', text: `UNDER ATTACK - ${sc.name} - T+${tick}s` };

  return { active: true, scenario: sc, banner, events, toasts, chart, incidents, kpis, distribution, responses, logs, lastUpdated: clock(tick) };
}

export function useAttackRun(baseline: Baseline) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    if (state.phase !== 'running' && state.phase !== 'awaiting') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  const view = useMemo(() => deriveView(state, baseline), [state, baseline]);
  const start = useCallback((scenarioId: ScenarioId) => dispatch({ type: 'START', scenarioId }), []);
  const decide = useCallback((decision: 'approved' | 'rejected') => dispatch({ type: 'DECIDE', decision }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  return { state, view, start, decide, reset };
}
