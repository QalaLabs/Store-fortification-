/**
 * CARTGUARD AI - Centralized Frontend API Layer Types
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * Enforces explicit data modes:
 * - LIVE: Responses fetched from verified backend route handlers.
 * - DEMO: Responses backed by strongly-typed synthetic fixtures (never claims live).
 * - ERROR: Failed backend requests when in LIVE mode (never silently falls back).
 */

import { SecurityEvent, EventSeverity, EventSource, SecurityEventType, ResourceType, DataCategory } from '@/types/events';
import { Incident, IncidentStatus, IncidentType } from '@/types/incidents';
import { IncidentInvestigation, InvestigationProviderStatus } from '@/types/investigation';
import { ProposedResponseAction, ResponseAuditRecord, DryRunResult } from '@/types/response';
import { AgentPaymentTransaction } from '@/types/agentPayment';
import { DPDPControlItem, PCIDSSBoundaryControl, DataCategoryMapping, AccessPurposeMapping } from '@/types/compliance';
import { Integration } from '@/types/integrations';
import { DashboardSummary, ThreatActivityDataPoint, SeverityDistributionItem, RecentResponseActivity } from '@/types/dashboard';
import { DetectionRule } from '@/types/detection';

export type AuditHistoryRecord = ResponseAuditRecord;

export type DataMode = 'LIVE' | 'DEMO' | 'ERROR';
export type ApiModePreference = 'auto' | 'demo' | 'live';
export type DataSource = 'backend' | 'fixtures' | 'none';

export interface ApiResponse<T> {
  data: T;
  mode: DataMode;
  source: DataSource;
  error?: string;
  timestamp: string;
  latencyMs?: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export interface BackendHealthStatus {
  online: boolean;
  mode: DataMode;
  endpoint: string;
  version?: string;
  providerStatus: InvestigationProviderStatus;
  message?: string;
  checkedAt: string;
}

/* ---------------- Query & Mutation Contracts ---------------- */

export interface EventFilterParams {
  severity?: EventSeverity | 'all';
  source?: EventSource | 'all';
  eventType?: SecurityEventType | 'all';
  type?: SecurityEventType | 'all';
  search?: string;
  limit?: number;
}

export interface IncidentFilterParams {
  status?: IncidentStatus | 'all';
  severity?: EventSeverity | 'all';
  search?: string;
  sort?: 'riskScore' | 'latestActivity';
}

export interface IngestEventPayload {
  source: EventSource;
  eventType: SecurityEventType;
  severity: EventSeverity;
  sourceIp: string;
  endpoint: string;
  resourceType: ResourceType;
  recordCount?: number;
  dataCategory?: DataCategory;
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  details?: string;
  description?: string;
  rawPayload?: Record<string, unknown>;
}

export interface TriggerInvestigationPayload {
  incidentId: string;
  analystPrompt?: string;
}

export interface SubmitResponseDecisionPayload {
  actionId: string;
  decision: 'APPROVE' | 'REJECT';
  approver: string;
  notes?: string;
}

export interface SimulationResult {
  success: boolean;
  scenarioId: string;
  incidentId: string;
  eventsTriggered: number;
  timestamp: string;
  message: string;
}

export interface DashboardMetricsData {
  summary: DashboardSummary;
  threatActivity: ThreatActivityDataPoint[];
  severityDistribution: SeverityDistributionItem[];
  recentActivity: RecentResponseActivity[];
}

export interface GovernanceData {
  dpdpControls: DPDPControlItem[];
  pciControls: PCIDSSBoundaryControl[];
  dataCategories: DataCategoryMapping[];
  accessPurposes: AccessPurposeMapping[];
}
