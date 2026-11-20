import { SecurityEvent, SeverityLevel } from "@/lib/types";
import { SecurityRule, RuleFinding, RuleContext } from "./rule-interface";

export type ActorClassification = "HUMAN" | "TRUSTED_SHOPPING_AGENT" | "SUSPICIOUS_BOT";

export class RuleR3ApiVolumeAndBotLikelihood implements SecurityRule {
  readonly id = "R3";
  readonly name = "API Volume & Bot Likelihood";
  readonly description = "Detects request rate far above normal or non-human patterns, classifying actors as human, trusted shopping agent, or suspicious bot";
  readonly defaultSeverity: SeverityLevel = "HIGH";

  private readonly BURST_THRESHOLD = 15; // single event requestCount >= 15 or accumulated in window >= 15
  private readonly WINDOW_MS = 60 * 1000; // 1-minute burst window

  /**
   * Classifies actor based on mandate credentials, user-agent patterns, and request dynamics
   */
  classifyActor(event: SecurityEvent): ActorClassification {
    // 1. Check if trusted shopping agent with registered mandate
    if (event.agentId && event.mandate && event.accountRole === "agent") {
      return "TRUSTED_SHOPPING_AGENT";
    }

    const ua = (event.userAgent || "").toLowerCase();
    const isScriptedAgent =
      ua.includes("python") ||
      ua.includes("curl") ||
      ua.includes("wget") ||
      ua.includes("scrapy") ||
      ua.includes("postman") ||
      ua.includes("httpclient") ||
      ua.includes("bot") ||
      ua.includes("crawler");

    // 2. High request volume or scripted client without agent mandate
    if (event.requestCount >= this.BURST_THRESHOLD || isScriptedAgent) {
      return "SUSPICIOUS_BOT";
    }

    // 3. Default to human browsing
    return "HUMAN";
  }

  async evaluate(event: SecurityEvent, context: RuleContext): Promise<RuleFinding | null> {
    const actorType = this.classifyActor(event);

    // Trusted shopping agents continue along normal shopping path unless explicitly violating rules
    if (actorType === "TRUSTED_SHOPPING_AGENT") {
      return null;
    }

    const currentEventTime = new Date(event.timestamp).getTime();
    const windowStart = currentEventTime - (context.windowMs ?? this.WINDOW_MS);

    // Calculate accumulated API request count within window for the same IP / user
    const recentActorEvents = context.recentEvents.filter((prior) => {
      const priorTime = new Date(prior.timestamp).getTime();
      if (priorTime < windowStart || priorTime > currentEventTime) return false;

      const ipMatch = Boolean(event.sourceIp && prior.sourceIp === event.sourceIp);
      const userMatch = Boolean(event.userId && prior.userId && prior.userId === event.userId);
      return ipMatch || userMatch;
    });

    const accumulatedRequestCount =
      event.requestCount +
      recentActorEvents
        .filter((e) => e.id !== event.id)
        .reduce((sum, e) => sum + (e.requestCount || 1), 0);

    const isHighVolume = event.requestCount >= this.BURST_THRESHOLD || accumulatedRequestCount >= this.BURST_THRESHOLD;
    const isSuspiciousBot = actorType === "SUSPICIOUS_BOT";

    if (isHighVolume || (isSuspiciousBot && event.endpoint.startsWith("/api"))) {
      const totalCount = Math.max(event.requestCount, accumulatedRequestCount);
      return {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.defaultSeverity,
        description: `Anomalous API volume detected: ${totalCount} requests recorded in rapid succession. Actor classified as ${actorType}.`,
        timestamp: event.timestamp,
        eventId: event.id,
        relatedEventIds: recentActorEvents.map((e) => e.id),
        confidence: 0.88,
        dataCategory: event.dataCategory,
        metadata: {
          actorClassification: actorType,
          eventRequestCount: event.requestCount,
          accumulatedRequestCount,
          userAgent: event.userAgent,
          endpoint: event.endpoint,
        },
      };
    }

    return null;
  }
}
