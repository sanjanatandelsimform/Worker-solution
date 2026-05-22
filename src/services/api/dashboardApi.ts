/**
 * Dashboard API Service
 *
 * API service for retrieving dashboard data from GET /dashboard endpoint.
 * Follows existing patterns from authApi.ts and profileApi.ts.
 *
 * Based on: specs/001-dashboard-api-integration/research.md
 * Contract: specs/001-dashboard-api-integration/contracts/dashboard-api.yaml
 */

import type { DashboardResponse } from "@/types/dashboardTypes";
import type { DashboardStatusResponse } from "@/types/dashboardStatusTypes";
import apiClient from "@/services/api/authApi";
import { getAuthToken, getErrorMessage } from "@/services/api/apiUtils";

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
      timeout: 600000,
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
 * Fetch dashboard status from GET /api/v1/dashboard/status endpoint
 */
export const getDashboardStatus = async (): Promise<DashboardStatusResponse> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }

    const response = await apiClient.get<DashboardStatusResponse>("/dashboard/status", {
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
    console.error("[getDashboardStatus] API call failed:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Dashboard API service object (for consistency with other API services)
 */
export const dashboardApi = {
  getDashboard,
  getDashboardStatus,
};
