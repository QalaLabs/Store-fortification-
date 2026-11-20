import { SecurityEvent, Incident, IncidentEvidenceItem, IncidentTimelineEntry } from "@/lib/types";
import { RuleFinding } from "@/lib/rules";
import { calculateRiskScore } from "./risk-scoring";
import { incidentStore, eventStore } from "@/lib/store";
import crypto from "crypto";

export interface CorrelationResult {
  incident: Incident;
  isNewIncident: boolean;
  findingsCorrelated: number;
}

export class EventCorrelator {
  private readonly CORRELATION_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

  /**
   * Correlates an event and its rule findings against open incidents,
   * updating an existing incident or creating a new one.
   */
  async correlate(event: SecurityEvent, findings: RuleFinding[]): Promise<CorrelationResult | null> {
    if (findings.length === 0) {
      return null;
    }

    const openIncidents = await incidentStore.list({
      status: "OPEN",
    });

    const currentEventTime = new Date(event.timestamp).getTime();

    // Find candidate open incident matching correlation criteria
    let matchedIncident: Incident | null = null;

    for (const incident of openIncidents) {
      const incidentLastUpdated = new Date(incident.updatedAt).getTime();
      const withinWindow = Math.abs(currentEventTime - incidentLastUpdated) <= this.CORRELATION_WINDOW_MS;

      if (!withinWindow) {
        continue;
      }

      // STRICT Cross-User Isolation Guardrail:
      // If the incident already has associated user IDs, and this event has a DIFFERENT user ID,
      // they must NEVER be merged!
      if (
        event.userId &&
        incident.affectedUserIds.length > 0 &&
        !incident.affectedUserIds.includes(event.userId)
      ) {
        continue; // Cross-user isolation: do not merge different users
      }

      // Check matching criteria:
      // 1. Exact user match
      const userMatch = Boolean(event.userId && incident.affectedUserIds.includes(event.userId));

      // 2. Exact session match
      const sessionMatch = Boolean(event.sessionId && incident.affectedSessions.includes(event.sessionId));

      // 3. IP match (if user matches or if incident has no user assigned yet)
      const ipMatch = Boolean(
        event.sourceIp &&
        incident.evidence.some((e) => e.metadata?.sourceIp === event.sourceIp)
      );

      if (userMatch || sessionMatch || ipMatch) {
        matchedIncident = incident;
        break;
      }
    }

    if (matchedIncident) {
      return this.updateExistingIncident(matchedIncident, event, findings);
    } else {
      return this.createNewIncident(event, findings);
    }
  }

  private async updateExistingIncident(
    existing: Incident,
    event: SecurityEvent,
    findings: RuleFinding[]
  ): Promise<CorrelationResult> {
    // 1. Accumulate event IDs (de-duplicate)
    const eventIdsSet = new Set(existing.eventIds);
    eventIdsSet.add(event.id);
    for (const finding of findings) {
      for (const relId of finding.relatedEventIds) {
        eventIdsSet.add(relId);
      }
    }
    const updatedEventIds = Array.from(eventIdsSet);

    // 2. Accumulate affected users, sessions, resources
    const usersSet = new Set(existing.affectedUserIds);
    if (event.userId) usersSet.add(event.userId);

    const sessionsSet = new Set(existing.affectedSessions);
    if (event.sessionId) sessionsSet.add(event.sessionId);

    const resourcesSet = new Set(existing.affectedResources);
    if (event.resourceType) resourcesSet.add(event.resourceType);

    // 3. Accumulate evidence (de-duplicate by eventId + ruleId)
    const existingEvidenceKeys = new Set(existing.evidence.map((e) => `${e.eventId}_${e.ruleId}`));
    const newEvidenceItems: IncidentEvidenceItem[] = [...existing.evidence];

    for (const finding of findings) {
      const key = `${finding.eventId}_${finding.ruleId}`;
      if (!existingEvidenceKeys.has(key)) {
        existingEvidenceKeys.add(key);
        newEvidenceItems.push({
          eventId: finding.eventId,
          description: finding.description,
          ruleId: finding.ruleId,
          timestamp: finding.timestamp,
          severity: finding.severity,
          metadata: {
            ...finding.metadata,
            sourceIp: event.sourceIp,
            confidence: finding.confidence,
          },
        });
      }
    }

    // 4. Fetch all associated events to compute deterministic risk score
    const associatedEvents: SecurityEvent[] = [];
    for (const id of updatedEventIds) {
      const evt = await eventStore.getById(id);
      if (evt) associatedEvents.push(evt);
    }

    const { score, severity } = calculateRiskScore(newEvidenceItems, associatedEvents);

    // 5. Update timeline
    const timeline: IncidentTimelineEntry[] = [...existing.timeline];
    for (const finding of findings) {
      timeline.push({
        timestamp: finding.timestamp,
        description: `Signal detected: [${finding.ruleId}] ${finding.description}`,
        type: "RULE_TRIGGER",
        actor: finding.ruleId,
      });
    }

    // Dynamic title & type escalation based on attack progression
    let updatedTitle = existing.title;
    let updatedType = existing.incidentType;
    const ruleIdsPresent = new Set(newEvidenceItems.map((e) => e.ruleId));
    if (ruleIdsPresent.has("R5")) {
      updatedTitle = "Account Compromise with Unapproved Data Exfiltration";
      updatedType = "ACCOUNT_TAKEOVER_API_ABUSE";
    } else if (ruleIdsPresent.has("R8")) {
      updatedTitle = "Agent Payment Mandate Violation Detected";
      updatedType = "AGENT_PAYMENT_MISMATCH";
    } else if (ruleIdsPresent.has("R6")) {
      updatedTitle = "Seller API Data Exposure & Scope Violation";
      updatedType = "SELLER_DATA_EXPOSURE";
    } else if (ruleIdsPresent.has("R7")) {
      updatedTitle = "Marketing Purpose Consent Drift Detected";
      updatedType = "CONSENT_DRIFT";
    } else if (ruleIdsPresent.has("R2") && (ruleIdsPresent.has("R3") || ruleIdsPresent.has("R4"))) {
      updatedTitle = "Account Takeover & Anomalous API Resource Scraping";
      updatedType = "ACCOUNT_TAKEOVER_API_ABUSE";
    } else if (ruleIdsPresent.has("R2")) {
      updatedTitle = "Account Takeover Detected (Success After Burst Failures)";
      updatedType = "ACCOUNT_TAKEOVER_API_ABUSE";
    }

    // Dynamic recommended actions
    const recommendedActions = Array.from(
      new Set([
        ...existing.recommendedActions,
        severity === "CRITICAL" ? "CONTAIN" : "ALERT",
        "BLOCK",
      ])
    );

    const updated = await incidentStore.update(existing.id, {
      title: updatedTitle,
      incidentType: updatedType,
      severity,
      riskScore: score,
      eventIds: updatedEventIds,
      affectedUserIds: Array.from(usersSet),
      affectedSessions: Array.from(sessionsSet),
      affectedResources: Array.from(resourcesSet),
      evidence: newEvidenceItems,
      timeline,
      recommendedActions,
      updatedAt: event.timestamp,
      summary: `Correlated threat incident tracking ${updatedEventIds.length} security events across ${newEvidenceItems.length} evidence indicators.`,
    });

    return {
      incident: updated!,
      isNewIncident: false,
      findingsCorrelated: findings.length,
    };
  }

  private async createNewIncident(
    event: SecurityEvent,
    findings: RuleFinding[]
  ): Promise<CorrelationResult> {
    const incidentId = `inc_${crypto.randomUUID().slice(0, 12)}`;

    // Collect all event IDs
    const eventIdsSet = new Set<string>([event.id]);
    for (const f of findings) {
      for (const relId of f.relatedEventIds) {
        eventIdsSet.add(relId);
      }
    }
    const eventIds = Array.from(eventIdsSet);

    // Evidence
    const evidence: IncidentEvidenceItem[] = findings.map((f) => ({
      eventId: f.eventId,
      description: f.description,
      ruleId: f.ruleId,
      timestamp: f.timestamp,
      severity: f.severity,
      metadata: {
        ...f.metadata,
        sourceIp: event.sourceIp,
        confidence: f.confidence,
      },
    }));

    // Associated events
    const associatedEvents: SecurityEvent[] = [];
    for (const id of eventIds) {
      const evt = await eventStore.getById(id);
      if (evt) associatedEvents.push(evt);
    }
    if (!associatedEvents.some((e) => e.id === event.id)) {
      associatedEvents.push(event);
    }

    const { score, severity } = calculateRiskScore(evidence, associatedEvents);

    // Title & incidentType selection based on initial finding
    const primaryRule = findings[0]?.ruleId || "R1";
    let title = "Suspicious Security Activity";
    let incidentType = "ACCOUNT_TAKEOVER_API_ABUSE";

    if (primaryRule === "R1") {
      title = "Suspicious Authentication Failures";
      incidentType = "ACCOUNT_TAKEOVER_API_ABUSE";
    } else if (primaryRule === "R2") {
      title = "Account Takeover Detected";
      incidentType = "ACCOUNT_TAKEOVER_API_ABUSE";
    } else if (primaryRule === "R3") {
      title = "Suspicious Bot API Ingestion Spike";
      incidentType = "ACCOUNT_TAKEOVER_API_ABUSE";
    } else if (primaryRule === "R4") {
      title = "Bulk Sensitive Data Access";
      incidentType = "ACCOUNT_TAKEOVER_API_ABUSE";
    } else if (primaryRule === "R5") {
      title = "Unapproved Data Exfiltration";
      incidentType = "ACCOUNT_TAKEOVER_API_ABUSE";
    } else if (primaryRule === "R6") {
      title = "Seller API Data Exposure";
      incidentType = "SELLER_DATA_EXPOSURE";
    } else if (primaryRule === "R7") {
      title = "Marketing Consent Drift";
      incidentType = "CONSENT_DRIFT";
    } else if (primaryRule === "R8") {
      title = "Agent Payment Mandate Mismatch";
      incidentType = "AGENT_PAYMENT_MISMATCH";
    }

    const timeline: IncidentTimelineEntry[] = [
      {
        timestamp: event.timestamp,
        description: `Incident created from detection rule [${primaryRule}]`,
        type: "INCIDENT_CREATED",
        actor: "CORRELATOR",
      },
    ];

    for (const finding of findings) {
      timeline.push({
        timestamp: finding.timestamp,
        description: `Signal detected: [${finding.ruleId}] ${finding.description}`,
        type: "RULE_TRIGGER",
        actor: finding.ruleId,
      });
    }

    const newIncident: Incident = {
      id: incidentId,
      title,
      incidentType,
      severity,
      status: "OPEN",
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
      affectedUserIds: event.userId ? [event.userId] : [],
      affectedSessions: event.sessionId ? [event.sessionId] : [],
      affectedResources: event.resourceType ? [event.resourceType] : [],
      eventIds,
      evidence,
      riskScore: score,
      summary: `Initial correlated incident triggered by ${primaryRule} with initial risk score of ${score}.`,
      investigationStatus: "PENDING",
      recommendedActions: severity === "CRITICAL" ? ["CONTAIN", "BLOCK"] : ["ALERT", "INVESTIGATE"],
      timeline,
    };

    const saved = await incidentStore.create(newIncident);

    return {
      incident: saved,
      isNewIncident: true,
      findingsCorrelated: findings.length,
    };
  }
}

// Global singleton instance for in-memory persistence
const globalForCorrelator = globalThis as unknown as { eventCorrelatorInstance?: EventCorrelator };
export const eventCorrelator = globalForCorrelator.eventCorrelatorInstance || new EventCorrelator();
if (process.env.NODE_ENV !== "production") globalForCorrelator.eventCorrelatorInstance = eventCorrelator;
