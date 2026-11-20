import type {
  ConfirmedEvidenceItem,
  Incident,
  InvestigationResult,
  RecommendedResponse,
  SecurityEvent,
} from "@/lib/types";
import { considerationsForIncident } from "@/lib/compliance";
import type { InvestigationProvider } from "./provider";

/** Metadata keys the scenario generators use for fields with no frozen slot. */
interface EventMeta {
  actorLabel?: string;
  tokenId?: string;
  purpose?: string;
  consentPurpose?: string;
  recordsAccessed?: unknown;
}

/** Fixed placeholder; the mock does not estimate certainty. Disclosed in unknowns. */
export const MOCK_CONFIDENCE = 0.5;

function meta(event: SecurityEvent): EventMeta {
  return (event.metadata ?? {}) as EventMeta;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function unique(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))];
}

function records(event: SecurityEvent): string | undefined {
  const list = meta(event).recordsAccessed;
  if (Array.isArray(list)) {
    const parts = list.map(str).filter((v): v is string => Boolean(v));
    if (parts.length > 0) return parts.join(", ");
  }
  return event.recordCount > 0 ? `${event.recordCount} record(s)` : undefined;
}

/** Events on the incident, in incident order, deduplicated. Others are ignored. */
function selectEvents(incident: Incident, events: SecurityEvent[]): SecurityEvent[] {
  const byId = new Map<string, SecurityEvent>();
  for (const event of events) if (!byId.has(event.id)) byId.set(event.id, event);
  return incident.eventIds.flatMap((id) => {
    const event = byId.get(id);
    return event ? [event] : [];
  });
}

function ruleIndex(incident: Incident): Map<string, string> {
  const index = new Map<string, string>();
  for (const item of incident.evidence) if (item.ruleId && !index.has(item.eventId)) index.set(item.eventId, item.ruleId);
  return index;
}

function evidenceForEvent(event: SecurityEvent, rules: Map<string, string>): ConfirmedEvidenceItem[] {
  const m = meta(event);
  const ruleTriggered = rules.get(event.id);
  const item = (finding: string): ConfirmedEvidenceItem =>
    ruleTriggered ? { eventId: event.id, finding, confidence: 1, ruleTriggered } : { eventId: event.id, finding, confidence: 1 };

  const items: ConfirmedEvidenceItem[] = [];
  const actor = unique([
    str(m.actorLabel) && `actor label ${m.actorLabel}`,
    event.agentId && `agent ${event.agentId}`,
    event.principalId && `principal ${event.principalId}`,
  ]).join(", ");
  items.push(
    item(
      `Event ${event.id} is recorded as "${event.eventType}" on ${event.httpMethod} ${event.endpoint} (HTTP ${event.responseStatus}) at ${event.timestamp}${actor ? ` with ${actor}` : ""}.`,
    ),
  );

  const ids = unique([
    event.userId && `user ${event.userId}`,
    event.sessionId && `session ${event.sessionId}`,
    `source IP ${event.sourceIp}`,
    str(m.tokenId) && `token ${m.tokenId}`,
  ]);
  items.push(item(`Event ${event.id} records ${ids.join(", ")}.`));

  if (event.mandate) {
    const { limit, merchantScope, expiry } = event.mandate;
    items.push(item(`Event ${event.id} records a mandate with limit ${limit}, merchant scope ${merchantScope.join(", ")}, expiry ${expiry}.`));
  }

  const data = unique([
    records(event) && `accessed ${records(event)}`,
    event.paymentMethodOwner && `payment method owner ${event.paymentMethodOwner}`,
    event.destination && `destination ${event.destination}`,
    event.approvedDestination === false ? "destination marked unapproved" : undefined,
    event.paymentAmount != null ? `payment amount ${event.paymentAmount}${event.currency ? ` ${event.currency}` : ""}` : undefined,
    str(m.purpose) && `purpose "${m.purpose}"`,
    str(m.consentPurpose) && `consent purpose "${m.consentPurpose}"`,
  ]);
  if (data.length > 0) items.push(item(`Event ${event.id} names ${data.join("; ")}.`));
  return items;
}

function buildSummary(incident: Incident, cited: SecurityEvent[]): string {
  const types = unique(cited.map((e) => e.eventType));
  return `Incident ${incident.id} "${incident.title}" (${incident.incidentType}) is recorded with severity ${incident.severity} and risk score ${incident.riskScore}. ${cited.length} cited event(s) of type ${types.join(", ") || "none"} are explained from recorded fields only.`;
}

function buildHypothesis(incident: Incident, cited: SecurityEvent[]): string {
  if (cited.length === 0) {
    return `Hypothesis: No event payload supplied for incident ${incident.id} matched its event list, so no activity explanation can be formed.`;
  }
  const observed = unique([
    unique(cited.map((e) => str(meta(e).actorLabel))).length ? `actor label(s) ${unique(cited.map((e) => str(meta(e).actorLabel))).join(", ")}` : undefined,
    unique(cited.map((e) => e.agentId)).length ? `agent id(s) ${unique(cited.map((e) => e.agentId)).join(", ")}` : undefined,
    `event type(s) ${unique(cited.map((e) => e.eventType)).join(", ")}`,
  ]).join("; ");
  return `Hypothesis: The cited events on incident ${incident.id} may describe one activity involving ${observed}. This is an unverified explanation of the provided records, not a detection.`;
}

function buildBusinessImpact(incident: Incident, cited: SecurityEvent[]): string {
  const details = unique([
    unique(cited.map(records)).length ? `records ${unique(cited.map(records)).join("; ")}` : undefined,
    unique(cited.map((e) => e.paymentMethodOwner)).length ? `payment method owner(s) ${unique(cited.map((e) => e.paymentMethodOwner)).join(", ")}` : undefined,
    unique(cited.map((e) => e.destination)).length ? `destination(s) ${unique(cited.map((e) => e.destination)).join(", ")}` : undefined,
  ]);
  const impact = details.length
    ? `The cited events name ${details.join("; ")}. Potential impact is limited to those named fields.`
    : "The cited events do not name records, a payment method owner, or a destination.";
  return `Incident ${incident.id} has severity ${incident.severity} and risk score ${incident.riskScore}. ${impact} This is not a compliance or certification determination.`;
}

function buildResponse(incident: Incident, cited: SecurityEvent[]): RecommendedResponse {
  const action: RecommendedResponse["action"] =
    incident.incidentType === "AGENT_PAYMENT_MISMATCH" ? "BLOCK" : incident.severity === "CRITICAL" ? "CONTAIN" : "ALERT";
  const priority: RecommendedResponse["priority"] =
    incident.severity === "CRITICAL" ? "IMMEDIATE" : incident.severity === "HIGH" ? "HIGH" : "STANDARD";
  const targetActor = incident.affectedUserIds[0] ?? cited.find((e) => e.userId)?.userId ?? undefined;
  const response: RecommendedResponse = {
    action,
    priority,
    rationale: `Proposed ${action} for ${incident.incidentType} at severity ${incident.severity}. This is a proposal for analyst review; it runs only after analyst approval and only in simulated mode.`,
  };
  return targetActor ? { ...response, targetActor } : response;
}

function buildUnknowns(incident: Incident, cited: SecurityEvent[]): string[] {
  const present = new Set(cited.map((e) => e.id));
  const unknowns = incident.eventIds
    .filter((id) => !present.has(id))
    .map((id) => `Incident lists event ${id}, but that event was not provided, so its contents are unverified.`);
  unknowns.push("Whether any cited actor was authorized for the recorded actions is unverified.");
  unknowns.push(`Overall confidence ${MOCK_CONFIDENCE} is a fixed mock placeholder, not an estimate.`);

  for (const e of cited) {
    const m = meta(e);
    if (str(m.purpose) && str(m.consentPurpose) && m.purpose !== m.consentPurpose) {
      unknowns.push(`Whether purpose "${m.purpose}" on ${e.id} is covered by consent purpose "${m.consentPurpose}" is unverified.`);
    }
    if (e.mandate) {
      if (e.destination) unknowns.push(`Whether destination "${e.destination}" on ${e.id} is inside the recorded merchant scope is unverified.`);
      unknowns.push(`Whether the mandate on ${e.id} was unexpired at ${e.timestamp} (recorded expiry ${e.mandate.expiry}) is unverified.`);
      if (e.paymentAmount != null) unknowns.push(`Whether payment amount ${e.paymentAmount} on ${e.id} is within mandate limit ${e.mandate.limit} is unverified.`);
    }
    if (e.paymentMethodOwner && e.principalId) {
      unknowns.push(`Whether payment method owner ${e.paymentMethodOwner} on ${e.id} is principal ${e.principalId} is unverified.`);
    }
  }
  return unknowns;
}

/**
 * Deterministic explanation built strictly from the incident and the events handed in.
 * Events not on the incident are ignored and never cited. Output is still untrusted
 * until validator.ts accepts it.
 */
export function buildMockInvestigation(incident: Incident, events: SecurityEvent[]): Omit<InvestigationResult, "providerUsed"> {
  const cited = selectEvents(incident, events);
  const rules = ruleIndex(incident);
  return {
    executiveSummary: buildSummary(incident, cited),
    confirmedEvidence: cited.flatMap((e) => evidenceForEvent(e, rules)),
    rootCauseHypothesis: buildHypothesis(incident, cited),
    confidence: MOCK_CONFIDENCE,
    businessImpact: buildBusinessImpact(incident, cited),
    complianceConsiderations: considerationsForIncident(incident),
    recommendedResponse: buildResponse(incident, cited),
    unknownsAndLimitations: buildUnknowns(incident, cited),
  };
}

export const mockProvider: InvestigationProvider = {
  async investigate(incident, events) {
    return { raw: buildMockInvestigation(incident, events), providerUsed: "MOCK" };
  },
};
