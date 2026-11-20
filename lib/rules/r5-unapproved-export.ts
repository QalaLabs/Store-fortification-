import { SecurityEvent, SeverityLevel } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";

export class RuleR5UnapprovedExport implements SecurityRule {
  readonly id = "R5";
  readonly name = "Export to Unapproved Destination";
  readonly description = "Triggers when customer, order, or catalog data is sent to a destination not on the approved destination list";
  readonly defaultSeverity: SeverityLevel = "CRITICAL";

  private readonly APPROVED_DESTINATIONS = new Set([
    "https://store.internal/backup",
    "https://analytics.store.internal",
    "https://datawarehouse.internal",
    "internal://backup-service",
  ]);

  async evaluate(event: SecurityEvent, _context: RuleContext): Promise<RuleFinding | null> {
    const isExportType =
      event.eventType.toLowerCase().includes("export") ||
      event.endpoint.toLowerCase().includes("export") ||
      event.eventType === "data.export";

    // 1. If destination is explicitly flagged as approved, do not trigger
    if (event.approvedDestination === true) {
      return null;
    }

    // 2. If destination is explicitly marked as unapproved, always trigger
    if (event.approvedDestination === false) {
      return this.createFinding(event, `Destination explicitly marked as unapproved: ${event.destination}`);
    }

    // 3. For export type events with destinations, check against authorized destinations whitelist
    if (isExportType) {
      if (event.destination && !this.APPROVED_DESTINATIONS.has(event.destination)) {
        return this.createFinding(
          event,
          `Data export attempted to unauthorized external destination: ${event.destination}`
        );
      }

      return this.createFinding(
        event,
        `Data export event initiated without destination authorization verification.`
      );
    }

    return null;
  }

  private createFinding(event: SecurityEvent, reason: string): RuleFinding {
    const destinationTarget = event.destination || "Unknown external recipient";
    return {
      ruleId: this.id,
      ruleName: this.name,
      severity: this.defaultSeverity,
      description: `Unapproved data exfiltration: ${reason}. Target: ${destinationTarget}.`,
      timestamp: event.timestamp,
      eventId: event.id,
      relatedEventIds: [],
      confidence: 0.98,
      dataCategory: event.dataCategory,
      metadata: {
        destination: event.destination,
        approvedDestination: event.approvedDestination,
        recordCount: event.recordCount,
        endpoint: event.endpoint,
      },
    };
  }
}
