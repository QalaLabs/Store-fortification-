import { InvestigationResultSchema, type ConfirmedEvidenceItem, type Incident, type InvestigationResult } from "@/lib/types";
import type { InvestigatorLabel } from "./provider";

export class InvestigationValidationError extends Error {
  readonly name = "InvestigationValidationError";
  constructor(
    message: string,
    readonly issues?: unknown,
  ) {
    super(message);
  }
}

export interface ValidateOptions {
  /** Stamped by the trusted code path; any providerUsed in raw output is ignored. */
  providerUsed: InvestigatorLabel;
  /** Extra limitation to append, e.g. mock fallback notice. */
  note?: string;
  now?: Date;
}

/** Compliance-honesty and provider-status wording the product must never emit. */
const BANNED_WORDING: ReadonlyArray<readonly [RegExp, string]> = [
  [/\b(certified|compliant)\b/i, "a certification or compliance claim"],
  [/\bCONNECTED\b/, "the CONNECTED provider status"],
];

/**
 * Approver-targeted social engineering and approval-skipping wording.
 * Fail closed — the pipeline ends at a human reading these prose fields.
 */
const UNSAFE_ACTION = new RegExp(
  [
    "\\bauto[- ]?approve",
    "\\bauto[- ]?close",
    "\\bno action needed",
    "\\bclose\\s+as\\s+false\\s+positive",
    "\\bapprove\\s+and\\s+(?:close|archive)",
    "\\bwithout (analyst|human) (approval|review)",
    "\\bbypass(es|ing)? (the )?(analyst |human )?approval",
    "\\bexecute[ds]? (it |this )?(automatically|immediately|now)",
    "\\bskip\\s+(?:review|approval)",
  ].join("|"),
  "i",
);

/** Event-id-like tokens (evt_… / evt-…) that may appear in free-text prose. */
const EVENT_ID_TOKEN = /\b(evt[_-][A-Za-z0-9_-]+)\b/g;

const PII_PATTERNS: Array<{ id: string; pattern: RegExp }> = [
  { id: "ssn", pattern: /\bssn\s*:?\s*\d{3}-\d{2}-\d{4}\b/gi },
  { id: "ssn-bare", pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  { id: "aadhaar", pattern: /\b\d{4}\s\d{4}\s\d{4}\b/g },
  { id: "pan", pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g },
];

function reject(message: string, issues?: unknown): never {
  throw new InvestigationValidationError(`Investigation output was rejected: ${message}`, issues);
}

function labelHypothesis(hypothesis: string): string {
  const body = hypothesis.replace(/^hypothesis\s*:?\s*/i, "").trim();
  if (!body) reject("rootCauseHypothesis has no content.");
  return `Hypothesis: ${body}`;
}

function sanitizeProse(
  text: string,
  field: string,
  allowed: ReadonlySet<string>,
  notes: string[],
): string {
  let out = text;

  if (UNSAFE_ACTION.test(out)) {
    reject(`${field} contains approver social-engineering or approval-skipping language.`);
  }

  const foundIds = out.match(EVENT_ID_TOKEN) ?? [];
  const uncited = [...new Set(foundIds.filter((id) => !allowed.has(id)))];
  if (uncited.length > 0) {
    for (const id of uncited) {
      out = out.split(id).join("[UNCITED_EVENT_ID]");
    }
    notes.push(`${field}: removed ${uncited.length} uncited event id(s) from prose.`);
  }

  for (const { id, pattern } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(out)) {
      pattern.lastIndex = 0;
      out = out.replace(pattern, `[REDACTED_${id.toUpperCase()}]`);
      notes.push(`${field}: redacted ${id}-shaped token(s).`);
    }
  }

  return out.trim();
}

function textFields(result: InvestigationResult): Array<[string, string]> {
  const fields: Array<[string, string]> = [
    ["executiveSummary", result.executiveSummary],
    ["rootCauseHypothesis", result.rootCauseHypothesis],
    ["businessImpact", result.businessImpact],
    ["recommendedResponse.rationale", result.recommendedResponse.rationale],
  ];
  result.confirmedEvidence.forEach((e, i) => fields.push([`confirmedEvidence[${i}].finding`, e.finding]));
  result.complianceConsiderations.forEach((c, i) => fields.push([`complianceConsiderations[${i}].note`, c.note]));
  result.unknownsAndLimitations.forEach((u, i) => fields.push([`unknownsAndLimitations[${i}]`, u]));
  return fields;
}

/**
 * Parses provider output against the frozen InvestigationResult contract and enforces
 * CartGuard invariants:
 * - every confirmedEvidence eventId is on the incident (others are stripped and noted)
 * - at least one cited evidence item remains (zero-evidence output is rejected)
 * - rootCauseHypothesis is labelled "Hypothesis:"
 * - providerUsed comes from the caller, never from model text
 * - no certification / compliance / CONNECTED claims, no approval-skipping wording
 * - prose fields cannot smuggle uncited event IDs or PII-shaped tokens
 */
export function validateInvestigationResult(
  raw: unknown,
  incident: Pick<Incident, "eventIds">,
  options: ValidateOptions,
): InvestigationResult {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) reject("it is not a JSON object.");

  const parsed = InvestigationResultSchema.safeParse({
    ...(raw as Record<string, unknown>),
    providerUsed: options.providerUsed,
  });
  if (!parsed.success) reject("it does not match the investigation schema.", parsed.error.issues);

  const allowed = new Set(incident.eventIds.map((id) => id.trim()).filter(Boolean));
  const seen = new Set<string>();
  const evidence: ConfirmedEvidenceItem[] = [];
  let stripped = 0;
  for (const item of parsed.data.confirmedEvidence) {
    const eventId = item.eventId.trim();
    const finding = item.finding.trim();
    if (!finding || !allowed.has(eventId)) {
      stripped += 1;
      continue;
    }
    const key = `${eventId}|${finding}`;
    if (seen.has(key)) continue;
    seen.add(key);
    evidence.push({ ...item, eventId, finding });
  }
  if (evidence.length === 0) reject("no confirmedEvidence item cites an event ID on this incident.");

  const proseNotes: string[] = [];
  const unknowns = parsed.data.unknownsAndLimitations.map((u) => u.trim()).filter(Boolean);
  if (stripped > 0) {
    unknowns.push(`${stripped} evidence item(s) were removed because they cited event IDs outside this incident.`);
  }
  if (options.note) unknowns.push(options.note);

  const result: InvestigationResult = {
    ...parsed.data,
    executiveSummary: sanitizeProse(parsed.data.executiveSummary.trim(), "executiveSummary", allowed, proseNotes),
    confirmedEvidence: evidence.map((item) => ({
      ...item,
      finding: sanitizeProse(item.finding, "confirmedEvidence.finding", allowed, proseNotes),
    })),
    rootCauseHypothesis: sanitizeProse(
      labelHypothesis(parsed.data.rootCauseHypothesis),
      "rootCauseHypothesis",
      allowed,
      proseNotes,
    ),
    businessImpact: sanitizeProse(parsed.data.businessImpact.trim(), "businessImpact", allowed, proseNotes),
    recommendedResponse: {
      ...parsed.data.recommendedResponse,
      rationale: sanitizeProse(
        parsed.data.recommendedResponse.rationale.trim(),
        "recommendedResponse.rationale",
        allowed,
        proseNotes,
      ),
    },
    unknownsAndLimitations: [
      ...unknowns.map((u, i) => sanitizeProse(u, `unknownsAndLimitations[${i}]`, allowed, proseNotes)),
      ...proseNotes,
    ],
    providerUsed: options.providerUsed,
    investigatedAt: parsed.data.investigatedAt ?? (options.now ?? new Date()).toISOString(),
  };

  for (const [field, text] of textFields(result)) {
    for (const [pattern, what] of BANNED_WORDING) {
      if (pattern.test(text)) reject(`${field} contains ${what}.`);
    }
  }

  const blob = textFields(result)
    .map(([, t]) => t)
    .join("\n");
  const stray = [...blob.matchAll(EVENT_ID_TOKEN)]
    .map((m) => m[1]!)
    .filter((id) => !allowed.has(id));
  if (stray.length > 0) {
    reject(`uncited event id(s) remain in output (${[...new Set(stray)].join(", ")}).`);
  }

  return result;
}
