import type { SecurityEvent } from "@/lib/types";
import type { ScenarioId, ScenarioMetadata } from "./types";

/** Fixed demo clock. Replays stay deterministic; nothing here calls Date.now(). */
export const DEMO_DATE = "2026-11-20";

/** User agent R3 classifies as SUSPICIOUS_BOT (contains "python"). */
export const BOT_USER_AGENT = "python-requests/2.31.0";
export const BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

export const actors = {
  s1: { userId: "usr_victim_1001", sessionId: "ses_victim_1001", sourceIp: "203.0.113.42", actorLabel: "suspicious_bot" },
  s2: {
    userId: "usr_partner_northwind",
    sessionId: "ses_partner_northwind",
    sourceIp: "198.51.100.24",
    /** Authorised merchant is the text after `tok_`. */
    tokenId: "tok_merch_acme",
    authorisedMerchant: "merch_acme",
  },
  s3: { userId: "usr_shopper_2002", sessionId: "ses_shopper_2002", sourceIp: "192.0.2.55", actorLabel: "human" },
  s4: {
    userId: "usr_principal_3003",
    sessionId: "ses_agent_3003",
    sourceIp: "203.0.113.77",
    agentId: "agent_shopper_01",
    principalId: "usr_principal_3003",
    tokenId: "tok_mandate_agent_shopper_01",
    actorLabel: "trusted_agent",
    merchant: "merch_acme",
    otherCardOwner: "usr_cardholder_8888",
  },
} as const;

/** Event ids follow the repo convention `evt_...`: evt_s1_01, evt_s1_02, ... */
export function eventId(scenario: ScenarioId, sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 99) {
    throw new Error(`event sequence out of range: ${sequence}`);
  }
  return `evt_${scenario}_${String(sequence).padStart(2, "0")}`;
}

/** ISO timestamp at a stable offset from a scenario base instant. */
export function at(baseIso: string, offsetMs: number): string {
  const base = Date.parse(baseIso);
  if (Number.isNaN(base)) throw new Error(`bad base timestamp: ${baseIso}`);
  if (!Number.isFinite(offsetMs)) throw new Error("offsetMs must be finite");
  return new Date(base + offsetMs).toISOString();
}

/** Fields a generator must supply; frozen defaults are filled in by stamp(). */
export type EventFields = Omit<
  SecurityEvent,
  "id" | "timestamp" | "source" | "userAgent" | "requestCount" | "recordCount" | "metadata"
> &
  Partial<Pick<SecurityEvent, "source" | "userAgent" | "requestCount" | "recordCount">> & {
    metadata?: ScenarioMetadata;
  };

export function stamp(id: string, offsetMs: number, baseIso: string, fields: EventFields): SecurityEvent {
  const { metadata, ...rest } = fields;
  return {
    source: "storefront",
    userAgent: BROWSER_USER_AGENT,
    requestCount: 1,
    recordCount: 0,
    ...rest,
    id,
    timestamp: at(baseIso, offsetMs),
    metadata: { ...(metadata ?? {}) },
  };
}

/** Customer record id. The merchant is the segment before the first colon. */
export function customerRecord(merchantId: string, recordId: string): string {
  return `${merchantId}:customer:${recordId}`;
}

/** Reads the scenario metadata block from any frozen event. */
export function scenarioMeta(event: SecurityEvent): ScenarioMetadata {
  return (event.metadata ?? {}) as ScenarioMetadata;
}

export function assertChain(label: string, events: SecurityEvent[]): SecurityEvent[] {
  if (events.length === 0) throw new Error(`${label} produced no events`);
  const seen = new Set<string>();
  let previous = Number.NEGATIVE_INFINITY;
  for (const event of events) {
    if (seen.has(event.id)) throw new Error(`${label} duplicate id ${event.id}`);
    seen.add(event.id);
    const time = Date.parse(event.timestamp);
    if (Number.isNaN(time)) throw new Error(`${label} bad timestamp on ${event.id}`);
    if (time < previous) throw new Error(`${label} timestamps out of order at ${event.id}`);
    previous = time;
  }
  return events;
}
