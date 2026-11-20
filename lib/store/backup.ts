import fs from "fs/promises";
import path from "path";
import { eventStore } from "./event-store";
import { incidentStore } from "./incident-store";
import { actionStore } from "./action-store";
import { auditStore } from "./audit-store";

export interface SystemBackupData {
  version: string;
  exportedAt: string;
  events: unknown[];
  incidents: unknown[];
  actions: unknown[];
  auditLogs: unknown[];
}

const DEFAULT_BACKUP_PATH = path.resolve(process.cwd(), "data", "backup.json");

export class StorageBackupManager {
  /**
   * Export in-memory state of all stores to a JSON backup file
   */
  static async exportBackup(filePath = DEFAULT_BACKUP_PATH): Promise<SystemBackupData> {
    const backup: SystemBackupData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      events: await eventStore.getAll(),
      incidents: await incidentStore.getAll(),
      actions: await actionStore.getAll(),
      auditLogs: await auditStore.getAll(),
    };

    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(backup, null, 2), "utf-8");
    return backup;
  }

  /**
   * Restore all stores from a JSON backup file
   */
  static async importBackup(filePath = DEFAULT_BACKUP_PATH): Promise<{
    eventsRestored: number;
    incidentsRestored: number;
    actionsRestored: number;
    auditRestored: number;
  }> {
    try {
      const dataStr = await fs.readFile(filePath, "utf-8");
      const data: SystemBackupData = JSON.parse(dataStr);

      await this.clearAll();

      if (Array.isArray(data.events)) {
        for (const evt of data.events) {
          await eventStore.add(evt as any);
        }
      }

      if (Array.isArray(data.incidents)) {
        for (const inc of data.incidents) {
          await incidentStore.create(inc as any);
        }
      }

      if (Array.isArray(data.actions)) {
        for (const act of data.actions) {
          await actionStore.create(act as any);
        }
      }

      if (Array.isArray(data.auditLogs)) {
        for (const log of data.auditLogs) {
          await auditStore.log(log as any);
        }
      }

      return {
        eventsRestored: (data.events || []).length,
        incidentsRestored: (data.incidents || []).length,
        actionsRestored: (data.actions || []).length,
        auditRestored: (data.auditLogs || []).length,
      };
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return { eventsRestored: 0, incidentsRestored: 0, actionsRestored: 0, auditRestored: 0 };
      }
      throw err;
    }
  }

  /**
   * Clears all stores in memory
   */
  static async clearAll(): Promise<void> {
    await Promise.all([
      eventStore.clear(),
      incidentStore.clear(),
      actionStore.clear(),
      auditStore.clear(),
    ]);
  }
}
