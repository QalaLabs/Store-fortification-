import type { InvestigationResult } from "@/lib/types";

export const PRESET_QUESTIONS = [
  "Why is this critical?",
  "Which events support the conclusion?",
  "What data may be affected?",
  "What should the team do first?",
  "What remains unverified?",
] as const;

export type PresetQuestion = (typeof PRESET_QUESTIONS)[number];

const DATA_SIGNAL = /accessed|record|payment method owner|payment amount|destination|purpose|consent purpose|token/i;

function normalizeQuestion(question: string): string {
  return question.trim().toLowerCase().replace(/\s+/g, " ").replace(/[?.!]+$/g, "");
}

function presetKey(question: string): PresetQuestion | undefined {
  const normalized = normalizeQuestion(question);
  return PRESET_QUESTIONS.find((preset) => normalizeQuestion(preset) === normalized);
}

function factLines(result: InvestigationResult): string[] {
  return result.confirmedEvidence.map((item) => `- ${item.finding} (event: ${item.eventId})`);
}

function answerWhy(result: InvestigationResult): string {
  return [
    "This answer uses the validated investigation only.",
    result.executiveSummary,
    result.businessImpact,
    "Cited facts:",
    ...factLines(result),
    `Separately, the unverified explanation is labelled as follows. ${result.rootCauseHypothesis}`,
  ].join("\n");
}

function answerEvents(result: InvestigationResult): string {
  const lines = result.confirmedEvidence.map((item) => `- ${item.eventId}: ${item.finding}`);
  return ["The validated result supports its facts only with these event IDs:", ...lines].join("\n");
}

function answerData(result: InvestigationResult): string {
  const related = result.confirmedEvidence.filter((item) => DATA_SIGNAL.test(item.finding));
  const lines =
    related.length > 0
      ? related.map((item) => `- ${item.finding} (event: ${item.eventId})`)
      : ["- The validated evidence does not name records, a payment method owner, or a destination."];
  return ["Data named by the validated result:", ...lines, result.businessImpact, "This does not determine compliance or certification."].join("\n");
}

function answerFirst(result: InvestigationResult): string {
  const r = result.recommendedResponse;
  return [
    `Proposed first step for analyst review: ${r.action} (priority ${r.priority})${r.targetActor ? ` targeting ${r.targetActor}` : ""}.`,
    r.rationale,
    "Nothing runs until an analyst approves it, and execution is simulated.",
  ].join("\n");
}

function answerUnknowns(result: InvestigationResult): string {
  const lines =
    result.unknownsAndLimitations.length > 0
      ? result.unknownsAndLimitations.map((item) => `- ${item}`)
      : ["- The validated result lists no explicit unknowns."];
  return ["Still unverified:", ...lines, result.rootCauseHypothesis].join("\n");
}

/**
 * Answers a fixed question from a result that has already been citation-checked.
 * Unknown questions are refused so this path cannot free-generate.
 */
export function ask(result: InvestigationResult, question: string): string {
  const preset = presetKey(question);
  if (!preset) {
    throw new Error(`Only preset investigation questions can be answered. Choose one of: ${PRESET_QUESTIONS.join(" | ")}`);
  }
  switch (preset) {
    case "Why is this critical?":
      return answerWhy(result);
    case "Which events support the conclusion?":
      return answerEvents(result);
    case "What data may be affected?":
      return answerData(result);
    case "What should the team do first?":
      return answerFirst(result);
    case "What remains unverified?":
      return answerUnknowns(result);
  }
}
