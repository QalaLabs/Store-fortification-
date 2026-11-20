import { z } from "zod";
import {
  SecurityEventSchema,
  IngestEventInputSchema,
  IncidentSchema,
  InvestigationResultSchema,
  ResponseActionSchema,
  ProposeActionInputSchema,
  ActionDecisionInputSchema,
  SeverityLevelSchema,
  IncidentStatusSchema,
} from "@/lib/types";

export {
  SecurityEventSchema,
  IngestEventInputSchema,
  IncidentSchema,
  InvestigationResultSchema,
  ResponseActionSchema,
  ProposeActionInputSchema,
  ActionDecisionInputSchema,
};

export const ScenarioNameSchema = z.enum(["s1", "s2", "s3", "s4"], {
  errorMap: () => ({ message: "Scenario must be one of: s1, s2, s3, s4" }),
});
export type ScenarioName = z.infer<typeof ScenarioNameSchema>;

export const InvestigateRequestSchema = z.object({
  provider: z.enum(["mock", "bedrock"]).optional().default("mock"),
  modelId: z.string().optional(),
});
export type InvestigateRequest = z.infer<typeof InvestigateRequestSchema>;

export const EventQueryParamsSchema = z.object({
  limit: z.coerce.number().int().positive().max(500).default(50),
  eventType: z.string().optional(),
  sourceIp: z.string().optional(),
  userId: z.string().optional(),
});
export type EventQueryParams = z.infer<typeof EventQueryParamsSchema>;

export const IncidentQueryParamsSchema = z.object({
  severity: SeverityLevelSchema.optional(),
  status: IncidentStatusSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type IncidentQueryParams = z.infer<typeof IncidentQueryParamsSchema>;

export const AuditQueryParamsSchema = z.object({
  limit: z.coerce.number().int().positive().max(200).default(50),
  action: z.string().optional(),
  actor: z.string().optional(),
});
export type AuditQueryParams = z.infer<typeof AuditQueryParamsSchema>;
