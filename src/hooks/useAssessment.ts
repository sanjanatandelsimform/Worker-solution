import { useState, useEffect, useCallback } from "react";
import {
  saveAssessmentProgress,
  loadSectionProgress,
  autoSaveProgress,
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
} from "@/services/api/assessmentApi";
import type { ApiResponse } from "@/services/api/assessmentApi";

type SectionType = "workforce" | "compensation" | "benefits" | "goals";

interface UseAssessmentOptions {
  section: SectionType;
  enableAutoSave?: boolean;
  autoSaveDelay?: number;
}

interface UseAssessmentReturn {
  answers: Record<string, unknown>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isSaving: boolean;
  isCompleted: boolean;
  updateAnswer: (key: string, value: unknown) => void;
  updateAnswers: (data: Record<string, unknown>) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearError: (key: string) => void;
  submitSection: (answersToSubmit?: Record<string, unknown>) => Promise<ApiResponse>;
  resetSection: () => void;
  loadProgress: () => void;
}

/**
 * Custom hook for managing assessment form state, auto-save, and submission
 */
export const useAssessment = ({
  section,
  enableAutoSave = true,
  autoSaveDelay = 500,
}: UseAssessmentOptions): UseAssessmentReturn => {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
    setIsCompleted(isTabCompleted(section));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // Load saved progress from localStorage
  const loadProgress = useCallback(() => {
    const savedData = loadSectionProgress(section);
    if (Object.keys(savedData).length > 0) {
      setAnswers(savedData);
    }
  }, [section]);

  // Update single answer
  const updateAnswer = useCallback(
    (key: string, value: unknown) => {
      setAnswers(prev => {
        const updated = { ...prev, [key]: value };
        // Auto-save if enabled
        if (enableAutoSave) {
          setIsSaving(true);
          autoSaveProgress(section, updated, autoSaveDelay);
          // Reset saving state after delay
          setTimeout(() => setIsSaving(false), autoSaveDelay + 100);
        }

        return updated;
      });
    },
    [section, enableAutoSave, autoSaveDelay]
  );

  // Update multiple answers
  const updateAnswers = useCallback(
    (data: Record<string, unknown>) => {
      setAnswers(prev => {
        const updated = { ...prev, ...data };

        if (enableAutoSave) {
          setIsSaving(true);
          autoSaveProgress(section, updated, autoSaveDelay);
          setTimeout(() => setIsSaving(false), autoSaveDelay + 100);
        }

        return updated;
      });
    },
    [section, enableAutoSave, autoSaveDelay]
  );

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
          // Save final state
          saveAssessmentProgress(section, dataToSubmit);
        }

        return response;
      } catch (error) {
        console.error("[useAssessment] Submission error:", error);
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

  // Save progress manually
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveAssessmentProgress(section, answers);
    }
  }, [section, answers]);

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
    isSaving,
    isCompleted,
    updateAnswer,
    updateAnswers,
    setErrors,
    clearError,
    submitSection,
    resetSection,
    loadProgress,
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
