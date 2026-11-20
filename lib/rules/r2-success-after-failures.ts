import { SecurityEvent, SeverityLevel } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";

export class RuleR2SuccessAfterFailures implements SecurityRule {
  readonly id = "R2";
  readonly name = "Success After Failures";
  readonly description = "Triggers when a successful login follows a burst of failed authentication attempts (credential stuffing/brute force indicator)";
  readonly defaultSeverity: SeverityLevel = "HIGH";

  private readonly FAILURE_BURST_THRESHOLD = 2; // >= 2 prior failures right before success
  private readonly WINDOW_MS = 15 * 60 * 1000;

  async evaluate(event: SecurityEvent, context: RuleContext): Promise<RuleFinding | null> {
    const isLoginSuccess =
      event.eventType === "auth.login.success" ||
      (event.endpoint.toLowerCase().includes("login") && event.responseStatus >= 200 && event.responseStatus < 300);

    if (!isLoginSuccess) {
      return null;
    }

    const currentEventTime = new Date(event.timestamp).getTime();
    const windowStart = currentEventTime - (context.windowMs ?? this.WINDOW_MS);

    // Look for preceding failed logins for the same userId or sourceIp
    const priorFailures = context.recentEvents.filter((prior) => {
      if (prior.id === event.id) return false;

      const priorTime = new Date(prior.timestamp).getTime();
      // Must have occurred before current successful login and within window
      if (priorTime < windowStart || priorTime >= currentEventTime) return false;

      const isPriorFailure =
        prior.eventType === "auth.login.failed" ||
        (prior.endpoint.toLowerCase().includes("login") && (prior.responseStatus === 401 || prior.responseStatus === 403));

      if (!isPriorFailure) return false;

      const userMatch = Boolean(event.userId && prior.userId && event.userId === prior.userId);
      const ipMatch = Boolean(event.sourceIp && prior.sourceIp && event.sourceIp === prior.sourceIp);

      return userMatch || ipMatch;
    });

    if (priorFailures.length >= this.FAILURE_BURST_THRESHOLD) {
      const targetUser = event.userId || "unknown_user";
      return {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.defaultSeverity,
        description: `Potential account takeover: Successful login for '${targetUser}' from IP '${event.sourceIp}' immediately following ${priorFailures.length} failed attempts.`,
        timestamp: event.timestamp,
        eventId: event.id,
        relatedEventIds: priorFailures.map((p) => p.id),
        confidence: 0.90,
        dataCategory: event.dataCategory,
        metadata: {
          priorFailuresCount: priorFailures.length,
          targetUser,
          sourceIp: event.sourceIp,
        },
      };
    }

    return null;
  }
}
