import { NextRequest } from "next/server";
import { StorageBackupManager, auditStore } from "@/lib/store";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import crypto from "crypto";

/**
 * POST /api/reset
 * Clears all in-memory event, incident, and action data for a fresh demo run.
 * Records a single clean reset audit marker.
 */
export async function POST(_request: NextRequest) {
  try {
    await StorageBackupManager.clearAll();

    const resetAudit = await auditStore.log({
      id: `aud_${crypto.randomUUID().slice(0, 12)}`,
      timestamp: new Date().toISOString(),
      action: "SYSTEM_RESET",
      actor: "ADMIN",
      entityType: "SYSTEM_SETTING",
      entityId: "SYSTEM",
      details: "In-memory stores cleared. Clean demo environment initialized.",
      metadata: { clearedAt: new Date().toISOString() },
    });

    return successResponse({
      reset: true,
      timestamp: new Date().toISOString(),
      auditEntryId: resetAudit.id,
      message: "Environment successfully reset for clean demonstration.",
    });
  } catch (error) {
    return handleApiError(error, "Failed to reset environment");
  }
}
