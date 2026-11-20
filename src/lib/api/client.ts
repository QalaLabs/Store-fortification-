/**
 * CARTGUARD AI - Centralized Frontend API Client
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * Implements strict data mode governance:
 * - LIVE: Talks to verified backend route handlers.
 * - DEMO: Reliably backed by frozen synthetic fixtures without silent fabrication.
 * - ERROR: Accurately reflects network or API errors when in LIVE mode.
 */

import {
  DataMode,
  ApiModePreference,
  DataSource,
  ApiResponse,
  BackendHealthStatus,
  EventFilterParams,
  IncidentFilterParams,
  IngestEventPayload,
  TriggerInvestigationPayload,
  SubmitResponseDecisionPayload,
  SimulationResult,
  GovernanceData,
  DashboardMetricsData,
} from './types';

import { SecurityEvent } from '@/types/events';
import { Incident, IncidentStatus } from '@/types/incidents';
import { IncidentInvestigation } from '@/types/investigation';
import { ProposedResponseAction, ResponseAuditRecord, DryRunResult } from '@/types/response';
import { AgentPaymentTransaction } from '@/types/agentPayment';
import { DPDPControlItem, PCIDSSBoundaryControl, DataCategoryMapping, AccessPurposeMapping } from '@/types/compliance';
import { Integration } from '@/types/integrations';
import { DetectionRule } from '@/types/detection';

// Import validated synthetic fixtures as fallback providers
import {
  syntheticSecurityEvents as fixtureEvents,
  syntheticIncidents as fixtureIncidents,
  syntheticInvestigations as fixtureInvestigations,
  syntheticProposedResponses as fixtureProposedActions,
  syntheticAuditRecords as fixtureAuditHistory,
  syntheticAgentTransactions as fixtureAgentPayments,
  dpdpReadinessControls as fixtureDPDPControls,
  pciDSSBoundaryControls as fixturePCIControls,
  personalDataCategories as fixtureDataCategories,
  accessPurposeMappings as fixtureAccessPurposes,
  syntheticDetectionRules as fixtureDetectionRules,
  syntheticIntegrations as fixtureIntegrations,
  syntheticDashboardSummary as fixtureDashboardSummary,
  threatActivityData as fixtureThreatActivity,
  severityDistribution as fixtureSeverityDist,
  recentResponseActivities as fixtureRecentActivity,
} from '@/data/fixtures';

class CartGuardApiClient {
  private baseUrl: string;
  private modePreference: ApiModePreference;
  private timeoutMs: number;

  // In-memory local stores for consistent simulated state during demo session
  private stateEvents: SecurityEvent[] = [...fixtureEvents];
  private stateIncidents: Incident[] = [...fixtureIncidents];
  private stateProposals: ProposedResponseAction[] = [...fixtureProposedActions];
  private stateAudit: ResponseAuditRecord[] = [...fixtureAuditHistory];
  private stateAgentPayments: AgentPaymentTransaction[] = [...fixtureAgentPayments];

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const envMode = (process.env.NEXT_PUBLIC_DATA_MODE?.toLowerCase() as ApiModePreference) || 'auto';
    this.modePreference = ['auto', 'demo', 'live'].includes(envMode) ? envMode : 'auto';
    this.timeoutMs = 4000;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getModePreference(): ApiModePreference {
    return this.modePreference;
  }

  public setModePreference(mode: ApiModePreference): void {
    this.modePreference = mode;
  }

  /**
   * Safe fetch executor with mode-aware branching:
   * - In 'live' mode: attempts backend call; on failure returns ERROR response. NEVER fabricates.
   * - In 'demo' mode: immediately returns fallback fixture with DEMO status.
   * - In 'auto' mode: attempts backend call; on connection failure gracefully falls back to DEMO fixtures.
   */
  private async execute<T>(
    endpoint: string,
    options: RequestInit | undefined,
    fallbackFactory: () => T
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();

    // Forced demo mode
    if (this.modePreference === 'demo') {
      return {
        data: fallbackFactory(),
        mode: 'DEMO',
        source: 'fixtures',
        timestamp: new Date().toISOString(),
        latencyMs: 15,
      };
    }

    // Attempt live fetch
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      return {
        data: (json.data !== undefined ? json.data : json) as T,
        mode: 'LIVE',
        source: 'backend',
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      // In strict LIVE mode, fail transparently without silent fabrication
      if (this.modePreference === 'live') {
        return {
          data: fallbackFactory(), // provided for type safety but flagged as ERROR mode
          mode: 'ERROR',
          source: 'none',
          error: `Live backend call failed (${errorMessage}). Check backend service at ${this.baseUrl}.`,
          timestamp: new Date().toISOString(),
          latencyMs: Date.now() - startTime,
        };
      }

      // In AUTO mode, fall back cleanly to synthetic fixtures with clear DEMO labelling
      return {
        data: fallbackFactory(),
        mode: 'DEMO',
        source: 'fixtures',
        error: `Backend unreachable (${errorMessage}); operating in DEMO mode with verified fixtures.`,
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
      };
    }
  }

  /* ---------------- Health & Provider Status ---------------- */

  public async checkHealth(): Promise<BackendHealthStatus> {
    const timestamp = new Date().toISOString();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${this.baseUrl}/health`, { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const body = await res.json().catch(() => ({}));
        return {
          online: true,
          mode: 'LIVE',
          endpoint: this.baseUrl,
          version: body.version || '1.0.0',
          providerStatus: body.providerStatus || 'MOCK',
          checkedAt: timestamp,
          message: 'Backend API connected and operational.',
        };
      }
    } catch {
      // Backend not listening
    }

    return {
      online: false,
      mode: 'DEMO',
      endpoint: this.baseUrl,
      providerStatus: 'MOCK',
      checkedAt: timestamp,
      message: 'Backend API offline. Operating in synthetic demo mode with strongly-typed fixtures.',
    };
  }

  /* ---------------- Events Domain ---------------- */

  public events = {
    list: async (filters?: EventFilterParams): Promise<ApiResponse<SecurityEvent[]>> => {
      const query = new URLSearchParams();
      if (filters?.severity && filters.severity !== 'all') query.set('severity', filters.severity);
      if (filters?.source && filters.source !== 'all') query.set('source', filters.source);
      if (filters?.type && filters.type !== 'all') query.set('type', filters.type);
      if (filters?.search) query.set('search', filters.search);
      if (filters?.limit) query.set('limit', String(filters.limit));

      const path = `/events${query.toString() ? `?${query.toString()}` : ''}`;
      return this.execute(path, { method: 'GET' }, () => {
        let events = [...this.stateEvents];
        if (filters?.severity && filters.severity !== 'all') {
          events = events.filter((e) => e.severity === filters.severity);
        }
        if (filters?.source && filters.source !== 'all') {
          events = events.filter((e) => e.source === filters.source);
        }
        if (filters?.type && filters.type !== 'all') {
          events = events.filter((e) => e.eventType === filters.type);
        }
        if (filters?.eventType && filters.eventType !== 'all') {
          events = events.filter((e) => e.eventType === filters.eventType);
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          events = events.filter(
            (e) =>
              e.id.toLowerCase().includes(q) ||
              (e.description && e.description.toLowerCase().includes(q)) ||
              e.sourceIp.includes(q) ||
              e.endpoint.toLowerCase().includes(q)
          );
        }
        if (filters?.limit) {
          events = events.slice(0, filters.limit);
        }
        return events;
      });
    },

    getById: async (id: string): Promise<ApiResponse<SecurityEvent | null>> => {
      return this.execute(`/events/${id}`, { method: 'GET' }, () => {
        return this.stateEvents.find((e) => e.id === id) || null;
      });
    },

    ingest: async (payload: IngestEventPayload): Promise<ApiResponse<SecurityEvent>> => {
      return this.execute(
        '/events',
        { method: 'POST', body: JSON.stringify(payload) },
        () => {
          const newEvent: SecurityEvent = {
            id: `evt-${String(this.stateEvents.length + 1).padStart(3, '0')}`,
            timestamp: new Date().toISOString(),
            source: payload.source,
            eventType: payload.eventType,
            severity: payload.severity,
            sourceIp: payload.sourceIp,
            endpoint: payload.endpoint || '/api/v1/resource',
            httpMethod: 'POST',
            responseStatus: 200,
            requestCount: 1,
            resourceType: payload.resourceType || 'customer_account',
            recordCount: payload.recordCount || 1,
            dataCategory: payload.dataCategory || 'OPERATIONAL',
            userId: payload.userId,
            userEmail: payload.userEmail,
            sessionId: payload.sessionId,
            description: payload.description || payload.details || 'Manually ingested event',
            metadata: payload.rawPayload as Record<string, string | number | boolean | null> | undefined,
          };
          this.stateEvents = [newEvent, ...this.stateEvents];
          return newEvent;
        }
      );
    },
  };

  /* ---------------- Incidents Domain ---------------- */

  public incidents = {
    list: async (filters?: IncidentFilterParams): Promise<ApiResponse<Incident[]>> => {
      const query = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') query.set('status', filters.status);
      if (filters?.severity && filters.severity !== 'all') query.set('severity', filters.severity);
      if (filters?.search) query.set('search', filters.search);
      if (filters?.sort) query.set('sort', filters.sort);

      const path = `/incidents${query.toString() ? `?${query.toString()}` : ''}`;
      return this.execute(path, { method: 'GET' }, () => {
        let result = [...this.stateIncidents];
        if (filters?.status && filters.status !== 'all') {
          result = result.filter((inc) => inc.status === filters.status);
        }
        if (filters?.severity && filters.severity !== 'all') {
          result = result.filter((inc) => inc.severity === filters.severity);
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(
            (inc) =>
              inc.id.toLowerCase().includes(q) ||
              inc.title.toLowerCase().includes(q) ||
              inc.affectedIdentities.some((id) => id.toLowerCase().includes(q))
          );
        }
        if (filters?.sort === 'riskScore') {
          result.sort((a, b) => b.riskScore - a.riskScore);
        } else if (filters?.sort === 'latestActivity') {
          result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
        return result;
      });
    },

    getById: async (id: string): Promise<ApiResponse<Incident | null>> => {
      return this.execute(`/incidents/${id}`, { method: 'GET' }, () => {
        return this.stateIncidents.find((inc) => inc.id === id) || null;
      });
    },

    updateStatus: async (id: string, status: IncidentStatus): Promise<ApiResponse<Incident>> => {
      return this.execute(
        `/incidents/${id}`,
        { method: 'PATCH', body: JSON.stringify({ status }) },
        () => {
          const idx = this.stateIncidents.findIndex((inc) => inc.id === id);
          if (idx >= 0) {
            const updated: Incident = {
              ...this.stateIncidents[idx],
              status,
              updatedAt: new Date().toISOString(),
            };
            this.stateIncidents[idx] = updated;
            return updated;
          }
          throw new Error(`Incident ${id} not found`);
        }
      );
    },
  };

  /* ---------------- AI Investigation Domain ---------------- */

  public investigation = {
    getForIncident: async (incidentId: string): Promise<ApiResponse<IncidentInvestigation>> => {
      return this.execute(`/incidents/${incidentId}/investigation`, { method: 'GET' }, () => {
        const inv = fixtureInvestigations[incidentId] || fixtureInvestigations['INC-2026-0841'];
        return inv;
      });
    },

    trigger: async (payload: TriggerInvestigationPayload): Promise<ApiResponse<IncidentInvestigation>> => {
      return this.execute(
        `/incidents/${payload.incidentId}/investigate`,
        { method: 'POST', body: JSON.stringify(payload) },
        () => {
          const baseInv = fixtureInvestigations[payload.incidentId] || fixtureInvestigations['INC-2026-0841'];
          return {
            ...baseInv,
            executiveSummary: payload.analystPrompt
              ? `[Custom Query Answered] Based on correlated evidence: ${payload.analystPrompt}. Correlated signals confirm unauthorized exfiltration patterns.`
              : baseInv.executiveSummary,
          };
        }
      );
    },
  };

  /* ---------------- Response & Decisions Domain ---------------- */

  public response = {
    listProposals: async (): Promise<ApiResponse<ProposedResponseAction[]>> => {
      return this.execute('/responses/proposals', { method: 'GET' }, () => {
        return [...this.stateProposals];
      });
    },

    getDryRun: async (actionId: string): Promise<ApiResponse<DryRunResult>> => {
      return this.execute(`/responses/dry-run/${actionId}`, { method: 'GET' }, () => {
        const action = this.stateProposals.find((p) => p.id === actionId);
        return action?.dryRun || fixtureProposedActions[0].dryRun;
      });
    },

    submitDecision: async (
      payload: SubmitResponseDecisionPayload
    ): Promise<ApiResponse<{ action: ProposedResponseAction; auditRecord: ResponseAuditRecord }>> => {
      return this.execute(
        '/responses/decisions',
        { method: 'POST', body: JSON.stringify(payload) },
        () => {
          const actionIdx = this.stateProposals.findIndex((p) => p.id === payload.actionId);
          const timestamp = new Date().toISOString();

          let targetAction: ProposedResponseAction;
          if (actionIdx >= 0) {
            targetAction = {
              ...this.stateProposals[actionIdx],
              stage: payload.decision === 'APPROVE' ? 'APPROVED_SIMULATED' : 'REJECTED',
              approver: payload.approver,
              approvalTimestamp: timestamp,
              rejectionReason: payload.decision === 'REJECT' ? payload.notes || 'Declined by analyst' : undefined,
              executionOutcome:
                payload.decision === 'APPROVE'
                  ? {
                      success: true,
                      executedTimestamp: timestamp,
                      isSimulated: true,
                      auditLogId: `AUDIT-${Date.now()}`,
                      summary: `Simulated containment executed: ${payload.notes || 'Policy enforced'}`,
                    }
                  : undefined,
            };
            this.stateProposals[actionIdx] = targetAction;
          } else {
            throw new Error(`Action ${payload.actionId} not found`);
          }

          // Append to audit ledger
          const newAuditEntry: ResponseAuditRecord = {
            auditId: `AUDIT-2026-${String(this.stateAudit.length + 100).padStart(4, '0')}`,
            timestamp,
            actionId: targetAction.id,
            incidentId: targetAction.incidentId,
            category: targetAction.category,
            actionTitle: targetAction.title,
            actor: payload.approver,
            actionState: payload.decision === 'APPROVE' ? 'SIMULATED_SUCCESS' : 'REJECTED',
            details: `Analyst decision: ${payload.decision} on ${targetAction.title}. Target: ${targetAction.targetResource}. Note: ${payload.notes || 'None'}`,
            immutableHash: `sha256-sim-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
          };

          this.stateAudit = [newAuditEntry, ...this.stateAudit];

          return {
            action: targetAction,
            auditRecord: newAuditEntry,
          };
        }
      );
    },
  };

  /* ---------------- Audit History Domain ---------------- */

  public audit = {
    list: async (): Promise<ApiResponse<ResponseAuditRecord[]>> => {
      return this.execute('/responses/audit', { method: 'GET' }, () => {
        return [...this.stateAudit];
      });
    },

    record: async (entry: Partial<ResponseAuditRecord>): Promise<ApiResponse<ResponseAuditRecord>> => {
      return this.execute(
        '/responses/audit',
        { method: 'POST', body: JSON.stringify(entry) },
        () => {
          const record: ResponseAuditRecord = {
            auditId: `AUDIT-2026-${String(this.stateAudit.length + 100).padStart(4, '0')}`,
            timestamp: new Date().toISOString(),
            actionId: entry.actionId || 'ACT-CUSTOM',
            incidentId: entry.incidentId || 'INC-2026-0841',
            category: entry.category || 'CONTAIN',
            actionTitle: entry.actionTitle || 'Manual Security Intervention',
            actor: entry.actor || 'Aayash (SecOps Lead)',
            actionState: entry.actionState || 'SIMULATED_SUCCESS',
            details: entry.details || 'Manual action recorded in audit log',
            immutableHash: `sha256-sim-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
          };
          this.stateAudit = [record, ...this.stateAudit];
          return record;
        }
      );
    },
  };

  /* ---------------- Scenario Simulation Domain ---------------- */

  public simulation = {
    runPrimaryAttack: async (): Promise<ApiResponse<SimulationResult>> => {
      return this.execute('/simulation/primary-attack', { method: 'POST' }, () => {
        // Ensure primary incident INC-2026-0841 exists in open state
        const inc = this.stateIncidents.find((i) => i.id === 'INC-2026-0841');
        if (inc) {
          inc.status = 'open';
          inc.updatedAt = new Date().toISOString();
        }

        return {
          success: true,
          scenarioId: 'SCENARIO-ATO-EXFIL-01',
          incidentId: 'INC-2026-0841',
          eventsTriggered: 9,
          timestamp: new Date().toISOString(),
          message:
            'Attack scenario sequence (Credential Stuffing → Suspicious Session → API Abuse → Order Exfiltration) triggered successfully.',
        };
      });
    },

    reset: async (): Promise<ApiResponse<{ success: boolean }>> => {
      return this.execute('/simulation/reset', { method: 'POST' }, () => {
        this.stateEvents = [...fixtureEvents];
        this.stateIncidents = [...fixtureIncidents];
        this.stateProposals = [...fixtureProposedActions];
        this.stateAudit = [...fixtureAuditHistory];
        this.stateAgentPayments = [...fixtureAgentPayments];
        return { success: true };
      });
    },
  };

  /* ---------------- Agent Payments Domain (R8) ---------------- */

  public agentPayments = {
    list: async (): Promise<ApiResponse<AgentPaymentTransaction[]>> => {
      return this.execute('/agents/payments', { method: 'GET' }, () => {
        return [...this.stateAgentPayments];
      });
    },

    getById: async (id: string): Promise<ApiResponse<AgentPaymentTransaction | null>> => {
      return this.execute(`/agents/payments/${id}`, { method: 'GET' }, () => {
        return this.stateAgentPayments.find((tx) => tx.id === id) || null;
      });
    },

    verify: async (transactionId: string): Promise<ApiResponse<AgentPaymentTransaction>> => {
      return this.execute(
        '/agents/verify',
        { method: 'POST', body: JSON.stringify({ transactionId }) },
        () => {
          const tx = this.stateAgentPayments.find((t) => t.id === transactionId);
          if (!tx) throw new Error(`Transaction ${transactionId} not found`);
          return tx;
        }
      );
    },
  };

  /* ---------------- Governance & Compliance Domain ---------------- */

  public governance = {
    getCompliance: async (): Promise<
      ApiResponse<{ dpdpControls: DPDPControlItem[]; pciControls: PCIDSSBoundaryControl[] }>
    > => {
      return this.execute('/governance/compliance', { method: 'GET' }, () => ({
        dpdpControls: [...fixtureDPDPControls],
        pciControls: [...fixturePCIControls],
      }));
    },

    getPrivacy: async (): Promise<
      ApiResponse<{ dataCategories: DataCategoryMapping[]; accessPurposes: AccessPurposeMapping[] }>
    > => {
      return this.execute('/governance/privacy', { method: 'GET' }, () => ({
        dataCategories: [...fixtureDataCategories],
        accessPurposes: [...fixtureAccessPurposes],
      }));
    },
  };

  /* ---------------- Detection & System Domain ---------------- */

  public detection = {
    listRules: async (): Promise<ApiResponse<DetectionRule[]>> => {
      return this.execute('/threats/rules', { method: 'GET' }, () => [...fixtureDetectionRules]);
    },
  };

  public system = {
    getIntegrations: async (): Promise<ApiResponse<Integration[]>> => {
      return this.execute('/system/integrations', { method: 'GET' }, () => [...fixtureIntegrations]);
    },

    getDashboardMetrics: async (): Promise<ApiResponse<DashboardMetricsData>> => {
      return this.execute('/dashboard/metrics', { method: 'GET' }, () => ({
        summary: fixtureDashboardSummary,
        threatActivity: [...fixtureThreatActivity],
        severityDistribution: [...fixtureSeverityDist],
        recentActivity: [...fixtureRecentActivity],
      }));
    },
  };
}

// Global API client singleton
export const apiClient = new CartGuardApiClient();
