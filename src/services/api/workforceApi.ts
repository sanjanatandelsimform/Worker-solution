/**
 * Workforce API Service
 *
 * API service for retrieving workforce data from GET /api/v1/dashboard/workforce endpoint.
 * Follows the same pattern as dashboardApi.ts.
 *
 * Based on: specs/009-workforce-tab-api/research.md
 * Contract: specs/009-workforce-tab-api/contracts/workforce-get.md
 */

import axios from "axios";
import type { WorkforceResponse } from "@/types/workforceTypes";
import apiClient from "@/services/api/authApi";

const STORAGE_KEY = "userDetail";

/**
 * Get authentication token from localStorage
 * @returns Bearer token or null if not found
 */
const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.auth?.tokens?.accessToken || null;
  } catch {
    return null;
  }
};

/**
 * Extract error message from API error response
 * @param error - Error object from axios
 * @returns User-friendly error message
 */
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as { message?: string } | undefined;
    if (apiError?.message) {
      return apiError.message;
    }
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    if (error.message) {
      return error.message;
    }
  }
  return "An unexpected error occurred. Please try again.";
};

/**
 * Fetch workforce data from GET /api/v1/dashboard/workforce endpoint
 *
 * @returns Promise resolving to WorkforceResponse
 * @throws Error with user-friendly message on failure
 */
export const getWorkforce = async (): Promise<WorkforceResponse> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }

    const response = await apiClient.get<WorkforceResponse>("/api/v1/dashboard/workforce", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 600000,
    });

    return response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Authentication required. Please log in again."
    ) {
      throw error;
    }
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};
