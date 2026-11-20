/**
 * CARTGUARD AI - Synthetic Compliance & Privacy Fixtures
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * NOTE:
 * Uses strictly qualified language: "DPDP-aligned readiness and controls."
 * Does not make unsupported claims of legal compliance certification or registered consent manager status.
 */

import {
  DPDPControlItem,
  PCIDSSBoundaryControl,
  DataCategoryMapping,
  AccessPurposeMapping,
  PrivacyIncidentReference,
} from '../../types/compliance';

export const dpdpReadinessControls: DPDPControlItem[] = [
  {
    id: 'dpdp-ctrl-01',
    sectionCode: 'DPDP-SEC-04',
    name: 'Data Fiduciary Notice & Purpose Specification',
    description: 'Clear itemized notification to data principals before personal data collection at checkout or account creation.',
    readinessStatus: 'READINESS_ALIGNED',
    evidenceAvailable: true,
    evidenceRef: 'doc:notice-spec-v2.1',
    auditFrequency: 'Continuous Telemetry',
    lastReviewed: '2026-11-20T10:00:00Z',
    notes: 'Prototype purpose specification active across e-commerce registration workflows.',
  },
  {
    id: 'dpdp-ctrl-02',
    sectionCode: 'DPDP-SEC-06',
    name: 'Consent Withdrawal & Purpose Limitation Controls',
    description: 'Ability for customer to withdraw marketing and analytics consent with deterministic downstream processing halt.',
    readinessStatus: 'READINESS_ALIGNED',
    evidenceAvailable: true,
    evidenceRef: 'svc:consent-tracker-event-stream',
    auditFrequency: 'Daily Audit',
    lastReviewed: '2026-11-19T18:00:00Z',
    notes: 'Internal purpose limiter active. Not registered with DPDP board as an external Consent Manager.',
  },
  {
    id: 'dpdp-ctrl-03',
    sectionCode: 'DPDP-SEC-08',
    name: 'Reasonable Security Safeguards & Breach Logging',
    description: 'Continuous logging of unauthorized access, automated stuffing attacks, and bulk exfiltration events with 72-hour readiness drafting.',
    readinessStatus: 'REVIEW_REQUIRED',
    evidenceAvailable: true,
    evidenceRef: 'inc:INC-2026-0841',
    auditFrequency: 'Real-time Event Hook',
    lastReviewed: '2026-11-20T12:25:00Z',
    notes: 'Triggered by Incident INC-2026-0841 (4,520 records). Breach assessment protocol draft generated.',
  },
  {
    id: 'dpdp-ctrl-04',
    sectionCode: 'DPDP-SEC-09',
    name: 'Third-Party Processor & Seller Data Boundaries',
    description: 'Enforcement of access scope limits preventing marketplace sellers from harvesting non-tenant customer personal data.',
    readinessStatus: 'READINESS_ALIGNED',
    evidenceAvailable: true,
    evidenceRef: 'inc:INC-2026-0834',
    auditFrequency: 'Per-Request Policy Check',
    lastReviewed: '2026-11-20T12:20:00Z',
    notes: 'Policy guard automatically quarantined seller token api-key-seller-88390 upon boundary breach attempt.',
  },
  {
    id: 'dpdp-ctrl-05',
    sectionCode: 'DPDP-SEC-12',
    name: 'Grievance Redressal & Right to Erasure Pipeline',
    description: 'Staged API pipeline to support customer data erasure requests across order, session, and profile databases.',
    readinessStatus: 'PARTIAL_CONTROLS',
    evidenceAvailable: false,
    auditFrequency: 'Monthly Review',
    lastReviewed: '2026-11-10T00:00:00Z',
    notes: 'Data deletion orchestration script in testing; requires manual database administrator approval.',
  },
];

export const pciDSSBoundaryControls: PCIDSSBoundaryControl[] = [
  {
    requirement: 'PCI DSS Req 3.4 (Cardholder Data Protection)',
    scopeStatus: 'OUT_OF_SCOPE',
    description: 'Raw Primary Account Numbers (PAN) and sensitive authentication data (CVV) are not stored or handled by core servers.',
    tamperProtectionActive: true,
    lastVerification: '2026-11-20T12:00:00Z',
  },
  {
    requirement: 'PCI DSS Req 6.4 (Payment Page Script Integrity)',
    scopeStatus: 'IN_SCOPE_TOKENIZED',
    description: 'Payment iframe hosted on isolated payment service provider vault. WAF rate-limiting protects against carding bursts.',
    tamperProtectionActive: true,
    lastVerification: '2026-11-20T12:21:00Z',
  },
  {
    requirement: 'PCI DSS Req 10.2 (Audit Trail for Payment Interfaces)',
    scopeStatus: 'IN_SCOPE_TOKENIZED',
    description: 'All authorization failures and velocity events logged with immutable SHA-256 telemetry hashes.',
    tamperProtectionActive: true,
    lastVerification: '2026-11-20T12:22:00Z',
  },
];

export const personalDataCategories: DataCategoryMapping[] = [
  {
    category: 'Customer PII',
    fields: ['Full Name', 'Primary Email', 'Mobile Phone', 'Delivery Address', 'Tax ID'],
    sensitivity: 'HIGH_PII',
    retentionPeriod: '3 Years (or until consent withdrawal)',
    encryptionStatus: 'AES-256-GCM',
  },
  {
    category: 'Payment Tokens',
    fields: ['Gateway Token Ref', 'Card Brand', 'Last 4 Digits', 'Cardholder Name Match'],
    sensitivity: 'FINANCIAL_TOKEN',
    retentionPeriod: '1 Year post transaction',
    encryptionStatus: 'TOKENIZED_VAULT',
  },
  {
    category: 'Order History & Telemetry',
    fields: ['Order ID', 'Item SKUs', 'Cart Value', 'IP Geolocation', 'User Agent Fingerprint'],
    sensitivity: 'OPERATIONAL',
    retentionPeriod: '5 Years for tax audit',
    encryptionStatus: 'AES-256-GCM',
  },
  {
    category: 'Seller & Partner Credentials',
    fields: ['Partner ID', 'OAuth Client Secret Hash', 'Scoped Endpoint Permissions'],
    sensitivity: 'SELLER_CREDENTIAL',
    retentionPeriod: 'Rotated every 90 days',
    encryptionStatus: 'AES-256-GCM',
  },
];

export const accessPurposeMappings: AccessPurposeMapping[] = [
  {
    id: 'apm-01',
    serviceOrRole: 'Checkout Engine',
    dataCategory: 'Payment Tokens & Delivery Address',
    permittedPurpose: 'Order fulfilment and payment settlement',
    actualDestination: 'Secure Payment Vault (Stripe / Adyen Sandbox)',
    isDestinationApproved: true,
    anomalyDetected: false,
  },
  {
    id: 'apm-02',
    serviceOrRole: 'Customer Support Portal',
    dataCategory: 'Customer Profile & Order History',
    permittedPurpose: 'Customer grievance redressal and return processing',
    actualDestination: 'Internal Support CRM (Encrypted TLS1.3)',
    isDestinationApproved: true,
    anomalyDetected: false,
  },
  {
    id: 'apm-03',
    serviceOrRole: 'Compromised Session (usr-vip-9902)',
    dataCategory: 'Customer PII & Historical Orders',
    permittedPurpose: 'Self-service account view',
    actualDestination: 'External Unapproved IP 198.51.100.42 (Bucharest, RO)',
    isDestinationApproved: false,
    anomalyDetected: true,
    associatedIncidentId: 'INC-2026-0841',
  },
  {
    id: 'apm-04',
    serviceOrRole: 'Partner Seller Gateway (Vertex Global)',
    dataCategory: 'Marketplace Product Pricing',
    permittedPurpose: 'Merchant inventory update',
    actualDestination: 'Cross-Tenant Product Catalog API',
    isDestinationApproved: false,
    anomalyDetected: true,
    associatedIncidentId: 'INC-2026-0834',
  },
];

export const privacyIncidentReferences: PrivacyIncidentReference[] = [
  {
    id: 'prv-inc-01',
    incidentId: 'INC-2026-0841',
    title: 'Unauthorized Batch PII and Order History Exfiltration',
    severity: 'critical',
    affectedRecords: 4520,
    dataCategory: 'Customer PII & Order History',
    regulatoryNoticeDrafted: true,
    reportedTimestamp: '2026-11-20T12:23:45Z',
  },
];
