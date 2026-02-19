import { useState, useEffect, useCallback } from "react";
import {
  markTabCompleted,
  isTabCompleted,
  loadCompletionStatus,
  saveCurrentStep,
  loadCurrentStep,
} from "@/utils/assessmentStorage";
import {
  submitWorkforce,
  submitCompensation,
  submitBenefits,
  submitGoals,
  getAssessment,
  type SectionType,
} from "@/services/api/assessmentApi";
import type { ApiResponse } from "@/services/api/assessmentApi";

interface UseAssessmentOptions {
  section: SectionType;
}

interface UseAssessmentReturn {
  answers: Record<string, unknown>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isCompleted: boolean;
  isLoadingGet: boolean;
  apiError: {
    type: "get" | "post";
    message: string;
  } | null;
  updateAnswer: (key: string, value: unknown) => void;
  updateAnswers: (data: Record<string, unknown>) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearError: (key: string) => void;
  submitSection: (answersToSubmit?: Record<string, unknown>) => Promise<ApiResponse>;
  resetSection: () => void;
  loadProgress: () => Promise<void>;
  retryGetAssessment: () => Promise<void>;
}

/**
 * Custom hook for managing assessment form state and submission
 */
export const useAssessment = ({ section }: UseAssessmentOptions): UseAssessmentReturn => {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoadingGet, setIsLoadingGet] = useState(false);
  const [apiError, setApiError] = useState<{
    type: "get" | "post";
    message: string;
  } | null>(null);

  // Load progress from API on mount
  const loadProgress = useCallback(async () => {
    setIsLoadingGet(true);
    setApiError(null);
    try {
      const response = await getAssessment();
      if (response.success && response.data?.sections?.[section]) {
        setAnswers(response.data.sections[section] as Record<string, unknown>);
      } else {
        // No data for this section yet - leave empty
        setAnswers({});
      }
    } catch (error) {
      setApiError({
        type: "get",
        message: error instanceof Error ? error.message : "Failed to load assessment data",
      });
    } finally {
      setIsLoadingGet(false);
    }
  }, [section]);

  // Retry function for GET failures
  const retryGetAssessment = useCallback(async () => {
    await loadProgress();
  }, [loadProgress]);

  // Load progress on mount AND when section changes
  useEffect(() => {
    loadProgress();
    setIsCompleted(isTabCompleted(section));
  }, [section, loadProgress]); // Added section as dependency

  // Update single answer (no auto-save to localStorage)
  const updateAnswer = useCallback((key: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple answers (no auto-save to localStorage)
  const updateAnswers = useCallback((data: Record<string, unknown>) => {
    setAnswers(prev => ({ ...prev, ...data }));
  }, []);

  // Clear single error
  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  // Submit section to API
  const submitSection = useCallback(
    async (answersToSubmit?: Record<string, unknown>): Promise<ApiResponse> => {
      setIsSubmitting(true);
      const dataToSubmit = answersToSubmit || answers;
      try {
        let response: ApiResponse;

        // Call appropriate API endpoint based on section
        switch (section) {
          case "workforce":
            response = await submitWorkforce(dataToSubmit);
            break;
          case "compensation":
            // Ensure we pass the flat cleaned answers object, not { responses: cleanedAnswers }
            response = await submitCompensation(dataToSubmit); // <--- use this
            break;
          case "benefits":
            response = await submitBenefits(dataToSubmit);
            break;
          case "goals":
            response = await submitGoals(dataToSubmit);
            break;
          default:
            console.error("[useAssessment] Invalid section:", section);
            response = {
              success: false,
              error: `Invalid section: ${section}`,
            };
        }

        // Mark as completed on success
        if (response.success) {
          markTabCompleted(section);
          setIsCompleted(true);
        } else {
          // NEW: Set field errors from API response
          if (response.fieldErrors) {
            setErrors(response.fieldErrors);
          }
          setApiError({
            type: "post",
            message: response.message || response.error || "Submission failed",
          });
        }

        return response;
      } catch (error) {
        console.error("[useAssessment] Submission error:", error);
        setApiError({
          type: "post",
          message: error instanceof Error ? error.message : "Submission failed",
        });
        return {
          success: false,
          error: error instanceof Error ? error.message : "Submission failed",
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    [section, answers]
  );

  // Remove auto-save effect - data persists only via POST

  // Reset section data
  const resetSection = useCallback(() => {
    setAnswers({});
    setErrors({});
    setIsCompleted(false);
  }, []);

  return {
    answers,
    errors,
    isSubmitting,
    isCompleted,
    isLoadingGet,
    apiError,
    updateAnswer,
    updateAnswers,
    setErrors,
    clearError,
    submitSection,
    resetSection,
    loadProgress,
    retryGetAssessment,
  };
};

/**
 * Hook for managing overall assessment navigation
 */
export const useAssessmentNavigation = () => {
  const savedStep = loadCurrentStep();
  const [currentStep, setCurrentStep] = useState(savedStep || "workforce");
  const [completionStatus] = useState(() => loadCompletionStatus());

  const goToStep = useCallback((step: string) => {
    setCurrentStep(step);
    saveCurrentStep(step);
  }, []);

  const goToNextStep = useCallback(() => {
    const steps = ["workforce", "compensation", "benefits", "goals"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      saveCurrentStep(nextStep);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    const steps = ["workforce", "compensation", "benefits", "goals"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      setCurrentStep(prevStep);
      saveCurrentStep(prevStep);
    }
  }, [currentStep]);

  const isFirstStep = currentStep === "workforce";
  const isLastStep = currentStep === "goals";

  return {
    currentStep,
    completionStatus,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep,
  };
};
