import type { SecurityEvent } from "@/lib/types";
import { EventType } from "./types";
import { actors, assertChain, customerRecord, eventId, scenarioMeta, stamp } from "./runners";

const BASE = "2026-11-20T09:10:00.000Z";

export const S2_TOKEN_ID = actors.s2.tokenId;
export const S2_AUTHORISED_MERCHANT = actors.s2.authorisedMerchant;

/**
 * Seller / partner token reads customer data outside its merchant scope.
 * R6 parse: authorised merchant = metadata.tokenId without `tok_`; each
 * metadata.recordsAccessed entry is `{merchantId}:customer:{recordId}`.
 * Expected rule: R6 (not implemented in lib/rules yet). evt_s2_01 is in scope.
 * Record counts stay under R4's bulk threshold so only scope is at issue.
 */
export function buildSellerScope(): SecurityEvent[] {
  const { userId, sessionId, sourceIp, tokenId } = actors.s2;
  const read = (seq: number, offset: number, records: string[]) =>
    stamp(eventId("s2", seq), offset, BASE, {
      userId,
      sessionId,
      sourceIp,
      source: "partner-api",
      accountRole: "partner",
      eventType: EventType.apiRead,
      endpoint: "/partner/v1/customers",
      httpMethod: "GET",
      responseStatus: 200,
      resourceType: "customer_records",
      recordCount: records.length,
      dataCategory: "PII",
      metadata: { tokenId, recordsAccessed: records, scenario: "s2" },
    });

  const events = [
    read(1, 0, [customerRecord(S2_AUTHORISED_MERCHANT, "c-1001")]),
    read(2, 5_000, ["c-2001", "c-2002", "c-2003"].map((id) => customerRecord("merch_globex", id))),
    read(3, 6_000, ["c-2004", "c-2005"].map((id) => customerRecord("merch_globex", id))),
  ];

  const violations = events.filter((event) =>
    (scenarioMeta(event).recordsAccessed ?? []).some((r) => !r.startsWith(`${S2_AUTHORISED_MERCHANT}:`)),
  );
  if (violations.length < 1) throw new Error("S2 needs an out-of-scope customer read");
  return assertChain("s2", events);
}
