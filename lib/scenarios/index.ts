import type { SecurityEvent } from "@/lib/types";
import { buildAccountTakeover } from "./s1-account-takeover";
import { buildSellerScope } from "./s2-seller-scope";
import { buildConsentDrift } from "./s3-consent-drift";
import { buildAgentPayment } from "./s4-agent-payment";
import type { ScenarioId, ScenarioSummary } from "./types";

/**
 * Deterministic scenario generators (owned by Aashirwad). Generators do not detect;
 * they emit the frozen SecurityEvent chain each rule needs.
 *
 * S1 -> R1, R2, R3, R4, R5 (one correlated incident; same userId, sessionId, sourceIp)
 * S2 -> R6  metadata.tokenId scope vs metadata.recordsAccessed merchant prefixes
 * S3 -> R7  metadata.purpose !== metadata.consentPurpose on evt_s3_02
 * S4 -> R8  evt_s4_01 passes; evt_s4_02 fails owner !== principal and amount > limit
 *
 * R6-R8 are not in lib/rules yet, so S2-S4 replay produces no incident today.
 */
const SCENARIOS: Record<ScenarioId, () => SecurityEvent[]> = {
  s1: buildAccountTakeover,
  s2: buildSellerScope,
  s3: buildConsentDrift,
  s4: buildAgentPayment,
};

const TITLES: Record<ScenarioId, string> = {
  s1: "Account takeover and API abuse",
  s2: "Seller API data exposure",
  s3: "Marketing consent drift",
  s4: "Agent payment mismatch",
};

export const EXPECTED_RULES: Record<ScenarioId, readonly string[]> = {
  s1: ["R1", "R2", "R3", "R4", "R5"],
  s2: ["R6"],
  s3: ["R7"],
  s4: ["R8"],
};

export function getScenario(id: ScenarioId): SecurityEvent[] {
  const events = SCENARIOS[id]();
  if (events.length === 0) throw new Error(`scenario ${id} produced no events`);
  return events;
}

export function listScenarios(): ScenarioSummary[] {
  return (Object.keys(SCENARIOS) as ScenarioId[]).map((id) => ({
    id,
    title: TITLES[id],
    rules: [...EXPECTED_RULES[id]],
    eventCount: getScenario(id).length,
  }));
}

export { buildAccountTakeover } from "./s1-account-takeover";
export { buildSellerScope } from "./s2-seller-scope";
export { buildConsentDrift } from "./s3-consent-drift";
export { buildAgentPayment } from "./s4-agent-payment";
export { actors, at, customerRecord, eventId, scenarioMeta, stamp } from "./runners";
export { EventType, isScenarioId, SCENARIO_IDS } from "./types";
export type { ActorLabel, EventTypeName, Mandate, ScenarioId, ScenarioMetadata, ScenarioSummary } from "./types";
