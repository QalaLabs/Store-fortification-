import type { Incident, InvestigationResult, SecurityEvent } from "@/lib/types";

/** Labels a provider may stamp on a result. CONNECTED is intentionally not a value. */
export type InvestigatorLabel = InvestigationResult["providerUsed"];

/**
 * Raw provider output. `raw` is untrusted until validator.ts accepts it.
 * `providerUsed` is set by the provider code path, never parsed from model text.
 */
export interface ProviderOutput {
  raw: unknown;
  providerUsed: InvestigatorLabel;
  /** Limitation to surface to the analyst, e.g. that a mock fallback was used. */
  note?: string;
}

/** Explains an existing incident. Implementations must not detect, create, or act on incidents. */
export interface InvestigationProvider {
  investigate(incident: Incident, events: SecurityEvent[]): Promise<ProviderOutput>;
}
