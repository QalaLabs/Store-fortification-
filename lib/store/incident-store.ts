import { Incident, SeverityLevel, IncidentStatus } from "@/lib/types";

export interface IIncidentStore {
  create(incident: Incident): Promise<Incident>;
  getById(id: string): Promise<Incident | null>;
  update(id: string, updates: Partial<Incident>): Promise<Incident | null>;
  list(filter?: { severity?: SeverityLevel; status?: IncidentStatus; limit?: number }): Promise<Incident[]>;
  count(): Promise<number>;
  clear(): Promise<void>;
  getAll(): Promise<Incident[]>;
}

export class InMemoryIncidentStore implements IIncidentStore {
  private incidents: Map<string, Incident> = new Map();

  async create(incident: Incident): Promise<Incident> {
    const frozen = Object.freeze({
      ...incident,
      createdAt: incident.createdAt || new Date().toISOString(),
      updatedAt: incident.updatedAt || new Date().toISOString(),
    });
    this.incidents.set(incident.id, frozen);
    return { ...this.incidents.get(incident.id)! };
  }

  async getById(id: string): Promise<Incident | null> {
    const incident = this.incidents.get(id);
    return incident ? { ...incident } : null;
  }

  async update(id: string, updates: Partial<Incident>): Promise<Incident | null> {
    const existing = this.incidents.get(id);
    if (!existing) return null;

    const updated: Incident = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      createdAt: existing.createdAt, // Immutable createdAt
      updatedAt: updates.updatedAt || new Date().toISOString(),
    };

    this.incidents.set(id, Object.freeze(updated));
    return { ...updated };
  }

  async list(filter?: {
    severity?: SeverityLevel;
    status?: IncidentStatus;
    limit?: number;
  }): Promise<Incident[]> {
    let result = Array.from(this.incidents.values());

    if (filter?.severity) {
      result = result.filter((i) => i.severity === filter.severity);
    }
    if (filter?.status) {
      result = result.filter((i) => i.status === filter.status);
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter?.limit) {
      result = result.slice(0, filter.limit);
    }

    return result.map((i) => ({ ...i }));
  }

  async count(): Promise<number> {
    return this.incidents.size;
  }

  async clear(): Promise<void> {
    this.incidents.clear();
  }

  async getAll(): Promise<Incident[]> {
    return Array.from(this.incidents.values()).map((i) => ({ ...i }));
  }
}

// Global singleton instance for in-memory persistence
const globalForIncidents = globalThis as unknown as { incidentStoreInstance?: InMemoryIncidentStore };
export const incidentStore = globalForIncidents.incidentStoreInstance || new InMemoryIncidentStore();
if (process.env.NODE_ENV !== "production") globalForIncidents.incidentStoreInstance = incidentStore;
