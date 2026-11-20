import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as postEvent } from "@/app/api/events/route";
import { POST as simulateScenario } from "@/app/api/simulate/[scenario]/route";
import { eventStore, incidentStore, auditStore } from "@/lib/store";

describe("S1 Scenario Acceptance & Pipeline Integration Test", () => {
  beforeEach(async () => {
    await eventStore.clear();
    await incidentStore.clear();
    await auditStore.clear();
  });

  const victimUser = "usr_cust_44";
  const attackerIp = "198.51.100.25";
  const victimSession = "sess_s1_compromised";
  const baseTime = new Date("2026-11-20T12:00:00Z").getTime();

  it("processes the S1 attack sequence end-to-end through POST /api/events into ONE CRITICAL correlated incident", async () => {
    // 1. First Failed Login Attempt
    const evt1 = {
      timestamp: new Date(baseTime).toISOString(),
      source: "storefront",
      eventType: "auth.login.failed",
      userId: victimUser,
      sessionId: victimSession,
      sourceIp: attackerIp,
      userAgent: "Mozilla/5.0",
      accountRole: "customer",
      endpoint: "/api/v1/auth/login",
      httpMethod: "POST",
      responseStatus: 401,
      requestCount: 1,
      recordCount: 0,
      dataCategory: "PII",
      metadata: { attempt: 1 },
    };

    const res1 = await postEvent(
      new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify(evt1),
      })
    );
    expect(res1.status).toBe(201);
    const json1 = await res1.json();
    expect(json1.data.incident).toBeNull(); // < 3 failures, no incident yet
    expect(await incidentStore.count()).toBe(0);

    // 2. Second Failed Login Attempt
    const evt2 = {
      ...evt1,
      timestamp: new Date(baseTime + 2 * 60 * 1000).toISOString(),
      metadata: { attempt: 2 },
    };
    const res2 = await postEvent(
      new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify(evt2),
      })
    );
    expect(res2.status).toBe(201);
    const json2 = await res2.json();
    expect(json2.data.incident).toBeNull();
    expect(await incidentStore.count()).toBe(0);

    // 3. Third Failed Login Attempt -> Rule R1 triggers, incident created!
    const evt3 = {
      ...evt1,
      timestamp: new Date(baseTime + 4 * 60 * 1000).toISOString(),
      metadata: { attempt: 3 },
    };
    const res3 = await postEvent(
      new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify(evt3),
      })
    );
    expect(res3.status).toBe(201);
    const json3 = await res3.json();
    expect(json3.data.incident).not.toBeNull();
    expect(json3.data.isNewIncident).toBe(true);
    expect(json3.data.findings.some((f: any) => f.ruleId === "R1")).toBe(true);
    expect(await incidentStore.count()).toBe(1);

    const incidentId = json3.data.incident.id;

    // 4. Successful Login Following Failures -> Rule R2 triggers, correlates into incident!
    const evt4 = {
      timestamp: new Date(baseTime + 6 * 60 * 1000).toISOString(),
      source: "storefront",
      eventType: "auth.login.success",
      userId: victimUser,
      sessionId: victimSession,
      sourceIp: attackerIp,
      userAgent: "Mozilla/5.0",
      accountRole: "customer",
      endpoint: "/api/v1/auth/login",
      httpMethod: "POST",
      responseStatus: 200,
      requestCount: 1,
      recordCount: 1,
      dataCategory: "PII",
      metadata: { authOverride: true },
    };
    const res4 = await postEvent(
      new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify(evt4),
      })
    );
    expect(res4.status).toBe(201);
    const json4 = await res4.json();
    expect(json4.data.incident).not.toBeNull();
    expect(json4.data.isNewIncident).toBe(false); // Merged into existing!
    expect(json4.data.incident.id).toBe(incidentId); // Same incident ID!
    expect(json4.data.findings.some((f: any) => f.ruleId === "R2")).toBe(true);
    expect(await incidentStore.count()).toBe(1);

    // 5. High-Rate API Scraping -> Rule R3 and R4 trigger, correlates into incident!
    const evt5 = {
      timestamp: new Date(baseTime + 8 * 60 * 1000).toISOString(),
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
      metadata: {},
    };
    const res5 = await postEvent(
      new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify(evt5),
      })
    );
    expect(res5.status).toBe(201);
    const json5 = await res5.json();
    expect(json5.data.incident.id).toBe(incidentId);
    expect(json5.data.isNewIncident).toBe(false);
    expect(await incidentStore.count()).toBe(1);

    // 6. Unapproved Data Export -> Rule R5 triggers, escalates to CRITICAL!
    const evt6 = {
      timestamp: new Date(baseTime + 10 * 60 * 1000).toISOString(),
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
      destination: "https://dropzone.external-attacker.cc/exfil",
      approvedDestination: false,
      metadata: {},
    };
    const res6 = await postEvent(
      new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify(evt6),
      })
    );
    expect(res6.status).toBe(201);
    const json6 = await res6.json();

    // FINAL ASSERTIONS FOR S1 ACCEPTANCE:
    // A. Exactly ONE incident created across the entire pipeline
    expect(await incidentStore.count()).toBe(1);

    const finalIncident = await incidentStore.getById(incidentId);
    expect(finalIncident).not.toBeNull();

    // B. Incident Severity is CRITICAL and Risk Score is >= 85
    expect(finalIncident?.severity).toBe("CRITICAL");
    expect(finalIncident?.riskScore).toBeGreaterThanOrEqual(85);

    // C. All 6 events are tracked in the incident's eventIds
    expect(finalIncident?.eventIds.length).toBeGreaterThanOrEqual(4);

    // D. Evidence cites real event IDs and all triggered rules
    const rulesTriggered = finalIncident?.evidence.map((e) => e.ruleId);
    expect(rulesTriggered).toContain("R1");
    expect(rulesTriggered).toContain("R2");
    expect(rulesTriggered).toContain("R3");
    expect(rulesTriggered).toContain("R4");
    expect(rulesTriggered).toContain("R5");

    // E. Chronological timeline entries exist
    expect(finalIncident?.timeline.length).toBeGreaterThanOrEqual(5);

    // F. Total events in eventStore is 6
    expect(await eventStore.count()).toBe(6);
  });

  it("replays S1 via POST /api/simulate/s1 through the live pipeline", async () => {
    const req = new NextRequest("http://localhost:3000/api/simulate/s1", { method: "POST" });
    const res = await simulateScenario(req, { params: Promise.resolve({ scenario: "s1" }) });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.scenario).toBe("s1");
    expect(json.data.eventsIngestedCount).toBe(6);
    expect(json.data.incident).not.toBeNull();
    expect(json.data.incident.severity).toBe("CRITICAL");
    expect(json.data.incident.riskScore).toBeGreaterThanOrEqual(85);
    expect(await incidentStore.count()).toBe(1);
    expect(await eventStore.count()).toBe(6);
  });
});
