import { describe, it, expect, beforeEach } from "vitest";
import {
  RuleR6PartnerScope,
  RuleR7ConsentDrift,
  RuleR8AgentPayment,
  DetectionEngine,
  detectionEngine,
} from "@/lib/rules";
import { SecurityEvent } from "@/lib/types";
import { eventStore, incidentStore, auditStore } from "@/lib/store";
import { eventCorrelator } from "@/lib/correlate";
import { getScenario } from "@/lib/scenarios";
import {
  S4_FAIL_EVENT_ID,
  S4_PASS_EVENT_ID,
} from "@/lib/scenarios/s4-agent-payment";

function makeEvent(overrides: Partial<SecurityEvent> = {}): SecurityEvent {
  return {
    id: "evt_test_01",
    timestamp: "2026-11-20T12:00:00.000Z",
    source: "storefront",
    eventType: "api.request",
    userId: "usr_alice",
    sessionId: "sess_001",
    sourceIp: "192.0.2.1",
    userAgent: "Mozilla/5.0",
    accountRole: "customer",
    endpoint: "/api/test",
    httpMethod: "GET",
    responseStatus: 200,
    requestCount: 1,
    recordCount: 0,
    dataCategory: "GENERAL",
    metadata: {},
    ...overrides,
  };
}

describe("Detection rules R6–R8", () => {
  describe("Rule R6: Partner scope", () => {
    const rule = new RuleR6PartnerScope();

    it("triggers HIGH when partner recordsAccessed leave the token merchant scope", async () => {
      const event = makeEvent({
        id: "evt_r6_out",
        accountRole: "partner",
        endpoint: "/partner/v1/customers",
        dataCategory: "PII",
        resourceType: "customer_records",
        metadata: {
          tokenId: "tok_merch_acme",
          recordsAccessed: ["merch_globex:customer:c-2001"],
        },
      });

      const finding = await rule.evaluate(event, { recentEvents: [] });
      expect(finding).not.toBeNull();
      expect(finding?.ruleId).toBe("R6");
      expect(finding?.severity).toBe("HIGH");
      expect(finding?.confidence).toBe(0.9);
    });

    it("does not trigger for in-scope partner reads", async () => {
      const event = makeEvent({
        accountRole: "partner",
        endpoint: "/partner/v1/customers",
        dataCategory: "PII",
        metadata: {
          tokenId: "tok_merch_acme",
          recordsAccessed: ["merch_acme:customer:c-1001"],
        },
      });

      const finding = await rule.evaluate(event, { recentEvents: [] });
      expect(finding).toBeNull();
    });

    it("triggers when resourceType is outside authorizedScope", async () => {
      const event = makeEvent({
        accountRole: "seller",
        endpoint: "/partner/v1/customers",
        resourceType: "customer_pii",
        dataCategory: "PII",
        metadata: { authorizedScope: ["catalog", "orders"] },
      });

      const finding = await rule.evaluate(event, { recentEvents: [] });
      expect(finding?.ruleId).toBe("R6");
    });

    it("does not trigger for non-partner roles", async () => {
      const event = makeEvent({
        accountRole: "customer",
        endpoint: "/api/v1/customers",
        dataCategory: "PII",
        metadata: { tokenId: "tok_merch_acme", recordsAccessed: ["merch_globex:customer:c-1"] },
      });
      expect(await rule.evaluate(event, { recentEvents: [] })).toBeNull();
    });
  });

  describe("Rule R7: Consent drift", () => {
    const rule = new RuleR7ConsentDrift();

    it("triggers MEDIUM when purpose differs from consentPurpose", async () => {
      const event = makeEvent({
        id: "evt_r7_drift",
        endpoint: "/api/v1/campaigns/audience",
        dataCategory: "PII",
        metadata: { purpose: "marketing", consentPurpose: "order_fulfillment" },
      });

      const finding = await rule.evaluate(event, { recentEvents: [] });
      expect(finding).not.toBeNull();
      expect(finding?.ruleId).toBe("R7");
      expect(finding?.severity).toBe("MEDIUM");
      expect(finding?.confidence).toBe(0.85);
    });

    it("does not trigger when purpose matches consentPurpose", async () => {
      const event = makeEvent({
        endpoint: "/api/v1/campaigns/audience",
        metadata: { purpose: "marketing", consentPurpose: "marketing" },
      });
      expect(await rule.evaluate(event, { recentEvents: [] })).toBeNull();
    });

    it("triggers on marketing action without ACTIVE consentStatus", async () => {
      const event = makeEvent({
        eventType: "marketing.send",
        endpoint: "/api/v1/marketing/blast",
        metadata: { consentStatus: "WITHDRAWN" },
      });
      const finding = await rule.evaluate(event, { recentEvents: [] });
      expect(finding?.ruleId).toBe("R7");
    });
  });

  describe("Rule R8: Agent payment mandate", () => {
    const rule = new RuleR8AgentPayment();

    const baseMandate = {
      limit: 50,
      merchantScope: ["merch_acme"],
      // Must be after makeEvent's fixed timestamp (12:00Z); R8 treats event time >= expiry as expired.
      expiry: "2026-11-20T18:00:00.000Z",
    };

    it("does not trigger when all five mandate checks pass", async () => {
      const event = makeEvent({
        id: "evt_r8_pass",
        eventType: "payment.agent",
        accountRole: "agent",
        agentId: "agent_1",
        principalId: "usr_p",
        paymentMethodOwner: "usr_p",
        paymentAmount: 22,
        destination: "merch_acme",
        mandate: baseMandate,
        dataCategory: "PAYMENT",
        endpoint: "/api/v1/checkout/agent-pay",
      });
      expect(await rule.evaluate(event, { recentEvents: [] })).toBeNull();
    });

    it("triggers CRITICAL on payment method mismatch and limit exceeded", async () => {
      const event = makeEvent({
        id: "evt_r8_fail",
        eventType: "payment.agent",
        accountRole: "agent",
        agentId: "agent_1",
        principalId: "usr_p",
        paymentMethodOwner: "usr_other",
        paymentAmount: 175,
        destination: "merch_acme",
        mandate: baseMandate,
        dataCategory: "PAYMENT",
        endpoint: "/api/v1/checkout/agent-pay",
      });

      const finding = await rule.evaluate(event, { recentEvents: [] });
      expect(finding).not.toBeNull();
      expect(finding?.ruleId).toBe("R8");
      expect(finding?.severity).toBe("CRITICAL");
      expect(finding?.metadata?.violations).toEqual(
        expect.arrayContaining(["PAYMENT_METHOD_MISMATCH", "LIMIT_EXCEEDED"])
      );
    });

    it("triggers HIGH when the mandate has expired at event time", async () => {
      const event = makeEvent({
        eventType: "payment.agent",
        accountRole: "agent",
        agentId: "agent_1",
        principalId: "usr_p",
        paymentMethodOwner: "usr_p",
        paymentAmount: 22,
        destination: "merch_acme",
        mandate: { ...baseMandate, expiry: "2026-11-20T12:00:00.000Z" },
        dataCategory: "PAYMENT",
      });
      const finding = await rule.evaluate(event, { recentEvents: [] });
      expect(finding?.severity).toBe("HIGH");
      expect(finding?.metadata?.violations).toEqual(["MANDATE_EXPIRED"]);
    });

    it("fails closed with CRITICAL when mandate is missing", async () => {
      const event = makeEvent({
        eventType: "payment.agent",
        accountRole: "agent",
        agentId: "agent_1",
        principalId: "usr_p",
        paymentMethodOwner: "usr_p",
        paymentAmount: 10,
        destination: "merch_acme",
        mandate: null,
        dataCategory: "PAYMENT",
      });
      const finding = await rule.evaluate(event, { recentEvents: [] });
      expect(finding?.severity).toBe("CRITICAL");
      expect(finding?.metadata?.violations).toContain("MANDATE_MISSING");
    });
  });

  describe("DetectionEngine registration", () => {
    it("registers R1–R8", () => {
      const engine = new DetectionEngine();
      const ids = engine.getAllRules().map((r) => r.id).sort();
      expect(ids).toEqual(["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"]);
    });
  });

  describe("Scenario replay against R6–R8", () => {
    beforeEach(async () => {
      await eventStore.clear();
      await incidentStore.clear();
      await auditStore.clear();
    });

    async function replay(id: "s2" | "s3" | "s4") {
      const rules = new Set<string>();
      for (const event of getScenario(id)) {
        const saved = await eventStore.add(event);
        const recentEvents = await eventStore.list({ limit: 50 });
        const findings = await detectionEngine.evaluate(saved, { recentEvents });
        findings.forEach((f) => rules.add(f.ruleId));
        if (findings.length > 0) await eventCorrelator.correlate(saved, findings);
      }
      return { rules, incidents: await incidentStore.getAll() };
    }

    it("S2 fires R6 on out-of-scope partner reads", async () => {
      const { rules, incidents } = await replay("s2");
      expect(rules.has("R6")).toBe(true);
      expect(incidents.length).toBeGreaterThanOrEqual(1);
      expect(incidents.some((i) => i.incidentType === "SELLER_DATA_EXPOSURE")).toBe(true);
    });

    it("S3 fires R7 on the purpose/consent mismatch event", async () => {
      const { rules, incidents } = await replay("s3");
      expect(rules.has("R7")).toBe(true);
      expect(incidents.some((i) => i.incidentType === "CONSENT_DRIFT")).toBe(true);
    });

    it("S4 fires R8 only on the failing agent payment", async () => {
      const { rules, incidents } = await replay("s4");
      expect(rules.has("R8")).toBe(true);
      expect(rules.has("R3")).toBe(false);
      const r8Evidence = incidents.flatMap((i) => i.evidence).filter((e) => e.ruleId === "R8");
      expect(r8Evidence.map((e) => e.eventId)).toEqual([S4_FAIL_EVENT_ID]);
      expect(r8Evidence.every((e) => e.eventId !== S4_PASS_EVENT_ID)).toBe(true);
    });
  });
});
