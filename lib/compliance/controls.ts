import type { ComplianceConsideration, ComplianceControl, Incident, SecurityEvent } from "@/lib/types";

/**
 * PRD section 6 control rows, mapped onto the frozen ComplianceControl contract.
 * Readiness language only: nothing here claims certification or compliance.
 */
export interface ControlDefinition {
  id: string;
  framework: ComplianceControl["framework"];
  name: string;
  description: string;
  safeWordingStatement: string;
  evidenceHints: readonly string[];
  /** Incident types that put this control in FLAGGED state. Empty = any incident. */
  flagOn: readonly string[] | "any" | "never";
  /** Status when nothing flags it. */
  idleStatus: "READY" | "MONITORING";
}

export const CONTROL_DEFINITIONS: readonly ControlDefinition[] = [
  {
    id: "DPDP-SEC-01",
    framework: "DPDP",
    name: "DPDP: security safeguards",
    description: "Detection, incident log, access monitoring",
    safeWordingStatement: "DPDP-aligned security safeguards",
    evidenceHints: ["Detection rule hits attached to the incident", "Incident log entry", "Access monitoring events for login, API read, and export"],
    flagOn: "any",
    idleStatus: "READY",
  },
  {
    id: "DPDP-BREACH-02",
    framework: "DPDP",
    name: "DPDP: breach handling",
    description: "Incident record with time, scope and records exposed",
    safeWordingStatement: "Supports breach-notification readiness",
    evidenceHints: ["Incident timestamp", "Scope of the affected user, session, and destination", "recordCount on the incident events"],
    flagOn: ["ACCOUNT_TAKEOVER_API_ABUSE", "SELLER_DATA_EXPOSURE"],
    idleStatus: "READY",
  },
  {
    id: "DPDP-CONSENT-03",
    framework: "DPDP",
    name: "DPDP: purpose and consent",
    description: "R7 flags use of data beyond consent; prototype consent tracker",
    safeWordingStatement: "Consent-aware controls, not a registered Consent Manager",
    evidenceHints: ["R7 when event purpose differs from consentPurpose", "Prototype consent tracker entry for the granted purpose"],
    flagOn: ["CONSENT_DRIFT"],
    idleStatus: "MONITORING",
  },
  {
    id: "PCI-DSS-PAY-01",
    framework: "PCI_DSS",
    name: "PCI DSS",
    description: "Payment anomaly and access logging, only where cardholder data is in scope",
    safeWordingStatement: "Applies only where cardholder data is in scope",
    evidenceHints: ["Payment anomaly events when cardholder data is in scope", "Access log entries tied to payment method use"],
    flagOn: ["AGENT_PAYMENT_MISMATCH"],
    idleStatus: "MONITORING",
  },
  {
    id: "AUDIT-ACC-01",
    framework: "SYSTEM_ACCOUNTABILITY",
    name: "Audit and accountability",
    description: "Every proposal, approval and action is logged",
    safeWordingStatement: "Evidence trail for review",
    evidenceHints: ["Logged response proposal", "Logged human approval", "Logged action after approval"],
    flagOn: "never",
    idleStatus: "READY",
  },
];

function flags(def: ControlDefinition, incident: Incident): boolean {
  if (def.flagOn === "any") return true;
  if (def.flagOn === "never") return false;
  return def.flagOn.includes(incident.incidentType);
}

function eventMatches(def: ControlDefinition, event: SecurityEvent): boolean {
  const category = event.dataCategory?.toUpperCase();
  if (def.framework === "PCI_DSS") return category === "PAYMENT" || Boolean(event.agentId);
  if (def.id === "DPDP-CONSENT-03") return Boolean((event.metadata as Record<string, unknown>)?.consentPurpose);
  if (def.framework === "DPDP") return category === "PII";
  return false;
}

/** Evaluates every control against current incidents and events. `now` is injectable for tests. */
export function evaluateControls(
  incidents: readonly Incident[],
  events: readonly SecurityEvent[],
  now: Date = new Date(),
): ComplianceControl[] {
  return CONTROL_DEFINITIONS.map((def) => {
    const flagged = incidents.filter((incident) => flags(def, incident));
    return {
      id: def.id,
      framework: def.framework,
      name: def.name,
      status: flagged.length > 0 ? "FLAGGED" : def.idleStatus,
      description: def.description,
      safeWordingStatement: def.safeWordingStatement,
      evidenceEventIds: events.filter((e) => eventMatches(def, e)).map((e) => e.id).slice(0, 10),
      evidenceIncidentIds: flagged.map((i) => i.id).slice(0, 5),
      lastEvaluatedAt: now.toISOString(),
    };
  });
}

/** Per-incident considerations for InvestigationResult.complianceConsiderations. */
export function considerationsForIncident(incident: Incident): ComplianceConsideration[] {
  return CONTROL_DEFINITIONS.filter((def) => def.flagOn !== "never" && flags(def, incident)).map((def) => ({
    framework: def.framework === "PCI_DSS" ? "PCI_DSS" : def.framework === "DPDP" ? "DPDP" : "GENERAL_AUDIT",
    controlId: def.id,
    controlTitle: def.name,
    status: "FLAGGED",
    note: `${def.safeWordingStatement}. Readiness mapping only, not a compliance or certification determination.`,
  }));
}
