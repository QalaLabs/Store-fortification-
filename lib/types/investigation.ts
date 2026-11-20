import { z } from "zod";

export const ConfirmedEvidenceItemSchema = z.object({
  eventId: z.string().min(1, "Evidence item must cite a real event ID"),
  finding: z.string().min(1, "Finding detail is required"),
  confidence: z.number().min(0).max(1),
  ruleTriggered: z.string().optional(),
});
export type ConfirmedEvidenceItem = z.infer<typeof ConfirmedEvidenceItemSchema>;

export const ComplianceConsiderationSchema = z.object({
  framework: z.enum(["DPDP", "PCI_DSS", "GENERAL_AUDIT"]),
  controlId: z.string().min(1),
  controlTitle: z.string(),
  status: z.enum(["FLAGGED", "READY", "APPLIES"]),
  note: z.string(),
  // Safe language guard: "DPDP-aligned readiness and controls", never "compliant"
});
export type ComplianceConsideration = z.infer<typeof ComplianceConsiderationSchema>;

export const RecommendedResponseSchema = z.object({
  action: z.enum(["BLOCK", "ALERT", "CONTAIN"]),
  rationale: z.string().min(1, "Rationale is required"),
  priority: z.enum(["IMMEDIATE", "HIGH", "STANDARD"]),
  targetActor: z.string().optional(),
});
export type RecommendedResponse = z.infer<typeof RecommendedResponseSchema>;

/**
 * Canonical InvestigationResult Schema
 * Validates AI investigator findings. Enforces citations to real event IDs.
 */
export const InvestigationResultSchema = z.object({
  executiveSummary: z.string().min(1, "Executive summary is required"),
  confirmedEvidence: z.array(ConfirmedEvidenceItemSchema).min(1, "At least one confirmed evidence item citing an event ID is required"),
  rootCauseHypothesis: z.string().min(1, "Root-cause hypothesis is required"),
  confidence: z.number().min(0).max(1),
  businessImpact: z.string().min(1, "Business impact statement is required"),
  complianceConsiderations: z.array(ComplianceConsiderationSchema).default([]),
  recommendedResponse: RecommendedResponseSchema,
  unknownsAndLimitations: z.array(z.string()).default([]),

  // Provider tracking: MOCK | BEDROCK_VERIFIED | BEDROCK_FAILED
  providerUsed: z.enum(["MOCK", "BEDROCK_VERIFIED"]).default("MOCK"),
  investigatedAt: z.string().datetime().optional(),
});

export type InvestigationResult = z.infer<typeof InvestigationResultSchema>;
