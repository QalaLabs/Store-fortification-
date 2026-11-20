import { SecurityEvent, SeverityLevel } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";

export class RuleR4SensitiveAccess implements SecurityRule {
  readonly id = "R4";
  readonly name = "Sensitive Access";
  readonly description = "Triggers when customer PII, payment tokens, or order histories are read in bulk";
  readonly defaultSeverity: SeverityLevel = "HIGH";

  private readonly BULK_RECORD_THRESHOLD = 10;
  private readonly SENSITIVE_CATEGORIES = new Set(["PII", "ORDER", "PAYMENT"]);
  private readonly SENSITIVE_RESOURCES = new Set([
    "customer_profile",
    "customer_records",
    "customer",
    "customers",
    "order",
    "orders",
    "order_history",
    "payment_method",
  ]);

  async evaluate(event: SecurityEvent, context: RuleContext): Promise<RuleFinding | null> {
    const isSensitiveCategory = this.SENSITIVE_CATEGORIES.has(event.dataCategory?.toUpperCase() || "");
    const isSensitiveResource = Boolean(
      event.resourceType && this.SENSITIVE_RESOURCES.has(event.resourceType.toLowerCase())
    );

    const isSensitiveEndpoint =
      event.endpoint.toLowerCase().includes("customer") ||
      event.endpoint.toLowerCase().includes("order") ||
      event.endpoint.toLowerCase().includes("profile") ||
      event.endpoint.toLowerCase().includes("export");

    if (!isSensitiveCategory && !isSensitiveResource && !isSensitiveEndpoint) {
      return null;
    }

    // Check single event recordCount
    let totalRecords = event.recordCount || 0;

    // Also aggregate recent records read by this actor if multiple small requests read bulk data
    if (context.recentEvents && context.recentEvents.length > 0) {
      const windowStart = new Date(event.timestamp).getTime() - 5 * 60 * 1000;
      const recentRelatedReads = context.recentEvents.filter((prior) => {
        if (prior.id === event.id) return false;
        const priorTime = new Date(prior.timestamp).getTime();
        if (priorTime < windowStart) return false;

        const actorMatch =
          (event.userId && prior.userId === event.userId) || (event.sourceIp && prior.sourceIp === event.sourceIp);
        const sensitiveMatch =
          this.SENSITIVE_CATEGORIES.has(prior.dataCategory?.toUpperCase() || "") ||
          prior.endpoint.toLowerCase().includes("order") ||
          prior.endpoint.toLowerCase().includes("customer");

        return actorMatch && sensitiveMatch;
      });

      totalRecords += recentRelatedReads.reduce((sum, e) => sum + (e.recordCount || 0), 0);
    }

    if (totalRecords >= this.BULK_RECORD_THRESHOLD) {
      const severity: SeverityLevel = totalRecords >= 100 ? "CRITICAL" : "HIGH";
      const category = event.dataCategory || event.resourceType || "PII/ORDER";

      return {
        ruleId: this.id,
        ruleName: this.name,
        severity,
        description: `Bulk sensitive data access detected: ${totalRecords} ${category} records read from ${event.endpoint}.`,
        timestamp: event.timestamp,
        eventId: event.id,
        relatedEventIds: [],
        confidence: 0.92,
        dataCategory: event.dataCategory,
        metadata: {
          recordCount: totalRecords,
          threshold: this.BULK_RECORD_THRESHOLD,
          resourceType: event.resourceType,
          endpoint: event.endpoint,
        },
      };
    }

    return null;
  }
}
