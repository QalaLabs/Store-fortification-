import { describe, it, expect, beforeEach } from "vitest";
import {
  InMemoryEventStore,
  InMemoryIncidentStore,
  InMemoryActionStore,
  InMemoryAuditStore,
  StorageBackupManager,
} from "@/lib/store";
import { SecurityEvent, Incident, ResponseAction } from "@/lib/types";

describe("Storage Abstraction & Operations", () => {
  let eventStore: InMemoryEventStore;
  let incidentStore: InMemoryIncidentStore;
  let actionStore: InMemoryActionStore;
  let auditStore: InMemoryAuditStore;

  const mockEvent: SecurityEvent = {
    id: "evt_t1",
    timestamp: "2026-11-20T12:00:00Z",
    source: "storefront",
    eventType: "auth.login.failed",
    sourceIp: "192.168.1.1",
    userAgent: "curl/7.68.0",
    endpoint: "/api/login",
    httpMethod: "POST",
    responseStatus: 401,
    requestCount: 1,
    recordCount: 0,
    dataCategory: "PII",
    metadata: {},
  };

  const mockIncident: Incident = {
    id: "inc_t1",
    title: "Test Incident",
    incidentType: "TEST_INCIDENT",
    severity: "HIGH",
    status: "OPEN",
    createdAt: "2026-11-20T12:00:00Z",
    updatedAt: "2026-11-20T12:00:00Z",
    affectedUserIds: ["usr_1"],
    affectedSessions: ["sess_1"],
    affectedResources: ["profile"],
    eventIds: ["evt_t1"],
    evidence: [],
    riskScore: 75,
    summary: "Test summary",
    investigationStatus: "PENDING",
    recommendedActions: ["ALERT"],
    timeline: [],
  };

  const mockAction: ResponseAction = {
    id: "act_t1",
    incidentId: "inc_t1",
    actionType: "ALERT",
    status: "PROPOSED",
    proposedAt: "2026-11-20T12:01:00Z",
    dryRunResult: {
      targetEntity: "192.168.1.1",
      impactedUsers: 1,
      impactedSessions: 1,
      blastRadius: "MINIMAL",
      estimatedDowntimeMinutes: 0,
      summary: "Alert test",
      projectedEffect: "No customer impact",
    },
    approvalMetadata: { decision: "PENDING" },
    auditReferences: [],
  };

  beforeEach(() => {
    eventStore = new InMemoryEventStore();
    incidentStore = new InMemoryIncidentStore();
    actionStore = new InMemoryActionStore();
    auditStore = new InMemoryAuditStore();
  });

  describe("Event Store", () => {
    it("adds and retrieves security events", async () => {
      await eventStore.add(mockEvent);
      expect(await eventStore.count()).toBe(1);

      const retrieved = await eventStore.getById("evt_t1");
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe("evt_t1");
      expect(retrieved?.sourceIp).toBe("192.168.1.1");
    });

    it("lists events with filtering and limits", async () => {
      await eventStore.add(mockEvent);
      await eventStore.add({
        ...mockEvent,
        id: "evt_t2",
        eventType: "api.request",
        sourceIp: "10.0.0.1",
      });

      const all = await eventStore.list();
      expect(all).toHaveLength(2);

      const filtered = await eventStore.list({ eventType: "api.request" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("evt_t2");
    });

    it("clears events cleanly", async () => {
      await eventStore.add(mockEvent);
      await eventStore.clear();
      expect(await eventStore.count()).toBe(0);
    });
  });

  describe("Incident Store", () => {
    it("creates, retrieves, and updates incidents", async () => {
      await incidentStore.create(mockIncident);
      expect(await incidentStore.count()).toBe(1);

      const updated = await incidentStore.update("inc_t1", {
        status: "INVESTIGATING",
        riskScore: 85,
      });

      expect(updated?.status).toBe("INVESTIGATING");
      expect(updated?.riskScore).toBe(85);

      const fetched = await incidentStore.getById("inc_t1");
      expect(fetched?.status).toBe("INVESTIGATING");
    });

    it("filters incidents by severity and status", async () => {
      await incidentStore.create(mockIncident);
      await incidentStore.create({
        ...mockIncident,
        id: "inc_t2",
        severity: "CRITICAL",
        status: "CONTAINED",
      });

      const criticalOnly = await incidentStore.list({ severity: "CRITICAL" });
      expect(criticalOnly).toHaveLength(1);
      expect(criticalOnly[0].id).toBe("inc_t2");
    });
  });

  describe("Action Store", () => {
    it("creates, retrieves, and updates response actions", async () => {
      await actionStore.create(mockAction);
      expect(await actionStore.count()).toBe(1);

      const byIncident = await actionStore.getByIncidentId("inc_t1");
      expect(byIncident).toHaveLength(1);

      const updated = await actionStore.update("act_t1", {
        status: "APPROVED",
        approvalMetadata: {
          decision: "APPROVED",
          decidedBy: "Aayush",
          decidedAt: "2026-11-20T12:05:00Z",
        },
      });

      expect(updated?.status).toBe("APPROVED");
      expect(updated?.approvalMetadata.decision).toBe("APPROVED");
    });
  });

  describe("Audit Store", () => {
    it("logs and queries audit trail entries", async () => {
      await auditStore.log({
        id: "aud_1",
        timestamp: "2026-11-20T12:00:00Z",
        action: "DETECTION_TRIGGERED",
        actor: "RULE_ENGINE:R1",
        entityType: "INCIDENT",
        entityId: "inc_t1",
        details: "Repeated failed login rule triggered",
        metadata: {},
      });

      expect(await auditStore.count()).toBe(1);
      const list = await auditStore.list({ actor: "RULE_ENGINE:R1" });
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("aud_1");
    });
  });

  describe("Backup Manager", () => {
    it("exports in-memory state and restores safely", async () => {
      const backup = await StorageBackupManager.exportBackup("./data/test-backup.json");
      expect(backup.version).toBe("1.0.0");
      expect(Array.isArray(backup.events)).toBe(true);

      const restored = await StorageBackupManager.importBackup("./data/test-backup.json");
      expect(restored).toBeDefined();
    });
  });
});
