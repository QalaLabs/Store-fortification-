import { SecurityEvent, SeverityLevel } from "@/lib/types";
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
