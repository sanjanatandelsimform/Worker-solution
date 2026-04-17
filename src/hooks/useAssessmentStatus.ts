import { useState, useEffect, useCallback } from "react";
import { getAssessment, type AssessmentData } from "@/services/api/assessmentApi";

interface UseAssessmentStatusOptions {
  enabled?: boolean;
}

interface UseAssessmentStatusReturn {
  completionCount: number;
  isLoading: boolean;
  error: string | null;
  assessmentData: AssessmentData | null;
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
  const [error, setError] = useState<string | null>(null);

  const fetchAssessmentStatus = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAssessment();

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
    }
  }, [enabled]);

  useEffect(() => {
    fetchAssessmentStatus();
  }, [fetchAssessmentStatus]);

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
  const isFinchCompleted =
    assessmentData?.assessmentType === "finch" && assessmentData?.data?.status === "completed";

  const isFinchAssessmentIncomplete =
    assessmentData?.assessmentType === "finch" && assessmentData?.data?.status !== "completed";

  return {
    completionCount,
    isLoading,
    error,
    assessmentData,
    isFinchCompleted,
    isFinchAssessmentIncomplete,
    sectionCompletion,
    refetch: fetchAssessmentStatus,
  };
};
