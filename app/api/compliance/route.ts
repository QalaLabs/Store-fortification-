import { NextRequest } from "next/server";
import { eventStore, incidentStore } from "@/lib/store";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { ComplianceReport, ComplianceControl } from "@/lib/types";

/**
 * GET /api/compliance
 * Provides current DPDP-aligned readiness and controls mapping,
 * PCI DSS applicability indicators, and accountability audit trails.
 * Connects directly to real evidence event and incident IDs.
 * Strictly adheres to safe compliance wording.
 */
export async function GET(_request: NextRequest) {
  try {
    const [incidents, events] = await Promise.all([
      incidentStore.getAll(),
      eventStore.getAll(),
    ]);

    const flaggedIncidents = incidents.map((i) => i.id);
    const piiEvents = events.filter((e) => e.dataCategory?.toUpperCase() === "PII").map((e) => e.id);
    const paymentEvents = events.filter((e) => e.dataCategory?.toUpperCase() === "PAYMENT" || Boolean(e.agentId)).map((e) => e.id);
    const consentIncidents = incidents.filter((i) => i.incidentType === "CONSENT_DRIFT").map((i) => i.id);
    const paymentIncidents = incidents.filter((i) => i.incidentType === "AGENT_PAYMENT_MISMATCH").map((i) => i.id);

    const controls: ComplianceControl[] = [
      {
        id: "DPDP-SEC-01",
        framework: "DPDP",
        name: "Security Safeguards & Access Monitoring",
        status: flaggedIncidents.length > 0 ? "FLAGGED" : "READY",
        description: "Continuous surveillance of customer accounts and API endpoints against credential stuffing and brute force.",
        safeWordingStatement: "DPDP-aligned security safeguards and access monitoring controls.",
        evidenceEventIds: piiEvents.slice(0, 10),
        evidenceIncidentIds: flaggedIncidents.slice(0, 5),
        lastEvaluatedAt: new Date().toISOString(),
      },
      {
        id: "DPDP-BREACH-02",
        framework: "DPDP",
        name: "Breach Handling & Incident Notification Readiness",
        status: flaggedIncidents.length > 0 ? "FLAGGED" : "READY",
        description: "Detailed incident records with timestamps, affected scope, and record counts to support timely reporting.",
        safeWordingStatement: "Supports breach-notification readiness and documentation controls.",
        evidenceEventIds: piiEvents.slice(0, 10),
        evidenceIncidentIds: flaggedIncidents.slice(0, 5),
        lastEvaluatedAt: new Date().toISOString(),
      },
      {
        id: "DPDP-CONSENT-03",
        framework: "DPDP",
        name: "Purpose Specification & Consent Tracking",
        status: consentIncidents.length > 0 ? "FLAGGED" : "READY",
        description: "Monitors data usage against customer consent parameters. Prototype consent tracker; not a registered Consent Manager.",
        safeWordingStatement: "Consent-aware controls and drift monitoring (prototype tracker).",
        evidenceEventIds: events.filter((e) => e.eventType.includes("marketing")).map((e) => e.id).slice(0, 5),
        evidenceIncidentIds: consentIncidents,
        lastEvaluatedAt: new Date().toISOString(),
      },
      {
        id: "PCI-DSS-PAY-01",
        framework: "PCI_DSS",
        name: "Cardholder & Payment Anomaly Monitoring",
        status: paymentIncidents.length > 0 ? "FLAGGED" : "READY",
        description: "Monitors payment endpoint anomalies and agent payment authorization scope.",
        safeWordingStatement: "Applies only where cardholder data is in scope. All transactions in prototype are simulated.",
        evidenceEventIds: paymentEvents.slice(0, 10),
        evidenceIncidentIds: paymentIncidents,
        lastEvaluatedAt: new Date().toISOString(),
      },
      {
        id: "AUDIT-TRACE-01",
        framework: "SYSTEM_ACCOUNTABILITY",
        name: "Audit Trail & Human Accountability",
        status: "READY",
        description: "Immutable logging of every detection, proposed action, analyst decision, and simulated execution.",
        safeWordingStatement: "Verifiable evidence trail for internal and regulatory review.",
        evidenceEventIds: events.map((e) => e.id).slice(0, 10),
        evidenceIncidentIds: flaggedIncidents.slice(0, 5),
        lastEvaluatedAt: new Date().toISOString(),
      },
    ];

    const report: ComplianceReport = {
      disclaimer:
        "CartGuard AI provides DPDP-aligned readiness and controls. Core DPDP obligations apply from May 2027. This prototype does not claim full DPDP certification or registered Consent Manager status. PCI DSS controls apply strictly where cardholder data is in scope.",
      controls,
      generatedAt: new Date().toISOString(),
    };

    return successResponse(report);
  } catch (error) {
    return handleApiError(error, "Failed to generate compliance report");
  }
}
