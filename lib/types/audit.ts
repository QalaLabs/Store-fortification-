import { z } from "zod";

export const AuditLogEntrySchema = z.object({
  id: z.string().min(1),
  timestamp: z.string().datetime(),
  action: z.string().min(1), // e.g. "EVENT_INGESTED", "INCIDENT_CREATED", "ACTION_PROPOSED", "ACTION_APPROVED", "ACTION_EXECUTED"
  actor: z.string().min(1), // e.g. "SYSTEM", "ANALYST:aayush", "AI_INVESTIGATOR"
  entityType: z.enum(["EVENT", "INCIDENT", "RESPONSE_ACTION", "SYSTEM_SETTING", "SIMULATION"]),
  entityId: z.string().min(1),
  details: z.string().min(1),
  metadata: z.record(z.unknown()).default({}),
});

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;
