/**
 * Industry API Service
 *
 * API service for retrieving industry data from GET /industry endpoint.
 * Follows existing patterns from dashboardApi.ts.
 *
 * Based on: specs/009-industry-status-api/research.md
 * Contract: specs/009-industry-status-api/contracts/industry-api.yaml
 */

import axios from "axios";
import type { IndustryData, IndustryApiResponse } from "@/types/industryTypes";
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
 * Fetch industry data from GET /industry endpoint
 *
 * @returns Promise resolving to IndustryData
 * @throws Error with user-friendly message on failure
 */
export const getIndustry = async (): Promise<IndustryData> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication required");
    }
    const response = await apiClient.get<IndustryApiResponse>("/dashboard/industry", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 600000,
    });

    if (!response.status) {
      throw new Error("Failed to fetch industry data");
    }
    
    return response.data.industry;
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      throw error;
    }
    if (error instanceof Error && error.message === "Failed to fetch industry data") {
      throw error;
    }
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Industry API service object (for consistency with other API services)
 */
export const industryApi = {
  getIndustry,
};
