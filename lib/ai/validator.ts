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

/** Wording that would present a proposal as skipping human approval. */
const UNSAFE_ACTION = new RegExp(
  [
    "\\bauto[- ]?approve",
    "\\bwithout (analyst|human) (approval|review)",
    "\\bbypass(es|ing)? (the )?(analyst |human )?approval",
    "\\bexecute[ds]? (it |this )?(automatically|immediately|now)",
  ].join("|"),
  "i",
);

function reject(message: string, issues?: unknown): never {
  throw new InvestigationValidationError(`Investigation output was rejected: ${message}`, issues);
}

function labelHypothesis(hypothesis: string): string {
  const body = hypothesis.replace(/^hypothesis\s*:?\s*/i, "").trim();
  if (!body) reject("rootCauseHypothesis has no content.");
  return `Hypothesis: ${body}`;
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

  const unknowns = parsed.data.unknownsAndLimitations.map((u) => u.trim()).filter(Boolean);
  if (stripped > 0) {
    unknowns.push(`${stripped} evidence item(s) were removed because they cited event IDs outside this incident.`);
  }
  if (options.note) unknowns.push(options.note);

  const result: InvestigationResult = {
    ...parsed.data,
    executiveSummary: parsed.data.executiveSummary.trim(),
    confirmedEvidence: evidence,
    rootCauseHypothesis: labelHypothesis(parsed.data.rootCauseHypothesis),
    businessImpact: parsed.data.businessImpact.trim(),
    unknownsAndLimitations: unknowns,
    providerUsed: options.providerUsed,
    investigatedAt: parsed.data.investigatedAt ?? (options.now ?? new Date()).toISOString(),
  };

  for (const [field, text] of textFields(result)) {
    for (const [pattern, what] of BANNED_WORDING) {
      if (pattern.test(text)) reject(`${field} contains ${what}.`);
    }
  }
  if (UNSAFE_ACTION.test(result.recommendedResponse.rationale)) {
    reject("recommendedResponse.rationale implies acting without analyst approval.");
  }
  return result;
}
