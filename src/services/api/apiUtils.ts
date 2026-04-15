import axios from "axios";

const STORAGE_KEY = "userDetail";

/**
 * Get authentication token from localStorage.
 * Single source of truth used by all API services.
 * @returns Bearer token or null if not found
 */
export const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.auth?.tokens?.accessToken ?? null;
  } catch {
    return null;
  }
};

/**
 * Extract a user-friendly error message from an API error response.
 * @returns Error message string
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as { message?: string } | undefined;
    if (apiError?.message) return apiError.message;
    if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
    if (error.message) return error.message;
  }
  return "An unexpected error occurred. Please try again.";
};
