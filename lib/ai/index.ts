/**
 * CartGuard AI investigator (owned by Aashirwad).
 * Explains existing incidents with cited event IDs. It never detects, creates, or acts on incidents.
 */
import type { Incident, InvestigationResult, SecurityEvent } from "@/lib/types";
import { mockProvider } from "./mock-provider";
import type { InvestigationProvider } from "./provider";
import { validateInvestigationResult } from "./validator";

export { ask, PRESET_QUESTIONS, type PresetQuestion } from "./ask";
export {
  bedrockProvider,
  createBedrockProvider,
  extractJsonObject,
  readBedrockConfig,
  selectInvestigationProvider,
  verifyBedrock,
  withMockFallback,
  BedrockInvocationError,
  type BedrockConfig,
  type BedrockVerification,
} from "./bedrock-provider";
export { buildMockInvestigation, mockProvider, MOCK_CONFIDENCE } from "./mock-provider";
export { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
export type { InvestigationProvider, InvestigatorLabel, ProviderOutput } from "./provider";
export { buildProviderStatus, hasBedrockCredentials, resolveStatus, type ResolveStatusOptions, type StatusEnv } from "./status";
export { InvestigationValidationError, validateInvestigationResult, type ValidateOptions } from "./validator";

/**
 * Mock-by-default explanation pipeline. Provider output is untrusted and is
 * schema-, citation- and wording-checked before it is returned. providerUsed is
 * taken from the provider code path, never from model text.
 */
export async function investigate(
  incident: Incident,
  events: SecurityEvent[],
  provider: InvestigationProvider = mockProvider,
  now: Date = new Date(),
): Promise<InvestigationResult> {
  const output = await provider.investigate(incident, events);
  return validateInvestigationResult(output.raw, incident, { providerUsed: output.providerUsed, note: output.note, now });
}
