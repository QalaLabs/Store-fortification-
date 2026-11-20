import { describe, it, expect, beforeEach } from "vitest";
import {
  RuleR1LoginFailures,
  RuleR2SuccessAfterFailures,
  RuleR3ApiVolumeAndBotLikelihood,
  RuleR4SensitiveAccess,
  RuleR5UnapprovedExport,
  DetectionEngine,
} from "@/lib/rules";
import { SecurityEvent } from "@/lib/types";

describe("Deterministic Detection Engine R1–R5", () => {
  const baseTime = new Date("2026-11-20T12:00:00Z").getTime();

  function makeEvent(overrides: Partial<SecurityEvent> = {}): SecurityEvent {
    return {
      id: "evt_test_01",
      timestamp: new Date(baseTime).toISOString(),
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

  describe("Rule R1: Login Failures", () => {
    const rule = new RuleR1LoginFailures();

    it("triggers when 3 or more failed logins occur within the lookback window", async () => {
      const prior1 = makeEvent({
        id: "evt_fail_1",
        eventType: "auth.login.failed",
        endpoint: "/api/v1/auth/login",
        responseStatus: 401,
        timestamp: new Date(baseTime - 3 * 60 * 1000).toISOString(),
      });
      const prior2 = makeEvent({
        id: "evt_fail_2",
        eventType: "auth.login.failed",
        endpoint: "/api/v1/auth/login",
        responseStatus: 401,
        timestamp: new Date(baseTime - 1 * 60 * 1000).toISOString(),
      });
      const current = makeEvent({
        id: "evt_fail_3",
        eventType: "auth.login.failed",
        endpoint: "/api/v1/auth/login",
        responseStatus: 401,
        timestamp: new Date(baseTime).toISOString(),
      });

      const finding = await rule.evaluate(current, {
        recentEvents: [prior1, prior2],
      });

      expect(finding).not.toBeNull();
      expect(finding?.ruleId).toBe("R1");
      expect(finding?.severity).toBe("MEDIUM");
      expect(finding?.eventId).toBe("evt_fail_3");
      expect(finding?.relatedEventIds).toEqual(["evt_fail_1", "evt_fail_2"]);
    });

    it("escalates to HIGH severity when 5 or more failed logins occur", async () => {
      const priors = [1, 2, 3, 4].map((i) =>
        makeEvent({
          id: `evt_fail_${i}`,
          eventType: "auth.login.failed",
          endpoint: "/api/v1/auth/login",
          responseStatus: 401,
          timestamp: new Date(baseTime - i * 60 * 1000).toISOString(),
        })
      );
      const current = makeEvent({
        id: "evt_fail_5",
        eventType: "auth.login.failed",
        endpoint: "/api/v1/auth/login",
        responseStatus: 401,
        timestamp: new Date(baseTime).toISOString(),
      });

      const finding = await rule.evaluate(current, { recentEvents: priors });
      expect(finding?.severity).toBe("HIGH");
    });

    it("does not trigger on isolated or non-login events", async () => {
      const isolatedFail = makeEvent({
        id: "evt_fail_single",
        eventType: "auth.login.failed",
        responseStatus: 401,
      });

      const finding = await rule.evaluate(isolatedFail, { recentEvents: [] });
      expect(finding).toBeNull();
    });

    it("does not count failures that occurred outside the lookback window", async () => {
      const ancientFail = makeEvent({
        id: "evt_ancient",
        eventType: "auth.login.failed",
        responseStatus: 401,
        timestamp: new Date(baseTime - 30 * 60 * 1000).toISOString(), // 30 min ago (> 15 min window)
      });
      const current = makeEvent({
        id: "evt_fail_curr",
        eventType: "auth.login.failed",
        responseStatus: 401,
        timestamp: new Date(baseTime).toISOString(),
      });

      const finding = await rule.evaluate(current, { recentEvents: [ancientFail] });
      expect(finding).toBeNull();
    });
  });

  describe("Rule R2: Success After Failures", () => {
    const rule = new RuleR2SuccessAfterFailures();

    it("triggers when successful login follows burst of failures", async () => {
      const fail1 = makeEvent({
        id: "evt_f1",
        eventType: "auth.login.failed",
        responseStatus: 401,
        timestamp: new Date(baseTime - 4 * 60 * 1000).toISOString(),
      });
      const fail2 = makeEvent({
        id: "evt_f2",
        eventType: "auth.login.failed",
        responseStatus: 401,
        timestamp: new Date(baseTime - 2 * 60 * 1000).toISOString(),
      });
      const success = makeEvent({
        id: "evt_s1",
        eventType: "auth.login.success",
        endpoint: "/api/v1/auth/login",
        responseStatus: 200,
        timestamp: new Date(baseTime).toISOString(),
      });

      const finding = await rule.evaluate(success, { recentEvents: [fail1, fail2] });
      expect(finding).not.toBeNull();
      expect(finding?.ruleId).toBe("R2");
      expect(finding?.severity).toBe("HIGH");
      expect(finding?.eventId).toBe("evt_s1");
      expect(finding?.relatedEventIds).toEqual(["evt_f1", "evt_f2"]);
    });

    it("does not trigger on normal login without preceding failures", async () => {
      const normalLogin = makeEvent({
        id: "evt_normal_login",
        eventType: "auth.login.success",
        responseStatus: 200,
      });

      const finding = await rule.evaluate(normalLogin, { recentEvents: [] });
      expect(finding).toBeNull();
    });
  });

  describe("Rule R3: API Volume & Bot Likelihood", () => {
    const rule = new RuleR3ApiVolumeAndBotLikelihood();

    it("triggers when requestCount is far above normal (>= 15 requests)", async () => {
      const burstEvent = makeEvent({
        id: "evt_burst",
        endpoint: "/api/v1/orders",
        requestCount: 25,
        userAgent: "python-requests/2.31.0",
      });

      const finding = await rule.evaluate(burstEvent, { recentEvents: [] });
      expect(finding).not.toBeNull();
      expect(finding?.ruleId).toBe("R3");
      expect(finding?.metadata?.actorClassification).toBe("SUSPICIOUS_BOT");
    });

    it("does not trigger on normal human browsing traffic", async () => {
      const humanEvent = makeEvent({
        endpoint: "/api/v1/cart",
        requestCount: 1,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      });

      const finding = await rule.evaluate(humanEvent, { recentEvents: [] });
      expect(finding).toBeNull();
    });

    it("does not trigger on trusted shopping agents with registered mandates", async () => {
      const agentEvent = makeEvent({
        endpoint: "/api/v1/catalog",
        requestCount: 5,
        accountRole: "agent",
        agentId: "agent_shop_bot_1",
        mandate: {
          limit: 5000,
          merchantScope: ["store-direct"],
          expiry: "2026-11-25T00:00:00Z",
        },
      });

      const finding = await rule.evaluate(agentEvent, { recentEvents: [] });
      expect(finding).toBeNull();
    });
  });

  describe("Rule R4: Sensitive Access", () => {
    const rule = new RuleR4SensitiveAccess();

    it("triggers when bulk PII or order records are read (recordCount >= 10)", async () => {
      const bulkPiiEvent = makeEvent({
        id: "evt_pii_bulk",
        endpoint: "/api/v1/customers",
        dataCategory: "PII",
        resourceType: "customer_profile",
        recordCount: 50,
      });

      const finding = await rule.evaluate(bulkPiiEvent, { recentEvents: [] });
      expect(finding).not.toBeNull();
      expect(finding?.ruleId).toBe("R4");
      expect(finding?.severity).toBe("HIGH");
    });

    it("escalates to CRITICAL when reading >= 100 sensitive records", async () => {
      const massiveRead = makeEvent({
        endpoint: "/api/v1/orders/export",
        dataCategory: "ORDER",
        recordCount: 200,
      });

      const finding = await rule.evaluate(massiveRead, { recentEvents: [] });
      expect(finding?.severity).toBe("CRITICAL");
    });

    it("does not trigger on individual record reads below threshold", async () => {
      const singleRead = makeEvent({
        endpoint: "/api/v1/customers/me",
        dataCategory: "PII",
        recordCount: 1,
      });

      const finding = await rule.evaluate(singleRead, { recentEvents: [] });
      expect(finding).toBeNull();
    });
  });

  describe("Rule R5: Export to Unapproved Destination", () => {
    const rule = new RuleR5UnapprovedExport();

    it("triggers with CRITICAL severity when destination is explicitly unapproved", async () => {
      const exfilEvent = makeEvent({
        id: "evt_exfil",
        eventType: "data.export",
        endpoint: "/api/v1/customers/export",
        destination: "https://dropzone.malicious-site.cc/exfil",
        approvedDestination: false,
        recordCount: 100,
      });

      const finding = await rule.evaluate(exfilEvent, { recentEvents: [] });
      expect(finding).not.toBeNull();
      expect(finding?.ruleId).toBe("R5");
      expect(finding?.severity).toBe("CRITICAL");
      expect(finding?.confidence).toBe(0.98);
    });

    it("does not trigger when exporting to an authorized internal destination", async () => {
      const validExport = makeEvent({
        eventType: "data.export",
        destination: "https://store.internal/backup",
        approvedDestination: true,
      });

      const finding = await rule.evaluate(validExport, { recentEvents: [] });
      expect(finding).toBeNull();
    });
  });

  describe("Detection Engine Multi-Rule Evaluation", () => {
    it("evaluates all registered rules modularly", async () => {
      const engine = new DetectionEngine();
      expect(engine.getAllRules().length).toBeGreaterThanOrEqual(5);

      // Event that triggers both R3 (volume) and R4 (sensitive access)
      const dualEvent = makeEvent({
        id: "evt_dual",
        endpoint: "/api/v1/orders",
        requestCount: 20,
        recordCount: 30,
        dataCategory: "ORDER",
        userAgent: "python-requests/2.31.0",
      });

      const findings = await engine.evaluate(dualEvent, { recentEvents: [] });
      expect(findings.length).toBeGreaterThanOrEqual(2);
      const ruleIds = findings.map((f) => f.ruleId);
      expect(ruleIds).toContain("R3");
      expect(ruleIds).toContain("R4");
    });
  });
});
