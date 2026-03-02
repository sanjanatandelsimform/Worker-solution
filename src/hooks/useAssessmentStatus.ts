import { useState, useEffect, useCallback } from "react";
import { getAssessment, type AssessmentData } from "@/services/api/assessmentApi";

interface UseAssessmentStatusReturn {
  completionCount: number;
  isLoading: boolean;
  error: string | null;
  assessmentData: AssessmentData | null;
  sectionCompletion: {
    workforce: boolean;
    compensation: boolean;
    benefits: boolean;
    goals: boolean;
  };
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

  const sections = assessmentData?.sections;

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

  return {
    completionCount,
    isLoading,
    error,
    assessmentData,
    sectionCompletion,
    refetch: fetchAssessmentStatus,
  };
};
