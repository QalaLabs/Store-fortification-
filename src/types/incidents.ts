/**
 * CARTGUARD AI - Incident & Investigation Types
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * NOTE FOR INTEGRATION:
 * Frontend contract for correlated incidents. Designed to map 1:1 with
 * backend correlation engine results once APIs are wired up.
 */

import { EventSeverity } from './events';

export type IncidentStatus = 'open' | 'investigating' | 'containment_pending' | 'contained' | 'resolved';

export type IncidentType =
  | 'ACCOUNT_TAKEOVER_API_ABUSE'
  | 'SUSPICIOUS_PAYMENT_ACTIVITY'
  | 'SELLER_API_EXPOSURE'
  | 'BULK_DATA_SCRAPING'
  | 'PRIVILEGE_ESCALATION';

export interface TimelineEntry {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'detection' | 'correlation' | 'investigation' | 'containment' | 'user_action';
  actor?: string;
  severity?: EventSeverity;
}

export interface RecommendedAction {
  id: string;
  actionType: 'REVOKE_SESSION' | 'RATE_LIMIT_IP' | 'FREEZE_API_KEY' | 'FLAG_FRAUD_TRANSACTION' | 'NOTIFY_CUSTOMER';
  label: string;
  description: string;
  requiresApproval: boolean;
  status: 'pending_approval' | 'executed' | 'cancelled';
  riskReduction: string;
}

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  severity: EventSeverity;
  status: IncidentStatus;
  createdAt: string; // ISO 8601
  updatedAt: string;
  affectedIdentities: string[];
  affectedResources: string[];
  relatedEventIds: string[];
  evidenceSummary: string;
  riskScore: number; // 0 - 100
  recommendedAction: RecommendedAction;
  timeline: TimelineEntry[];
  aiAnalysisSummary?: string;
  complianceImpact?: {
    dpdpAligned: boolean;
    pciScope: boolean;
    details: string;
  };
}
