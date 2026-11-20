/**
 * CARTGUARD AI - Response Centre & Audit Trail Contracts
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * Enforces the strict response workflow:
 * PROPOSE → DRY RUN → HUMAN APPROVAL → SIMULATED EXECUTION → AUDIT LOG
 */

export type ResponseActionCategory = 'BLOCK' | 'ALERT' | 'CONTAIN';

export type ResponseStage =
  | 'PROPOSED'
  | 'DRY_RUN_COMPLETED'
  | 'PENDING_APPROVAL'
  | 'APPROVED_SIMULATED'
  | 'REJECTED'
  | 'EXECUTED_SIMULATED';

export interface DryRunResult {
  simulatedAt: string;
  expectedRiskReductionPercent: number;
  estimatedBlastRadius: string;
  affectedLegitimateUsersEstimate: number;
  targetedTokensCount: number;
  sideEffectsWarning?: string;
  rollbackPlan: string;
}

export interface ProposedResponseAction {
  id: string;
  incidentId: string;
  incidentTitle: string;
  category: ResponseActionCategory;
  title: string;
  targetResource: string;
  description: string;
  proposedBy: string;
  proposedTimestamp: string;
  stage: ResponseStage;
  dryRun: DryRunResult;
  approver?: string;
  approvalTimestamp?: string;
  rejectionReason?: string;
  executionOutcome?: {
    success: boolean;
    executedTimestamp: string;
    isSimulated: boolean;
    auditLogId: string;
    summary: string;
  };
}

export interface ResponseAuditRecord {
  auditId: string;
  timestamp: string;
  actionId: string;
  incidentId: string;
  category: ResponseActionCategory;
  actionTitle: string;
  actor: string;
  actionState: 'SIMULATED_SUCCESS' | 'REJECTED' | 'PROPOSED';
  details: string;
  immutableHash: string;
}
