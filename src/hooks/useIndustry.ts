/**
 * useIndustry Hook
 *
 * Fetches industry data based on assessment type:
 * - Manual assessment: fetch immediately (no finch connection needed)
 * - Finch assessment: fetch only when finch isConnected === true
 *
 * Guards against duplicate fetches using isLoaded + isLoading flags.
 */

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchIndustry } from "@/store/slices/industrySlice";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import {
  selectIndustryLoading,
  selectIndustryError,
  selectIndustryIsLoaded,
  selectIndustryFullData,
} from "@/store/selectors/industrySelectors";
import type { IndustryData } from "@/types/industryTypes";

export interface UseIndustryReturn {
  data: IndustryData | null;
  isLoading: boolean;
  error: string | null;
  isLoaded: boolean;
}

export interface UseIndustryOptions {
  enabled?: boolean;
}

export function useIndustry({ enabled = true }: UseIndustryOptions = {}): UseIndustryReturn {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectIndustryFullData);
  const isLoading = useAppSelector(selectIndustryLoading);
  const error = useAppSelector(selectIndustryError);
  const isLoaded = useAppSelector(selectIndustryIsLoaded);
  const { isConnected } = useAssessmentStatus();

  useEffect(() => {
    // Guard: skip if fetch is not yet enabled (tab not ready)
    if (!enabled) return;
    // Guard: skip if already loaded or currently loading
    if (isLoaded || isLoading) return;

    if (!isConnected) {
      // Manual assessment: fetch immediately, no finch connection required
      dispatch(fetchIndustry());
      return;
    }

    if (isConnected) {
      // Finch assessment: only fetch once finch is connected
      dispatch(fetchIndustry());
    }
  }, [enabled, isConnected, isLoaded, isLoading, dispatch]);

  return {
    data,
    isLoading,
    error,
    isLoaded,
  };
}
