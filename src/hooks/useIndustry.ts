/**
 * useIndustry Hook
 *
 * Conditionally fetches industry data based on finch status connection.industry field.
 * Dispatches fetchIndustry() only when:
 *   1. connection.industry === "fetch"
 *   2. Data has not already been loaded (isLoaded === false)
 *   3. Not currently loading
 *
 * Returns industry data, loading state, error, and isLoaded flag.
 *
 * Based on: specs/009-industry-status-api/spec.md (US1, US2, US3)
 */

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchIndustry } from "@/store/slices/industrySlice";
import { selectFinchIndustryStatus } from "@/store/selectors/finchStatusSelectors";
import {
  selectIndustryData,
  selectIndustryLoading,
  selectIndustryError,
  selectIndustryIsLoaded,
  selectIndustryFullData
} from "@/store/selectors/industrySelectors";
import type { IndustryData } from "@/types/industryTypes";

export interface UseIndustryReturn {
  data: IndustryData | null;
  isLoading: boolean;
  error: string | null;
  isLoaded: boolean;
}

export function useIndustry(): UseIndustryReturn {
  const dispatch = useAppDispatch();
  const industryStatus = useAppSelector(selectFinchIndustryStatus);
  const data = useAppSelector(selectIndustryFullData);
  const isLoading = useAppSelector(selectIndustryLoading);
  // const isLoading = true;
  const error = useAppSelector(selectIndustryError);
  const isLoaded = useAppSelector(selectIndustryIsLoaded);
  // const isLoaded = true;

  useEffect(() => {
    if (industryStatus === "fetch" && !isLoaded && !isLoading) {
      console.log("test----", isLoaded, isLoading)
      dispatch(fetchIndustry());
    }
  }, [dispatch, industryStatus, isLoaded, isLoading]);

  return {
    data,
    isLoading,
    error,
    isLoaded,
  };
}
