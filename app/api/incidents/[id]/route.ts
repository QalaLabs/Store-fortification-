import { NextRequest } from "next/server";
import { incidentStore, eventStore } from "@/lib/store";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-response";
import { SecurityEvent } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/incidents/[id]
 * Retrieves a single incident by ID along with its associated security events.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const incident = await incidentStore.getById(id);

    if (!incident) {
      return errorResponse("NOT_FOUND", `Incident with ID '${id}' was not found`, 404);
    }

    // Resolve associated events
    const events: SecurityEvent[] = [];
    for (const eventId of incident.eventIds) {
      const evt = await eventStore.getById(eventId);
      if (evt) {
        events.push(evt);
      }
    }

    return successResponse({
      incident,
      events,
    });
  } catch (error) {
    return handleApiError(error, "Failed to retrieve incident details");
  }
}
