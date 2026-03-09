/**
 * Dashboard API Service
 *
 * API service for retrieving dashboard data from GET /dashboard endpoint.
 * Follows existing patterns from authApi.ts and profileApi.ts.
 *
 * Based on: specs/001-dashboard-api-integration/research.md
 * Contract: specs/001-dashboard-api-integration/contracts/dashboard-api.yaml
 */

import axios from "axios";
import type { DashboardResponse } from "@/types/dashboardTypes";
import apiClient from "@/services/api/authApi";
// Storage key for user authentication details

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
 * Fetch dashboard data from GET /dashboard endpoint
 *
 * @returns Promise resolving to DashboardResponse
 * @throws Error with user-friendly message on failure
 *
 * @example
 * ```typescript
 * try {
 *   const data = await getDashboard();
 *   console.log(data.companyAtGlance);
 * } catch (error) {
 *   console.error('Dashboard fetch failed:', error.message);
 * }
 * ```
 */
export const getDashboard = async (): Promise<DashboardResponse> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }

    const response = await apiClient.get<DashboardResponse>("/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Return only the data property from the Axios response
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

/**
 * Dashboard API service object (for consistency with other API services)
 */
export const dashboardApi = {
  getDashboard,
};
