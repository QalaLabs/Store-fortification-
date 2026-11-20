import { ResponseAction, ActionStatus, ActionType } from "@/lib/types";

export interface IActionStore {
  create(action: ResponseAction): Promise<ResponseAction>;
  getById(id: string): Promise<ResponseAction | null>;
  getByIncidentId(incidentId: string): Promise<ResponseAction[]>;
  update(id: string, updates: Partial<ResponseAction>): Promise<ResponseAction | null>;
  list(filter?: { status?: ActionStatus; actionType?: ActionType; limit?: number }): Promise<ResponseAction[]>;
  count(): Promise<number>;
  clear(): Promise<void>;
  getAll(): Promise<ResponseAction[]>;
}

export class InMemoryActionStore implements IActionStore {
  private actions: Map<string, ResponseAction> = new Map();

  async create(action: ResponseAction): Promise<ResponseAction> {
    const frozen = Object.freeze({
      ...action,
      proposedAt: action.proposedAt || new Date().toISOString(),
    });
    this.actions.set(action.id, frozen);
    return { ...this.actions.get(action.id)! };
  }

  async getById(id: string): Promise<ResponseAction | null> {
    const action = this.actions.get(id);
    return action ? { ...action } : null;
  }

  async getByIncidentId(incidentId: string): Promise<ResponseAction[]> {
    return Array.from(this.actions.values())
      .filter((a) => a.incidentId === incidentId)
      .map((a) => ({ ...a }));
  }

  async update(id: string, updates: Partial<ResponseAction>): Promise<ResponseAction | null> {
    const existing = this.actions.get(id);
    if (!existing) return null;

    const updated: ResponseAction = {
      ...existing,
      ...updates,
      id: existing.id,
      incidentId: existing.incidentId,
      proposedAt: existing.proposedAt,
    };

    this.actions.set(id, Object.freeze(updated));
    return { ...updated };
  }

  async list(filter?: {
    status?: ActionStatus;
    actionType?: ActionType;
    limit?: number;
  }): Promise<ResponseAction[]> {
    let result = Array.from(this.actions.values());

    if (filter?.status) {
      result = result.filter((a) => a.status === filter.status);
    }
    if (filter?.actionType) {
      result = result.filter((a) => a.actionType === filter.actionType);
    }

    result.sort((a, b) => new Date(b.proposedAt).getTime() - new Date(a.proposedAt).getTime());

    if (filter?.limit) {
      result = result.slice(0, filter.limit);
    }

    return result.map((a) => ({ ...a }));
  }

  async count(): Promise<number> {
    return this.actions.size;
  }

  async clear(): Promise<void> {
    this.actions.clear();
  }

  async getAll(): Promise<ResponseAction[]> {
    return Array.from(this.actions.values()).map((a) => ({ ...a }));
  }
}

const globalForActions = globalThis as unknown as { actionStoreInstance?: InMemoryActionStore };
export const actionStore = globalForActions.actionStoreInstance || new InMemoryActionStore();
if (process.env.NODE_ENV !== "production") globalForActions.actionStoreInstance = actionStore;
