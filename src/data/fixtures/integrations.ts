/**
 * CARTGUARD AI - Synthetic Integration Fixtures
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * NOTE:
 * Explicitly truthful integration telemetry. In accordance with project requirements,
 * all AWS/cloud provider connections are clearly flagged as SIMULATED or CONNECTED (UNTESTED).
 * Never present mock integrations as live production AWS services.
 */

import { Integration } from '../../types/integrations';

export const syntheticIntegrations: Integration[] = [
  {
    id: 'int-bedrock-01',
    name: 'Amazon Bedrock (Claude 3.5 Sonnet / Haiku)',
    serviceKey: 'bedrock',
    category: 'AI_INVESTIGATION',
    status: 'simulated',
    statusLabel: 'SIMULATED (LOCAL MOCK)',
    badgeVariant: 'warning',
    lastSyncTimestamp: '2026-11-20T12:20:00Z',
    latencyMs: 142,
    description: 'Local Mock Investigation Provider with deterministic e-commerce security prompt fallback.',
    disclaimer: 'AWS credentials pending. Running local deterministic security reasoning adapter.',
  },
  {
    id: 'int-cloudtrail-01',
    name: 'AWS CloudTrail Audit Stream',
    serviceKey: 'cloudtrail',
    category: 'AUDIT_LOGGING',
    status: 'connected_untested',
    statusLabel: 'CONNECTED (UNTESTED)',
    badgeVariant: 'info',
    lastSyncTimestamp: '2026-11-20T12:10:00Z',
    latencyMs: 310,
    description: 'Webhook listener endpoint provisioned for S3 and IAM audit events.',
    disclaimer: 'Payload receiver active. End-to-end ingestion pipeline unverified in local sandbox.',
  },
  {
    id: 'int-guardduty-01',
    name: 'Amazon GuardDuty Threat Intel',
    serviceKey: 'guardduty',
    category: 'THREAT_INTEL',
    status: 'simulated',
    statusLabel: 'SIMULATED',
    badgeVariant: 'neutral',
    lastSyncTimestamp: '2026-11-20T12:00:00Z',
    latencyMs: 85,
    description: 'Synthetic reconnaissance and anomaly detection signal generator.',
    disclaimer: 'Local mock feed emitting synthetic Tor exit node and credential anomaly findings.',
  },
  {
    id: 'int-config-01',
    name: 'AWS Config Compliance Posture',
    serviceKey: 'config',
    category: 'COMPLIANCE_POSTURE',
    status: 'simulated',
    statusLabel: 'SIMULATED',
    badgeVariant: 'neutral',
    lastSyncTimestamp: '2026-11-20T11:30:00Z',
    latencyMs: 215,
    description: 'Evaluates S3 bucket encryption, public access block and IAM credential rotation posture.',
    disclaimer: 'Local rule evaluator providing sample compliance posture signals.',
  },
];
