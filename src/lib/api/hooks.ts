'use client';

/**
 * CARTGUARD AI - Centralized Frontend API Hooks
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * Exposes strongly typed data-fetching and mutation adapters.
 * Every hook provides:
 * - data
 * - isLoading
 * - error (if any)
 * - mode ('LIVE' | 'DEMO' | 'ERROR')
 * - source ('backend' | 'fixtures' | 'none')
 * - refetch()
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './client';
import {
  DataMode,
  DataSource,
  EventFilterParams,
  IncidentFilterParams,
  IngestEventPayload,
  TriggerInvestigationPayload,
  SubmitResponseDecisionPayload,
  DashboardMetricsData,
  SimulationResult,
} from './types';

import { SecurityEvent } from '@/types/events';
import { Incident, IncidentStatus } from '@/types/incidents';
import { IncidentInvestigation } from '@/types/investigation';
import { ProposedResponseAction, ResponseAuditRecord, DryRunResult } from '@/types/response';
import { AgentPaymentTransaction } from '@/types/agentPayment';
import { DPDPControlItem, PCIDSSBoundaryControl, DataCategoryMapping, AccessPurposeMapping } from '@/types/compliance';
import { Integration } from '@/types/integrations';
import { DetectionRule } from '@/types/detection';

/* ---------------- 1. Dashboard Metrics Hook ---------------- */

export function useDashboardData() {
  const [data, setData] = useState<DashboardMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DataMode>('DEMO');
  const [source, setSource] = useState<DataSource>('fixtures');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.system.getDashboardMetrics();
      setData(res.data);
      setMode(res.mode);
      setSource(res.source);
      setError(res.error || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setMode('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mode, source, refetch: fetchData };
}

/* ---------------- 2. Events Hook ---------------- */

export function useEvents(filters?: EventFilterParams) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DataMode>('DEMO');
  const [source, setSource] = useState<DataSource>('fixtures');

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.events.list(filters);
      setEvents(res.data);
      setMode(res.mode);
      setSource(res.source);
      setError(res.error || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setMode('ERROR');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.severity, filters?.source, filters?.type, filters?.search, filters?.limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const ingestEvent = async (payload: IngestEventPayload) => {
    const res = await apiClient.events.ingest(payload);
    if (res.data) {
      setEvents((prev) => [res.data, ...prev]);
    }
    return res;
  };

  return { events, isLoading, error, mode, source, refetch: fetchEvents, ingestEvent };
}

/* ---------------- 3. Incidents Hook ---------------- */

export function useIncidents(filters?: IncidentFilterParams) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DataMode>('DEMO');
  const [source, setSource] = useState<DataSource>('fixtures');

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.incidents.list(filters);
      setIncidents(res.data);
      setMode(res.mode);
      setSource(res.source);
      setError(res.error || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setMode('ERROR');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.severity, filters?.search, filters?.sort]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return { incidents, isLoading, error, mode, source, refetch: fetchIncidents };
}

/* ---------------- 4. Single Incident Hook ---------------- */

export function useIncident(id: string) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DataMode>('DEMO');
  const [source, setSource] = useState<DataSource>('fixtures');

  const fetchIncident = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await apiClient.incidents.getById(id);
      setIncident(res.data);
      setMode(res.mode);
      setSource(res.source);
      setError(res.error || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setMode('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  const updateStatus = async (status: IncidentStatus) => {
    const res = await apiClient.incidents.updateStatus(id, status);
    if (res.data) {
      setIncident(res.data);
    }
    return res;
  };

  return { incident, isLoading, error, mode, source, refetch: fetchIncident, updateStatus };
}

/* ---------------- 5. AI Investigation Hook ---------------- */

export function useInvestigation(incidentId: string) {
  const [investigation, setInvestigation] = useState<IncidentInvestigation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DataMode>('DEMO');
  const [source, setSource] = useState<DataSource>('fixtures');

  const fetchInvestigation = useCallback(async () => {
    if (!incidentId) return;
    setIsLoading(true);
    try {
      const res = await apiClient.investigation.getForIncident(incidentId);
      setInvestigation(res.data);
      setMode(res.mode);
      setSource(res.source);
      setError(res.error || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setMode('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchInvestigation();
  }, [fetchInvestigation]);

  const triggerInvestigation = async (payload: TriggerInvestigationPayload) => {
    setIsLoading(true);
    try {
      const res = await apiClient.investigation.trigger(payload);
      setInvestigation(res.data);
      setMode(res.mode);
      setSource(res.source);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  return { investigation, isLoading, error, mode, source, refetch: fetchInvestigation, triggerInvestigation };
}

/* ---------------- 6. Response Centre & Decisions Hook ---------------- */

export function useResponseCentre() {
  const [proposals, setProposals] = useState<ProposedResponseAction[]>([]);
  const [auditHistory, setAuditHistory] = useState<ResponseAuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DataMode>('DEMO');
  const [source, setSource] = useState<DataSource>('fixtures');

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [proposalsRes, auditRes] = await Promise.all([
        apiClient.response.listProposals(),
        apiClient.audit.list(),
      ]);
      setProposals(proposalsRes.data);
      setAuditHistory(auditRes.data);
      setMode(proposalsRes.mode);
      setSource(proposalsRes.source);
      setError(proposalsRes.error || auditRes.error || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setMode('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const submitDecision = async (payload: SubmitResponseDecisionPayload) => {
    const res = await apiClient.response.submitDecision(payload);
    if (res.data) {
      // Refresh local state with returned action & audit record
      setProposals((prev) =>
        prev.map((p) => (p.id === payload.actionId ? res.data.action : p))
      );
      setAuditHistory((prev) => [res.data.auditRecord, ...prev]);
    }
    return res;
  };

  const getDryRun = async (actionId: string): Promise<DryRunResult> => {
    const res = await apiClient.response.getDryRun(actionId);
    return res.data;
  };

  return {
    proposals,
    auditHistory,
    isLoading,
    error,
    mode,
    source,
    refetch: refreshAll,
    submitDecision,
    getDryRun,
  };
}

/* ---------------- 7. Scenario Simulation Hook ---------------- */

export function useSimulation() {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null);

  const runPrimaryAttack = async () => {
    setIsSimulating(true);
    try {
      const res = await apiClient.simulation.runPrimaryAttack();
      setLastResult(res.data);
      return res;
    } finally {
      setIsSimulating(false);
    }
  };

  const resetSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await apiClient.simulation.reset();
      setLastResult(null);
      return res;
    } finally {
      setIsSimulating(false);
    }
  };

  return { isSimulating, lastResult, runPrimaryAttack, resetSimulation };
}

/* ---------------- 8. Agent Payments Hook (R8) ---------------- */

export function useAgentPayments() {
  const [transactions, setTransactions] = useState<AgentPaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DataMode>('DEMO');
  const [source, setSource] = useState<DataSource>('fixtures');

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.agentPayments.list();
      setTransactions(res.data);
      setMode(res.mode);
      setSource(res.source);
      setError(res.error || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setMode('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const verifyTransaction = async (id: string) => {
    const res = await apiClient.agentPayments.verify(id);
    return res;
  };

  return { transactions, isLoading, error, mode, source, refetch: fetchPayments, verifyTransaction };
}

/* ---------------- 9. Governance Hook ---------------- */

export function useGovernance() {
  const [dpdpControls, setDpdpControls] = useState<DPDPControlItem[]>([]);
  const [pciControls, setPciControls] = useState<PCIDSSBoundaryControl[]>([]);
  const [dataCategories, setDataCategories] = useState<DataCategoryMapping[]>([]);
  const [accessPurposes, setAccessPurposes] = useState<AccessPurposeMapping[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DataMode>('DEMO');

  const fetchGovernance = useCallback(async () => {
    setIsLoading(true);
    try {
      const [compRes, privRes] = await Promise.all([
        apiClient.governance.getCompliance(),
        apiClient.governance.getPrivacy(),
      ]);
      setDpdpControls(compRes.data.dpdpControls);
      setPciControls(compRes.data.pciControls);
      setDataCategories(privRes.data.dataCategories);
      setAccessPurposes(privRes.data.accessPurposes);
      setMode(compRes.mode);
      setError(compRes.error || privRes.error || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setMode('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGovernance();
  }, [fetchGovernance]);

  return {
    dpdpControls,
    pciControls,
    dataCategories,
    accessPurposes,
    isLoading,
    error,
    mode,
    refetch: fetchGovernance,
  };
}

/* ---------------- 10. Detection Rules Hook ---------------- */

export function useDetectionRules() {
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DataMode>('DEMO');

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.detection.listRules();
      setRules(res.data);
      setMode(res.mode);
      setError(res.error || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setMode('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return { rules, isLoading, error, mode, refetch: fetchRules };
}

/* ---------------- 11. Integrations Hook ---------------- */

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DataMode>('DEMO');

  const fetchIntegrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.system.getIntegrations();
      setIntegrations(res.data);
      setMode(res.mode);
      setError(res.error || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setMode('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return { integrations, isLoading, error, mode, refetch: fetchIntegrations };
}
