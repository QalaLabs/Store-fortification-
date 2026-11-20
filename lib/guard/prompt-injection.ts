/**
 * Defensive prompt-injection detector for CartGuard.
 * Detects instruction-override / role-escape patterns in untrusted text
 * (event fields, free-form questions). Does not execute or generate attacks.
 */

export type InjectionSeverity = "none" | "low" | "medium" | "high";

export interface InjectionFinding {
  pattern: string;
  severity: InjectionSeverity;
  match: string;
}

export interface InjectionScanResult {
  score: number;
  severity: InjectionSeverity;
  findings: InjectionFinding[];
  blocked: boolean;
}

const SIGNATURES: Array<{ pattern: RegExp; severity: InjectionSeverity; id: string }> = [
  {
    id: "ignore-prior",
    severity: "high",
    pattern:
      /\b(ignore|disregard|forget)\b[\s\S]{0,120}\b(previous|prior|above|all)\b[\s\S]{0,40}\b(instructions?|rules?|prompts?)\b/i,
  },
  {
    id: "ignore-prior-compact",
    severity: "high",
    pattern: /ignoreall(previous|prior|above)?instructions?/i,
  },
  {
    id: "reveal-system",
    severity: "high",
    pattern:
      /\b(reveal|show|print|dump|repeat|output)\b[\s\S]{0,60}\b(system\s*prompt|developer\s*message|hidden\s*instructions?|your\s*instructions?)\b/i,
  },
  {
    id: "reveal-system-compact",
    severity: "high",
    pattern: /(reveal|show|print|dump|repeat|output)(your)?(systemprompt|developermessage|hiddeninstructions?)/i,
  },
  {
    id: "role-escape",
    severity: "high",
    pattern:
      /\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be|jailbreak|DAN\b|developer\s+mode)\b/i,
  },
  {
    id: "new-directive",
    severity: "medium",
    pattern: /(?:^|[\n\r]|[\s>])\s*(?:system|assistant|developer)\s*:\s*/i,
  },
  {
    id: "new-directive-compact",
    severity: "medium",
    pattern: /(?:^|[^a-z])(?:system|assistant|developer):/i,
  },
  {
    id: "tool-override",
    severity: "high",
    pattern:
      /\b(disable|bypass|turn\s*off)\b[\s\S]{0,40}\b(guardrail|safety|filter|citation|validation)\b/i,
  },
  {
    id: "exfil-marker",
    severity: "medium",
    pattern:
      /\b(begin\s+system\s+prompt|end\s+system\s+prompt|<\s*\/?\s*system\s*>)\b/i,
  },
  {
    id: "encoded-override",
    severity: "medium",
    pattern:
      /\b(base64|rot13|hex\s*decode)\b[\s\S]{0,80}\b(instruction|prompt|ignore)\b/i,
  },
  {
    id: "ignore-prior-hi",
    severity: "high",
    pattern:
      /\b(pichh?le|purane|sabhi|saare)\b[\s\S]{0,80}\b(nirdesh(on)?|instructions?|rules?)\b[\s\S]{0,40}\b(andekha|ignore|bhool|disregard)\b/i,
  },
  {
    id: "ignore-prior-hi-alt",
    severity: "high",
    pattern:
      /\b(andekha\s+karein|ignore\s+karo|bhool\s+jao)\b[\s\S]{0,80}\b(nirdesh|instruction|prompt|system)\b/i,
  },
  {
    id: "reveal-system-hi",
    severity: "high",
    pattern:
      /\b(system\s*prompt|hidden\s*instructions?|nirdesh)\b[\s\S]{0,40}\b(dikhayein|batao|reveal|print|dikhao)\b/i,
  },
  {
    id: "ignore-prior-devanagari",
    severity: "high",
    pattern: /पिछले[\s\S]{0,40}निर्देश[\s\S]{0,40}(अनदेखा|नज़रअंदाज़|भूल)/,
  },
];

const SEVERITY_WEIGHT: Record<InjectionSeverity, number> = {
  none: 0,
  low: 1,
  medium: 3,
  high: 5,
};

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/g;

const HOMOGLYPHS: Record<string, string> = {
  "\u0456": "i",
  "\u0406": "i",
  "\u04CF": "i",
  "\u0430": "a",
  "\u0435": "e",
  "\u043E": "o",
  "\u0440": "p",
  "\u0441": "c",
  "\u0443": "y",
  "\u0445": "x",
  "\u0110": "d",
  "\u00ED": "i",
  "\u00EC": "i",
  "\u0399": "i",
  "\u03B9": "i",
};

function worst(a: InjectionSeverity, b: InjectionSeverity): InjectionSeverity {
  return SEVERITY_WEIGHT[a] >= SEVERITY_WEIGHT[b] ? a : b;
}

function mapHomoglyphs(text: string): string {
  let out = "";
  for (const ch of text) {
    out += HOMOGLYPHS[ch] ?? ch;
  }
  return out;
}

export function normalizeForScan(text: string): string {
  const nfkc = (text ?? "").normalize("NFKC");
  const stripped = nfkc.replace(ZERO_WIDTH, "");
  const mapped = mapHomoglyphs(stripped);
  return mapped.replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function compactForScan(text: string): string {
  return normalizeForScan(text).replace(/[\s_\-./\\]+/g, "");
}

const BASE64_CHUNK = /[A-Za-z0-9+/]{24,}={0,2}/g;
const HEX_CHUNK = /\b(?:[0-9a-fA-F]{2}){16,}\b/g;

function tryDecodeBase64(chunk: string): string | undefined {
  try {
    if (chunk.length % 4 === 1) return undefined;
    const buf = Buffer.from(chunk, "base64");
    if (buf.length < 8) return undefined;
    const decoded = buf.toString("utf8");
    const printable = decoded.replace(/[\x09\x0a\x0d\x20-\x7e]/g, "");
    if (printable.length > decoded.length * 0.15) return undefined;
    return decoded;
  } catch {
    return undefined;
  }
}

function tryDecodeHex(chunk: string): string | undefined {
  try {
    const buf = Buffer.from(chunk, "hex");
    if (buf.length < 8) return undefined;
    const decoded = buf.toString("utf8");
    const printable = decoded.replace(/[\x09\x0a\x0d\x20-\x7e]/g, "");
    if (printable.length > decoded.length * 0.15) return undefined;
    return decoded;
  } catch {
    return undefined;
  }
}

export function expandEncodedPayloads(text: string): string[] {
  const extras: string[] = [];
  for (const m of text.matchAll(BASE64_CHUNK)) {
    const decoded = tryDecodeBase64(m[0]);
    if (decoded) extras.push(decoded);
  }
  for (const m of text.matchAll(HEX_CHUNK)) {
    const decoded = tryDecodeHex(m[0]);
    if (decoded) extras.push(decoded);
  }
  if (/^[a-z\s.,!?'-]{20,}$/i.test(text) && !/\d/.test(text)) {
    extras.push(
      text.replace(/[a-zA-Z]/g, (ch) => {
        const base = ch <= "Z" ? 65 : 97;
        return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
      }),
    );
  }
  return extras;
}

function mergeResults(parts: InjectionScanResult[]): InjectionScanResult {
  const findings: InjectionFinding[] = [];
  let severity: InjectionSeverity = "none";
  let score = 0;
  const seen = new Set<string>();
  for (const part of parts) {
    for (const f of part.findings) {
      const key = `${f.pattern}:${f.match}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push(f);
      score += SEVERITY_WEIGHT[f.severity];
      severity = worst(severity, f.severity);
    }
  }
  return {
    score,
    severity,
    findings,
    blocked: SEVERITY_WEIGHT[severity] >= SEVERITY_WEIGHT["medium"],
  };
}

function scanNormalized(
  text: string,
  options: { blockAt?: InjectionSeverity } = {},
): InjectionScanResult {
  const blockAt = options.blockAt ?? "medium";
  const findings: InjectionFinding[] = [];
  let severity: InjectionSeverity = "none";
  let score = 0;

  for (const sig of SIGNATURES) {
    const m = text.match(sig.pattern);
    if (!m) continue;
    findings.push({
      pattern: sig.id,
      severity: sig.severity,
      match: m[0].slice(0, 120),
    });
    score += SEVERITY_WEIGHT[sig.severity];
    severity = worst(severity, sig.severity);
  }

  const blocked = SEVERITY_WEIGHT[severity] >= SEVERITY_WEIGHT[blockAt];
  return { score, severity, findings, blocked };
}

export function scanPromptInjection(
  text: string,
  options: { blockAt?: InjectionSeverity; decodeDepth?: number } = {},
): InjectionScanResult {
  const input = text ?? "";
  const decodeDepth = options.decodeDepth ?? 0;
  const normalized = normalizeForScan(input);
  const compact = compactForScan(input);
  const parts = [
    scanNormalized(normalized, options),
    scanNormalized(compact, options),
  ];

  if (decodeDepth < 2) {
    for (const decoded of expandEncodedPayloads(input)) {
      parts.push(
        scanPromptInjection(decoded, {
          ...options,
          decodeDepth: decodeDepth + 1,
        }),
      );
    }
  }

  const merged = mergeResults(parts);
  const blockAt = options.blockAt ?? "medium";
  merged.blocked = SEVERITY_WEIGHT[merged.severity] >= SEVERITY_WEIGHT[blockAt];
  return merged;
}

const MAX_WALK_DEPTH = 8;
const MAX_STRINGS = 500;

export function collectStringsDeep(
  value: unknown,
  out: string[] = [],
  depth = 0,
): string[] {
  if (out.length >= MAX_STRINGS || depth > MAX_WALK_DEPTH) return out;
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    out.push(String(value));
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStringsDeep(item, out, depth + 1);
      if (out.length >= MAX_STRINGS) break;
    }
    return out;
  }
  if (value && typeof value === "object") {
    for (const child of Object.values(value as Record<string, unknown>)) {
      collectStringsDeep(child, out, depth + 1);
      if (out.length >= MAX_STRINGS) break;
    }
  }
  return out;
}

const REDACTED = "[REDACTED_INJECTION]";

export function neutralizeInjectionDeep<T>(value: T, depth = 0): T {
  if (depth > MAX_WALK_DEPTH) return value;
  if (typeof value === "string") {
    const scan = scanPromptInjection(value);
    return (scan.blocked ? REDACTED : value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => neutralizeInjectionDeep(item, depth + 1)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = neutralizeInjectionDeep(v, depth + 1);
    }
    return out as T;
  }
  return value;
}

export function scanEventsForInjection(
  events: Array<Record<string, unknown>>,
): InjectionScanResult {
  const chunks = collectStringsDeep(events);
  const parts = chunks.map((c) => scanPromptInjection(c));
  parts.push(scanPromptInjection(chunks.join("\n")));
  const merged = mergeResults(parts);
  merged.blocked =
    SEVERITY_WEIGHT[merged.severity] >= SEVERITY_WEIGHT["medium"];
  return merged;
}

export function formatInjectionBlock(result: InjectionScanResult): string {
  const ids = result.findings.map((f) => f.pattern).join(", ") || "unknown";
  return `Blocked: untrusted input matched prompt-injection signatures (${ids}). CartGuard will not follow embedded instructions from event or question text.`;
}

export function formatInjectionWarning(result: InjectionScanResult): string {
  const ids = result.findings.map((f) => f.pattern).join(", ") || "unknown";
  return `Injection signatures neutralized in event fields (${ids}); content was framed as untrusted data and matching strings were redacted.`;
}
