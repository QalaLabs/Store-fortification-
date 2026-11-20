import { ProviderStateSchema, type ProviderState, type ProviderStatus } from "@/lib/types";

const PROVIDER_STATES = ProviderStateSchema.options;
export type StatusEnv = Record<string, string | undefined>;

export interface ResolveStatusOptions {
  env?: StatusEnv;
  /** True only after a real Bedrock round-trip was verified by the caller. */
  verified?: boolean;
}

/**
 * In-process flag set by the Bedrock provider after a real call returned output that
 * passed validator.ts. It is never set from configuration alone.
 */
let bedrockVerifiedInProcess = false;

export function markBedrockVerified(): void {
  bedrockVerifiedInProcess = true;
}

export function clearBedrockVerified(): void {
  bedrockVerifiedInProcess = false;
}

export function isBedrockVerifiedInProcess(): boolean {
  return bedrockVerifiedInProcess;
}

function readProcessEnv(): StatusEnv {
  const proc = (globalThis as { process?: { env?: StatusEnv } }).process;
  return proc?.env ?? {};
}

function nonEmpty(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function flagTrue(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "verified"].includes(value.trim().toLowerCase());
}

/**
 * True when region, model, and AWS credentials (access key pair or Bedrock API key) are all
 * present. Used by the Bedrock provider to decide whether a request can be sent at all.
 */
export function hasBedrockCredentials(env: StatusEnv = readProcessEnv()): boolean {
  const region = nonEmpty(env.AWS_REGION) || nonEmpty(env.AWS_DEFAULT_REGION);
  const keys = nonEmpty(env.AWS_ACCESS_KEY_ID) && nonEmpty(env.AWS_SECRET_ACCESS_KEY);
  return region && (keys || nonEmpty(env.AWS_BEARER_TOKEN_BEDROCK));
}

/**
 * CONFIGURED requires an explicit CartGuard provider selection plus a model id.
 * Generic AWS environment variables do not count, so a laptop with cloud creds
 * still resolves to MOCK. BEDROCK_VERIFIED also requires a verified signal: the
 * caller's flag, CARTGUARD_BEDROCK_VERIFIED, or a successful in-process Bedrock call.
 * The string CONNECTED is intentionally not a status.
 */
function isBedrockConfigured(env: StatusEnv): boolean {
  const provider = (env.CARTGUARD_AI_PROVIDER ?? "").trim().toLowerCase();
  if (provider !== "bedrock") return false;
  return (
    nonEmpty(env.CARTGUARD_BEDROCK_MODEL_ID) ||
    nonEmpty(env.BEDROCK_MODEL_ID) ||
    nonEmpty(env.AWS_BEDROCK_MODEL_ID)
  );
}

export function resolveStatus(options: ResolveStatusOptions = {}): ProviderState {
  const env = options.env ?? readProcessEnv();
  const configured = isBedrockConfigured(env);
  const verified =
    options.verified === true || flagTrue(env.CARTGUARD_BEDROCK_VERIFIED) || bedrockVerifiedInProcess;

  let status: ProviderState = "MOCK";
  if (configured && verified) status = "BEDROCK_VERIFIED";
  else if (configured) status = "CONFIGURED";

  if (!(PROVIDER_STATES as readonly string[]).includes(status)) {
    return "MOCK";
  }
  return status;
}

function readModelId(env: StatusEnv): string | null {
  for (const key of ["CARTGUARD_BEDROCK_MODEL_ID", "BEDROCK_MODEL_ID", "AWS_BEDROCK_MODEL_ID"]) {
    if (nonEmpty(env[key])) return env[key]!.trim();
  }
  return null;
}

/** Frozen ProviderStatus payload for GET /api/provider-status. Reads env only; sends no request. */
export function buildProviderStatus(options: ResolveStatusOptions = {}): ProviderStatus {
  const env = options.env ?? readProcessEnv();
  const aiProvider = resolveStatus(options);
  const region = nonEmpty(env.AWS_REGION) ? env.AWS_REGION!.trim() : nonEmpty(env.AWS_DEFAULT_REGION) ? env.AWS_DEFAULT_REGION!.trim() : null;
  const statusMessage = {
    MOCK: "Deterministic mock investigator active. No Bedrock request is sent.",
    CONFIGURED: "Bedrock is configured but no verified call has succeeded yet; the mock investigator stays active.",
    BEDROCK_VERIFIED: "A Bedrock investigation call succeeded and passed validation.",
  }[aiProvider];
  return {
    aiProvider,
    bedrockModelId: aiProvider === "MOCK" ? null : readModelId(env),
    awsRegion: aiProvider === "MOCK" ? null : region,
    offlineMode: aiProvider !== "BEDROCK_VERIFIED",
    lastVerifiedAt: null,
    statusMessage,
    guardrailsActive: aiProvider !== "MOCK" && nonEmpty(env.CARTGUARD_BEDROCK_GUARDRAIL_ID),
    adapters: {
      bedrock: aiProvider === "BEDROCK_VERIFIED" ? "VERIFIED" : aiProvider === "CONFIGURED" ? "CONFIGURED" : "NOT_CONFIGURED",
    },
  };
}
