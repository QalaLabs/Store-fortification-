import { describe, it, expect, beforeEach } from "vitest";
import { EventCorrelator, calculateRiskScore } from "@/lib/correlate";
import { incidentStore, eventStore } from "@/lib/store";
import { SecurityEvent, IncidentEvidenceItem } from "@/lib/types";
import { RuleFinding } from "@/lib/rules";

describe("Event Correlation & Risk Scoring Engine", () => {
  let correlator: EventCorrelator;

  beforeEach(async () => {
    await incidentStore.clear();
    await eventStore.clear();
    correlator = new EventCorrelator();
  });

  const baseEvent: SecurityEvent = {
    id: "evt_base_1",
    timestamp: "2026-11-20T12:00:00Z",
    source: "storefront",
    eventType: "auth.login.failed",
    userId: "usr_alice",
    sessionId: "sess_alice_1",
    sourceIp: "198.51.100.10",
    userAgent: "Mozilla/5.0",
    accountRole: "customer",
    endpoint: "/api/v1/auth/login",
    httpMethod: "POST",
    responseStatus: 401,
    requestCount: 1,
    recordCount: 0,
    dataCategory: "PII",
    metadata: {},
  };

  const sampleFinding: RuleFinding = {
    ruleId: "R1",
    ruleName: "Repeated Login Failures",
    severity: "MEDIUM",
    description: "Repeated authentication failures detected",
    timestamp: "2026-11-20T12:00:00Z",
    eventId: "evt_base_1",
    relatedEventIds: [],
    confidence: 0.95,
  };

  describe("Event Correlation", () => {
    it("creates a new incident on initial finding", async () => {
      await eventStore.add(baseEvent);

      const result = await correlator.correlate(baseEvent, [sampleFinding]);
      expect(result).not.toBeNull();
      expect(result?.isNewIncident).toBe(true);
      expect(result?.incident.id).toMatch(/^inc_/);
      expect(result?.incident.affectedUserIds).toContain("usr_alice");
      expect(result?.incident.eventIds).toContain("evt_base_1");
      expect(await incidentStore.count()).toBe(1);
    });

    it("correlates subsequent findings into the existing incident without duplicating", async () => {
      await eventStore.add(baseEvent);
      const firstResult = await correlator.correlate(baseEvent, [sampleFinding]);
      const initialIncidentId = firstResult!.incident.id;

      // Second event for the same user
      const secondEvent: SecurityEvent = {
        ...baseEvent,
        id: "evt_base_2",
        timestamp: "2026-11-20T12:03:00Z",
        eventType: "auth.login.success",
        responseStatus: 200,
      };
      await eventStore.add(secondEvent);

      const secondFinding: RuleFinding = {
        ruleId: "R2",
        ruleName: "Success After Failures",
        severity: "HIGH",
        description: "Successful login following failures",
        timestamp: "2026-11-20T12:03:00Z",
        eventId: "evt_base_2",
        relatedEventIds: ["evt_base_1"],
        confidence: 0.90,
      };

      const secondResult = await correlator.correlate(secondEvent, [secondFinding]);
      expect(secondResult).not.toBeNull();
      expect(secondResult?.isNewIncident).toBe(false);
      expect(secondResult?.incident.id).toBe(initialIncidentId); // SAME incident!
      expect(secondResult?.incident.eventIds).toEqual(["evt_base_1", "evt_base_2"]);
      expect(secondResult?.incident.evidence).toHaveLength(2);
      expect(await incidentStore.count()).toBe(1); // No duplicate incident created!
    });

    it("STRICTLY enforces cross-user isolation (never merges different users)", async () => {
      // Incident created for Alice
      await eventStore.add(baseEvent);
      await correlator.correlate(baseEvent, [sampleFinding]);
      expect(await incidentStore.count()).toBe(1);

      // Event for Bob from the same IP (e.g. shared proxy/NAT)
      const bobEvent: SecurityEvent = {
        ...baseEvent,
        id: "evt_bob_1",
        userId: "usr_bob", // DIFFERENT USER
        sourceIp: "198.51.100.10", // SAME IP
        timestamp: "2026-11-20T12:05:00Z",
      };
      await eventStore.add(bobEvent);

      const bobFinding: RuleFinding = {
        ...sampleFinding,
        eventId: "evt_bob_1",
        description: "Login failure on user bob",
      };

      const bobResult = await correlator.correlate(bobEvent, [bobFinding]);
      expect(bobResult?.isNewIncident).toBe(true); // Must spawn a separate incident!
      expect(bobResult?.incident.affectedUserIds).toContain("usr_bob");
      expect(bobResult?.incident.affectedUserIds).not.toContain("usr_alice");
      expect(await incidentStore.count()).toBe(2);
    });

    it("preserves chronological timeline entries on the incident", async () => {
      await eventStore.add(baseEvent);
      const res1 = await correlator.correlate(baseEvent, [sampleFinding]);

      const secondEvent: SecurityEvent = {
        ...baseEvent,
        id: "evt_base_2",
        timestamp: "2026-11-20T12:05:00Z",
      };
      await eventStore.add(secondEvent);

      const secondFinding: RuleFinding = {
        ruleId: "R3",
        ruleName: "API Volume",
        severity: "HIGH",
        description: "Volume spike",
        timestamp: "2026-11-20T12:05:00Z",
        eventId: "evt_base_2",
        relatedEventIds: [],
        confidence: 0.85,
      };

      const res2 = await correlator.correlate(secondEvent, [secondFinding]);
      const timeline = res2!.incident.timeline;
      expect(timeline.length).toBeGreaterThanOrEqual(3);
      expect(timeline[0].type).toBe("INCIDENT_CREATED");
      expect(timeline[timeline.length - 1].description).toContain("[R3]");
    });
  });

  describe("Deterministic Risk Scoring Formula", () => {
    it("calculates explainable score with severity mapping", () => {
      const evidence: IncidentEvidenceItem[] = [
        {
          eventId: "evt_1",
          ruleId: "R1",
          description: "Login failures",
          severity: "MEDIUM",
        },
        {
          eventId: "evt_2",
          ruleId: "R2",
          description: "Success after failures",
          severity: "HIGH",
        },
      ];

      const events: SecurityEvent[] = [
        { ...baseEvent, id: "evt_1", dataCategory: "PII", recordCount: 1 },
        { ...baseEvent, id: "evt_2", dataCategory: "PII", recordCount: 1 },
      ];

      const result = calculateRiskScore(evidence, events);
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.contributions.length).toBeGreaterThan(0);
      expect(result.contributions.some((c) => c.factor === "ATTACK_CHAIN_ACCOUNT_TAKEOVER")).toBe(true);
    });

    it("evaluates multi-vector attack chain into CRITICAL (>= 85 score)", () => {
      const evidence: IncidentEvidenceItem[] = [
        { eventId: "e1", ruleId: "R1", description: "R1", severity: "MEDIUM" },
        { eventId: "e2", ruleId: "R2", description: "R2", severity: "HIGH" },
        { eventId: "e3", ruleId: "R3", description: "R3", severity: "HIGH" },
        { eventId: "e4", ruleId: "R4", description: "R4", severity: "HIGH" },
        { eventId: "e5", ruleId: "R5", description: "R5", severity: "CRITICAL" },
      ];

      const events: SecurityEvent[] = [
        { ...baseEvent, id: "e1", dataCategory: "PII", recordCount: 0 },
        { ...baseEvent, id: "e2", dataCategory: "PII", recordCount: 1 },
        { ...baseEvent, id: "e3", dataCategory: "ORDER", recordCount: 50 },
        { ...baseEvent, id: "e4", dataCategory: "PII", recordCount: 150 },
      ];

      const result = calculateRiskScore(evidence, events);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.severity).toBe("CRITICAL");
    });
  });
});
