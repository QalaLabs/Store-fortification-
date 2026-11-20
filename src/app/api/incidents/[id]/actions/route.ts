import { NextRequest } from "next/server";
import { incidentStore, actionStore, auditStore } from "@/lib/store";
import { ProposeActionInputSchema } from "@/lib/validation";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-response";
import { ResponseAction } from "@/lib/types";
import crypto from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/incidents/[id]/actions
 * Proposes a containment, block, or alert response action with a projected dry-run calculation.
 * All proposed actions require explicit human approval prior to simulation or execution.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const incident = await incidentStore.getById(id);

    if (!incident) {
      return errorResponse("NOT_FOUND", `Incident with ID '${id}' was not found`, 404);
    }

    const body = await request.json();
    const validated = ProposeActionInputSchema.parse({
      ...body,
      incidentId: id,
    });

    const actionId = `act_${crypto.randomUUID().slice(0, 12)}`;

    // Dry-run calculation
    const isContainment = validated.actionType === "CONTAIN";
    const dryRunResult = {
      targetEntity: validated.targetEntity,
      impactedUsers: incident.affectedUserIds.length || 1,
      impactedSessions: incident.affectedSessions.length || 1,
      blastRadius: isContainment ? ("MINIMAL" as const) : ("MODERATE" as const),
      estimatedDowntimeMinutes: 0,
      summary: isContainment
        ? `Tarpit and deception mode proposed for entity ${validated.targetEntity}. Zero customer disruption.`
        : `Access restriction proposed for entity ${validated.targetEntity}.`,
      projectedEffect: `Defensive mitigation for incident ${incident.id} with human authorization.`,
    };

    const action: ResponseAction = {
      id: actionId,
      incidentId: incident.id,
      actionType: validated.actionType,
      status: "PROPOSED",
      proposedAt: new Date().toISOString(),
      dryRunResult,
      approvalMetadata: {
        decision: "PENDING",
      },
      auditReferences: [],
    };

    const savedAction = await actionStore.create(action);

    const auditEntry = await auditStore.log({
      id: `aud_${crypto.randomUUID().slice(0, 12)}`,
      timestamp: new Date().toISOString(),
      action: "ACTION_PROPOSED",
      actor: "ANALYST_OR_SYSTEM",
      entityType: "RESPONSE_ACTION",
      entityId: savedAction.id,
      details: `Proposed ${validated.actionType} for incident ${incident.id}: ${validated.reason}`,
      metadata: { actionId: savedAction.id, incidentId: incident.id, dryRun: dryRunResult },
    });

    await actionStore.update(savedAction.id, {
      auditReferences: [auditEntry.id],
    });

    return successResponse(
      {
        action: { ...savedAction, auditReferences: [auditEntry.id] },
        message: "Response action proposed with dry-run analysis. Awaiting human approval.",
      },
      201
    );
  } catch (error) {
    return handleApiError(error, "Failed to propose response action");
  }
}
