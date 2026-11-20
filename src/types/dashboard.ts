/**
 * CARTGUARD AI - Dashboard View State & Aggregation Types
 * Team: QALA LABS | E-Commerce Security Operations
 */

import { SecurityEvent, EventSeverity } from './events';
import { Incident } from './incidents';
import { Integration } from './integrations';

export interface KPICardData {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  changeText: string;
  isPositive: boolean;
  contextDescription: string;
  iconName: 'shield-alert' | 'alert-triangle' | 'activity' | 'database' | 'user-check';
  severityVariant?: EventSeverity | 'neutral';
}

export interface ThreatActivityDataPoint {
  time: string;
  authAnomalies: number;
  apiSpikes: number;
  dataAccessAnomalies: number;
  paymentAnomalies: number;
}

export interface SeverityDistributionItem {
  severity: EventSeverity;
  count: number;
  percentage: number;
  label: string;
}

export interface RecentResponseActivity {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  actor: string;
  status: 'simulated_success' | 'pending_approval' | 'reverted';
  incidentId: string;
  details: string;
}

export interface DashboardSummary {
  environment: {
    name: string;
    mode: 'DEMO / LOCAL REPLAY' | 'AWS HYBRID';
    lastUpdated: string;
    isSimulatedData: boolean;
  };
  kpis: {
    activeIncidents: KPICardData;
    criticalThreats: KPICardData;
    suspiciousApiRequests: KPICardData;
    affectedRecords: KPICardData;
    pendingApprovals: KPICardData;
  };
  threatActivity: ThreatActivityDataPoint[];
  severityDistribution: SeverityDistributionItem[];
  recentEvents: SecurityEvent[];
  activeIncidents: Incident[];
  integrations: Integration[];
  recentResponses: RecentResponseActivity[];
}
