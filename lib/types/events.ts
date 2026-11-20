import { z } from "zod";

/**
 * Agent Payment Mandate Schema
 * Defines spending constraints, authorized merchant scopes, and validity period for shopping agents.
 */
export const AgentPaymentMandateSchema = z.object({
  limit: z.number().positive("Mandate limit must be a positive number"),
  merchantScope: z.array(z.string()).min(1, "At least one merchant scope is required"),
  expiry: z.string().datetime({ message: "Mandate expiry must be a valid ISO 8601 datetime string" }),
});

export type AgentPaymentMandate = z.infer<typeof AgentPaymentMandateSchema>;

/**
 * Canonical SecurityEvent Schema
 * Captures all storefront, API, auth, checkout, and agent activity.
 * All 22 base fields + 4 mandatory agent-payment fields are strictly typed.
 */
export const SecurityEventSchema = z.object({
  // Required core identification
  id: z.string().min(1, "Event ID cannot be empty"),
  timestamp: z.string().datetime({ message: "Timestamp must be a valid ISO 8601 datetime string" }),
  source: z.string().min(1, "Source system is required"),
  eventType: z.string().min(1, "Event type is required"),

  // Identity and session (optional / nullable when anonymous or external)
  userId: z.string().nullable().optional(),
  sessionId: z.string().nullable().optional(),
  sourceIp: z.string().min(1, "Source IP is required"),
  userAgent: z.string().default("Unknown"),
  accountRole: z.string().nullable().optional(),

  // HTTP and endpoint details
  endpoint: z.string().min(1, "Endpoint is required"),
  httpMethod: z.string().min(1, "HTTP method is required"),
  responseStatus: z.number().int().min(100).max(599),
  requestCount: z.number().int().nonnegative().default(1),

  // Data access and volume
  resourceType: z.string().nullable().optional(),
  recordCount: z.number().int().nonnegative().default(0),
  dataCategory: z.string().min(1, "Data category is required"),

  // Data exfiltration / destination tracking
  destination: z.string().nullable().optional(),
  approvedDestination: z.boolean().nullable().optional(),

  // Payment transaction details
  paymentAmount: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).nullable().optional(),
  transactionId: z.string().nullable().optional(),

  // Freeform structured metadata
  metadata: z.record(z.unknown()).default({}),

  // MANDATORY OPTIONAL AGENT-PAYMENT FIELDS (R8 & Scenario S4)
  agentId: z.string().nullable().optional(),
  principalId: z.string().nullable().optional(),
  mandate: AgentPaymentMandateSchema.nullable().optional(),
  paymentMethodOwner: z.string().nullable().optional(),
});

export type SecurityEvent = z.infer<typeof SecurityEventSchema>;

/**
 * Schema for incoming raw event ingestion (allows auto-generation of ID and timestamp if omitted)
 */
export const IngestEventInputSchema = SecurityEventSchema.extend({
  id: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export type IngestEventInput = z.infer<typeof IngestEventInputSchema>;
