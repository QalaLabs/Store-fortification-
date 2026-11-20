import { describe, it, expect } from "vitest";
import {
  SecurityEventSchema,
  IncidentSchema,
  ResponseActionSchema,
  InvestigationResultSchema,
  AgentPaymentMandateSchema,
} from "@/lib/types";

describe("Shared Contracts & Schemas Validation", () => {
  describe("SecurityEvent Contract", () => {
    it("validates a standard security event with all required fields", () => {
      const validEvent = {
        id: "evt_1001",
        timestamp: "2026-11-20T12:00:00Z",
        source: "storefront",
        eventType: "auth.login.failed",
        userId: "usr_cust_44",
        sessionId: "sess_abc123",
        sourceIp: "198.51.100.25",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        accountRole: "customer",
        endpoint: "/api/v1/auth/login",
        httpMethod: "POST",
        responseStatus: 401,
        requestCount: 1,
        resourceType: "customer_profile",
        recordCount: 0,
        dataCategory: "PII",
        destination: null,
        approvedDestination: null,
        paymentAmount: null,
        currency: null,
        transactionId: null,
        metadata: { attemptNumber: 4 },
      };

      const parsed = SecurityEventSchema.parse(validEvent);
      expect(parsed.id).toBe("evt_1001");
      expect(parsed.eventType).toBe("auth.login.failed");
      expect(parsed.sourceIp).toBe("198.51.100.25");
      expect(parsed.agentId).toBeUndefined();
    });

    it("validates mandatory optional agent-payment fields when present", () => {
      const agentEvent = {
        id: "evt_agent_pay_01",
        timestamp: "2026-11-20T12:05:00Z",
        source: "checkout-gateway",
        eventType: "payment.mandate.executed",
        userId: "usr_principal_77",
        sessionId: "sess_agent_session_99",
        sourceIp: "203.0.113.50",
        userAgent: "ShoppingAgentBot/2.1 (QalaBot)",
        accountRole: "agent",
        endpoint: "/api/v1/checkout/pay",
        httpMethod: "POST",
        responseStatus: 200,
        requestCount: 1,
        resourceType: "order_payment",
        recordCount: 1,
        dataCategory: "PAYMENT",
        destination: "https://pay.store.internal",
        approvedDestination: true,
        paymentAmount: 4999.0,
        currency: "INR",
        transactionId: "tx_pay_99812",
        metadata: { itemCategory: "electronics" },
        // MANDATORY AGENT FIELDS
        agentId: "agent_shop_bot_007",
        principalId: "usr_principal_77",
        mandate: {
          limit: 10000.0,
          merchantScope: ["qala-store", "electronics-hub"],
          expiry: "2026-11-25T00:00:00Z",
        },
        paymentMethodOwner: "usr_principal_77",
      };

      const parsed = SecurityEventSchema.parse(agentEvent);
      expect(parsed.agentId).toBe("agent_shop_bot_007");
      expect(parsed.principalId).toBe("usr_principal_77");
      expect(parsed.mandate?.limit).toBe(10000.0);
      expect(parsed.mandate?.merchantScope).toContain("qala-store");
      expect(parsed.paymentMethodOwner).toBe("usr_principal_77");
    });

    it("rejects an invalid agent mandate with negative limit or empty scope", () => {
      expect(() =>
        AgentPaymentMandateSchema.parse({
          limit: -50,
          merchantScope: [],
          expiry: "not-a-date",
        })
      ).toThrow();
    });

    it("rejects an event with missing required fields or invalid types", () => {
      const invalidEvent = {
        id: "evt_invalid",
        // missing timestamp
        // missing source
        eventType: "unknown",
        sourceIp: "", // empty
        endpoint: "/test",
        httpMethod: "GET",
        responseStatus: 999, // out of range
      };

      expect(() => SecurityEventSchema.parse(invalidEvent)).toThrow();
    });

    it("rejects an event with invalid ISO datetime string", () => {
      const invalidTimeEvent = {
        id: "evt_1002",
        timestamp: "invalid-iso-string",
        source: "api",
        eventType: "read",
        sourceIp: "127.0.0.1",
        userAgent: "agent",
        endpoint: "/items",
        httpMethod: "GET",
        responseStatus: 200,
        requestCount: 1,
        recordCount: 0,
        dataCategory: "GENERAL",
      };

      expect(() => SecurityEventSchema.parse(invalidTimeEvent)).toThrow();
    });
  });

  describe("Incident Contract", () => {
    it("validates a complete Incident schema", () => {
      const validIncident = {
        id: "inc_s1_001",
        title: "Account Takeover & High-Volume Data Exfiltration",
        incidentType: "ACCOUNT_TAKEOVER_API_ABUSE",
        severity: "CRITICAL",
        status: "OPEN",
        createdAt: "2026-11-20T12:10:00Z",
        updatedAt: "2026-11-20T12:10:00Z",
        affectedUserIds: ["usr_cust_44"],
        affectedSessions: ["sess_abc123"],
        affectedResources: ["customer_profile", "orders"],
        eventIds: ["evt_1001", "evt_1002", "evt_1003"],
        evidence: [
          {
            eventId: "evt_1001",
            description: "Repeated failed logins detected on account usr_cust_44",
            ruleId: "R1",
          },
        ],
        riskScore: 92,
        summary: "Brute force followed by anomalous API export",
        investigationStatus: "PENDING",
        recommendedActions: ["CONTAIN", "BLOCK"],
        assignedTo: "Aayush",
        timeline: [
          {
            timestamp: "2026-11-20T12:10:00Z",
            description: "Incident correlated by detection engine",
            type: "DETECTION",
          },
        ],
      };

      const parsed = IncidentSchema.parse(validIncident);
      expect(parsed.id).toBe("inc_s1_001");
      expect(parsed.severity).toBe("CRITICAL");
      expect(parsed.riskScore).toBe(92);
      expect(parsed.eventIds).toHaveLength(3);
    });

    it("rejects an incident without referenced event IDs", () => {
      const invalidIncident = {
        id: "inc_empty",
        title: "Empty Incident",
        incidentType: "TEST",
        severity: "LOW",
        createdAt: "2026-11-20T12:00:00Z",
        updatedAt: "2026-11-20T12:00:00Z",
        eventIds: [], // Empty not allowed
        riskScore: 20,
        summary: "Empty",
      };

      expect(() => IncidentSchema.parse(invalidIncident)).toThrow();
    });
  });

  describe("ResponseAction Contract", () => {
    it("validates ResponseAction schema with dry-run and approval metadata", () => {
      const action = {
        id: "act_contain_01",
        incidentId: "inc_s1_001",
        actionType: "CONTAIN",
        status: "PROPOSED",
        proposedAt: "2026-11-20T12:15:00Z",
        dryRunResult: {
          targetEntity: "198.51.100.25",
          impactedUsers: 1,
          impactedSessions: 1,
          blastRadius: "MINIMAL",
          estimatedDowntimeMinutes: 0,
          summary: "Tarpit and deception mode proposed",
          projectedEffect: "Defensive isolation",
        },
        approvalMetadata: {
          decision: "PENDING",
        },
        auditReferences: ["aud_init_01"],
      };

      const parsed = ResponseActionSchema.parse(action);
      expect(parsed.id).toBe("act_contain_01");
      expect(parsed.actionType).toBe("CONTAIN");
      expect(parsed.dryRunResult.blastRadius).toBe("MINIMAL");
      expect(parsed.approvalMetadata.decision).toBe("PENDING");
    });
  });

  describe("InvestigationResult Contract", () => {
    it("validates InvestigationResult enforcing confirmed evidence with event citations", () => {
      const investigation = {
        executiveSummary: "Confirmed account takeover with bulk data exfiltration attempt.",
        confirmedEvidence: [
          {
            eventId: "evt_1001",
            finding: "5 consecutive failed authentication attempts within 60 seconds",
            confidence: 0.98,
            ruleTriggered: "R1",
          },
        ],
        rootCauseHypothesis: "Credential stuffing from compromised botnet IP address",
        confidence: 0.95,
        businessImpact: "Risk of PII exposure for high-value customer profile",
        complianceConsiderations: [
          {
            framework: "DPDP",
            controlId: "DPDP-SEC-01",
            controlTitle: "Security Safeguards",
            status: "FLAGGED",
            note: "DPDP-aligned readiness and controls require swift containment and evidence logging.",
          },
        ],
        recommendedResponse: {
          action: "CONTAIN",
          rationale: "Tarpit attacker while keeping real customer safe",
          priority: "IMMEDIATE",
          targetActor: "198.51.100.25",
        },
        unknownsAndLimitations: ["External proxy identity unconfirmed"],
        providerUsed: "MOCK",
      };

      const parsed = InvestigationResultSchema.parse(investigation);
      expect(parsed.confirmedEvidence[0].eventId).toBe("evt_1001");
      expect(parsed.providerUsed).toBe("MOCK");
    });
  });
});
