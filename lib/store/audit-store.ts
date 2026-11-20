import { AuditLogEntry } from "@/lib/types";

export interface IAuditStore {
  log(entry: AuditLogEntry): Promise<AuditLogEntry>;
  list(filter?: { action?: string; actor?: string; entityId?: string; limit?: number }): Promise<AuditLogEntry[]>;
  count(): Promise<number>;
  clear(): Promise<void>;
  getAll(): Promise<AuditLogEntry[]>;
}

export class InMemoryAuditStore implements IAuditStore {
  private logs: AuditLogEntry[] = [];

  async log(entry: AuditLogEntry): Promise<AuditLogEntry> {
    const frozen = Object.freeze({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
    });
    this.logs.unshift(frozen);
    return { ...frozen };
  }

  async list(filter?: { action?: string; actor?: string; entityId?: string; limit?: number }): Promise<AuditLogEntry[]> {
    let result = [...this.logs];

    if (filter?.action) {
      result = result.filter((l) => l.action.includes(filter.action!));
    }
    if (filter?.actor) {
      result = result.filter((l) => l.actor === filter.actor);
    }
    if (filter?.entityId) {
      result = result.filter((l) => l.entityId === filter.entityId);
    }

    if (filter?.limit) {
      result = result.slice(0, filter.limit);
    }

    return result.map((l) => ({ ...l }));
  }

  async count(): Promise<number> {
    return this.logs.length;
  }

  async clear(): Promise<void> {
    this.logs = [];
  }

  async getAll(): Promise<AuditLogEntry[]> {
    return this.logs.map((l) => ({ ...l }));
  }
}

const globalForAudit = globalThis as unknown as { auditStoreInstance?: InMemoryAuditStore };
export const auditStore = globalForAudit.auditStoreInstance || new InMemoryAuditStore();
if (process.env.NODE_ENV !== "production") globalForAudit.auditStoreInstance = auditStore;
