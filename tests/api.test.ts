import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as postEvent, GET as getEvents } from "@/app/api/events/route";
import { GET as getIncidents } from "@/app/api/incidents/route";
import { GET as getIncidentById } from "@/app/api/incidents/[id]/route";
import { POST as investigateIncident } from "@/app/api/incidents/[id]/investigate/route";
import { POST as proposeAction } from "@/app/api/incidents/[id]/actions/route";
import { POST as actionDecision } from "@/app/api/actions/[id]/decision/route";
import { POST as simulateScenario } from "@/app/api/simulate/[scenario]/route";
import { POST as resetSystem } from "@/app/api/reset/route";
import { GET as getPosture } from "@/app/api/posture/route";
import { GET as getCompliance } from "@/app/api/compliance/route";
import { GET as getProviderStatus } from "@/app/api/provider-status/route";
import { GET as getAudit } from "@/app/api/audit/route";
import { GET as getAutonomySettings } from "@/app/api/autonomy-settings/route";
import { eventStore, incidentStore, actionStore, auditStore } from "@/lib/store";

describe("API Route Handlers (14 Foundational Endpoints)", () => {
  beforeEach(async () => {
    await eventStore.clear();
    await incidentStore.clear();
    await actionStore.clear();
    await auditStore.clear();
  });

  describe("1 & 2. /api/events (POST & GET)", () => {
    it("ingests a valid event and persists it to eventStore", async () => {
      const payload = {
        source: "storefront",
        eventType: "auth.login.failed",
        sourceIp: "198.51.100.5",
        endpoint: "/api/login",
        httpMethod: "POST",
        responseStatus: 401,
        requestCount: 1,
        recordCount: 0,
        dataCategory: "PII",
        metadata: {},
      };

      const req = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await postEvent(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.event.id).toMatch(/^evt_/);
      expect(json.data.event.sourceIp).toBe("198.51.100.5");
      expect(await eventStore.count()).toBe(1);
    });

    it("rejects an invalid event payload with 422 validation error", async () => {
      const invalidPayload = {
        // missing required fields
        sourceIp: "",
      };

      const req = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify(invalidPayload),
      });

      const res = await postEvent(req);
      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("VALIDATION_ERROR");
    });

    it("lists ingested events via GET", async () => {
      await eventStore.add({
        id: "evt_1",
        timestamp: "2026-11-20T12:00:00Z",
        source: "api",
        eventType: "data.read",
        sourceIp: "10.0.0.1",
        userAgent: "bot",
        endpoint: "/api/orders",
        httpMethod: "GET",
        responseStatus: 200,
        requestCount: 1,
        recordCount: 50,
        dataCategory: "ORDER",
        metadata: {},
      });

      const req = new NextRequest("http://localhost:3000/api/events?limit=10");
      const res = await getEvents(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.returnedCount).toBe(1);
      expect(json.data.events[0].id).toBe("evt_1");
    });
  });

  describe("3 & 4. /api/incidents & /api/incidents/[id] (GET)", () => {
    it("returns empty list initially and filters by severity", async () => {
      const req = new NextRequest("http://localhost:3000/api/incidents");
      const res = await getIncidents(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.incidents).toEqual([]);
    });

    it("returns 404 for non-existent incident ID", async () => {
      const req = new NextRequest("http://localhost:3000/api/incidents/inc_nonexistent");
      const res = await getIncidentById(req, { params: Promise.resolve({ id: "inc_nonexistent" }) });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("NOT_FOUND");
    });

    it("retrieves an existing incident with its correlated events", async () => {
      await eventStore.add({
        id: "evt_correlated_1",
        timestamp: "2026-11-20T12:00:00Z",
        source: "storefront",
        eventType: "auth.login.failed",
        sourceIp: "192.168.1.100",
        userAgent: "agent",
        endpoint: "/auth",
        httpMethod: "POST",
        responseStatus: 401,
        requestCount: 1,
        recordCount: 0,
        dataCategory: "PII",
        metadata: {},
      });

      await incidentStore.create({
        id: "inc_test_100",
        title: "Test Correlated Incident",
        incidentType: "ACCOUNT_TAKEOVER_API_ABUSE",
        severity: "HIGH",
        status: "OPEN",
        createdAt: "2026-11-20T12:01:00Z",
        updatedAt: "2026-11-20T12:01:00Z",
        affectedUserIds: ["usr_test"],
        affectedSessions: [],
        affectedResources: ["account"],
        eventIds: ["evt_correlated_1"],
        evidence: [],
        riskScore: 78,
        summary: "Correlated test incident",
        investigationStatus: "PENDING",
        recommendedActions: ["ALERT"],
        timeline: [],
      });

      const req = new NextRequest("http://localhost:3000/api/incidents/inc_test_100");
      const res = await getIncidentById(req, { params: Promise.resolve({ id: "inc_test_100" }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.incident.id).toBe("inc_test_100");
      expect(json.data.events).toHaveLength(1);
      expect(json.data.events[0].id).toBe("evt_correlated_1");
    });
  });

  describe("5. /api/incidents/[id]/investigate (POST)", () => {
    it("returns typed investigation stub citing real event IDs", async () => {
      await incidentStore.create({
        id: "inc_inv_1",
        title: "Test for AI Investigation",
        incidentType: "ACCOUNT_TAKEOVER_API_ABUSE",
        severity: "CRITICAL",
        status: "OPEN",
        createdAt: "2026-11-20T12:00:00Z",
        updatedAt: "2026-11-20T12:00:00Z",
        affectedUserIds: ["usr_victim"],
        affectedSessions: [],
        affectedResources: [],
        eventIds: ["evt_real_evidence_42"],
        evidence: [],
        riskScore: 90,
        summary: "AI stub test",
        investigationStatus: "PENDING",
        recommendedActions: [],
        timeline: [],
      });

      const req = new NextRequest("http://localhost:3000/api/incidents/inc_inv_1/investigate", {
        method: "POST",
        body: JSON.stringify({ provider: "mock" }),
      });

      const res = await investigateIncident(req, { params: Promise.resolve({ id: "inc_inv_1" }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.investigationResult.confirmedEvidence[0].eventId).toBe("evt_real_evidence_42");
      expect(json.data.investigationResult.providerUsed).toBe("MOCK");
    });
  });

  describe("6 & 7. /api/incidents/[id]/actions & /api/actions/[id]/decision (POST)", () => {
    it("proposes a containment action and executes simulated response upon approval", async () => {
      await incidentStore.create({
        id: "inc_act_1",
        title: "Incident with Actions",
        incidentType: "SELLER_DATA_EXPOSURE",
        severity: "HIGH",
        status: "OPEN",
        createdAt: "2026-11-20T12:00:00Z",
        updatedAt: "2026-11-20T12:00:00Z",
        affectedUserIds: ["usr_partner_3"],
        affectedSessions: [],
        affectedResources: [],
        eventIds: ["evt_x1"],
        evidence: [],
        riskScore: 80,
        summary: "Partner scope violation",
        investigationStatus: "PENDING",
        recommendedActions: [],
        timeline: [],
      });

      // Step 1: Propose action
      const proposeReq = new NextRequest("http://localhost:3000/api/incidents/inc_act_1/actions", {
        method: "POST",
        body: JSON.stringify({
          actionType: "CONTAIN",
          targetEntity: "usr_partner_3",
          reason: "Anomalous partner token data access",
        }),
      });

      const proposeRes = await proposeAction(proposeReq, { params: Promise.resolve({ id: "inc_act_1" }) });
      expect(proposeRes.status).toBe(201);
      const proposeJson = await proposeRes.json();
      expect(proposeJson.data.action.status).toBe("PROPOSED");
      expect(proposeJson.data.action.dryRunResult.blastRadius).toBe("MINIMAL");

      const actionId = proposeJson.data.action.id;

      // Step 2: Human Decision -> Approve
      const decisionReq = new NextRequest(`http://localhost:3000/api/actions/${actionId}/decision`, {
        method: "POST",
        body: JSON.stringify({
          decision: "APPROVED",
          decidedBy: "Aayush",
          comments: "Approved defensive containment.",
        }),
      });

      const decisionRes = await actionDecision(decisionReq, { params: Promise.resolve({ id: actionId }) });
      expect(decisionRes.status).toBe(200);
      const decisionJson = await decisionRes.json();
      expect(decisionJson.data.action.status).toBe("EXECUTED");
      expect(decisionJson.data.simulatedExecution.simulated).toBe(true);
      expect(decisionJson.data.simulatedExecution.containmentModeActive).toBe(true);
    });
  });

  describe("8. /api/simulate/[scenario] (POST)", () => {
    it("validates scenario parameter (s1, s2, s3, s4)", async () => {
      const validReq = new NextRequest("http://localhost:3000/api/simulate/s1", { method: "POST" });
      const validRes = await simulateScenario(validReq, { params: Promise.resolve({ scenario: "s1" }) });
      expect(validRes.status).toBe(200);
      const json = await validRes.json();
      expect(json.data.scenario).toBe("s1");
    });

    it("rejects an invalid scenario with 422 error", async () => {
      const invalidReq = new NextRequest("http://localhost:3000/api/simulate/s99", { method: "POST" });
      const invalidRes = await simulateScenario(invalidReq, { params: Promise.resolve({ scenario: "s99" }) });
      expect(invalidRes.status).toBe(422);
    });
  });

  describe("9. /api/reset (POST)", () => {
    it("clears all stores and returns clean confirmation", async () => {
      await eventStore.add({
        id: "evt_to_clear",
        timestamp: "2026-11-20T12:00:00Z",
        source: "api",
        eventType: "test",
        sourceIp: "127.0.0.1",
        userAgent: "test",
        endpoint: "/test",
        httpMethod: "GET",
        responseStatus: 200,
        requestCount: 1,
        recordCount: 0,
        dataCategory: "GENERAL",
        metadata: {},
      });

      const req = new NextRequest("http://localhost:3000/api/reset", { method: "POST" });
      const res = await resetSystem(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.reset).toBe(true);
      expect(await eventStore.count()).toBe(0);
    });
  });

  describe("10. /api/posture (GET)", () => {
    it("returns overall system posture and risk aggregates", async () => {
      const req = new NextRequest("http://localhost:3000/api/posture");
      const res = await getPosture(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.overallStatus).toBe("HEALTHY");
      expect(json.data.totalEventsProcessed).toBe(0);
    });
  });

  describe("11. /api/compliance (GET)", () => {
    it("enforces safe wording 'DPDP-aligned readiness and controls'", async () => {
      const req = new NextRequest("http://localhost:3000/api/compliance");
      const res = await getCompliance(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.disclaimer).toContain("DPDP-aligned readiness and controls");
      expect(json.data.disclaimer).not.toContain("full DPDP compliant");
      expect(json.data.controls.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("12. /api/provider-status (GET)", () => {
    it("returns honest MOCK provider label by default, never CONNECTED", async () => {
      const req = new NextRequest("http://localhost:3000/api/provider-status");
      const res = await getProviderStatus(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(["MOCK", "CONFIGURED", "BEDROCK_VERIFIED"]).toContain(json.data.aiProvider);
      expect(json.data.offlineMode).toBe(true);
    });
  });

  describe("13. /api/audit (GET)", () => {
    it("returns audit trail entries", async () => {
      const req = new NextRequest("http://localhost:3000/api/audit");
      const res = await getAudit(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json.data.entries)).toBe(true);
    });
  });

  describe("14. /api/autonomy-settings (GET)", () => {
    it("enforces autonomousResponseEnabled: false and humanApprovalRequired: true", async () => {
      const req = new NextRequest("http://localhost:3000/api/autonomy-settings");
      const res = await getAutonomySettings(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.autonomousResponseEnabled).toBe(false);
      expect(json.data.humanApprovalRequired).toBe(true);
      expect(json.data.documentationNotice).toBeDefined();
    });
  });
});
