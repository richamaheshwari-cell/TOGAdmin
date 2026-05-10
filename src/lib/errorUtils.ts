/**
 * Centralised error handling for API and forms.
 * Use for future reference when handling submit/update errors.
 */

/** Message shown when request fails due to network (no internet, connection refused, etc.). */
export const NETWORK_ERROR_MESSAGE =
  "Network error. Please check your connection and try again.";

/**
 * Returns true if the error is likely a network/connectivity failure
 * (e.g. no internet, server unreachable, CORS, request aborted).
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === "Failed to fetch") return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("load failed")) return true;
  }
  return false;
}

/**
 * Returns a user-friendly message for display in forms/toasts.
 * Use this when catching errors from api.* or mutateAsync and showing setError("root", ...) or toast.
 * - Network errors → NETWORK_ERROR_MESSAGE
 * - Otherwise → error.message or fallback
 */
export function getDisplayErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (isNetworkError(error)) return NETWORK_ERROR_MESSAGE;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
