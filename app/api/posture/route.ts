import { NextRequest } from "next/server";
import { incidentStore, eventStore, actionStore } from "@/lib/store";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { SecurityPosture } from "@/lib/types";

/**
 * GET /api/posture
 * Aggregates live system-wide threat metrics and operational counts.
 */
export async function GET(_request: NextRequest) {
  try {
    const [incidents, eventsCount, actions] = await Promise.all([
      incidentStore.getAll(),
      eventStore.count(),
      actionStore.getAll(),
    ]);

    const activeIncidents = incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED");
    const criticalIncidents = activeIncidents.filter((i) => i.severity === "CRITICAL");
    const pendingApprovals = actions.filter((a) => a.status === "PROPOSED");

    const totalRisk = activeIncidents.reduce((sum, inc) => sum + inc.riskScore, 0);
    const averageRiskScore = activeIncidents.length > 0 ? Math.round(totalRisk / activeIncidents.length) : 0;

    let overallStatus: SecurityPosture["overallStatus"] = "HEALTHY";
    if (criticalIncidents.length > 0 || averageRiskScore >= 75) {
      overallStatus = "CRITICAL";
    } else if (activeIncidents.length > 0 || averageRiskScore >= 40) {
      overallStatus = "ELEVATED";
    }

    const posture: SecurityPosture = {
      overallStatus,
      activeIncidentsCount: activeIncidents.length,
      criticalIncidentsCount: criticalIncidents.length,
      totalEventsProcessed: eventsCount,
      pendingApprovalsCount: pendingApprovals.length,
      averageRiskScore,
      lastUpdated: new Date().toISOString(),
      ruleTriggersCount: {},
    };

    return successResponse(posture);
  } catch (error) {
    return handleApiError(error, "Failed to compute security posture");
  }
}
