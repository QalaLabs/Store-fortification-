from pathlib import Path

root = Path(__file__).resolve().parent
rules = root / "lib" / "rules"
tests = root / "tests"

R6 = r'''import { SecurityEvent, SeverityLevel } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";

/**
 * R6 — Third-party partner / seller token scope violation.
 *
 * Primary path (S2): authorised merchant = metadata.tokenId without `tok_`;
 * each metadata.recordsAccessed entry is `{merchantId}:customer:{recordId}`.
 * Alternate path: metadata.authorizedScope string array; flag when
 * resourceType is outside it, or when scope is absent and the endpoint
 * touches /customer or /pii.
 */
export class RuleR6PartnerScope implements SecurityRule {
  readonly id = "R6";
  readonly name = "Third-party Partner Token Scope Violation";
  readonly description =
    "Triggers when a partner or seller token reads customer PII outside its contracted merchant scope";
  readonly defaultSeverity: SeverityLevel = "HIGH";

  async evaluate(event: SecurityEvent, _context: RuleContext): Promise<RuleFinding | null> {
    const role = (event.accountRole || "").toLowerCase();
    const isPartnerToken = role.includes("partner") || role.includes("seller");
    if (!isPartnerToken) {
      return null;
    }

    const meta = (event.metadata ?? {}) as Record<string, unknown>;
    const recordsAccessed = Array.isArray(meta.recordsAccessed)
      ? (meta.recordsAccessed.filter((r): r is string => typeof r === "string") as string[])
      : [];
    const tokenId = typeof meta.tokenId === "string" ? meta.tokenId : undefined;

    // Path A: S2 merchant-prefix scope via tokenId + recordsAccessed
    if (tokenId && recordsAccessed.length > 0) {
      const authorisedMerchant = tokenId.startsWith("tok_") ? tokenId.slice(4) : tokenId;
      const outOfScope = recordsAccessed.filter((r) => !r.startsWith(`${authorisedMerchant}:`));
      if (outOfScope.length > 0) {
        return this.createFinding(
          event,
          `Partner token ${tokenId} accessed ${outOfScope.length} customer record(s) outside merchant scope ${authorisedMerchant}`,
          {
            tokenId,
            authorisedMerchant,
            outOfScopeRecords: outOfScope,
            recordsAccessed,
          }
        );
      }
      return null;
    }

    // Path B: explicit authorizedScope array (or PII endpoint with no scope declared)
    const authorizedScope = Array.isArray(meta.authorizedScope)
      ? (meta.authorizedScope.filter((s): s is string => typeof s === "string") as string[])
      : null;

    const endpoint = (event.endpoint || "").toLowerCase();
    const touchesCustomerPii =
      endpoint.includes("/customer") ||
      endpoint.includes("/pii") ||
      (event.resourceType || "").toLowerCase().includes("customer") ||
      (event.dataCategory || "").toUpperCase() === "PII";

    if (authorizedScope && authorizedScope.length > 0) {
      const resourceType = event.resourceType || "";
      if (resourceType && !authorizedScope.includes(resourceType)) {
        return this.createFinding(
          event,
          `Partner token accessed resourceType "${resourceType}" outside authorizedScope`,
          { authorizedScope, resourceType, endpoint: event.endpoint }
        );
      }
      return null;
    }

    if (touchesCustomerPii) {
      return this.createFinding(
        event,
        `Partner/seller token accessed customer PII endpoint without declared authorizedScope: ${event.endpoint}`,
        { authorizedScope: null, resourceType: event.resourceType, endpoint: event.endpoint }
      );
    }

    return null;
  }

  private createFinding(
    event: SecurityEvent,
    reason: string,
    metadata: Record<string, unknown>
  ): RuleFinding {
    return {
      ruleId: this.id,
      ruleName: this.name,
      severity: this.defaultSeverity,
      description: `Partner scope violation: ${reason}.`,
      timestamp: event.timestamp,
      eventId: event.id,
      relatedEventIds: [],
      confidence: 0.9,
      dataCategory: event.dataCategory,
      metadata: {
        accountRole: event.accountRole,
        ...metadata,
      },
    };
  }
}
'''

R7 = r'''import { SecurityEvent, SeverityLevel } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";

/**
 * R7 — Marketing consent drift (stretch, kept simple).
 *
 * Primary path (S3): metadata.purpose !== metadata.consentPurpose.
 * Alternate path: marketing/campaign action with consentStatus !== "ACTIVE".
 */
export class RuleR7ConsentDrift implements SecurityRule {
  readonly id = "R7";
  readonly name = "Marketing Consent Drift";
  readonly description =
    "Triggers when customer data is used for a purpose that differs from the recorded consent purpose";
  readonly defaultSeverity: SeverityLevel = "MEDIUM";

  async evaluate(event: SecurityEvent, _context: RuleContext): Promise<RuleFinding | null> {
    const meta = (event.metadata ?? {}) as Record<string, unknown>;
    const purpose = typeof meta.purpose === "string" ? meta.purpose : undefined;
    const consentPurpose = typeof meta.consentPurpose === "string" ? meta.consentPurpose : undefined;

    // Path A: S3 purpose / consentPurpose check (mismatch fires; match is definitive OK)
    if (purpose !== undefined && consentPurpose !== undefined) {
      if (purpose === consentPurpose) {
        return null;
      }
      return {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.defaultSeverity,
        description: `Consent drift: event purpose "${purpose}" differs from consent purpose "${consentPurpose}".`,
        timestamp: event.timestamp,
        eventId: event.id,
        relatedEventIds: [],
        confidence: 0.85,
        dataCategory: event.dataCategory,
        metadata: {
          purpose,
          consentPurpose,
          endpoint: event.endpoint,
          eventType: event.eventType,
        },
      };
    }

    // Path B: marketing/campaign action without ACTIVE consent
    const eventType = (event.eventType || "").toLowerCase();
    const endpoint = (event.endpoint || "").toLowerCase();
    const isMarketingAction =
      eventType.includes("marketing") ||
      eventType.includes("campaign") ||
      endpoint.includes("marketing") ||
      endpoint.includes("campaign");

    if (!isMarketingAction) {
      return null;
    }

    const consentStatus = typeof meta.consentStatus === "string" ? meta.consentStatus : undefined;
    if (consentStatus === "ACTIVE") {
      return null;
    }

    return {
      ruleId: this.id,
      ruleName: this.name,
      severity: this.defaultSeverity,
      description: `Consent drift: marketing/campaign action without ACTIVE consent (consentStatus=${consentStatus ?? "missing"}).`,
      timestamp: event.timestamp,
      eventId: event.id,
      relatedEventIds: [],
      confidence: 0.85,
      dataCategory: event.dataCategory,
      metadata: {
        consentStatus: consentStatus ?? null,
        endpoint: event.endpoint,
        eventType: event.eventType,
      },
    };
  }
}
'''

R8 = r'''import { SecurityEvent, SeverityLevel } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";

type MandateViolation =
  | "MANDATE_MISSING"
  | "MANDATE_EXPIRED"
  | "LIMIT_EXCEEDED"
  | "MERCHANT_OUT_OF_SCOPE"
  | "PAYMENT_METHOD_MISMATCH";

/**
 * R8 — Agent payment mandate verification.
 *
 * Fires on agent payment events that fail any of the five checks:
 * mandate present, unexpired, paymentAmount within limit, destination in
 * merchantScope, paymentMethodOwner === principalId. Fails closed when
 * mandate is missing. PAYMENT_METHOD_MISMATCH escalates to CRITICAL so
 * risk-scoring can apply the fraud bonus.
 */
export class RuleR8AgentPayment implements SecurityRule {
  readonly id = "R8";
  readonly name = "Agent Payment Mandate Verification";
  readonly description =
    "Triggers when a shopping-agent payment violates mandate presence, expiry, spend limit, merchant scope, or principal ownership";
  readonly defaultSeverity: SeverityLevel = "HIGH";

  async evaluate(event: SecurityEvent, _context: RuleContext): Promise<RuleFinding | null> {
    if (!this.isAgentPayment(event)) {
      return null;
    }

    const violations: MandateViolation[] = [];
    const mandate = event.mandate;

    if (!mandate) {
      violations.push("MANDATE_MISSING");
    } else {
      const eventTime = Date.parse(event.timestamp);
      const expiryTime = Date.parse(mandate.expiry);
      if (!Number.isNaN(eventTime) && !Number.isNaN(expiryTime) && eventTime >= expiryTime) {
        violations.push("MANDATE_EXPIRED");
      }

      if (event.paymentAmount != null && event.paymentAmount > mandate.limit) {
        violations.push("LIMIT_EXCEEDED");
      }

      const merchant = event.destination ?? "";
      if (!merchant || !mandate.merchantScope.includes(merchant)) {
        violations.push("MERCHANT_OUT_OF_SCOPE");
      }
    }

    if (
      !event.paymentMethodOwner ||
      !event.principalId ||
      event.paymentMethodOwner !== event.principalId
    ) {
      violations.push("PAYMENT_METHOD_MISMATCH");
    }

    if (violations.length === 0) {
      return null;
    }

    const severity: SeverityLevel = violations.includes("PAYMENT_METHOD_MISMATCH")
      ? "CRITICAL"
      : violations.includes("MANDATE_MISSING")
        ? "CRITICAL"
        : this.defaultSeverity;

    return {
      ruleId: this.id,
      ruleName: this.name,
      severity,
      description: `Agent payment mandate verification failed: ${violations.join(", ")}.`,
      timestamp: event.timestamp,
      eventId: event.id,
      relatedEventIds: [],
      confidence: 0.95,
      dataCategory: event.dataCategory,
      metadata: {
        violations,
        agentId: event.agentId,
        principalId: event.principalId,
        paymentMethodOwner: event.paymentMethodOwner,
        paymentAmount: event.paymentAmount,
        mandateLimit: mandate?.limit ?? null,
        destination: event.destination,
        mandateExpiry: mandate?.expiry ?? null,
      },
    };
  }

  private isAgentPayment(event: SecurityEvent): boolean {
    const type = (event.eventType || "").toLowerCase();
    if (type.includes("agent") && type.includes("payment")) return true;
    if (type === "payment.agent" || type === "agent_payment" || type === "agent.payment") return true;
    if (event.accountRole === "agent" && event.agentId && (event.paymentAmount != null || event.mandate)) {
      return true;
    }
    return Boolean(event.agentId && event.principalId && (event.mandate || event.paymentAmount != null));
  }
}
'''

INDEX = '''export * from "./rule-interface";
export * from "./r1-login-failures";
export * from "./r2-success-after-failures";
export * from "./r3-api-volume";
export * from "./r4-sensitive-access";
export * from "./r5-unapproved-export";
export * from "./r6-partner-scope";
export * from "./r7-consent-drift";
export * from "./r8-agent-payment";
export * from "./detection-engine";
'''

ENGINE = '''import { SecurityEvent } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";
import { RuleR1LoginFailures } from "./r1-login-failures";
import { RuleR2SuccessAfterFailures } from "./r2-success-after-failures";
import { RuleR3ApiVolumeAndBotLikelihood } from "./r3-api-volume";
import { RuleR4SensitiveAccess } from "./r4-sensitive-access";
import { RuleR5UnapprovedExport } from "./r5-unapproved-export";
import { RuleR6PartnerScope } from "./r6-partner-scope";
import { RuleR7ConsentDrift } from "./r7-consent-drift";
import { RuleR8AgentPayment } from "./r8-agent-payment";

export class DetectionEngine {
  private rules: Map<string, SecurityRule> = new Map();

  constructor() {
    this.registerRule(new RuleR1LoginFailures());
    this.registerRule(new RuleR2SuccessAfterFailures());
    this.registerRule(new RuleR3ApiVolumeAndBotLikelihood());
    this.registerRule(new RuleR4SensitiveAccess());
    this.registerRule(new RuleR5UnapprovedExport());
    this.registerRule(new RuleR6PartnerScope());
    this.registerRule(new RuleR7ConsentDrift());
    this.registerRule(new RuleR8AgentPayment());
  }

  registerRule(rule: SecurityRule): void {
    this.rules.set(rule.id, rule);
  }

  getRule(id: string): SecurityRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): SecurityRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Evaluates an incoming event against all registered deterministic detection rules
   */
  async evaluate(event: SecurityEvent, context: RuleContext): Promise<RuleFinding[]> {
    const findings: RuleFinding[] = [];

    for (const rule of this.rules.values()) {
      try {
        const finding = await rule.evaluate(event, context);
        if (finding) {
          findings.push(finding);
        }
      } catch (err) {
        console.error(`[DETECTION_ENGINE] Error evaluating rule ${rule.id} on event ${event.id}:`, err);
      }
    }

    return findings;
  }
}

// Global singleton instance for in-memory persistence
const globalForEngine = globalThis as unknown as { detectionEngineInstance?: DetectionEngine };
export const detectionEngine = globalForEngine.detectionEngineInstance || new DetectionEngine();
if (process.env.NODE_ENV !== "production") globalForEngine.detectionEngineInstance = detectionEngine;
'''

TEST = r'''import { describe, it, expect, beforeEach } from "vitest";
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
      expiry: "2026-11-20T12:00:00.000Z",
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
'''

def main() -> None:
    (rules / "r6-partner-scope.ts").write_text(R6, encoding="utf-8", newline="\n")
    (rules / "r7-consent-drift.ts").write_text(R7, encoding="utf-8", newline="\n")
    (rules / "r8-agent-payment.ts").write_text(R8, encoding="utf-8", newline="\n")
    (rules / "index.ts").write_text(INDEX, encoding="utf-8", newline="\n")
    (rules / "detection-engine.ts").write_text(ENGINE, encoding="utf-8", newline="\n")
    (tests / "rules-r6-r8.test.ts").write_text(TEST, encoding="utf-8", newline="\n")
    for name in [
        "r6-partner-scope.ts",
        "r7-consent-drift.ts",
        "r8-agent-payment.ts",
        "index.ts",
        "detection-engine.ts",
    ]:
        path = rules / name
        print(f"OK {path} ({path.stat().st_size} bytes)")
    test_path = tests / "rules-r6-r8.test.ts"
    print(f"OK {test_path} ({test_path.stat().st_size} bytes)")

if __name__ == "__main__":
    main()
