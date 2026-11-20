import { z } from "zod";

export const ActionTypeSchema = z.enum(["BLOCK", "ALERT", "CONTAIN"]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

export const ActionStatusSchema = z.enum(["PROPOSED", "APPROVED", "REJECTED", "EXECUTED", "FAILED"]);
export type ActionStatus = z.infer<typeof ActionStatusSchema>;

export const DryRunResultSchema = z.object({
  targetEntity: z.string().min(1, "Target entity is required"),
  impactedUsers: z.number().int().nonnegative().default(0),
  impactedSessions: z.number().int().nonnegative().default(0),
  blastRadius: z.enum(["MINIMAL", "MODERATE", "BROAD", "CRITICAL"]).default("MINIMAL"),
  estimatedDowntimeMinutes: z.number().nonnegative().default(0),
  summary: z.string().min(1, "Dry run summary is required"),
  projectedEffect: z.string().min(1, "Projected effect is required"),
});
export type DryRunResult = z.infer<typeof DryRunResultSchema>;

export const ApprovalMetadataSchema = z.object({
  decision: z.enum(["PENDING", "APPROVED", "REJECTED", "REVERSED"]).default("PENDING"),
  decidedBy: z.string().nullable().optional(),
  decidedAt: z.string().datetime().nullable().optional(),
  comments: z.string().nullable().optional(),
});
export type ApprovalMetadata = z.infer<typeof ApprovalMetadataSchema>;

export const SimulatedExecutionResultSchema = z.object({
  simulated: z.literal(true).default(true), // Guardrail: all response execution in prototype is simulated
  executedAt: z.string().datetime().nullable().optional(),
  success: z.boolean().default(false),
  simulatedOutput: z.string().min(1),
  containmentModeActive: z.boolean().optional(),
  containmentDetails: z
    .object({
      tarpittingDelayMs: z.number().optional(),
      honeypotActive: z.boolean().optional(),
      tightenedRulesActive: z.boolean().optional(),
    })
    .optional(),
});
export type SimulatedExecutionResult = z.infer<typeof SimulatedExecutionResultSchema>;

/**
 * Canonical ResponseAction Schema
 * All automated or analyst-directed interventions require proposal -> dry run -> human approval -> simulated execution -> audit.
 */
export const ResponseActionSchema = z.object({
  id: z.string().min(1, "Action ID cannot be empty"),
  incidentId: z.string().min(1, "Incident ID is required"),
  actionType: ActionTypeSchema,
  status: ActionStatusSchema.default("PROPOSED"),
  proposedAt: z.string().datetime({ message: "proposedAt must be ISO 8601" }),
  dryRunResult: DryRunResultSchema,
  approvalMetadata: ApprovalMetadataSchema.default({ decision: "PENDING" }),
  simulatedExecutionResult: SimulatedExecutionResultSchema.nullable().optional(),
  auditReferences: z.array(z.string()).default([]),
});

export type ResponseAction = z.infer<typeof ResponseActionSchema>;

export const ProposeActionInputSchema = z.object({
  incidentId: z.string().min(1, "Incident ID is required"),
  actionType: ActionTypeSchema,
  targetEntity: z.string().min(1, "Target entity is required"),
  reason: z.string().min(1, "Reason for proposed action is required"),
});
export type ProposeActionInput = z.infer<typeof ProposeActionInputSchema>;

export const ActionDecisionInputSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED", "REVERSED"]),
  decidedBy: z.string().min(1, "Analyst identity is required"),
  comments: z.string().optional(),
});
export type ActionDecisionInput = z.infer<typeof ActionDecisionInputSchema>;
