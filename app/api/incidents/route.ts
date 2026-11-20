import { NextRequest } from "next/server";
import { incidentStore } from "@/lib/store";
import { IncidentQueryParamsSchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/utils/api-response";

/**
 * GET /api/incidents
 * Lists security incidents with optional filtering by severity and status.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = IncidentQueryParamsSchema.parse({
      severity: searchParams.get("severity") || undefined,
      status: searchParams.get("status") || undefined,
      limit: searchParams.get("limit") || 20,
    });

    const incidents = await incidentStore.list(query);
    const totalCount = await incidentStore.count();

    return successResponse({
      incidents,
      totalCount,
      returnedCount: incidents.length,
    });
  } catch (error) {
    return handleApiError(error, "Failed to retrieve incidents");
  }
}
