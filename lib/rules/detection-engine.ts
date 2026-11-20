import { SecurityEvent } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";
import { RuleR1LoginFailures } from "./r1-login-failures";
import { RuleR2SuccessAfterFailures } from "./r2-success-after-failures";
import { RuleR3ApiVolumeAndBotLikelihood } from "./r3-api-volume";
import { RuleR4SensitiveAccess } from "./r4-sensitive-access";
import { RuleR5UnapprovedExport } from "./r5-unapproved-export";

export class DetectionEngine {
  private rules: Map<string, SecurityRule> = new Map();

  constructor() {
    this.registerRule(new RuleR1LoginFailures());
    this.registerRule(new RuleR2SuccessAfterFailures());
    this.registerRule(new RuleR3ApiVolumeAndBotLikelihood());
    this.registerRule(new RuleR4SensitiveAccess());
    this.registerRule(new RuleR5UnapprovedExport());
  }

  registerRule(rule: SecurityRule): void {
    this.rules.set(rule.id, rule);
  }

  getRule(id: string): SecurityRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): SecurityRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Evaluates an incoming event against all registered deterministic detection rules
   */
  async evaluate(event: SecurityEvent, context: RuleContext): Promise<RuleFinding[]> {
    const findings: RuleFinding[] = [];

    for (const rule of this.rules.values()) {
      try {
        const finding = await rule.evaluate(event, context);
        if (finding) {
          findings.push(finding);
        }
      } catch (err) {
        console.error(`[DETECTION_ENGINE] Error evaluating rule ${rule.id} on event ${event.id}:`, err);
      }
    }

    return findings;
  }
}

// Global singleton instance for in-memory persistence
const globalForEngine = globalThis as unknown as { detectionEngineInstance?: DetectionEngine };
export const detectionEngine = globalForEngine.detectionEngineInstance || new DetectionEngine();
if (process.env.NODE_ENV !== "production") globalForEngine.detectionEngineInstance = detectionEngine;
