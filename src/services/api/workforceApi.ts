/**
 * Workforce API Service
 *
 * API service for retrieving workforce data from GET /dashboard/workforce endpoint.
 * Follows the same pattern as dashboardApi.ts.
 *
 * Based on: specs/009-workforce-tab-api/research.md
 * Contract: specs/014-fix-workforce-rec-api/contracts/workforce-get.md
 */

import type { WorkforceApiResponse } from "@/types/workforceTypes";
import apiClient from "@/services/api/authApi";
import { getAuthToken, getErrorMessage } from "@/services/api/apiUtils";

/**
 * Fetch workforce data from GET /dashboard/workforce endpoint
 *
 * @returns Promise resolving to WorkforceApiResponse
 * @throws Error with user-friendly message on failure
 */
export const getWorkforce = async (): Promise<WorkforceApiResponse> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }

    const response = await apiClient.get<WorkforceApiResponse>("/dashboard/workforce", {
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
