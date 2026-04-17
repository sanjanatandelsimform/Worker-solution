/**
 * Recommendations API Service
 *
 * API service for retrieving recommendations data from GET /api/v1/dashboard/recommendations endpoint.
 * Follows the same pattern as workforceApi.ts.
 *
 * Based on: specs/011-recommendations-api/contracts/recommendations-get.md
 */

import type { RecommendationsApiResponse } from "@/types/recommendationsTypes";
import apiClient from "@/services/api/authApi";
import { getAuthToken, getErrorMessage } from "@/services/api/apiUtils";

/**
 * Fetch recommendations data from GET /api/v1/dashboard/recommendations endpoint
 *
 * @returns Promise resolving to RecommendationsApiResponse
 * @throws Error with user-friendly message on failure
 */
export const getRecommendations = async (): Promise<RecommendationsApiResponse> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }

    const response = await apiClient.get<RecommendationsApiResponse>("/dashboard/recommendation", {
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
