/**
 * Error handling utility for server actions
 * Provides consistent error logging and user-friendly messages
 */

import * as Sentry from "@sentry/nextjs";

interface ErrorContext {
  action: string;
  userId?: string;
  data?: Record<string, any>;
}

interface ErrorDetails {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Logs error with context for debugging and sends to Sentry
 */
export function logError(error: unknown, context: ErrorContext): void {
  const timestamp = new Date().toISOString();
  const errorDetails = extractErrorDetails(error);

  // Structured error logging
  console.error("=== Server Action Error ===", {
    timestamp,
    action: context.action,
    userId: context.userId,
    error: {
      message: errorDetails.message,
      code: errorDetails.code,
      details: errorDetails.details,
    },
    context: context.data,
  });

  // Send to Sentry with full context
  Sentry.captureException(error, {
    tags: {
      action: context.action,
      errorCode: errorDetails.code,
    },
    user: context.userId ? { id: context.userId } : undefined,
    extra: {
      context: context.data,
      errorDetails,
    },
  });
}

/**
 * Extracts error details from various error types
 */
function extractErrorDetails(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as any).code,
      details: (error as any).details || (error as any).hint,
    };
  }

  if (typeof error === "object" && error !== null) {
    return {
      message: (error as any).message || "Unknown error",
      code: (error as any).code,
      details: (error as any).details,
    };
  }

  return {
    message: String(error),
  };
}

/**
 * Gets user-friendly error message
 * Returns detailed messages in development, generic in production
 */
export function getUserErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    const details = extractErrorDetails(error);
    return `${fallbackMessage}\n[Dev] ${details.message}${
      details.code ? ` (${details.code})` : ""
    }`;
  }

  return fallbackMessage;
}

/**
 * Type guard for PostgreSQL errors
 */
export function isPostgresError(error: unknown): error is {
  code: string;
  message: string;
  details?: string;
  hint?: string;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "string"
  );
}
