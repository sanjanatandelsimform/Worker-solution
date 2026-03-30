import { useState, useEffect, useCallback } from "react";
import {
  submitWorkforce,
  submitCompensation,
  submitBenefits,
  submitGoals,
  getAssessment,
  type SectionType,
} from "@/services/api/assessmentApi";
import type { ApiResponse } from "@/services/api/assessmentApi";
import questionData from "@/data/assessment/questionData.json";
import type { Question } from "@/types/questionTypes";

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

// Local ID generator for normalizing STRUCTURED_ARRAY items restored from the API
let structuredArrayIdCounter = 0;
const generateStructuredArrayId = () => ++structuredArrayIdCounter;

const sectionNameMap: Record<SectionType, string> = {
  workforce: "Workforce",
  compensation: "Compensation",
  benefits: "Benefits",
  goals: "Goals",
};

/**
 * Ensure restored STRUCTURED_ARRAY answers have stable `id` fields
 * so that DynamicQuestionRenderer can use them as React keys and
 * for precise item deletion.
 */
const normalizeSectionAnswers = (
  section: SectionType,
  raw: Record<string, unknown>
): Record<string, unknown> => {
  const normalized: Record<string, unknown> = { ...raw };

  if (section === "workforce") {
    if (normalized.commuteMethod !== undefined) {
      normalized.employeeCommuteMethod = normalized.commuteMethod;
      delete normalized.commuteMethod;
    }
    if (normalized.commuteTime !== undefined) {
      normalized.averageCommuteTime = normalized.commuteTime;
      delete normalized.commuteTime;
    }
  }
  
  const sectionName = sectionNameMap[section];
  const configSection = questionData.sections.find(
    s => s.name.toLowerCase() === sectionName.toLowerCase()
  );

  if (!configSection) {
    return normalized;
  }

  const questions = configSection.questions as Question[];

  const normalizeArrayField = (key: string) => {
    const value = normalized[key];
    if (!Array.isArray(value)) return;

    const items = value as Array<Record<string, unknown>>;
    let changed = false;

    const withIds = items.map(item => {
      if (typeof (item as { id?: unknown }).id !== "number") {
        changed = true;
        return {
          ...item,
          id: generateStructuredArrayId(),
        };
      }
      return item;
    });

    if (changed) {
      normalized[key] = withIds;
    }
  };

  questions.forEach(question => {
    if (question.questionType === "STRUCTURED_ARRAY") {
      normalizeArrayField(question.key);
    }

    const conditional = question.conditionalQuestion?.question;
    if (conditional && conditional.questionType === "STRUCTURED_ARRAY") {
      normalizeArrayField(conditional.key);
    }
  });

  return normalized;
};

/**
 * Custom hook for managing assessment form state and submission
 * Uses API (/assessment) as single source of truth - NO localStorage
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
        const sectionAnswers = response.data.sections[section] as Record<string, unknown>;
        const normalizedAnswers = normalizeSectionAnswers(section, sectionAnswers);
        setAnswers(normalizedAnswers);
        // Mark as completed if section exists in API response
        setIsCompleted(true);
      } else {
        // No data for this section yet - leave empty
        setAnswers({});
        setIsCompleted(false);
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
  }, [section, loadProgress]);

  // Update single answer (no localStorage auto-save)
  const updateAnswer = useCallback((key: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple answers (no localStorage auto-save)
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
            response = await submitCompensation(dataToSubmit);
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

        // Mark as completed on success (API is authoritative)
        if (response.success) {
          setIsCompleted(true);
        } else {
          // Set field errors from API response
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
 * Uses API completion status instead of localStorage
 */
export const useAssessmentNavigation = () => {
  const [currentStep, setCurrentStep] = useState("workforce");

  const goToStep = useCallback((step: string) => {
    setCurrentStep(step);
  }, []);

  const goToNextStep = useCallback(() => {
    const steps = ["workforce", "compensation", "benefits", "goals"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    const steps = ["workforce", "compensation", "benefits", "goals"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      setCurrentStep(prevStep);
    }
  }, [currentStep]);

  const isFirstStep = currentStep === "workforce";
  const isLastStep = currentStep === "goals";

  return {
    currentStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep,
  };
};
