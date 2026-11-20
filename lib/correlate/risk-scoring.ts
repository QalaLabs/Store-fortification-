import { SeverityLevel, IncidentEvidenceItem, SecurityEvent } from "@/lib/types";

export interface ScoreContribution {
  factor: string;
  points: number;
  description: string;
}

export interface RiskScoreResult {
  score: number;
  severity: SeverityLevel;
  contributions: ScoreContribution[];
}

/**
 * Deterministic Risk Scoring Engine
 * Computes an explainable 0–100 risk score based on rule severity, accumulated evidence,
 * data sensitivity, records exposed volume, and multi-stage attack chaining.
 * Strictly adheres to PRD severity bands:
 *   >= 85 : CRITICAL
 *   >= 65 : HIGH
 *   >= 40 : MEDIUM
 *   < 40  : LOW
 */
export function calculateRiskScore(
  evidence: IncidentEvidenceItem[],
  associatedEvents: SecurityEvent[]
): RiskScoreResult {
  const contributions: ScoreContribution[] = [];
  let rawScore = 0;

  // 1. Rule Severity Base Points (de-duplicated by unique rule ID)
  const uniqueRules = new Set<string>();
  for (const item of evidence) {
    if (item.ruleId) {
      uniqueRules.add(item.ruleId);
    }
  }

  for (const ruleId of uniqueRules) {
    if (ruleId === "R5") {
      const pts = 40;
      rawScore += pts;
      contributions.push({
        factor: "CRITICAL_RULE_R5",
        points: pts,
        description: "Unapproved data exfiltration detected (Rule R5)",
      });
    } else if (ruleId === "R8") {
      const hasCriticalFinding = evidence.some(
        (e) => e.ruleId === "R8" && e.severity === "CRITICAL"
      );
      const pts = hasCriticalFinding ? 40 : 30;
      rawScore += pts;
      contributions.push({
        factor: hasCriticalFinding ? "CRITICAL_AGENT_PAYMENT_VIOLATION_R8" : "AGENT_PAYMENT_VIOLATION_R8",
        points: pts,
        description: hasCriticalFinding
          ? "Critical agent payment mandate violation detected (Rule R8)"
          : "Agent payment mandate check failed (Rule R8)",
      });
    } else if (ruleId === "R2" || ruleId === "R3" || ruleId === "R4" || ruleId === "R6") {
      const pts = 25;
      rawScore += pts;
      contributions.push({
        factor: `HIGH_RULE_${ruleId}`,
        points: pts,
        description: `High severity indicator triggered: ${ruleId}`,
      });
    } else if (ruleId === "R7") {
      const pts = 20;
      rawScore += pts;
      contributions.push({
        factor: "CONSENT_DRIFT_R7",
        points: pts,
        description: "Marketing purpose consent drift detected (Rule R7)",
      });
    } else if (ruleId === "R1") {
      const pts = 15;
      rawScore += pts;
      contributions.push({
        factor: "MEDIUM_RULE_R1",
        points: pts,
        description: "Repeated authentication failures detected (Rule R1)",
      });
    }
  }

  // 2. Attack Chain Progression Bonus
  // If credential failure (R1) -> success (R2) -> API volume (R3) -> data access/export (R4/R5)
  if (uniqueRules.has("R1") && uniqueRules.has("R2")) {
    const pts = 10;
    rawScore += pts;
    contributions.push({
      factor: "ATTACK_CHAIN_ACCOUNT_TAKEOVER",
      points: pts,
      description: "Confirmed Account Takeover chain (Authentication failures followed by success)",
    });
  }

  if (uniqueRules.size >= 4) {
    const pts = 10;
    rawScore += pts;
    contributions.push({
      factor: "MULTI_STAGE_EXPLOITATION",
      points: pts,
      description: "Complex multi-stage attack sequence confirmed across 4+ detection vectors",
    });
  }

  // 2b. Agent Payment Fraud / Cardholder Ownership Mismatch Factor
  const hasPaymentMismatch = evidence.some(
    (e) =>
      e.ruleId === "R8" &&
      ((e.metadata?.violations as string[] | undefined)?.includes("PAYMENT_METHOD_MISMATCH") ||
        e.description.includes("MISMATCH") ||
        e.description.includes("payment method of"))
  );
  if (hasPaymentMismatch) {
    const pts = 30;
    rawScore += pts;
    contributions.push({
      factor: "PAYMENT_METHOD_MISMATCH_FRAUD",
      points: pts,
      description: "Payment method owner does not match human principal (unauthorized payment method utilization)",
    });
  }

  // 3. Data Sensitivity Multiplier
  const dataCategories = new Set<string>();
  for (const evt of associatedEvents) {
    if (evt.dataCategory) {
      dataCategories.add(evt.dataCategory.toUpperCase());
    }
  }

  if (dataCategories.has("PAYMENT")) {
    const pts = 15;
    rawScore += pts;
    contributions.push({
      factor: "SENSITIVITY_PAYMENT",
      points: pts,
      description: "Payment and cardholder data in scope",
    });
  } else if (dataCategories.has("PII")) {
    const pts = 12;
    rawScore += pts;
    contributions.push({
      factor: "SENSITIVITY_PII",
      points: pts,
      description: "Customer Personally Identifiable Information (PII) in scope",
    });
  } else if (dataCategories.has("ORDER")) {
    const pts = 8;
    rawScore += pts;
    contributions.push({
      factor: "SENSITIVITY_ORDER",
      points: pts,
      description: "Order and transaction histories in scope",
    });
  }

  // 4. Volume / Records Exposed Impact
  const totalRecordsExposed = associatedEvents.reduce((sum, e) => sum + (e.recordCount || 0), 0);
  if (totalRecordsExposed >= 100) {
    const pts = 15;
    rawScore += pts;
    contributions.push({
      factor: "VOLUME_MASSIVE",
      points: pts,
      description: `Massive exposure volume: ${totalRecordsExposed} records accessed/exported`,
    });
  } else if (totalRecordsExposed >= 20) {
    const pts = 10;
    rawScore += pts;
    contributions.push({
      factor: "VOLUME_BULK",
      points: pts,
      description: `Bulk exposure volume: ${totalRecordsExposed} records accessed`,
    });
  } else if (totalRecordsExposed > 0) {
    const pts = 5;
    rawScore += pts;
    contributions.push({
      factor: "VOLUME_MODEST",
      points: pts,
      description: `${totalRecordsExposed} records exposed`,
    });
  }

  // Normalize final score strictly between 0 and 100
  let finalScore = Math.min(100, Math.max(0, rawScore));

  // If a confirmed CRITICAL evidence finding is present, ensure score reflects CRITICAL band (>= 85)
  const hasCriticalEvidence = evidence.some((e) => e.severity === "CRITICAL");
  if (hasCriticalEvidence && finalScore < 85) {
    const pts = 85 - finalScore;
    finalScore = 85;
    contributions.push({
      factor: "CRITICAL_SEVERITY_FLOOR",
      points: pts,
      description: "Floor elevated to CRITICAL (85) due to confirmed critical severity finding",
    });
  }

  // Map to PRD severity bands
  let severity: SeverityLevel;
  if (finalScore >= 85) {
    severity = "CRITICAL";
  } else if (finalScore >= 65) {
    severity = "HIGH";
  } else if (finalScore >= 40) {
    severity = "MEDIUM";
  } else {
    severity = "LOW";
  }

  return {
    score: finalScore,
    severity,
    contributions,
  };
}
