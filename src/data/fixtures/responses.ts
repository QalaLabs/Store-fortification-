/**
 * CARTGUARD AI - Synthetic Response Centre & Audit Trail Fixtures
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * NOTE:
 * Explicitly structures actions through the required safety pipeline:
 * PROPOSE → DRY RUN → HUMAN APPROVAL → SIMULATED EXECUTION → AUDIT LOG
 * All executions are clearly labelled as simulated.
 */

import { ProposedResponseAction, ResponseAuditRecord } from '../../types/response';

export const syntheticProposedResponses: ProposedResponseAction[] = [
  {
    id: 'prop-act-001',
    incidentId: 'INC-2026-0841',
    incidentTitle: 'Account Takeover & Bulk Order History Extraction',
    category: 'CONTAIN',
    title: 'Terminate Session sess-tok-84729a1b & Invalidate Tokens',
    targetResource: 'res:session/sess-tok-84729a1b (usr-vip-9902)',
    description:
      'Immediately revokes active OAuth bearer tokens, terminates active e-commerce web session, and locks account pending customer identity re-verification.',
    proposedBy: 'CARTGUARD Correlation Engine (P0-RULE-ATO)',
    proposedTimestamp: '2026-11-20T12:24:00Z',
    stage: 'PENDING_APPROVAL',
    dryRun: {
      simulatedAt: '2026-11-20T12:24:02Z',
      expectedRiskReductionPercent: 96,
      estimatedBlastRadius: 'Isolated to single compromised session token',
      affectedLegitimateUsersEstimate: 0,
      targetedTokensCount: 1,
      sideEffectsWarning: 'Customer Victoria Sterling will be required to reset password on next visit.',
      rollbackPlan: 'Admin token re-issuance via verified support verification channel.',
    },
  },
  {
    id: 'prop-act-002',
    incidentId: 'INC-2026-0839',
    incidentTitle: 'Distributed Carding Attack & Checkout Velocity Spike',
    category: 'BLOCK',
    title: 'Deploy Dynamic Cloudflare WAF Rate-Limit on Subnet 198.51.100.0/24',
    targetResource: 'WAF Rule: /api/v1/checkout/process-payment (198.51.100.0/24)',
    description:
      'Throttles inbound payment authorization requests from offending proxy subnet to a maximum of 2 requests per minute with mandatory Cloudflare Turnstile challenge.',
    proposedBy: 'Automated Payment Fraud Guard',
    proposedTimestamp: '2026-11-20T12:21:30Z',
    stage: 'PENDING_APPROVAL',
    dryRun: {
      simulatedAt: '2026-11-20T12:21:35Z',
      expectedRiskReductionPercent: 88,
      estimatedBlastRadius: 'Subnet 198.51.100.0/24 restricted to payment endpoints',
      affectedLegitimateUsersEstimate: 0,
      targetedTokensCount: 0,
      sideEffectsWarning: 'Legitimate customers on shared carrier CGNAT within subnet may face Turnstile step-up.',
      rollbackPlan: 'Instant rule teardown via WAF API adapter with 30-second propagation.',
    },
  },
  {
    id: 'prop-act-003',
    incidentId: 'INC-2026-0834',
    incidentTitle: 'Third-Party Seller Partner Token Scope Abuse',
    category: 'CONTAIN',
    title: 'Quarantine Partner Seller API Key api-key-seller-88390',
    targetResource: 'res:token/api-key-seller-88390 (Vertex Global)',
    description:
      'Revokes merchant token access to catalog pricing endpoints following 88 consecutive cross-tenant 403 policy rejections.',
    proposedBy: 'CARTGUARD Policy Guard',
    proposedTimestamp: '2026-11-20T12:19:48Z',
    stage: 'EXECUTED_SIMULATED',
    dryRun: {
      simulatedAt: '2026-11-20T12:19:49Z',
      expectedRiskReductionPercent: 99,
      estimatedBlastRadius: 'Partner Vertex Global write access suspended',
      affectedLegitimateUsersEstimate: 0,
      targetedTokensCount: 1,
      rollbackPlan: 'Re-enable token in merchant partner portal after credentials rotation.',
    },
    approver: 'Aayash (SecOps Analyst)',
    approvalTimestamp: '2026-11-20T12:20:05Z',
    executionOutcome: {
      success: true,
      executedTimestamp: '2026-11-20T12:20:10Z',
      isSimulated: true,
      auditLogId: 'audit-log-2026-0834',
      summary: 'Simulated API key freeze executed successfully. Merchant notification webhook dispatched.',
    },
  },
];

export const syntheticAuditRecords: ResponseAuditRecord[] = [
  {
    auditId: 'aud-2026-1120-001',
    timestamp: '2026-11-20T12:20:10Z',
    actionId: 'prop-act-003',
    incidentId: 'INC-2026-0834',
    category: 'CONTAIN',
    actionTitle: 'Quarantine Partner Seller API Key api-key-seller-88390',
    actor: 'Aayash (SecOps Analyst)',
    actionState: 'SIMULATED_SUCCESS',
    details: 'Isolated vendor API key following cross-tenant catalogue mutation attempt. Dry-run blast radius verified.',
    immutableHash: 'sha256:4f89d31190bc128e0892f3aa6e01a89b782910c0e',
  },
  {
    auditId: 'aud-2026-1120-002',
    timestamp: '2026-11-20T11:50:00Z',
    actionId: 'prop-act-000',
    incidentId: 'INC-2026-0830',
    category: 'ALERT',
    actionTitle: 'Dispatch Security Digest to Merchant Risk Committee',
    actor: 'System Policy Engine',
    actionState: 'SIMULATED_SUCCESS',
    details: 'Automated hourly digest dispatched covering 3 active correlated incidents.',
    immutableHash: 'sha256:912bc099182377fae12089acbd66219800a73891d',
  },
];
