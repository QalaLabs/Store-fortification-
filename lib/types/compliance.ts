import { z } from "zod";

export const ComplianceControlSchema = z.object({
  id: z.string().min(1),
  framework: z.enum(["DPDP", "PCI_DSS", "SYSTEM_ACCOUNTABILITY"]),
  name: z.string().min(1),
  status: z.enum(["READY", "FLAGGED", "MONITORING"]),
  description: z.string().min(1),
  safeWordingStatement: z.string().min(1), // e.g. "DPDP-aligned readiness and controls"
  evidenceEventIds: z.array(z.string()).default([]),
  evidenceIncidentIds: z.array(z.string()).default([]),
  lastEvaluatedAt: z.string().datetime(),
});

export type ComplianceControl = z.infer<typeof ComplianceControlSchema>;

export const ComplianceReportSchema = z.object({
  disclaimer: z.string().default(
    "CartGuard AI provides DPDP-aligned readiness and controls and access monitoring. This prototype does not claim full DPDP certification or registered Consent Manager status. PCI DSS controls apply strictly where cardholder data is in scope."
  ),
  controls: z.array(ComplianceControlSchema),
  generatedAt: z.string().datetime(),
});

export type ComplianceReport = z.infer<typeof ComplianceReportSchema>;
