/**
 * Scenario replay types. Events are the frozen SecurityEvent from @/lib/types.
 * Fields with no frozen slot (actorLabel, tokenId, purpose, consentPurpose,
 * recordsAccessed) travel in event.metadata under the keys below.
 */
export type { SecurityEvent, AgentPaymentMandate as Mandate } from "@/lib/types";

export const SCENARIO_IDS = ["s1", "s2", "s3", "s4"] as const;
export type ScenarioId = (typeof SCENARIO_IDS)[number];

export type ActorLabel = "human" | "trusted_agent" | "suspicious_bot";

/** eventType values these generators emit. R1/R2/R5 match the auth and export names. */
export const EventType = {
  loginFail: "auth.login.failed",
  loginSuccess: "auth.login.success",
  apiRead: "api.request",
  dataExport: "data.export",
  agentPayment: "payment.agent",
  consentGrant: "consent.grant",
} as const;
export type EventTypeName = (typeof EventType)[keyof typeof EventType];

/** metadata keys used for fields the frozen contract does not model directly. */
export interface ScenarioMetadata {
  actorLabel?: ActorLabel;
  tokenId?: string;
  purpose?: string;
  consentPurpose?: string;
  /** `{merchantId}:customer:{recordId}` strings for R6 scope checks. */
  recordsAccessed?: string[];
  scenario?: ScenarioId;
}

export interface ScenarioSummary {
  id: ScenarioId;
  title: string;
  rules: string[];
  eventCount: number;
}

export function isScenarioId(value: string): value is ScenarioId {
  return (SCENARIO_IDS as readonly string[]).includes(value);
}
