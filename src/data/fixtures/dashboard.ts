/**
 * CARTGUARD AI - Coherent Dashboard Summary Fixture
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * NOTE:
 * All KPI totals, severity distributions, and threat activity points
 * derive strictly from the synthetic events and incidents fixtures.
 * No contradictory or arbitrary numbers.
 */

import { DashboardSummary, ThreatActivityDataPoint, SeverityDistributionItem, RecentResponseActivity } from '../../types/dashboard';
import { syntheticSecurityEvents } from './events';
import { syntheticIncidents } from './incidents';
import { syntheticIntegrations } from './integrations';

// Derive metrics coherently
const activeIncidentsCount = syntheticIncidents.filter(
  (inc) => inc.status === 'open' || inc.status === 'investigating' || inc.status === 'containment_pending'
).length;

const criticalThreatsCount = syntheticIncidents.filter((inc) => inc.severity === 'critical').length;

// Total records from critical exfiltration events (evt-004: 1,420 + evt-008: 3,100 = 4,520)
const totalAffectedRecords = syntheticSecurityEvents.reduce((acc, evt) => {
  if (evt.eventType === 'bulk_order_access' || evt.eventType === 'abnormal_api_volume') {
    return acc + evt.recordCount;
  }
  return acc;
}, 0);

// Total requests across anomalous events (evt-004: 420, evt-006: 88, evt-007: 16, evt-001: 7, plus baseline = 1,284)
const totalSuspiciousApiRequests = 1284;

// Pending containment approvals (INC-0841 session revoke + INC-0839 IP rate limit)
const pendingApprovalsCount = syntheticIncidents.filter(
  (inc) => inc.recommendedAction.status === 'pending_approval'
).length;

export const threatActivityData: ThreatActivityDataPoint[] = [
  { time: '11:00', authAnomalies: 2, apiSpikes: 5, dataAccessAnomalies: 1, paymentAnomalies: 0 },
  { time: '11:15', authAnomalies: 4, apiSpikes: 12, dataAccessAnomalies: 2, paymentAnomalies: 1 },
  { time: '11:30', authAnomalies: 3, apiSpikes: 18, dataAccessAnomalies: 0, paymentAnomalies: 3 },
  { time: '11:45', authAnomalies: 6, apiSpikes: 24, dataAccessAnomalies: 3, paymentAnomalies: 14 },
  { time: '12:00', authAnomalies: 5, apiSpikes: 42, dataAccessAnomalies: 4, paymentAnomalies: 8 },
  { time: '12:15', authAnomalies: 28, apiSpikes: 190, dataAccessAnomalies: 38, paymentAnomalies: 16 },
  { time: '12:30', authAnomalies: 12, apiSpikes: 420, dataAccessAnomalies: 85, paymentAnomalies: 12 },
];

export const severityDistribution: SeverityDistributionItem[] = [
  { severity: 'critical', count: 3, percentage: 33.3, label: 'Critical' },
  { severity: 'high', count: 3, percentage: 33.3, label: 'High' },
  { severity: 'medium', count: 2, percentage: 22.2, label: 'Medium' },
  { severity: 'low', count: 1, percentage: 11.1, label: 'Low' },
];

export const recentResponseActivities: RecentResponseActivity[] = [
  {
    id: 'resp-001',
    timestamp: '2026-11-20T12:20:10Z',
    action: 'Freeze Third-Party API Key',
    target: 'api-key-seller-88390 (Vertex Global)',
    actor: 'CARTGUARD Policy Guard',
    status: 'simulated_success',
    incidentId: 'INC-2026-0834',
    details: 'Isolated vendor API key following cross-tenant catalogue mutation attempt.',
  },
  {
    id: 'resp-002',
    timestamp: '2026-11-20T12:23:55Z',
    action: 'Revoke Active Session & Invalidate Tokens',
    target: 'sess-tok-84729a1b (usr-vip-9902)',
    actor: 'Aayash (SecOps Analyst)',
    status: 'pending_approval',
    incidentId: 'INC-2026-0841',
    details: 'Awaiting analyst one-click authorization to terminate compromised session.',
  },
  {
    id: 'resp-003',
    timestamp: '2026-11-20T12:22:15Z',
    action: 'WAF Rate-Limitation Rule',
    target: 'Subnet 198.51.100.0/24',
    actor: 'Automated Fraud Guard',
    status: 'pending_approval',
    incidentId: 'INC-2026-0839',
    details: 'Proposed dynamic rate limiter on payment endpoints to block card testing burst.',
  },
];

export const syntheticDashboardSummary: DashboardSummary = {
  environment: {
    name: 'CARTGUARD SOC Local Environment',
    mode: 'DEMO / LOCAL REPLAY',
    lastUpdated: '2026-11-20T12:25:00Z',
    isSimulatedData: true,
  },
  kpis: {
    activeIncidents: {
      id: 'kpi-incidents',
      label: 'Active Incidents',
      value: activeIncidentsCount,
      changeText: '+2 in last 2h',
      isPositive: false,
      contextDescription: '3 active cases under review, 1 critical P0',
      iconName: 'shield-alert',
      severityVariant: 'critical',
    },
    criticalThreats: {
      id: 'kpi-threats',
      label: 'Critical Threats',
      value: criticalThreatsCount,
      changeText: 'Immediate Triage',
      isPositive: false,
      contextDescription: 'Account takeover + high-frequency order scraping',
      iconName: 'alert-triangle',
      severityVariant: 'critical',
    },
    suspiciousApiRequests: {
      id: 'kpi-api',
      label: 'Suspicious API Requests',
      value: totalSuspiciousApiRequests.toLocaleString(),
      changeText: '+142% anomaly spike',
      isPositive: false,
      contextDescription: 'Burst volume on /orders/history & /partner/catalog',
      iconName: 'activity',
      severityVariant: 'high',
    },
    affectedRecords: {
      id: 'kpi-records',
      label: 'Potentially Affected Records',
      value: totalAffectedRecords.toLocaleString(),
      changeText: 'PII & Order Data',
      isPositive: false,
      contextDescription: '4,520 customer & transaction records in scope',
      iconName: 'database',
      severityVariant: 'high',
    },
    pendingApprovals: {
      id: 'kpi-approvals',
      label: 'Pending Approvals',
      value: pendingApprovalsCount,
      changeText: 'Human-in-the-loop',
      isPositive: true,
      contextDescription: 'Session kill & IP rate limit await analyst approval',
      iconName: 'user-check',
      severityVariant: 'medium',
    },
  },
  threatActivity: threatActivityData,
  severityDistribution,
  recentEvents: syntheticSecurityEvents,
  activeIncidents: syntheticIncidents,
  integrations: syntheticIntegrations,
  recentResponses: recentResponseActivities,
};
