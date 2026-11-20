import { mockProvider } from "./mock-provider";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import type { InvestigationProvider, ProviderOutput } from "./provider";
import { markBedrockVerified, resolveStatus, type StatusEnv } from "./status";
import type { Incident, SecurityEvent } from "@/lib/types";
import { InvestigationValidationError, validateInvestigationResult } from "./validator";

/*
 * BedrockInvestigationProvider (Amazon Bedrock Converse API, Anthropic Claude models). Owned by Aashirwad.
 *
 * Verification record (2026-11-20, Asia/Calcutta): verifyBedrock() succeeded in us-east-1 with
 * us.anthropic.claude-haiku-4-5-20251001-v1:0 using a Bedrock API key; the response passed
 * validator.ts with 2 cited evidence items. Claude 3 Haiku / Sonnet and Claude 3.5 Haiku returned
 * HTTP 404 (model end of life), so they cannot be used. Bedrock is selected only when
 * CARTGUARD_AI_PROVIDER=bedrock and the status resolves to BEDROCK_VERIFIED; otherwise Mock.
 *
 * Implementation notes:
 * - No AWS SDK dependency. Requests use fetch and Web Crypto (SigV4) or a Bedrock API key
 *   (AWS_BEARER_TOKEN_BEDROCK), so the module works in Node 18+ and Next.js server runtimes.
 * - Prompts come from prompts.ts. Output always runs through validator.ts, which drops any
 *   evidence that cites event IDs outside the incident and rejects malformed output.
 * - Optional Bedrock Guardrails (CARTGUARD_BEDROCK_GUARDRAIL_ID / _VERSION) are applied on top
 *   of an explicit allow-list of event IDs in the prompt. The validator still runs either way.
 * - This module never takes remediation actions; it only returns an explanation.
 */

export interface BedrockConfig {
  region: string;
  modelId: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  bearerToken?: string;
  guardrailId?: string;
  guardrailVersion?: string;
  timeoutMs: number;
  maxTokens: number;
}

export class BedrockInvocationError extends Error {
  readonly name = "BedrockInvocationError";

  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_TOKENS = 2_048;

function readProcessEnv(): StatusEnv {
  const proc = (globalThis as { process?: { env?: StatusEnv } }).process;
  return proc?.env ?? {};
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Reads Bedrock settings from the environment. Returns undefined when the region, model,
 * or credentials are missing, so callers stay on the mock path.
 */
export function readBedrockConfig(env: StatusEnv = readProcessEnv()): BedrockConfig | undefined {
  const region = clean(env.AWS_REGION) ?? clean(env.AWS_DEFAULT_REGION);
  const modelId =
    clean(env.CARTGUARD_BEDROCK_MODEL_ID) ?? clean(env.BEDROCK_MODEL_ID) ?? clean(env.AWS_BEDROCK_MODEL_ID);
  const accessKeyId = clean(env.AWS_ACCESS_KEY_ID);
  const secretAccessKey = clean(env.AWS_SECRET_ACCESS_KEY);
  const bearerToken = clean(env.AWS_BEARER_TOKEN_BEDROCK);
  const hasKeys = Boolean(accessKeyId && secretAccessKey);

  if (!region || !modelId || (!hasKeys && !bearerToken)) return undefined;

  const guardrailId = clean(env.CARTGUARD_BEDROCK_GUARDRAIL_ID);
  return {
    region,
    modelId,
    accessKeyId: hasKeys ? accessKeyId : undefined,
    secretAccessKey: hasKeys ? secretAccessKey : undefined,
    sessionToken: hasKeys ? clean(env.AWS_SESSION_TOKEN) : undefined,
    bearerToken: hasKeys ? undefined : bearerToken,
    guardrailId,
    guardrailVersion: guardrailId ? (clean(env.CARTGUARD_BEDROCK_GUARDRAIL_VERSION) ?? "DRAFT") : undefined,
    timeoutMs: positiveInt(env.CARTGUARD_BEDROCK_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    maxTokens: positiveInt(env.CARTGUARD_BEDROCK_MAX_TOKENS, DEFAULT_MAX_TOKENS),
  };
}

/* ---------- SigV4 signing (Web Crypto) ---------- */

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(data: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(data)));
}

async function hmac(key: BufferSource, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
}

function rfc3986(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function signedHeaders(
  config: BedrockConfig,
  host: string,
  encodedPath: string,
  body: string,
  now: Date,
): Promise<Record<string, string>> {
  if (!config.accessKeyId || !config.secretAccessKey) {
    throw new BedrockInvocationError("SigV4 signing needs AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.");
  }
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const service = "bedrock";
  const payloadHash = await sha256Hex(body);

  const headers: Record<string, string> = {
    "content-type": "application/json",
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (config.sessionToken) headers["x-amz-security-token"] = config.sessionToken;

  const names = Object.keys(headers).sort();
  const canonicalHeaders = names.map((name) => `${name}:${headers[name].trim()}\n`).join("");
  const signedHeaderList = names.join(";");
  // Non-S3 services sign the path with each segment URI-encoded a second time.
  const canonicalPath = encodedPath
    .split("/")
    .map((segment) => rfc3986(segment))
    .join("/");
  const canonicalRequest = ["POST", canonicalPath, "", canonicalHeaders, signedHeaderList, payloadHash].join("\n");
  const scope = `${dateStamp}/${config.region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n");

  const kDate = await hmac(encoder.encode(`AWS4${config.secretAccessKey}`), dateStamp);
  const kRegion = await hmac(kDate, config.region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  const signature = toHex(await hmac(kSigning, stringToSign));

  const { host: _host, ...sendable } = headers;
  return {
    ...sendable,
    authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaderList}, Signature=${signature}`,
  };
}

/* ---------- Converse call ---------- */

interface ConverseResponse {
  output?: { message?: { content?: Array<{ text?: string }> } };
  stopReason?: string;
  message?: string;
}

function groundingInstruction(incident: Incident): string {
  const ids = incident.eventIds.map((id) => id.trim()).filter(Boolean);
  return [
    "Allowed event IDs (the only IDs you may cite):",
    JSON.stringify(ids),
    "Any evidence item citing another ID will be discarded. If an event does not support a claim, move the claim to unknowns.",
    "Respond with the JSON object only: no markdown fences, no prose before or after it.",
  ].join("\n");
}

async function converse(config: BedrockConfig, system: string, user: string): Promise<string> {
  const host = `bedrock-runtime.${config.region}.amazonaws.com`;
  const encodedPath = `/model/${rfc3986(config.modelId)}/converse`;
  const payload: Record<string, unknown> = {
    system: [{ text: system }],
    messages: [{ role: "user", content: [{ text: user }] }],
    inferenceConfig: { maxTokens: config.maxTokens, temperature: 0 },
  };
  if (config.guardrailId && config.guardrailVersion) {
    payload.guardrailConfig = {
      guardrailIdentifier: config.guardrailId,
      guardrailVersion: config.guardrailVersion,
      trace: "disabled",
    };
  }
  const body = JSON.stringify(payload);

  const headers: Record<string, string> = config.bearerToken
    ? { "content-type": "application/json", authorization: `Bearer ${config.bearerToken}` }
    : await signedHeaders(config, host, encodedPath, body, new Date());

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  let response: Response;
  try {
    response = await fetch(`https://${host}${encodedPath}`, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new BedrockInvocationError(`Bedrock request did not complete: ${reason}`);
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let parsed: ConverseResponse;
  try {
    parsed = JSON.parse(text) as ConverseResponse;
  } catch {
    throw new BedrockInvocationError(`Bedrock returned non-JSON (HTTP ${response.status}).`, response.status);
  }
  if (!response.ok) {
    throw new BedrockInvocationError(
      `Bedrock returned HTTP ${response.status}: ${parsed.message ?? "no message"}`,
      response.status,
    );
  }
  if (parsed.stopReason === "guardrail_intervened") {
    throw new BedrockInvocationError("Bedrock Guardrails blocked the response.");
  }
  const output = (parsed.output?.message?.content ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!output) throw new BedrockInvocationError("Bedrock returned an empty message.");
  return output;
}

/** Pulls one JSON object out of model text, tolerating markdown fences or stray prose. */
export function extractJsonObject(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new InvestigationValidationError("Bedrock output was rejected: it contains no JSON object.");
  }
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as unknown;
  } catch {
    throw new InvestigationValidationError("Bedrock output was rejected: its JSON did not parse.");
  }
}

/**
 * Real Bedrock provider. Throws BedrockInvocationError or InvestigationValidationError on
 * failure; wrap it with withMockFallback() for zero-downtime use.
 */
export function createBedrockProvider(config: BedrockConfig): InvestigationProvider {
  return {
    async investigate(incident: Incident, events: SecurityEvent[]): Promise<ProviderOutput> {
      const allowed = new Set(incident.eventIds);
      const scopedEvents = events.filter((event) => allowed.has(event.id));
      const system = `${SYSTEM_PROMPT}\n\n${groundingInstruction(incident)}`;
      const text = await converse(config, system, buildUserPrompt(incident, scopedEvents));
      const raw = extractJsonObject(text);
      // Validate here so only a real call whose output passed every check marks Bedrock verified.
      // providerUsed is stamped by this code path; the model cannot set it.
      validateInvestigationResult(raw, incident, { providerUsed: "BEDROCK_VERIFIED" });
      markBedrockVerified();
      return { raw, providerUsed: "BEDROCK_VERIFIED" };
    },
  };
}

/**
 * Uses the primary provider, and on any error returns the fallback's answer instead.
 * The failure is logged and surfaced in unknownsAndLimitations so a broken Bedrock
 * setup never looks like a deliberate mock run.
 */
export function withMockFallback(
  primary: InvestigationProvider,
  fallback: InvestigationProvider = mockProvider,
): InvestigationProvider {
  return {
    async investigate(incident: Incident, events: SecurityEvent[]): Promise<ProviderOutput> {
      try {
        return await primary.investigate(incident, events);
      } catch (error) {
        const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
        console.warn(`[AI_INVESTIGATOR] Bedrock investigation failed for ${incident.id}; using mock fallback. ${reason}`);
        const output = await fallback.investigate(incident, events);
        return { ...output, note: `Bedrock investigation failed (${reason}); this result came from the mock fallback.` };
      }
    },
  };
}

export interface BedrockVerification {
  ok: boolean;
  detail: string;
}

/**
 * Sends one real test investigation to Bedrock and validates it. On success the in-process
 * verified flag is set, so resolveStatus() reports BEDROCK_VERIFIED for a configured env.
 */
export async function verifyBedrock(
  incident: Incident,
  events: SecurityEvent[],
  env: StatusEnv = readProcessEnv(),
): Promise<BedrockVerification> {
  const config = readBedrockConfig(env);
  if (!config) {
    return { ok: false, detail: "No Bedrock request was sent: region, model ID, or AWS credentials are missing." };
  }
  try {
    const output = await createBedrockProvider(config).investigate(incident, events);
    const result = validateInvestigationResult(output.raw, incident, { providerUsed: output.providerUsed });
    return { ok: true, detail: `Bedrock ${config.modelId} returned ${result.confirmedEvidence.length} validated evidence item(s).` };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Picks the provider for the app. Only a BEDROCK_VERIFIED status with full credentials
 * selects Bedrock, and even then every failure falls back to Mock. Everything else is Mock.
 */
export function selectInvestigationProvider(env: StatusEnv = readProcessEnv()): InvestigationProvider {
  const config = readBedrockConfig(env);
  if (config && resolveStatus({ env }) === "BEDROCK_VERIFIED") {
    return withMockFallback(createBedrockProvider(config));
  }
  return mockProvider;
}

/**
 * Default export stays inert: no live Bedrock call has been verified for this project yet,
 * so this refuses without contacting AWS. Use selectInvestigationProvider() or
 * createBedrockProvider() once verifyBedrock() succeeds.
 */
export const bedrockProvider: InvestigationProvider = {
  async investigate() {
    throw new Error(
      "Bedrock provider is not implemented as the active provider: no verified Bedrock call has succeeded. No Bedrock request was sent. Use the mock provider.",
    );
  },
};
