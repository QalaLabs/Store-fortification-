import { z } from "zod";

export const AutonomySettingsSchema = z.object({
  autonomousResponseEnabled: z.literal(false).default(false), // STRICT: Always disabled in prototype
  allowedAutonomousActions: z.array(z.enum(["BLOCK", "CONTAIN"])).default(["BLOCK", "CONTAIN"]),
  minimumRiskScoreThreshold: z.number().min(0).max(100).default(95),
  humanApprovalRequired: z.literal(true).default(true), // STRICT: Always true
  gracePeriodSeconds: z.number().int().positive().default(120),
  documentationNotice: z
    .string()
    .default(
      "CartGuard AI enforces human-in-the-loop response execution. Autonomous destructive response is disabled by design. Every response action in the demo requires explicit human approval."
    ),
});

export type AutonomySettings = z.infer<typeof AutonomySettingsSchema>;
