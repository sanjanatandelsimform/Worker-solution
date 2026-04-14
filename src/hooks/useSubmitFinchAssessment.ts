import { useState, useCallback } from "react";
import { submitFinchAssessment } from "@/services/api/assessmentApi";
import type { FinchAssessmentPayload } from "@/types/finchAssessmentTypes";

export interface UseSubmitFinchAssessmentReturn {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  submit: (payload: FinchAssessmentPayload) => Promise<void>;
  clearError: () => void;
}

export function useSubmitFinchAssessment(): UseSubmitFinchAssessmentReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (payload: FinchAssessmentPayload): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await submitFinchAssessment(payload);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { isSubmitting, error, success, submit, clearError };
}
