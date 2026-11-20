import { z } from "zod";

export const ProviderStateSchema = z.enum(["MOCK", "CONFIGURED", "BEDROCK_VERIFIED"]);
export type ProviderState = z.infer<typeof ProviderStateSchema>;

export const ProviderStatusSchema = z.object({
  aiProvider: ProviderStateSchema,
  bedrockModelId: z.string().nullable().optional(),
  awsRegion: z.string().nullable().optional(),
  offlineMode: z.boolean().default(true),
  lastVerifiedAt: z.string().datetime().nullable().optional(),
  statusMessage: z.string().min(1),
  guardrailsActive: z.boolean().default(false),
  adapters: z.record(z.enum(["NOT_CONFIGURED", "CONFIGURED", "VERIFIED"])).default({}),
});

export type ProviderStatus = z.infer<typeof ProviderStatusSchema>;
