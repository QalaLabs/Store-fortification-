import { SecurityEvent, SeverityLevel } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";

/**
 * R6 — Third-party partner / seller token scope violation.
 *
 * Primary path (S2): authorised merchant = metadata.tokenId without `tok_`;
 * each metadata.recordsAccessed entry is `{merchantId}:customer:{recordId}`.
 * Alternate path: metadata.authorizedScope string array; flag when
 * resourceType is outside it, or when scope is absent and the endpoint
 * touches /customer or /pii.
 */
export class RuleR6PartnerScope implements SecurityRule {
  readonly id = "R6";
  readonly name = "Third-party Partner Token Scope Violation";
  readonly description =
    "Triggers when a partner or seller token reads customer PII outside its contracted merchant scope";
  readonly defaultSeverity: SeverityLevel = "HIGH";

  async evaluate(event: SecurityEvent, _context: RuleContext): Promise<RuleFinding | null> {
    const role = (event.accountRole || "").toLowerCase();
    const isPartnerToken = role.includes("partner") || role.includes("seller");
    if (!isPartnerToken) {
      return null;
    }

    const meta = (event.metadata ?? {}) as Record<string, unknown>;
    const recordsAccessed = Array.isArray(meta.recordsAccessed)
      ? (meta.recordsAccessed.filter((r): r is string => typeof r === "string") as string[])
      : [];
    const tokenId = typeof meta.tokenId === "string" ? meta.tokenId : undefined;

    // Path A: S2 merchant-prefix scope via tokenId + recordsAccessed
    if (tokenId && recordsAccessed.length > 0) {
      const authorisedMerchant = tokenId.startsWith("tok_") ? tokenId.slice(4) : tokenId;
      const outOfScope = recordsAccessed.filter((r) => !r.startsWith(`${authorisedMerchant}:`));
      if (outOfScope.length > 0) {
        return this.createFinding(
          event,
          `Partner token ${tokenId} accessed ${outOfScope.length} customer record(s) outside merchant scope ${authorisedMerchant}`,
          {
            tokenId,
            authorisedMerchant,
            outOfScopeRecords: outOfScope,
            recordsAccessed,
          }
        );
      }
      return null;
    }

    // Path B: explicit authorizedScope array (or PII endpoint with no scope declared)
    const authorizedScope = Array.isArray(meta.authorizedScope)
      ? (meta.authorizedScope.filter((s): s is string => typeof s === "string") as string[])
      : null;

    const endpoint = (event.endpoint || "").toLowerCase();
    const touchesCustomerPii =
      endpoint.includes("/customer") ||
      endpoint.includes("/pii") ||
      (event.resourceType || "").toLowerCase().includes("customer") ||
      (event.dataCategory || "").toUpperCase() === "PII";

    if (authorizedScope && authorizedScope.length > 0) {
      const resourceType = event.resourceType || "";
      if (resourceType && !authorizedScope.includes(resourceType)) {
        return this.createFinding(
          event,
          `Partner token accessed resourceType "${resourceType}" outside authorizedScope`,
          { authorizedScope, resourceType, endpoint: event.endpoint }
        );
      }
      return null;
    }

    if (touchesCustomerPii) {
      return this.createFinding(
        event,
        `Partner/seller token accessed customer PII endpoint without declared authorizedScope: ${event.endpoint}`,
        { authorizedScope: null, resourceType: event.resourceType, endpoint: event.endpoint }
      );
    }

    return null;
  }

  private createFinding(
    event: SecurityEvent,
    reason: string,
    metadata: Record<string, unknown>
  ): RuleFinding {
    return {
      ruleId: this.id,
      ruleName: this.name,
      severity: this.defaultSeverity,
      description: `Partner scope violation: ${reason}.`,
      timestamp: event.timestamp,
      eventId: event.id,
      relatedEventIds: [],
      confidence: 0.9,
      dataCategory: event.dataCategory,
      metadata: {
        accountRole: event.accountRole,
        ...metadata,
      },
    };
  }
}
