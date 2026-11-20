import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { ProviderStatus } from "@/lib/types";

/**
 * GET /api/provider-status
 * Reports the current operational status of the AI investigation provider
 * and AWS platform integrations.
 * Strictly honest labels: MOCK, CONFIGURED, or BEDROCK_VERIFIED.
 * Never reports CONNECTED without a verified test call.
 */
export async function GET(_request: NextRequest) {
  try {
    const aiProviderEnv = process.env.AI_PROVIDER || "mock";
    const awsRegion = process.env.AWS_REGION;
    const hasAwsKeys = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    const bedrockModelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20241022-v2:0";

    // Determine honest status: default to MOCK offline mode
    let aiProviderStatus: ProviderStatus["aiProvider"] = "MOCK";
    let statusMessage = "Offline Mock AI provider active. Local development requires zero AWS credentials.";

    if (aiProviderEnv === "bedrock" && hasAwsKeys) {
      // In Phase 01, we have not executed a verified test call yet, so it is CONFIGURED at best
      aiProviderStatus = "CONFIGURED";
      statusMessage = "AWS Bedrock credentials configured; live inference pending test verification in Phase 02.";
    }

    const status: ProviderStatus = {
      aiProvider: aiProviderStatus,
      bedrockModelId: aiProviderStatus !== "MOCK" ? bedrockModelId : null,
      awsRegion: awsRegion || null,
      offlineMode: aiProviderStatus === "MOCK",
      lastVerifiedAt: null,
      statusMessage,
      guardrailsActive: false,
      adapters: {
        CloudTrail: "NOT_CONFIGURED",
        GuardDuty: "NOT_CONFIGURED",
        Config: "NOT_CONFIGURED",
        EventBridge: "NOT_CONFIGURED",
        StepFunctions: "NOT_CONFIGURED",
        SNS: "NOT_CONFIGURED",
      },
    };

    return successResponse(status);
  } catch (error) {
    return handleApiError(error, "Failed to retrieve provider status");
  }
}
