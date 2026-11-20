/**
 * Compliance mapping (owned by Aashirwad). Readiness language only. No UI.
 * Produces the frozen ComplianceReport for GET /api/compliance.
 */
import { ComplianceReportSchema, type ComplianceReport, type Incident, type SecurityEvent } from "@/lib/types";
import { getConsentTrackerMeta as readConsentTrackerMeta } from "./consent-tracker";
import { evaluateControls } from "./controls";

export { CONTROL_DEFINITIONS, considerationsForIncident, evaluateControls, type ControlDefinition } from "./controls";
export type { ConsentTrackerEntry, ConsentTrackerMeta } from "./consent-tracker";

export const PROVIDER_STATUS_LABELS = ["MOCK", "CONFIGURED", "BEDROCK_VERIFIED"] as const;
export type ProviderStatusLabel = (typeof PROVIDER_STATUS_LABELS)[number];

export interface WordingRules {
  dpdpPhrase: string;
  coreDpdpObligations: string;
  consentTracker: string;
  pciScope: string;
  providerStatusLabels: readonly ProviderStatusLabel[];
}

const CORE_DPDP_NOTE = "Core DPDP obligations apply from May 2027. This mapping describes readiness, not certification.";
const PCI_SCOPE_NOTE = "Applies only where cardholder data is in scope";

export function getWordingRules(): WordingRules {
  return {
    dpdpPhrase: "DPDP-aligned readiness and controls",
    coreDpdpObligations: CORE_DPDP_NOTE,
    consentTracker: "The consent tracker is a prototype, not a registered Consent Manager.",
    pciScope: "PCI DSS applies only where cardholder data is in scope.",
    providerStatusLabels: [...PROVIDER_STATUS_LABELS],
  };
}

export function getPciScopeNote(): string {
  return PCI_SCOPE_NOTE;
}

/** Builds and schema-validates the frozen ComplianceReport. */
export function buildComplianceReport(
  incidents: readonly Incident[],
  events: readonly SecurityEvent[],
  now: Date = new Date(),
): ComplianceReport {
  return ComplianceReportSchema.parse({ controls: evaluateControls(incidents, events, now), generatedAt: now.toISOString() });
}

export function getConsentTrackerMeta() {
  return readConsentTrackerMeta();
}
