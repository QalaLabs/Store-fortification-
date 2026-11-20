/**
 * CARTGUARD AI - Governance, Compliance & Privacy Types
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * STRICT LANGUAGE GUARDRAIL:
 * In accordance with QALA LABS compliance guidelines:
 * - Use strictly: "DPDP-aligned readiness and controls"
 * - NEVER claim: full DPDP compliance, DPDP certification, or registered Consent Manager
 * - PCI DSS scope applies only to cardholder data interfaces (tokenized checkout)
 */

export interface DPDPControlItem {
  id: string;
  sectionCode: string;
  name: string;
  description: string;
  readinessStatus: 'READINESS_ALIGNED' | 'REVIEW_REQUIRED' | 'PARTIAL_CONTROLS';
  evidenceAvailable: boolean;
  evidenceRef?: string;
  auditFrequency: string;
  lastReviewed: string;
  notes: string;
}

export interface PCIDSSBoundaryControl {
  requirement: string;
  scopeStatus: 'IN_SCOPE_TOKENIZED' | 'ISOLATED_SANDBOX' | 'OUT_OF_SCOPE';
  description: string;
  tamperProtectionActive: boolean;
  lastVerification: string;
}

export interface DataCategoryMapping {
  category: string;
  fields: string[];
  sensitivity: 'HIGH_PII' | 'FINANCIAL_TOKEN' | 'OPERATIONAL' | 'SELLER_CREDENTIAL';
  retentionPeriod: string;
  encryptionStatus: 'AES-256-GCM' | 'TOKENIZED_VAULT' | 'IN_TRANSIT_TLS13';
}

export interface AccessPurposeMapping {
  id: string;
  serviceOrRole: string;
  dataCategory: string;
  permittedPurpose: string;
  actualDestination: string;
  isDestinationApproved: boolean;
  anomalyDetected: boolean;
  associatedIncidentId?: string;
}

export interface PrivacyIncidentReference {
  id: string;
  incidentId: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedRecords: number;
  dataCategory: string;
  regulatoryNoticeDrafted: boolean;
  reportedTimestamp: string;
}
