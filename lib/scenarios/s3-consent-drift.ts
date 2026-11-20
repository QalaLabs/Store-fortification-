import type { SecurityEvent } from "@/lib/types";
import { EventType } from "./types";
import { actors, assertChain, eventId, scenarioMeta, stamp } from "./runners";

const BASE = "2026-11-20T09:20:00.000Z";

export const S3_CONSENT_PURPOSE = "order_fulfillment";
export const S3_MISUSE_PURPOSE = "marketing";

/**
 * Consent is captured for order fulfillment, then the same shopper's data is
 * read for marketing. R7 fires where metadata.purpose !== metadata.consentPurpose.
 * Expected rule: R7 (not implemented in lib/rules yet). Volume stays small.
 */
export function buildConsentDrift(): SecurityEvent[] {
  const { userId, sessionId, sourceIp, actorLabel } = actors.s3;
  const shared = { userId, sessionId, sourceIp, accountRole: "customer", httpMethod: "POST", responseStatus: 200 };

  const events: SecurityEvent[] = [
    stamp(eventId("s3", 1), 0, BASE, {
      ...shared,
      eventType: EventType.consentGrant,
      endpoint: "/api/v1/consent",
      dataCategory: "CONSENT",
      metadata: { actorLabel, purpose: S3_CONSENT_PURPOSE, consentPurpose: S3_CONSENT_PURPOSE, scenario: "s3" },
    }),
    stamp(eventId("s3", 2), 8_000, BASE, {
      ...shared,
      source: "marketing-service",
      httpMethod: "GET",
      eventType: EventType.apiRead,
      endpoint: "/api/v1/campaigns/audience",
      resourceType: "customer_profile",
      recordCount: 4,
      dataCategory: "PII",
      metadata: { actorLabel, purpose: S3_MISUSE_PURPOSE, consentPurpose: S3_CONSENT_PURPOSE, scenario: "s3" },
    }),
  ];

  const drift = events.filter((e) => {
    const m = scenarioMeta(e);
    return m.purpose !== undefined && m.consentPurpose !== undefined && m.purpose !== m.consentPurpose;
  });
  if (drift.length !== 1) throw new Error("S3 needs exactly one purpose/consent mismatch");
  return assertChain("s3", events);
}
