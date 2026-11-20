import { describe, it, expect } from "vitest";
import { ComplianceReportSchema, type Incident } from "@/lib/types";
import { buildComplianceReport, considerationsForIncident, getConsentTrackerMeta, getWordingRules } from "@/lib/compliance";
import { getScenario } from "@/lib/scenarios";

const NOW = new Date("2026-11-20T10:00:00.000Z");

function incident(incidentType: string, severity: Incident["severity"] = "HIGH"): Incident {
  return {
    id: `inc_${incidentType.toLowerCase()}`,
    title: incidentType,
    incidentType,
    severity,
    status: "OPEN",
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    affectedUserIds: [],
    affectedSessions: [],
    affectedResources: [],
    eventIds: ["evt_x"],
    evidence: [],
    riskScore: 70,
    summary: "test",
    investigationStatus: "PENDING",
    recommendedActions: [],
    timeline: [],
  };
}

describe("Compliance mapping (lib/compliance)", () => {
  it("builds a report that satisfies the frozen ComplianceReport schema", () => {
    const report = buildComplianceReport([], [], NOW);
    expect(ComplianceReportSchema.safeParse(report).success).toBe(true);
    expect(report.controls.map((c) => c.id)).toEqual(["DPDP-SEC-01", "DPDP-BREACH-02", "DPDP-CONSENT-03", "PCI-DSS-PAY-01", "AUDIT-ACC-01"]);
    expect(report.controls.every((c) => c.status !== "FLAGGED")).toBe(true);
  });

  it("flags the consent control for CONSENT_DRIFT and the PCI control for AGENT_PAYMENT_MISMATCH", () => {
    const events = [...getScenario("s3"), ...getScenario("s4")];
    const report = buildComplianceReport([incident("CONSENT_DRIFT"), incident("AGENT_PAYMENT_MISMATCH")], events, NOW);
    const byId = new Map(report.controls.map((c) => [c.id, c]));
    expect(byId.get("DPDP-CONSENT-03")?.status).toBe("FLAGGED");
    expect(byId.get("DPDP-CONSENT-03")?.evidenceEventIds).toContain("evt_s3_02");
    expect(byId.get("PCI-DSS-PAY-01")?.status).toBe("FLAGGED");
    expect(byId.get("PCI-DSS-PAY-01")?.evidenceEventIds).toEqual(["evt_s4_01", "evt_s4_02"]);
    expect(byId.get("AUDIT-ACC-01")?.status).toBe("READY");
  });

  it("never uses certification or compliance-claim wording", () => {
    const report = buildComplianceReport([incident("ACCOUNT_TAKEOVER_API_ABUSE", "CRITICAL")], getScenario("s1"), NOW);
    const blob = JSON.stringify([report.controls, considerationsForIncident(incident("CONSENT_DRIFT")), getWordingRules()]);
    expect(blob).not.toMatch(/\b(certified|compliant)\b/i);
    expect(blob).not.toContain("CONNECTED");
    expect(getConsentTrackerMeta().isRegisteredConsentManager).toBe(false);
  });
});
