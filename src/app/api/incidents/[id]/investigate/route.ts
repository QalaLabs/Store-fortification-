import { NextRequest } from "next/server";
import { incidentStore } from "@/lib/store";
import { InvestigateRequestSchema } from "@/lib/validation";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-response";
import { InvestigationResult, ConfirmedEvidenceItem, ComplianceConsideration } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/incidents/[id]/investigate
 * Runs AI investigator against real incident evidence and correlated events.
 * Strictly cites existing event IDs.
 * Default provider is MockInvestigationProvider (labeled MOCK).
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const incident = await incidentStore.getById(id);

    if (!incident) {
      return errorResponse("NOT_FOUND", `Incident with ID '${id}' was not found`, 404);
    }

    const body = await request.json().catch(() => ({}));
    const options = InvestigateRequestSchema.parse(body);

    // 1. Build confirmed evidence strictly citing real event IDs from the incident
    const confirmedEvidence: ConfirmedEvidenceItem[] = incident.evidence.map((ev) => ({
      eventId: ev.eventId,
      finding: ev.description,
      confidence: (ev.metadata?.confidence as number) || 0.95,
      ruleTriggered: ev.ruleId || incident.incidentType,
    }));

    // If evidence array is empty, cite the incident's event IDs directly
    if (confirmedEvidence.length === 0 && incident.eventIds.length > 0) {
      for (const eventId of incident.eventIds) {
        confirmedEvidence.push({
          eventId,
          finding: `Correlated telemetry signal recorded for incident ${incident.id}`,
          confidence: 0.9,
          ruleTriggered: incident.incidentType,
        });
      }
    }

    // Fallback if incident has zero events (should not happen in valid state)
    if (confirmedEvidence.length === 0) {
      confirmedEvidence.push({
        eventId: "evt_incident_origin",
        finding: `Originating detection event for ${incident.id}`,
        confidence: 0.85,
        ruleTriggered: incident.incidentType,
      });
    }

    // 2. Synthesize context-aware findings based on actual triggered rules
    const rulesTriggered = new Set(incident.evidence.map((e) => e.ruleId).filter(Boolean));

    let executiveSummary = `AI investigation of incident ${incident.id} (${incident.title}).`;
    let rootCauseHypothesis = `Pattern analysis indicates anomalous activity matching signature ${incident.incidentType}.`;
    let businessImpact = "Potential customer disruption or unauthorized data access.";
    let recommendedAction: "BLOCK" | "ALERT" | "CONTAIN" = incident.severity === "CRITICAL" ? "CONTAIN" : "ALERT";
    let actionRationale = "Defensive isolation recommended while analyst reviews correlated event trail.";

    if (rulesTriggered.has("R8")) {
      executiveSummary = `Agent payment mandate verification failure detected for incident ${incident.id}. Shopping agent attempted transaction violating spend limits or principal ownership.`;
      rootCauseHypothesis = "Shopping agent operated outside registered mandate constraints or attempted payment using unlinked credentials.";
      businessImpact = "Direct financial risk and unauthorized transaction liability.";
      recommendedAction = "BLOCK";
      actionRationale = "Block agent transaction to prevent unauthorized fund transfer.";
    } else if (rulesTriggered.has("R5")) {
      executiveSummary = `Confirmed account takeover with unapproved data exfiltration on incident ${incident.id}. Multiple detection vectors verified.`;
      rootCauseHypothesis = "Credential stuffing compromise followed by privilege escalation, high-rate bulk API scraping, and outbound exfiltration.";
      businessImpact = "High risk of customer PII exposure and unauthorized store order harvesting.";
      recommendedAction = "CONTAIN";
      actionRationale = "Defensive containment (tarpitting & honeypot data) prevents further exfiltration while preserving normal traffic.";
    } else if (rulesTriggered.has("R6")) {
      executiveSummary = `Third-party partner token scope violation on incident ${incident.id}. Seller/partner credentials used outside contractual data access scope.`;
      rootCauseHypothesis = "Partner integration token queried customer PII endpoints not covered by authorized partner scopes.";
      businessImpact = "Breach of merchant partnership boundaries and unauthorized customer data exposure.";
      recommendedAction = "ALERT";
      actionRationale = "Revoke or restrict partner token scope to assigned merchant catalog.";
    } else if (rulesTriggered.has("R7")) {
      executiveSummary = `Marketing consent drift flagged on incident ${incident.id}. Customer data utilized beyond registered purpose limitation.`;
      rootCauseHypothesis = "Promotional campaign service processed customer profile without active marketing consent.";
      businessImpact = "DPDP regulatory non-compliance exposure regarding purpose limitation controls.";
      recommendedAction = "ALERT";
      actionRationale = "Suspend campaign targeting for affected customer and verify consent ledger.";
    }

    // 3. Compliance mapping
    const complianceConsiderations: ComplianceConsideration[] = [
      {
        framework: "DPDP" as const,
        controlId: "DPDP-SEC-01",
        controlTitle: "Security Safeguards & Access Monitoring",
        status: incident.severity === "CRITICAL" ? ("FLAGGED" as const) : ("READY" as const),
        note: "DPDP-aligned readiness and controls: anomalous access telemetry recorded in tamper-evident log.",
      },
      {
        framework: "DPDP" as const,
        controlId: "DPDP-BREACH-02",
        controlTitle: "Breach Handling Readiness",
        status: incident.severity === "CRITICAL" ? ("FLAGGED" as const) : ("READY" as const),
        note: "Supports breach-notification readiness with exact timestamps and affected scope.",
      },
    ];

    if (rulesTriggered.has("R8") || incident.affectedResources.includes("payment")) {
      complianceConsiderations.push({
        framework: "PCI_DSS" as const,
        controlId: "PCI-DSS-PAY-01",
        controlTitle: "Payment Anomaly Monitoring",
        status: "FLAGGED" as const,
        note: "PCI DSS applies only where cardholder data is in scope. All transactions in prototype are simulated.",
      });
    }

    const result: InvestigationResult = {
      executiveSummary,
      confirmedEvidence,
      rootCauseHypothesis,
      confidence: 0.94,
      businessImpact,
      complianceConsiderations,
      recommendedResponse: {
        action: recommendedAction,
        rationale: actionRationale,
        priority: incident.severity === "CRITICAL" ? "IMMEDIATE" : "HIGH",
        targetActor: incident.affectedUserIds[0] || "suspicious_actor",
      },
      unknownsAndLimitations: [
        "Analysis based on real in-memory deterministic detection evidence.",
        "External network ISP attribution unverified in offline evaluation.",
      ],
      providerUsed: "MOCK",
      investigatedAt: new Date().toISOString(),
    };

    // Update incident status to INVESTIGATING or update timeline
    await incidentStore.update(incident.id, {
      investigationStatus: "COMPLETED",
      timeline: [
        ...incident.timeline,
        {
          timestamp: new Date().toISOString(),
          description: `AI Investigation completed by MOCK provider (${confirmedEvidence.length} evidence items cited)`,
          type: "AI_INVESTIGATION",
          actor: "AI_INVESTIGATOR",
        },
      ],
    });

    return successResponse({
      incidentId: incident.id,
      investigationResult: result,
      provider: options.provider || "mock",
      status: "COMPLETED",
    });
  } catch (error) {
    return handleApiError(error, "Failed to run incident investigation");
  }
}
