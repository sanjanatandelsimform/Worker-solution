import { useState, useEffect, useCallback } from "react";
import { getAssessment, type AssessmentData } from "@/services/api/assessmentApi";

interface UseAssessmentStatusReturn {
  completionCount: number;
  isLoading: boolean;
  error: string | null;
  assessmentData: AssessmentData | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and track assessment completion status from API
 * Replaces localStorage-based completion tracking
 */
export const useAssessmentStatus = (): UseAssessmentStatusReturn => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessmentStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAssessment();

      if (response.success && response.data) {
        setAssessmentData(response.data);
      } else {
        // If assessment doesn't exist yet, treat as 0 completions
        setAssessmentData(null);
        setError(null);
      }
    } catch (err) {
      console.error("[useAssessmentStatus] Failed to fetch assessment:", err);
      setError(err instanceof Error ? err.message : "Failed to load assessment status");
      setAssessmentData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessmentStatus();
  }, [fetchAssessmentStatus]);

  // Calculate completion count from API response sections
  //   const completionCount = assessmentData?.sections
  //     ? Object.keys(assessmentData.sections).filter(
  //         (key) => assessmentData.sections[key as keyof typeof assessmentData.sections] !== undefined
  //       ).length
  //     : 0;
  const completionCount = assessmentData?.sections
    ? Object.values(assessmentData.sections).filter(
        section =>
          section !== null && typeof section === "object" && Object.keys(section).length > 0
      ).length
    : 0;

  return {
    completionCount,
    isLoading,
    error,
    assessmentData,
    refetch: fetchAssessmentStatus,
  };
};
