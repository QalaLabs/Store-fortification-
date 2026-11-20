import { SecurityEvent, SeverityLevel } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";

/**
 * R7 — Marketing consent drift (stretch, kept simple).
 *
 * Primary path (S3): metadata.purpose !== metadata.consentPurpose.
 * Alternate path: marketing/campaign action with consentStatus !== "ACTIVE".
 */
export class RuleR7ConsentDrift implements SecurityRule {
  readonly id = "R7";
  readonly name = "Marketing Consent Drift";
  readonly description =
    "Triggers when customer data is used for a purpose that differs from the recorded consent purpose";
  readonly defaultSeverity: SeverityLevel = "MEDIUM";

  async evaluate(event: SecurityEvent, _context: RuleContext): Promise<RuleFinding | null> {
    const meta = (event.metadata ?? {}) as Record<string, unknown>;
    const purpose = typeof meta.purpose === "string" ? meta.purpose : undefined;
    const consentPurpose = typeof meta.consentPurpose === "string" ? meta.consentPurpose : undefined;

    // Path A: S3 purpose / consentPurpose check (mismatch fires; match is definitive OK)
    if (purpose !== undefined && consentPurpose !== undefined) {
      if (purpose === consentPurpose) {
        return null;
      }
      return {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.defaultSeverity,
        description: `Consent drift: event purpose "${purpose}" differs from consent purpose "${consentPurpose}".`,
        timestamp: event.timestamp,
        eventId: event.id,
        relatedEventIds: [],
        confidence: 0.85,
        dataCategory: event.dataCategory,
        metadata: {
          purpose,
          consentPurpose,
          endpoint: event.endpoint,
          eventType: event.eventType,
        },
      };
    }

    // Path B: marketing/campaign action without ACTIVE consent
    const eventType = (event.eventType || "").toLowerCase();
    const endpoint = (event.endpoint || "").toLowerCase();
    const isMarketingAction =
      eventType.includes("marketing") ||
      eventType.includes("campaign") ||
      endpoint.includes("marketing") ||
      endpoint.includes("campaign");

    if (!isMarketingAction) {
      return null;
    }

    const consentStatus = typeof meta.consentStatus === "string" ? meta.consentStatus : undefined;
    if (consentStatus === "ACTIVE") {
      return null;
    }

    return {
      ruleId: this.id,
      ruleName: this.name,
      severity: this.defaultSeverity,
      description: `Consent drift: marketing/campaign action without ACTIVE consent (consentStatus=${consentStatus ?? "missing"}).`,
      timestamp: event.timestamp,
      eventId: event.id,
      relatedEventIds: [],
      confidence: 0.85,
      dataCategory: event.dataCategory,
      metadata: {
        consentStatus: consentStatus ?? null,
        endpoint: event.endpoint,
        eventType: event.eventType,
      },
    };
  }
}
