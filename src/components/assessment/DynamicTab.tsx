import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import { DynamicQuestionRenderer } from "./DynamicQuestionRenderer";
import type { Question } from "@/types/questionTypes";
import { useAssessment } from "@/hooks/useAssessment";

interface DynamicTabProps {
  section: "workforce" | "compensation" | "benefits" | "goals";
  questions: Question[];
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
  onSuccess?: () => void;
}

export const DynamicTab = forwardRef<
  {
    submit: () => Promise<{ success: boolean; errors?: Record<string, string> }>;
    validate: () => boolean;
    getAnswers: () => Record<string, unknown>;
    getErrors: () => Record<string, string>;
    isCompleted: boolean;
    isSaving: boolean;
  },
  DynamicTabProps
>(({ section, questions, onValidationChange, onNext, onSuccess }, ref) => {
  const { answers, updateAnswer, errors: hookErrors, submitSection } = useAssessment({ section });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Sync hook errors to local state
  useEffect(() => {
    if (Object.keys(hookErrors).length > 0) {
      setErrors(hookErrors);
    }
  }, [hookErrors]);

  const handleAnswerChange = useCallback(
    (key: string, value: unknown) => {
      updateAnswer(key, value);
      if (errors[key]) {
        const newErrors = { ...errors };
        delete newErrors[key];
        setErrors(newErrors);
      }
    },
    [updateAnswer, errors]
  );

  const validateAnswers = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    questions.forEach(question => {
      const value = answers[question.key];
      const rules = question.validationRules;

      if (rules.required && (value === null || value === undefined || value === "")) {
        newErrors[question.key] = rules.errorMessage || `${question.questionText} is required`;
        isValid = false;
      }

      if (rules.type === "NUMERIC" && value !== null && value !== undefined && value !== "") {
        const numValue = typeof value === "number" ? value : Number(value);
        if (rules.min !== undefined && numValue < rules.min) {
          newErrors[question.key] = `Value must be at least ${rules.min}`;
          isValid = false;
        }
        if (rules.max !== undefined && numValue > rules.max) {
          newErrors[question.key] = `Value must not exceed ${rules.max}`;
          isValid = false;
        }
      }

      if (rules.type === "STRUCTURED_ARRAY" && Array.isArray(value)) {
        if (rules.minItems && value.length < rules.minItems) {
          newErrors[question.key] = `At least ${rules.minItems} item(s) required`;
          isValid = false;
        }
        if (rules.maxItems && value.length > rules.maxItems) {
          newErrors[question.key] = `Maximum ${rules.maxItems} items allowed`;
          isValid = false;
        }
      }

      if (
        question.conditionalQuestion &&
        value === question.conditionalQuestion.showWhen &&
        question.conditionalQuestion.question.validationRules.required
      ) {
        const conditionalValue = answers[question.conditionalQuestion.question.key];
        if (
          conditionalValue === null ||
          conditionalValue === undefined ||
          conditionalValue === ""
        ) {
          newErrors[question.conditionalQuestion.question.key] =
            question.conditionalQuestion.question.validationRules.errorMessage ||
            `${question.conditionalQuestion.question.questionText} is required`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    if (onValidationChange) {
      onValidationChange(isValid);
    }

    return isValid;
  }, [answers, questions, onValidationChange]);

  const cleanAnswers = useCallback(() => {
    const cleaned: Record<string, unknown> = {};

    questions.forEach(question => {
      const value = answers[question.key];

      if (value === null || value === undefined) {
        // Skip but allow conditional child
      } else {
        if (question.questionType === "NUMERIC" || question.questionType === "NUMBER_INPUT") {
          cleaned[question.key] = typeof value === "number" ? value : Number(value);
        } else if (question.questionType === "YES_NO") {
          cleaned[question.key] = typeof value === "boolean" ? value : value === "yes";
        } else if (question.questionType === "STRUCTURED_ARRAY" && Array.isArray(value)) {
          cleaned[question.key] = value.map(item => {
            const cleanedItem: Record<string, unknown> = { ...item };
            delete cleanedItem.id;

            if (question.validationRules.fields) {
              question.validationRules.fields.forEach(field => {
                const fieldValue = cleanedItem[field.name];

                if (field.type === "number" && fieldValue !== null && fieldValue !== undefined) {
                  cleanedItem[field.name] =
                    typeof fieldValue === "number" ? fieldValue : Number(fieldValue);
                } else if (field.type === "text") {
                  cleanedItem[field.name] = String(fieldValue || "");
                }
              });
            }

            return cleanedItem;
          });
        } else {
          cleaned[question.key] = value;
        }
      }

      if (question.conditionalQuestion?.question) {
        const cq = question.conditionalQuestion.question;
        const cKey = cq.key;
        const cValue = answers[cKey];

        if (cValue !== null && cValue !== undefined && cValue !== "") {
          if (cq.questionType === "NUMERIC" || cq.questionType === "NUMBER_INPUT") {
            cleaned[cKey] = typeof cValue === "number" ? cValue : Number(cValue);
          } else if (cq.questionType === "YES_NO") {
            cleaned[cKey] = typeof cValue === "boolean" ? cValue : cValue === "yes";
          } else if (cq.questionType === "STRUCTURED_ARRAY" && Array.isArray(cValue)) {
            cleaned[cKey] = cValue.map((item: Record<string, unknown>) => {
              const cleanedItem: Record<string, unknown> = { ...item };
              delete cleanedItem.id;

              if (cq.validationRules?.fields) {
                cq.validationRules.fields.forEach((field: { name: string; type: string }) => {
                  const fieldValue = cleanedItem[field.name];

                  if (field.type === "number" && fieldValue !== null && fieldValue !== undefined) {
                    cleanedItem[field.name] =
                      typeof fieldValue === "number" ? fieldValue : Number(fieldValue);
                  } else if (field.type === "text") {
                    cleanedItem[field.name] = String(fieldValue || "");
                  }
                });
              }

              return cleanedItem;
            });
          } else {
            cleaned[cKey] = cValue;
          }
        }
      }
    });

    return cleaned;
  }, [answers, questions]);

  const handleSubmit = useCallback(async () => {
    const isValid = validateAnswers();

    if (!isValid) {
      setTimeout(() => {
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey) {
          const errorElement = document.querySelector(`[data-question-key="${firstErrorKey}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 100);
      return { success: false, errors };
    }

    const cleanedAnswers = cleanAnswers();
    setIsSaving(true);

    try {
      const response = await submitSection(cleanedAnswers);
      if (response.success) {
        if (onSuccess) onSuccess();
        if (onNext) onNext();
      }
      return response;
    } catch (error) {
      console.error("[DynamicTab] Submission error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    } finally {
      setIsSaving(false);
    }
  }, [validateAnswers, errors, cleanAnswers, submitSection, onSuccess, onNext]);

  useImperativeHandle(
    ref,
    () => ({
      submit: handleSubmit,
      validate: validateAnswers,
      getAnswers: () => answers,
      getErrors: () => errors,
      isCompleted: Object.keys(errors).length === 0,
      isSaving,
    }),
    [handleSubmit, validateAnswers, answers, errors, isSaving]
  );

  useEffect(() => {
    (window as { __dynamicTabValidation?: unknown }).__dynamicTabValidation = {
      submit: handleSubmit,
      validate: validateAnswers,
      getAnswers: () => answers,
      getErrors: () => errors,
      isCompleted: Object.keys(errors).length === 0,
      isSaving,
    };

    return () => {
      delete (window as { __dynamicTabValidation?: unknown }).__dynamicTabValidation;
    };
  }, [handleSubmit, validateAnswers, answers, errors, isSaving]);

  return (
    <div className="space-y-6 p-6">
      {questions.map(question => (
        <DynamicQuestionRenderer
          key={question.key}
          question={question}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          errors={errors}
        />
      ))}
    </div>
  );
});

DynamicTab.displayName = "DynamicTab";
