import { SecurityEvent, SeverityLevel } from "@/lib/types";

/**
 * Finding produced by a deterministic security rule
 */
export interface RuleFinding {
  ruleId: "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8" | string;
  ruleName: string;
  severity: SeverityLevel;
  description: string;
  timestamp: string;
  eventId: string; // The primary triggering event ID
  relatedEventIds: string[]; // Supporting historical event IDs (e.g. prior failed login events)
  confidence: number; // Deterministic rule confidence (0.0 - 1.0)
  dataCategory?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Historical context provided to stateful / temporal detection rules
 */
export interface RuleContext {
  /**
   * Chronologically sorted events in the evaluation window
   */
  recentEvents: SecurityEvent[];
  /**
   * Lookback window in milliseconds (default: 15 minutes)
   */
  windowMs?: number;
}

/**
 * Modular security rule contract
 */
export interface SecurityRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly defaultSeverity: SeverityLevel;

  evaluate(event: SecurityEvent, context: RuleContext): Promise<RuleFinding | null>;
}
