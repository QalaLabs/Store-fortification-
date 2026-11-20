import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiResponseMeta {
  timestamp: string;
  version: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  meta: ApiResponseMeta;
}

const API_VERSION = "1.0.0";

function createMeta(): ApiResponseMeta {
  return {
    timestamp: new Date().toISOString(),
    version: API_VERSION,
  };
}

/**
 * Standardized success response helper
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: createMeta(),
    },
    { status }
  );
}

/**
 * Standardized error response helper — never leaks internal stack traces
 */
export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      meta: createMeta(),
    },
    { status }
  );
}

/**
 * Helper to handle Zod validation errors cleanly
 */
export function validationErrorResponse(error: ZodError): NextResponse<ApiErrorResponse> {
  const issues = error.errors.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));
  return errorResponse("VALIDATION_ERROR", "Request payload failed schema validation", 422, issues);
}

/**
 * Safe error catcher wrapper for route handlers
 */
export function handleApiError(error: unknown, fallbackMessage = "An unexpected error occurred"): NextResponse<ApiErrorResponse> {
  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  // Always log internally without exposing secrets or stacks to client
  console.error("[API_ERROR]", error);
  return errorResponse("INTERNAL_SERVER_ERROR", message, 500);
}
