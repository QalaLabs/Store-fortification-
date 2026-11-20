import type { SecurityEvent } from "@/lib/types";
import { EventType } from "./types";
import { actors, assertChain, BOT_USER_AGENT, eventId, stamp } from "./runners";

/** S1 starts at 09:00 UTC so later scenarios do not share its timestamps. */
const BASE = "2026-11-20T09:00:00.000Z";

/** Above R4's bulk threshold (10). */
export const S1_BULK_RECORD_COUNT = 500;

/** Not on R5's approved-destination allowlist. Host is documentation-only (RFC 2606). */
export const S1_UNAPPROVED_DESTINATION = "https://drop.unapproved.example/usr_victim_1001";

const LOGIN_FAILURES = 5;
const API_READS = 5;
/** Per-read requestCount; 5 reads x 5 = 25 >= R3's burst threshold of 15 in one minute. */
const REQUESTS_PER_READ = 5;

/**
 * Account takeover plus API abuse.
 * auth.login.failed x5 -> auth.login.success -> bulk sensitive api.request burst
 * -> data.export to an unapproved destination. Same userId, sessionId, sourceIp.
 * Expected rules: R1, R2, R3, R4, R5 (one correlated incident).
 */
export function buildAccountTakeover(): SecurityEvent[] {
  const { userId, sessionId, sourceIp, actorLabel } = actors.s1;
  const shared = { userId, sessionId, sourceIp, userAgent: BOT_USER_AGENT, accountRole: "customer" };
  const events: SecurityEvent[] = [];

  for (let n = 1; n <= LOGIN_FAILURES; n += 1) {
    events.push(
      stamp(eventId("s1", n), (n - 1) * 4_000, BASE, {
        ...shared,
        eventType: EventType.loginFail,
        endpoint: "/api/v1/auth/login",
        httpMethod: "POST",
        responseStatus: 401,
        dataCategory: "CREDENTIALS",
        metadata: { actorLabel, scenario: "s1" },
      }),
    );
  }

  events.push(
    stamp(eventId("s1", LOGIN_FAILURES + 1), 19_000, BASE, {
      ...shared,
      eventType: EventType.loginSuccess,
      endpoint: "/api/v1/auth/login",
      httpMethod: "POST",
      responseStatus: 200,
      dataCategory: "CREDENTIALS",
      metadata: { actorLabel, scenario: "s1" },
    }),
  );

  for (let i = 0; i < API_READS; i += 1) {
    const pii = i % 2 === 0;
    events.push(
      stamp(eventId("s1", LOGIN_FAILURES + 2 + i), 22_000 + i * 100, BASE, {
        ...shared,
        eventType: EventType.apiRead,
        endpoint: pii ? "/api/v1/customers" : "/api/v1/orders",
        httpMethod: "GET",
        responseStatus: 200,
        requestCount: REQUESTS_PER_READ,
        resourceType: pii ? "customers" : "orders",
        recordCount: S1_BULK_RECORD_COUNT,
        dataCategory: pii ? "PII" : "ORDER",
        metadata: { actorLabel, purpose: pii ? "customer_pii" : "order_data", scenario: "s1" },
      }),
    );
  }

  events.push(
    stamp(eventId("s1", LOGIN_FAILURES + 2 + API_READS), 25_000, BASE, {
      ...shared,
      eventType: EventType.dataExport,
      endpoint: "/api/v1/customers/export",
      httpMethod: "POST",
      responseStatus: 200,
      resourceType: "customers",
      recordCount: S1_BULK_RECORD_COUNT,
      dataCategory: "PII",
      destination: S1_UNAPPROVED_DESTINATION,
      approvedDestination: false,
      metadata: { actorLabel, purpose: "customer_pii", scenario: "s1" },
    }),
  );

  const correlation = `${userId}|${sessionId}|${sourceIp}`;
  if (events.some((e) => `${e.userId}|${e.sessionId}|${e.sourceIp}` !== correlation)) {
    throw new Error("S1 events must share userId, sessionId, and sourceIp");
  }
  if (events[events.length - 1]?.eventType !== EventType.dataExport) {
    throw new Error("S1 must end with data.export");
  }
  return assertChain("s1", events);
}
