import { NextRequest } from "next/server";
import { eventStore, auditStore } from "@/lib/store";
import { IngestEventInputSchema, EventQueryParamsSchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { detectionEngine } from "@/lib/rules";
import { eventCorrelator } from "@/lib/correlate";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/events
 * Real Deterministic Pipeline:
 * Incoming Event → Zod Validation → Normalization → Storage → R1–R5 Detection →
 * Correlation → Risk Scoring → Incident Create/Update → Audit Log
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Zod Validation
    const body = await request.json();
    const validated = IngestEventInputSchema.parse(body);

    // 2. Normalization
    const fullEvent = {
      ...validated,
      id: validated.id || `evt_${crypto.randomUUID().slice(0, 12)}`,
      timestamp: validated.timestamp || new Date().toISOString(),
    };

    // 3. Storage (Valid event must be stored even if it generates no detection)
    const savedEvent = await eventStore.add(fullEvent);

    // Fetch recent events for temporal lookback context (15-30 min window)
    const recentEvents = await eventStore.list({ limit: 100 });

    // 4. R1–R5 Deterministic Detection Engine
    const findings = await detectionEngine.evaluate(savedEvent, {
      recentEvents,
      windowMs: 15 * 60 * 1000,
    });

    // 5. Correlation & Risk Scoring
    let correlationResult = null;
    if (findings.length > 0) {
      correlationResult = await eventCorrelator.correlate(savedEvent, findings);
    }

    // 6. Audit Logging
    // Log event ingestion
    await auditStore.log({
      id: `aud_${crypto.randomUUID().slice(0, 12)}`,
      timestamp: new Date().toISOString(),
      action: "EVENT_INGESTED",
      actor: "API_INGEST",
      entityType: "EVENT",
      entityId: savedEvent.id,
      details: `Security event ${savedEvent.eventType} ingested from ${savedEvent.sourceIp}`,
      metadata: {
        eventType: savedEvent.eventType,
        endpoint: savedEvent.endpoint,
        findingsCount: findings.length,
      },
    });

    // Log incident creation or update if triggered
    if (correlationResult) {
      const isNew = correlationResult.isNewIncident;
      await auditStore.log({
        id: `aud_${crypto.randomUUID().slice(0, 12)}`,
        timestamp: new Date().toISOString(),
        action: isNew ? "INCIDENT_CREATED" : "INCIDENT_UPDATED",
        actor: "CORRELATION_ENGINE",
        entityType: "INCIDENT",
        entityId: correlationResult.incident.id,
        details: `${isNew ? "Created" : "Updated"} incident ${correlationResult.incident.id}: ${correlationResult.incident.title} (Risk: ${correlationResult.incident.riskScore}, Severity: ${correlationResult.incident.severity})`,
        metadata: {
          incidentId: correlationResult.incident.id,
          riskScore: correlationResult.incident.riskScore,
          severity: correlationResult.incident.severity,
          eventCount: correlationResult.incident.eventIds.length,
          rulesTriggered: findings.map((f) => f.ruleId),
        },
      });
    }

    return successResponse(
      {
        event: savedEvent,
        findings,
        incident: correlationResult ? correlationResult.incident : null,
        isNewIncident: correlationResult ? correlationResult.isNewIncident : false,
        pipelineStatus: "PROCESSED_DETERMINISTIC_PIPELINE",
      },
      201
    );
  } catch (error) {
    return handleApiError(error, "Failed to ingest and process security event");
  }
}

/**
 * GET /api/events
 * Lists ingested security events with optional filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = EventQueryParamsSchema.parse({
      limit: searchParams.get("limit") || 50,
      eventType: searchParams.get("eventType") || undefined,
      sourceIp: searchParams.get("sourceIp") || undefined,
      userId: searchParams.get("userId") || undefined,
    });

    const events = await eventStore.list(query);
    const totalCount = await eventStore.count();

    return successResponse({
      events,
      totalCount,
      returnedCount: events.length,
    });
  } catch (error) {
    return handleApiError(error, "Failed to retrieve security events");
  }
}
