import { SecurityEvent } from "@/lib/types";

export interface IEventStore {
  add(event: SecurityEvent): Promise<SecurityEvent>;
  addBatch(events: SecurityEvent[]): Promise<SecurityEvent[]>;
  getById(id: string): Promise<SecurityEvent | null>;
  list(filter?: { limit?: number; eventType?: string; sourceIp?: string; userId?: string }): Promise<SecurityEvent[]>;
  count(): Promise<number>;
  clear(): Promise<void>;
  getAll(): Promise<SecurityEvent[]>;
}

export class InMemoryEventStore implements IEventStore {
  private events: Map<string, SecurityEvent> = new Map();

  async add(event: SecurityEvent): Promise<SecurityEvent> {
    this.events.set(event.id, Object.freeze({ ...event }));
    return this.events.get(event.id)!;
  }

  async addBatch(events: SecurityEvent[]): Promise<SecurityEvent[]> {
    const results: SecurityEvent[] = [];
    for (const evt of events) {
      results.push(await this.add(evt));
    }
    return results;
  }

  async getById(id: string): Promise<SecurityEvent | null> {
    const event = this.events.get(id);
    return event ? { ...event } : null;
  }

  async list(filter?: {
    limit?: number;
    eventType?: string;
    sourceIp?: string;
    userId?: string;
  }): Promise<SecurityEvent[]> {
    let result = Array.from(this.events.values());

    if (filter?.eventType) {
      result = result.filter((e) => e.eventType === filter.eventType);
    }
    if (filter?.sourceIp) {
      result = result.filter((e) => e.sourceIp === filter.sourceIp);
    }
    if (filter?.userId) {
      result = result.filter((e) => e.userId === filter.userId);
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filter?.limit) {
      result = result.slice(0, filter.limit);
    }

    return result.map((e) => ({ ...e }));
  }

  async count(): Promise<number> {
    return this.events.size;
  }

  async clear(): Promise<void> {
    this.events.clear();
  }

  async getAll(): Promise<SecurityEvent[]> {
    return Array.from(this.events.values()).map((e) => ({ ...e }));
  }
}

// Global singleton instance for in-memory persistence across Next.js route calls
const globalForEvents = globalThis as unknown as { eventStoreInstance?: InMemoryEventStore };
export const eventStore = globalForEvents.eventStoreInstance || new InMemoryEventStore();
if (process.env.NODE_ENV !== "production") globalForEvents.eventStoreInstance = eventStore;
