import { NextRequest } from "next/server";
import { ScenarioNameSchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { eventStore, auditStore } from "@/lib/store";
import { detectionEngine } from "@/lib/rules";
import { eventCorrelator } from "@/lib/correlate";
import { SecurityEvent } from "@/lib/types";
import crypto from "crypto";

interface RouteParams {
  params: Promise<{ scenario: string }>;
}

/**
 * Generates canonical S1 synthetic event stream:
 * Account Takeover + API Abuse (Credential stuffing -> Success -> Bulk API reads -> Unapproved export)
 */
function createS1SyntheticEvents(baseTime = new Date()): Omit<SecurityEvent, "id">[] {
  const t0 = new Date(baseTime.getTime() - 10 * 60 * 1000).toISOString();
  const t1 = new Date(baseTime.getTime() - 8 * 60 * 1000).toISOString();
  const t2 = new Date(baseTime.getTime() - 6 * 60 * 1000).toISOString();
  const t3 = new Date(baseTime.getTime() - 4 * 60 * 1000).toISOString();
  const t4 = new Date(baseTime.getTime() - 2 * 60 * 1000).toISOString();
  const t5 = baseTime.toISOString();

  const victimUser = "usr_cust_44";
  const attackerIp = "198.51.100.25";
  const victimSession = "sess_atk_99182";

  return [
    {
      timestamp: t0,
      source: "storefront",
      eventType: "auth.login.failed",
      userId: victimUser,
      sessionId: victimSession,
      sourceIp: attackerIp,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      accountRole: "customer",
      endpoint: "/api/v1/auth/login",
      httpMethod: "POST",
      responseStatus: 401,
      requestCount: 1,
      recordCount: 0,
      dataCategory: "PII",
      metadata: { failureReason: "INVALID_CREDENTIALS", attempt: 1 },
    },
    {
      timestamp: t1,
      source: "storefront",
      eventType: "auth.login.failed",
      userId: victimUser,
      sessionId: victimSession,
      sourceIp: attackerIp,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      accountRole: "customer",
      endpoint: "/api/v1/auth/login",
      httpMethod: "POST",
      responseStatus: 401,
      requestCount: 1,
      recordCount: 0,
      dataCategory: "PII",
      metadata: { failureReason: "INVALID_CREDENTIALS", attempt: 2 },
    },
    {
      timestamp: t2,
      source: "storefront",
      eventType: "auth.login.failed",
      userId: victimUser,
      sessionId: victimSession,
      sourceIp: attackerIp,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      accountRole: "customer",
      endpoint: "/api/v1/auth/login",
      httpMethod: "POST",
      responseStatus: 401,
      requestCount: 1,
      recordCount: 0,
      dataCategory: "PII",
      metadata: { failureReason: "INVALID_CREDENTIALS", attempt: 3 },
    },
    {
      timestamp: t3,
      source: "storefront",
      eventType: "auth.login.success",
      userId: victimUser,
      sessionId: victimSession,
      sourceIp: attackerIp,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      accountRole: "customer",
      endpoint: "/api/v1/auth/login",
      httpMethod: "POST",
      responseStatus: 200,
      requestCount: 1,
      recordCount: 1,
      dataCategory: "PII",
      metadata: { authMethod: "PASSWORD_OVERRIDE" },
    },
    {
      timestamp: t4,
      source: "api-gateway",
      eventType: "api.request",
      userId: victimUser,
      sessionId: victimSession,
      sourceIp: attackerIp,
      userAgent: "python-requests/2.31.0",
      accountRole: "customer",
      endpoint: "/api/v1/orders",
      httpMethod: "GET",
      responseStatus: 200,
      requestCount: 25,
      recordCount: 50,
      resourceType: "orders",
      dataCategory: "ORDER",
      metadata: { scriptDetected: true },
    },
    {
      timestamp: t5,
      source: "api-gateway",
      eventType: "data.export",
      userId: victimUser,
      sessionId: victimSession,
      sourceIp: attackerIp,
      userAgent: "python-requests/2.31.0",
      accountRole: "customer",
      endpoint: "/api/v1/customers/export",
      httpMethod: "POST",
      responseStatus: 200,
      requestCount: 1,
      recordCount: 150,
      resourceType: "customer_profile",
      dataCategory: "PII",
      destination: "https://exfil-dropzone.attacker-domain.cc/dump",
      approvedDestination: false,
      metadata: { format: "json", encrypted: false },
    },
  ];
}

/**
 * POST /api/simulate/[scenario]
 * Replays security scenario (s1, s2, s3, or s4).
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { scenario } = await params;
    const validatedScenario = ScenarioNameSchema.parse(scenario.toLowerCase());

    if (validatedScenario === "s1") {
      const syntheticEvents = createS1SyntheticEvents();
      const ingestedEvents: SecurityEvent[] = [];
      let finalIncident = null;

      for (const eventData of syntheticEvents) {
        const fullEvent: SecurityEvent = {
          ...eventData,
          id: `evt_s1_${crypto.randomUUID().slice(0, 8)}`,
        };

        const saved = await eventStore.add(fullEvent);
        ingestedEvents.push(saved);

        const recentEvents = await eventStore.list({ limit: 50 });

        const findings = await detectionEngine.evaluate(saved, {
          recentEvents,
          windowMs: 15 * 60 * 1000,
        });

        if (findings.length > 0) {
          const correlation = await eventCorrelator.correlate(saved, findings);
          if (correlation) {
            finalIncident = correlation.incident;
          }
        }

        await auditStore.log({
          id: `aud_${crypto.randomUUID().slice(0, 10)}`,
          timestamp: new Date().toISOString(),
          action: "SIMULATION_EVENT_REPLAYED",
          actor: "SIMULATOR:S1",
          entityType: "EVENT",
          entityId: saved.id,
          details: `Replayed S1 event ${saved.eventType} (${saved.endpoint})`,
          metadata: { scenario: "s1", eventType: saved.eventType },
        });
      }

      return successResponse({
        scenario: "s1",
        title: "S1: Account takeover plus API abuse",
        eventsIngestedCount: ingestedEvents.length,
        incident: finalIncident,
        message: "Scenario S1 replayed successfully through live detection and correlation pipeline.",
      });
    }

    // Placeholders for S2, S3, S4
    const scenarioDescriptions: Record<string, string> = {
      s2: "S2: Seller API data exposure (partner token accessing customer data beyond authorized scope)",
      s3: "S3: Marketing consent drift (data used beyond explicit customer DPDP consent parameters)",
      s4: "S4: Agent payment verification mismatch (mandate, expiry, limit, and merchant scope)",
    };

    return successResponse({
      scenario: validatedScenario,
      title: scenarioDescriptions[validatedScenario],
      status: "READY_FOR_PHASE_02_SIMULATION_GENERATOR",
      message: `Scenario '${validatedScenario}' validated. Generator hooks in /lib/scenarios scheduled for Aashirwad.`,
    });
  } catch (error) {
    return handleApiError(error, "Failed to execute scenario simulation");
  }
}
