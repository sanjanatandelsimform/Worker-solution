/**
 * Shared module-level cache for /assessment API data.
 * This prevents duplicate API calls when multiple hooks (useAssessment, useAssessmentStatus)
 * are used simultaneously or when components re-mount.
 */

import { getAssessment, type AssessmentData } from "@/services/api/assessmentApi";
import type { ApiResponse } from "@/services/api/assessmentApi";

interface CacheEntry {
  data: AssessmentData | null;
  timestamp: number;
  error: string | null;
}

// Module-level cache
let cachedData: CacheEntry | null = null;
let fetchPromise: Promise<ApiResponse<AssessmentData>> | null = null;

// Cache TTL: 30 seconds (prevents stale data while avoiding duplicate calls)
const CACHE_TTL_MS = 30000;

/**
 * Check if cache is still valid
 */
const isCacheValid = (): boolean => {
  if (!cachedData) return false;
  const age = Date.now() - cachedData.timestamp;
  return age < CACHE_TTL_MS;
};

/**
 * Fetch assessment data with deduplication and caching.
 * Multiple concurrent calls will share the same promise.
 * Subsequent calls within TTL will use cached data.
 *
 * @param forceRefresh - If true, bypass cache and fetch fresh data
 * @returns The assessment API response
 */
export const fetchAssessmentWithCache = async (
  forceRefresh = false
): Promise<ApiResponse<AssessmentData>> => {
  // Return cached data if valid and not forcing refresh
  if (!forceRefresh && isCacheValid() && cachedData) {
    return {
      success: cachedData.error === null,
      data: cachedData.data ?? undefined,
      error: cachedData.error ?? undefined,
    };
  }

  // If a fetch is already in progress, wait for it (deduplication)
  if (fetchPromise) {
    return fetchPromise;
  }

  // Start new fetch
  fetchPromise = getAssessment();

  try {
    const response = await fetchPromise;

    // Update cache
    cachedData = {
      data: response.success && response.data ? response.data : null,
      timestamp: Date.now(),
      error: response.success ? null : (response.error ?? "Unknown error"),
    };

    return response;
  } catch (error) {
    // Update cache with error
    cachedData = {
      data: null,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : "Failed to fetch assessment",
    };

    throw error;
  } finally {
    // Clear the promise so future calls can start fresh
    fetchPromise = null;
  }
};

/**
 * Get cached assessment data without making an API call.
 * Returns null if cache is invalid or empty.
 */
export const getCachedAssessment = (): AssessmentData | null => {
  if (isCacheValid() && cachedData) {
    return cachedData.data;
  }
  return null;
};

/**
 * Invalidate the cache, forcing next fetch to call API.
 */
export const invalidateAssessmentCache = (): void => {
  cachedData = null;
  fetchPromise = null;
};

/**
 * Update the cache with new data (useful after successful section submission).
 * This allows updating the local cache without a full refetch.
 */
export const updateAssessmentCache = (
  updater: (current: AssessmentData | null) => AssessmentData | null
): void => {
  if (cachedData) {
    cachedData = {
      ...cachedData,
      data: updater(cachedData.data),
      timestamp: Date.now(),
    };
  }
};
