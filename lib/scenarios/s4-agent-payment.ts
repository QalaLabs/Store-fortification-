import type { AgentPaymentMandate, SecurityEvent } from "@/lib/types";
import { EventType } from "./types";
import { actors, assertChain, eventId, stamp } from "./runners";

const BASE = "2026-11-20T09:30:00.000Z";

export const S4_MANDATE_LIMIT = 50;
export const S4_PASS_AMOUNT = 22;
export const S4_FAIL_AMOUNT = 175;
export const S4_MERCHANT = actors.s4.merchant;
export const S4_PASS_EVENT_ID = eventId("s4", 1);
export const S4_FAIL_EVENT_ID = eventId("s4", 2);

/** Mandate stays valid through both payments; the fail is owner mismatch and amount over limit. */
function shoppingMandate(): AgentPaymentMandate {
  return { limit: S4_MANDATE_LIMIT, merchantScope: [S4_MERCHANT], expiry: "2026-11-20T12:00:00.000Z" };
}

/**
 * Agent payment differentiator (R8, not implemented in lib/rules yet).
 * evt_s4_01 passes all five checks: mandate present, unexpired, paymentAmount
 * within limit, merchant (destination) in scope, payment method owned by principal.
 * evt_s4_02 fails: paymentMethodOwner !== principalId and paymentAmount > limit.
 * accountRole "agent" + agentId + mandate makes R3 classify it TRUSTED_SHOPPING_AGENT.
 */
export function buildAgentPayment(): SecurityEvent[] {
  const { userId, sessionId, sourceIp, agentId, principalId, tokenId, actorLabel, otherCardOwner } = actors.s4;
  const shared = {
    userId,
    sessionId,
    sourceIp,
    agentId,
    principalId,
    source: "agent-checkout",
    userAgent: "CartGuardShoppingAgent/1.0",
    accountRole: "agent",
    eventType: EventType.agentPayment,
    endpoint: "/api/v1/checkout/agent-pay",
    httpMethod: "POST",
    responseStatus: 200,
    dataCategory: "PAYMENT",
    destination: S4_MERCHANT,
    currency: "USD",
    metadata: { actorLabel, tokenId, scenario: "s4" as const },
  };

  const events: SecurityEvent[] = [
    stamp(S4_PASS_EVENT_ID, 0, BASE, {
      ...shared,
      mandate: shoppingMandate(),
      paymentMethodOwner: principalId,
      paymentAmount: S4_PASS_AMOUNT,
      transactionId: "txn_s4_01",
    }),
    stamp(S4_FAIL_EVENT_ID, 5_000, BASE, {
      ...shared,
      mandate: shoppingMandate(),
      paymentMethodOwner: otherCardOwner,
      paymentAmount: S4_FAIL_AMOUNT,
      transactionId: "txn_s4_02",
    }),
  ];

  for (const event of events) {
    const m = event.mandate;
    if (!event.agentId || !event.principalId || !event.paymentMethodOwner || !m) {
      throw new Error(`S4 ${event.id} is missing agent payment fields`);
    }
    if (Date.parse(event.timestamp) >= Date.parse(m.expiry)) throw new Error(`S4 ${event.id} must sit inside a live mandate`);
    if (!m.merchantScope.includes(event.destination ?? "")) throw new Error(`S4 ${event.id} merchant must stay in scope`);
    if (event.paymentAmount == null) throw new Error(`S4 ${event.id} needs paymentAmount for the limit check`);
  }
  const [pass, fail] = events;
  if (!pass || pass.paymentMethodOwner !== pass.principalId || (pass.paymentAmount ?? 0) > S4_MANDATE_LIMIT) {
    throw new Error("S4 pass payment must be owned by the principal and within limit");
  }
  if (!fail || fail.paymentMethodOwner === fail.principalId || (fail.paymentAmount ?? 0) <= S4_MANDATE_LIMIT) {
    throw new Error("S4 fail payment must have a foreign owner and exceed the limit");
  }
  return assertChain("s4", events);
}
