import { useState, useEffect, useCallback, useRef } from "react";
import { type AssessmentData } from "@/services/api/assessmentApi";
import { fetchAssessmentWithCache, getCachedAssessment } from "./assessmentCache";

interface UseAssessmentStatusOptions {
  enabled?: boolean;
}

interface UseAssessmentStatusReturn {
  completionCount: number;
  isLoading: boolean;
  error: string | null;
  assessmentData: AssessmentData | null;
  isConnected: boolean;
  isFetched: boolean;
  isFinchCompleted: boolean;
  isFinchAssessmentIncomplete: boolean;
  sectionCompletion: {
    workforce: boolean;
    compensation: boolean;
    benefits: boolean;
    goals: boolean;
  };
  refetch: () => Promise<void>;
}

export const useAssessmentStatus = ({
  enabled = true,
}: UseAssessmentStatusOptions = {}): UseAssessmentStatusReturn => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to prevent duplicate API calls
  const fetchInProgressRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetchAssessmentStatus = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Prevent duplicate calls unless forced (e.g., explicit refetch)
    if (!forceRefresh && fetchInProgressRef.current) {
      return;
    }

    // Check shared cache first (without forcing refresh)
    if (!forceRefresh) {
      const cached = getCachedAssessment();
      if (cached) {
        setAssessmentData(cached);
        setIsFetched(true);
        hasFetchedRef.current = true;
        return;
      }
    }

    if (!forceRefresh && hasFetchedRef.current) {
      return;
    }

    fetchInProgressRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAssessmentWithCache(forceRefresh);
      hasFetchedRef.current = true;

      if (response.success && response.data) {
        setAssessmentData(response.data);
      } else {
        setAssessmentData(null);
        setError(null);
      }
    } catch (err) {
      console.error("[useAssessmentStatus] Failed to fetch assessment:", err);
      setError(err instanceof Error ? err.message : "Failed to load assessment status");
      setAssessmentData(null);
    } finally {
      setIsLoading(false);
      setIsFetched(true);
      fetchInProgressRef.current = false;
    }
  }, [enabled]);

  // Refetch function that forces a new API call
  const refetch = useCallback(async () => {
    await fetchAssessmentStatus(true);
  }, [fetchAssessmentStatus]);

  useEffect(() => {
    // Reset hasFetchedRef when enabled changes from false to true
    if (enabled && !hasFetchedRef.current) {
      fetchAssessmentStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const sections = assessmentData?.data?.sections;

  const sectionCompletion = {
    workforce:
      !!sections?.workforce &&
      typeof sections.workforce === "object" &&
      Object.keys(sections.workforce).length > 0,
    compensation:
      !!sections?.compensation &&
      typeof sections.compensation === "object" &&
      Object.keys(sections.compensation).length > 0,
    benefits:
      !!sections?.benefits &&
      typeof sections.benefits === "object" &&
      Object.keys(sections.benefits).length > 0,
    goals:
      !!sections?.goals &&
      typeof sections.goals === "object" &&
      Object.keys(sections.goals).length > 0,
  };

  const completionCount = Object.values(sectionCompletion).filter(Boolean).length;
  const isConnected = assessmentData?.assessmentType === "finch";
  const isFinchCompleted = isConnected && assessmentData?.data?.status === "completed";

  const isFinchAssessmentIncomplete = isConnected && assessmentData?.data?.status !== "completed";

  return {
    completionCount,
    isLoading,
    isFetched,
    error,
    assessmentData,
    isConnected,
    isFinchCompleted,
    isFinchAssessmentIncomplete,
    sectionCompletion,
    refetch,
  };
};
