import { NextRequest } from "next/server";
import { auditStore } from "@/lib/store";
import { AuditQueryParamsSchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/audit
 * Returns immutable audit log entries detailing event ingestion,
 * detection runs, response proposals, analyst decisions, and simulations.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = AuditQueryParamsSchema.parse({
      limit: searchParams.get("limit") || 50,
      action: searchParams.get("action") || undefined,
      actor: searchParams.get("actor") || undefined,
    });

    const entries = await auditStore.list(query);
    const totalCount = await auditStore.count();

    return successResponse({
      entries,
      totalCount,
      returnedCount: entries.length,
    });
  } catch (error) {
    return handleApiError(error, "Failed to retrieve audit log entries");
  }
}
