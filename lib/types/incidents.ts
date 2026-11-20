import { z } from "zod";

export const SeverityLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type SeverityLevel = z.infer<typeof SeverityLevelSchema>;

export const IncidentStatusSchema = z.enum(["OPEN", "INVESTIGATING", "CONTAINED", "RESOLVED", "CLOSED"]);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const InvestigationStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"]);
export type InvestigationStatus = z.infer<typeof InvestigationStatusSchema>;

export const IncidentEvidenceItemSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  description: z.string().min(1, "Evidence description is required"),
  ruleId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  severity: SeverityLevelSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type IncidentEvidenceItem = z.infer<typeof IncidentEvidenceItemSchema>;

export const IncidentTimelineEntrySchema = z.object({
  timestamp: z.string().datetime({ message: "Timeline timestamp must be a valid ISO 8601 datetime string" }),
  description: z.string().min(1, "Timeline description is required"),
  type: z.string().default("NOTE"),
  actor: z.string().optional(),
});
export type IncidentTimelineEntry = z.infer<typeof IncidentTimelineEntrySchema>;

/**
 * Canonical Incident Schema
 * Defines the correlated threat story connecting multiple security events.
 */
export const IncidentSchema = z.object({
  id: z.string().min(1, "Incident ID cannot be empty"),
  title: z.string().min(1, "Title is required"),
  incidentType: z.string().min(1, "Incident type is required"),
  severity: SeverityLevelSchema,
  status: IncidentStatusSchema.default("OPEN"),
  createdAt: z.string().datetime({ message: "createdAt must be ISO 8601" }),
  updatedAt: z.string().datetime({ message: "updatedAt must be ISO 8601" }),

  affectedUserIds: z.array(z.string()).default([]),
  affectedSessions: z.array(z.string()).default([]),
  affectedResources: z.array(z.string()).default([]),
  eventIds: z.array(z.string()).min(1, "Incident must reference at least one event ID"),

  evidence: z.array(IncidentEvidenceItemSchema).default([]),
  riskScore: z.number().min(0).max(100),
  summary: z.string().min(1, "Incident summary is required"),

  investigationStatus: InvestigationStatusSchema.default("PENDING"),
  recommendedActions: z.array(z.string()).default([]),
  assignedTo: z.string().nullable().optional(),
  resolution: z.string().nullable().optional(),
  timeline: z.array(IncidentTimelineEntrySchema).default([]),
});

export type Incident = z.infer<typeof IncidentSchema>;
