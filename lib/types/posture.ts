import { z } from "zod";

export const SecurityPostureSchema = z.object({
  overallStatus: z.enum(["HEALTHY", "ELEVATED", "CRITICAL"]),
  activeIncidentsCount: z.number().int().nonnegative(),
  criticalIncidentsCount: z.number().int().nonnegative(),
  totalEventsProcessed: z.number().int().nonnegative(),
  pendingApprovalsCount: z.number().int().nonnegative(),
  averageRiskScore: z.number().min(0).max(100),
  lastUpdated: z.string().datetime(),
  ruleTriggersCount: z.record(z.number().int().nonnegative()).default({}),
});

export type SecurityPosture = z.infer<typeof SecurityPostureSchema>;
