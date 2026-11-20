/**
 * CARTGUARD AI - Integration Health & Telemetry Contracts
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * NOTE:
 * Accurately reflects provider availability status according to QALA LABS Buildathon spec.
 * Never claim mock/simulated providers are live AWS services.
 */

export type IntegrationStatus =
  | 'live_verified'
  | 'connected_untested'
  | 'simulated'
  | 'unavailable';

export interface Integration {
  id: string;
  name: string;
  serviceKey: 'bedrock' | 'cloudtrail' | 'guardduty' | 'config';
  category: 'AI_INVESTIGATION' | 'AUDIT_LOGGING' | 'THREAT_INTEL' | 'COMPLIANCE_POSTURE';
  status: IntegrationStatus;
  statusLabel: string;
  badgeVariant: 'success' | 'warning' | 'info' | 'neutral' | 'error';
  lastSyncTimestamp: string;
  latencyMs: number;
  description: string;
  disclaimer: string;
  docsUrl?: string;
}
