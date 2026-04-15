/**
 * Workforce API Service
 *
 * API service for retrieving workforce data from GET /api/v1/dashboard/workforce endpoint.
 * Follows the same pattern as dashboardApi.ts.
 *
 * Based on: specs/009-workforce-tab-api/research.md
 * Contract: specs/009-workforce-tab-api/contracts/workforce-get.md
 */

import type { WorkforceResponse } from "@/types/workforceTypes";
import apiClient from "@/services/api/authApi";
import { getAuthToken, getErrorMessage } from "@/services/api/authApi";

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
