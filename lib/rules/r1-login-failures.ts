import { SecurityEvent, SeverityLevel } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";

export class RuleR1LoginFailures implements SecurityRule {
  readonly id = "R1";
  readonly name = "Repeated Login Failures";
  readonly description = "Triggers when repeated failed authentication attempts occur for an account or IP";
  readonly defaultSeverity: SeverityLevel = "MEDIUM";

  private readonly FAILURE_THRESHOLD = 3;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15-minute correlation window

  async evaluate(event: SecurityEvent, context: RuleContext): Promise<RuleFinding | null> {
    const isLoginFailure =
      event.eventType === "auth.login.failed" ||
      (event.endpoint.toLowerCase().includes("login") && (event.responseStatus === 401 || event.responseStatus === 403));

    if (!isLoginFailure) {
      return null;
    }

    const currentEventTime = new Date(event.timestamp).getTime();
    const windowStart = currentEventTime - (context.windowMs ?? this.WINDOW_MS);

    // Look back at recent events for matching userId or sourceIp that also failed login
    const matchingPriorFailures = context.recentEvents.filter((prior) => {
      if (prior.id === event.id) return false;

      const priorTime = new Date(prior.timestamp).getTime();
      if (priorTime < windowStart || priorTime > currentEventTime) return false;

      const isPriorFailure =
        prior.eventType === "auth.login.failed" ||
        (prior.endpoint.toLowerCase().includes("login") && (prior.responseStatus === 401 || prior.responseStatus === 403));

      if (!isPriorFailure) return false;

      // Match on userId (if known) or sourceIp
      const userMatch = Boolean(event.userId && prior.userId && event.userId === prior.userId);
      const ipMatch = Boolean(event.sourceIp && prior.sourceIp && event.sourceIp === prior.sourceIp);

      return userMatch || ipMatch;
    });

    const totalFailures = matchingPriorFailures.length + 1; // +1 for the current event

    // Check if failure threshold reached
    if (totalFailures >= this.FAILURE_THRESHOLD) {
      const severity: SeverityLevel = totalFailures >= 5 ? "HIGH" : "MEDIUM";
      const target = event.userId ? `account '${event.userId}'` : `IP '${event.sourceIp}'`;

      return {
        ruleId: this.id,
        ruleName: this.name,
        severity,
        description: `Repeated failed logins detected on ${target}: ${totalFailures} failed attempts within lookback window.`,
        timestamp: event.timestamp,
        eventId: event.id,
        relatedEventIds: matchingPriorFailures.map((p) => p.id),
        confidence: 0.95,
        dataCategory: event.dataCategory,
        metadata: {
          totalFailures,
          threshold: this.FAILURE_THRESHOLD,
          matchedBy: event.userId ? "userId" : "sourceIp",
        },
      };
    }

    return null;
  }
}
