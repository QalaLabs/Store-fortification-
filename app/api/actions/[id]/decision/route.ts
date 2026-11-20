import { NextRequest } from "next/server";
import { actionStore, auditStore } from "@/lib/store";
import { ActionDecisionInputSchema } from "@/lib/validation";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-response";
import crypto from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/actions/[id]/decision
 * Governance workflow:
 * - Approves or rejects a proposed response action.
 * - Supports safe handling of duplicate decisions (idempotency).
 * - Supports action reversal workflow (e.g. lifting containment or reversing a block).
 * - All executions remain simulated (no real destructive infrastructure modification).
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const action = await actionStore.getById(id);

    if (!action) {
      return errorResponse("NOT_FOUND", `Response action with ID '${id}' was not found`, 404);
    }

    const body = await request.json();
    const decision = ActionDecisionInputSchema.parse(body);

    const now = new Date().toISOString();

    // 1. Safe handling of duplicate decisions (Idempotency Guard)
    if (action.approvalMetadata.decision === decision.decision) {
      return successResponse({
        action,
        decision: decision.decision,
        simulatedExecution: action.simulatedExecutionResult,
        message: `Action was already ${decision.decision}. No redundant execution performed.`,
        isDuplicateDecision: true,
      });
    }

    // 2. Reversal Workflow
    if (decision.decision === "REVERSED") {
      if (action.status !== "EXECUTED" && action.status !== "APPROVED") {
        return errorResponse(
          "INVALID_STATE_TRANSITION",
          `Cannot reverse an action with status '${action.status}'. Only APPROVED or EXECUTED actions can be reversed.`,
          400
        );
      }

      const reversalExecutionResult = {
        simulated: true as const,
        executedAt: now,
        success: true,
        simulatedOutput: `[SIMULATION] Action ${action.actionType} reversed by ${decision.decidedBy}: Defensive containment / block lifted for ${action.dryRunResult.targetEntity}. Normal traffic parameters restored.`,
        containmentModeActive: false,
      };

      const auditEntry = await auditStore.log({
        id: `aud_${crypto.randomUUID().slice(0, 12)}`,
        timestamp: now,
        action: "ACTION_REVERSED",
        actor: `ANALYST:${decision.decidedBy}`,
        entityType: "RESPONSE_ACTION",
        entityId: action.id,
        details: `Reversed action ${action.id} (${action.actionType}) by ${decision.decidedBy}: ${decision.comments || "No comments"}`,
        metadata: {
          actionId: action.id,
          incidentId: action.incidentId,
          previousDecision: action.approvalMetadata.decision,
          newDecision: "REVERSED",
          comments: decision.comments,
        },
      });

      const updatedAction = await actionStore.update(action.id, {
        status: "REJECTED", // Action is neutralized
        approvalMetadata: {
          decision: "REVERSED",
          decidedBy: decision.decidedBy,
          decidedAt: now,
          comments: decision.comments || "Action reversed by analyst",
        },
        simulatedExecutionResult: reversalExecutionResult,
        auditReferences: [...action.auditReferences, auditEntry.id],
      });

      return successResponse({
        action: updatedAction,
        decision: "REVERSED",
        simulatedExecution: reversalExecutionResult,
        message: "Action reversed successfully. Simulated containment or block lifted.",
      });
    }

    // 3. Approval or Rejection Workflow
    const isApproved = decision.decision === "APPROVED";
    let simulatedExecutionResult = undefined;
    const newStatus: typeof action.status = isApproved ? "EXECUTED" : "REJECTED";

    if (isApproved) {
      const isContainment = action.actionType === "CONTAIN";
      simulatedExecutionResult = {
        simulated: true as const,
        executedAt: now,
        success: true,
        simulatedOutput: isContainment
          ? `[SIMULATION] Defensive containment active for ${action.dryRunResult.targetEntity}: 5000ms tarpit delay applied, honeypot synthetic data served, request thresholds tightened.`
          : `[SIMULATION] Action ${action.actionType} successfully simulated for ${action.dryRunResult.targetEntity}. Target isolated.`,
        containmentModeActive: isContainment,
        containmentDetails: isContainment
          ? {
              tarpittingDelayMs: 5000,
              honeypotActive: true,
              tightenedRulesActive: true,
            }
          : undefined,
      };
    }

    const auditEntry = await auditStore.log({
      id: `aud_${crypto.randomUUID().slice(0, 12)}`,
      timestamp: now,
      action: isApproved ? "ACTION_APPROVED_AND_EXECUTED" : "ACTION_REJECTED",
      actor: `ANALYST:${decision.decidedBy}`,
      entityType: "RESPONSE_ACTION",
      entityId: action.id,
      details: `${decision.decision} for action ${action.id} (${action.actionType}) by ${decision.decidedBy}`,
      metadata: {
        actionId: action.id,
        incidentId: action.incidentId,
        decision: decision.decision,
        comments: decision.comments,
      },
    });

    const updatedAction = await actionStore.update(action.id, {
      status: newStatus,
      approvalMetadata: {
        decision: decision.decision,
        decidedBy: decision.decidedBy,
        decidedAt: now,
        comments: decision.comments || null,
      },
      simulatedExecutionResult,
      auditReferences: [...action.auditReferences, auditEntry.id],
    });

    return successResponse({
      action: updatedAction,
      decision: decision.decision,
      simulatedExecution: simulatedExecutionResult,
      message: isApproved
        ? "Action approved and simulated execution completed safely."
        : "Action rejected by analyst.",
    });
  } catch (error) {
    return handleApiError(error, "Failed to record action decision");
  }
}
