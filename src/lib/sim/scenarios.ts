/**
 * CARTGUARD AI - Scripted client-side attack scenarios (DEMO / SIMULATED).
 * Pure data: no network calls, no server state.
 */
import type { EventSeverity, EventSource, SecurityEventType, ResourceType, DataCategory } from '@/types/events';
import type { IncidentType, RecommendedAction } from '@/types/incidents';

export const APPROVAL_T = 25;
export const END_T = 45;
export const APPROVAL_SECONDS = 20;

export type ScenarioId = 'S1' | 'S2' | 'S4';
export type Rate = [auth: number, api: number, data: number, payment: number];
export type LogStage = 'Detected' | 'Correlated' | 'AI investigating' | 'Proposed response' | 'Containment' | 'Alert';

export interface EvSpec {
  type: SecurityEventType;
  sev: EventSeverity;
  src: EventSource;
  ip: string;
  geo: string;
  ep: string;
  m: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: number;
  reqs: number;
  res: ResourceType;
  rec: number;
  cat: DataCategory;
  user: string;
  session: string;
  desc: string;
}

export interface Step {
  t: number;
  caption: string;
  ev?: EvSpec;
  rate?: Rate;
  log?: { stage: LogStage; text: string };
  risk?: number;
}

export interface Scenario {
  id: ScenarioId;
  name: string;
  blurb: string;
  incidentId: string;
  incidentTitle: string;
  incidentType: IncidentType;
  identity: string;
  resource: string;
  action: {
    label: string;
    actionType: RecommendedAction['actionType'];
    affects: string;
    riskIfSkipped: string;
  };
  pre: Step[];
  approve: Step[];
  reject: Step[];
}

/** ENFORCE: any event with status >= 400 has recordCount 0. */
function mk(e: EvSpec): EvSpec {
  return e.status >= 400 ? { ...e, rec: 0 } : e;
}

interface Cfg {
  meta: Omit<Scenario, 'pre' | 'approve' | 'reject'>;
  evAt: (t: number) => EvSpec | undefined;
  rateAt: (t: number) => Rate;
  bigEv: (k: number) => EvSpec;
  proposed: string;
  aiText: string;
  detectText: string;
  correlateText: string;
  containText: string;
  contain2Text: string;
}

const riskAt = (t: number) => Math.round(64 + Math.min(t - 13, 11) * (31 / 11));

function build(c: Cfg): Scenario {
  const pre: Step[] = [];
  for (let t = 1; t <= 25; t++) {
    const ev = c.evAt(t);
    const s: Step = { t, caption: ev ? ev.desc : 'Telemetry steady - anomaly score climbing', rate: c.rateAt(t) };
    if (ev) s.ev = mk(ev);
    if (t >= 13) s.risk = riskAt(t);
    if (t === 13) s.log = { stage: 'Detected', text: c.detectText };
    if (t === 15) s.log = { stage: 'Correlated', text: c.correlateText };
    if (t === 18) s.log = { stage: 'AI investigating', text: c.aiText };
    if (t === 25) {
      s.caption = 'Defender Agent proposes a response - human approval required';
      s.log = { stage: 'Proposed response', text: c.proposed };
    }
    pre.push(s);
  }

  const approve: Step[] = [
    { t: 27, caption: 'Action approved - containment executing (MOCK)', rate: [0, 0, 0, 0], risk: 40, log: { stage: 'Containment', text: c.containText } },
    { t: 29, caption: 'Residual activity dropping', risk: 20 },
    { t: 31, caption: 'Confirming containment', risk: 10, log: { stage: 'Containment', text: c.contain2Text } },
    { t: 36, caption: 'Telemetry quiet', risk: 6 },
    { t: 41, caption: 'Incident CONTAINED', risk: 5, log: { stage: 'Alert', text: 'Incident CONTAINED - no further malicious traffic observed (simulated).' } },
  ];

  const reject: Step[] = [];
  const base = c.rateAt(25);
  for (let t = 28; t <= 41; t++) {
    const f = 1.4 + (t - 28) * 0.08;
    const s: Step = {
      t,
      caption: 'Attack continuing - no containment applied',
      rate: base.map((v) => Math.round(v * f)) as Rate,
      risk: Math.min(100, 97 + Math.floor((t - 28) / 4)),
    };
    if ((t - 28) % 3 === 0) {
      s.ev = mk(c.bigEv((t - 28) / 3));
      s.caption = s.ev.desc;
    }
    if (t === 28) s.log = { stage: 'Alert', text: 'Proposed action not executed. Attack is continuing and escalating.' };
    if (t === 34) s.log = { stage: 'Alert', text: 'Escalating: larger data volumes leaving the environment.' };
    if (t === 41) s.log = { stage: 'Alert', text: 'UNRESOLVED - no containment executed. Analyst action required.' };
    reject.push(s);
  }
  return { ...c.meta, pre, approve, reject };
}

/* ---------------- S1: Account Takeover ---------------- */
const S1_BASE = { src: 'auth-service' as EventSource, ip: '185.220.101.34', geo: 'RO', user: 'usr-vip-9902', session: 'sess-tok-84729a1b' };
function s1Ev(t: number): EvSpec | undefined {
  if (t <= 7)
    return { ...S1_BASE, type: 'failed_login', sev: 'medium', ep: '/api/v1/auth/login', m: 'POST', status: 401, reqs: 1, res: 'customer_account', rec: 0, cat: 'AUTHENTICATION', session: 'none', desc: `Failed login ${t}/7 for usr-vip-9902 from 185.220.101.34 (RO)` };
  if (t === 8)
    return { ...S1_BASE, type: 'successful_login', sev: 'high', ep: '/api/v1/auth/login', m: 'POST', status: 200, reqs: 1, res: 'session_token', rec: 0, cat: 'AUTHENTICATION', desc: 'Login success for usr-vip-9902 from RO after 7 failures (credential stuffing)' };
  if (t === 9)
    return { ...S1_BASE, src: 'customer-portal', type: 'customer_profile_access', sev: 'high', ep: '/api/v1/account/address', m: 'PUT', status: 200, reqs: 1, res: 'customer_account', rec: 1, cat: 'PII', desc: 'Shipping address changed from the new RO session' };
  if (t === 21)
    return { ...S1_BASE, src: 'ecommerce-api', type: 'sensitive_data_export', sev: 'critical', ep: '/api/v1/orders/export', m: 'GET', status: 200, reqs: 1, res: 'order_database', rec: 1200, cat: 'ORDER_HISTORY', desc: 'Bulk order export: 1,200 records requested' };
  if (t >= 10) {
    const rec = Math.min(1500, 420 + (t - 10) * 90);
    return { ...S1_BASE, src: 'ecommerce-api', type: 'bulk_order_access', sev: t >= 14 ? 'critical' : 'high', ep: '/api/v1/orders/history', m: 'GET', status: 200, reqs: Math.round(rec / 10), res: 'order_database', rec, cat: 'ORDER_HISTORY', desc: `Order-history scraping: ${rec.toLocaleString('en-US')} records paged out` };
  }
  return undefined;
}
const s1 = build({
  meta: {
    id: 'S1',
    name: 'S1 - Account Takeover',
    blurb: 'Credential stuffing, login from RO, address change, then bulk order-history scraping.',
    incidentId: 'INC-SIM-S1',
    incidentTitle: 'Account Takeover & Bulk Order History Extraction (Simulated)',
    incidentType: 'ACCOUNT_TAKEOVER_API_ABUSE',
    identity: 'usr-vip-9902',
    resource: 'res:db/orders/history',
    action: {
      label: 'Revoke Active Session & Invalidate Tokens',
      actionType: 'REVOKE_SESSION',
      affects: 'Session sess-tok-84729a1b and all refresh tokens for usr-vip-9902 (customer is logged out everywhere).',
      riskIfSkipped: 'Attacker keeps scraping order history and PII; exfiltration grows with every minute.',
    },
  },
  evAt: s1Ev,
  rateAt: (t) => [t <= 8 ? t * 5 : 5, 10 + t * 14, t >= 10 ? (t - 9) * 12 : 0, 0],
  bigEv: (k) => ({ ...S1_BASE, src: 'ecommerce-api', type: k % 2 ? 'sensitive_data_export' : 'bulk_order_access', sev: 'critical', ep: k % 2 ? '/api/v1/orders/export' : '/api/v1/orders/history', m: 'GET', status: 200, reqs: 150 + k * 40, res: 'order_database', rec: 2400 + k * 700, cat: 'ORDER_HISTORY', desc: `Escalation: ${(2400 + k * 700).toLocaleString('en-US')} order records exfiltrated` }),
  detectText: 'Rule P0-STUFFING-BURST fired: 7 failures then success from 185.220.101.34 (RO). Risk 64.',
  correlateText: 'Correlated login, address change and order-history scraping to usr-vip-9902 / sess-tok-84729a1b.',
  aiText: 'AI investigating (SIMULATED/MOCK): pattern matches account takeover followed by bulk scraping. Deterministic mock output.',
  proposed: 'Proposed: Revoke Active Session & Invalidate Tokens. Awaiting human approval.',
  containText: 'Session sess-tok-84729a1b revoked and tokens invalidated (MOCK execution).',
  contain2Text: 'Traffic from 185.220.101.34 to /orders/* no longer served (simulated).',
});

/* ---------------- S2: Seller Token Abuse ---------------- */
const S2_BASE = { src: 'seller-gateway' as EventSource, ip: '203.0.113.88', geo: 'DE', user: 'seller-app-vertex-global', session: 'api-key-seller-88390', res: 'seller_api_key' as ResourceType, cat: 'SELLER_CREDENTIALS' as DataCategory };
function s2Ev(t: number): EvSpec | undefined {
  if (t <= 8)
    return { ...S2_BASE, type: 'seller_integration_access', sev: 'medium', ep: '/api/v1/partner/catalog/pricing', m: 'POST', status: 403, reqs: 11, rec: 0, desc: `403 storm ${t}/8 on /partner/catalog/pricing (scope violation)` };
  if (t === 9)
    return { ...S2_BASE, type: 'seller_integration_access', sev: 'critical', ep: '/api/v1/partner/catalog/pricing', m: 'PUT', status: 200, reqs: 1, rec: 650, desc: 'Cross-tenant price write slipped through: 650 listings modified' };
  if (t >= 10 && t <= 15)
    return { ...S2_BASE, type: 'seller_integration_access', sev: 'high', ep: '/api/v1/partner/catalog/pricing', m: 'POST', status: 403, reqs: 9, rec: 0, desc: 'Further cross-tenant writes denied (403)' };
  if (t >= 16 && t % 2 === 0)
    return { ...S2_BASE, type: 'sensitive_data_export', sev: 'critical', ep: '/api/v1/partner/catalog/export', m: 'GET', status: 200, reqs: 20, rec: 800 + (t - 16) * 150, desc: `Catalogue export: ${800 + (t - 16) * 150} records` };
  return undefined;
}
const s2 = build({
  meta: {
    id: 'S2',
    name: 'S2 - Seller Token Abuse',
    blurb: 'Partner API key hits a 403 storm, one cross-tenant write slips through, then catalogue export.',
    incidentId: 'INC-SIM-S2',
    incidentTitle: 'Seller API Token Abuse & Catalogue Export (Simulated)',
    incidentType: 'SELLER_API_EXPOSURE',
    identity: 'seller-app-vertex-global',
    resource: 'res:api-key/api-key-seller-88390',
    action: {
      label: 'Isolate Seller API Token',
      actionType: 'FREEZE_API_KEY',
      affects: 'API key api-key-seller-88390 (Vertex Global): all partner catalogue calls are rejected until re-issued.',
      riskIfSkipped: 'Cross-tenant price overrides and catalogue exports continue under a valid key.',
    },
  },
  evAt: s2Ev,
  rateAt: (t) => [0, 20 + t * 12, t >= 9 ? (t - 8) * 9 : 0, 0],
  bigEv: (k) => ({ ...S2_BASE, type: 'sensitive_data_export', sev: 'critical', ep: '/api/v1/partner/catalog/export', m: 'GET', status: 200, reqs: 60 + k * 20, rec: 2000 + k * 600, desc: `Escalation: catalogue export of ${2000 + k * 600} records` }),
  detectText: 'Rule SELLER-SCOPE-VIOLATION fired: 403 storm + 1 cross-tenant write from 203.0.113.88 (DE). Risk 64.',
  correlateText: 'Correlated 403 storm, accepted cross-tenant write and catalogue export to api-key-seller-88390.',
  aiText: 'AI investigating (SIMULATED/MOCK): token behaviour exceeds partner scope; likely leaked or abused key. Deterministic mock output.',
  proposed: 'Proposed: Isolate Seller API Token (FREEZE_API_KEY). Awaiting human approval.',
  containText: 'API key api-key-seller-88390 isolated (MOCK execution).',
  contain2Text: 'Partner catalogue endpoints now reject the key (simulated).',
});

/* ---------------- S4: Bot Payment Mismatch ---------------- */
const S4_BASE = { src: 'checkout-engine' as EventSource, ip: '192.0.2.117', geo: 'SG', user: 'shopper-agent-7731', session: 'mnd-5521', res: 'payment_gateway' as ResourceType, cat: 'PCI_FINANCIAL' as DataCategory };
function s4Ev(t: number): EvSpec | undefined {
  if (t <= 8)
    return { ...S4_BASE, type: 'suspicious_payment_attempt', sev: 'medium', ep: '/api/v1/checkout/agent-pay', m: 'POST', status: 402, reqs: 2, rec: 0, desc: `Agent payment declined ${t}/8 under mandate mnd-5521 (402)` };
  if (t >= 9 && t % 2 === 1)
    return { ...S4_BASE, type: 'suspicious_payment_attempt', sev: t >= 13 ? 'critical' : 'high', ep: '/api/v1/checkout/agent-pay', m: 'POST', status: 200, reqs: 3, rec: 2 + (t - 9), desc: 'Payment accepted to merchant MRCH-9931, not on mandate allow-list, ~10x the mandate cap' };
  if (t >= 10 && t % 2 === 0)
    return { ...S4_BASE, type: 'suspicious_payment_attempt', sev: 'high', ep: '/api/v1/checkout/agent-pay', m: 'POST', status: 402, reqs: 2, rec: 0, desc: 'Agent payment declined (402) - retrying with altered amounts' };
  return undefined;
}
const s4 = build({
  meta: {
    id: 'S4',
    name: 'S4 - Bot Payment Mismatch',
    blurb: 'An AI shopping agent pays outside its signed mandate: unlisted merchant, ~10x the cap.',
    incidentId: 'INC-SIM-S4',
    incidentTitle: 'AI Agent Payment Outside Signed Mandate (Simulated)',
    incidentType: 'SUSPICIOUS_PAYMENT_ACTIVITY',
    identity: 'shopper-agent-7731',
    resource: 'res:mandate/mnd-5521',
    action: {
      label: 'Block Agent Payment & Revoke Mandate',
      actionType: 'FLAG_FRAUD_TRANSACTION',
      affects: 'Mandate mnd-5521 for shopper-agent-7731 and pending payments to MRCH-9931.',
      riskIfSkipped: 'The agent keeps paying merchants outside its mandate at ~10x the spend cap.',
    },
  },
  evAt: s4Ev,
  rateAt: (t) => [0, 15 + t * 6, 0, t >= 9 ? 4 + (t - 8) * 2 : 3],
  bigEv: (k) => ({ ...S4_BASE, type: 'suspicious_payment_attempt', sev: 'critical', ep: '/api/v1/checkout/agent-pay', m: 'POST', status: 200, reqs: 6 + k * 2, rec: 10 + k * 4, desc: `Escalation: ${10 + k * 4} further mismatched payments to MRCH-9931` }),
  detectText: 'Rule AGENT-MANDATE-MISMATCH fired: payments to MRCH-9931 outside mandate mnd-5521. Risk 64.',
  correlateText: 'Correlated 402 declines and accepted payments to shopper-agent-7731 under mandate mnd-5521.',
  aiText: 'AI investigating (SIMULATED/MOCK): merchant not on allow-list and amount ~10x cap - payment is outside the signed mandate. Deterministic mock output.',
  proposed: 'Proposed: Block Agent Payment & Revoke Mandate. Awaiting human approval.',
  containText: 'Mandate mnd-5521 revoked and agent payments blocked (MOCK execution).',
  contain2Text: 'Payments to MRCH-9931 flagged and held (simulated).',
});

export const SCENARIOS: Scenario[] = [s1, s2, s4];
export const getScenario = (id: ScenarioId): Scenario => SCENARIOS.find((s) => s.id === id) ?? s1;
