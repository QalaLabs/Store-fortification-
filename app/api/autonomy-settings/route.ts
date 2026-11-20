import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { AutonomySettings } from "@/lib/types";

/**
 * GET /api/autonomy-settings
 * Returns current autonomy thresholds and human-in-the-loop policies.
 * Autonomous response is disabled by design in this release.
 */
export async function GET(_request: NextRequest) {
  try {
    const settings: AutonomySettings = {
      autonomousResponseEnabled: false,
      allowedAutonomousActions: ["BLOCK", "CONTAIN"],
      minimumRiskScoreThreshold: 95,
      humanApprovalRequired: true,
      gracePeriodSeconds: 120,
      documentationNotice:
        "CartGuard AI enforces human-in-the-loop response execution. Autonomous destructive response is disabled by design. Every response action in the demo requires explicit human approval.",
    };

    return successResponse(settings);
  } catch (error) {
    return handleApiError(error, "Failed to retrieve autonomy settings");
  }
}
