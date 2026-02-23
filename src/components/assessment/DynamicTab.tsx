import { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useRef } from "react";
import { DynamicQuestionRenderer } from "./DynamicQuestionRenderer";
import type { Question } from "@/types/questionTypes";
import { useAssessment } from "@/hooks/useAssessment";
import ErrorMessage from "@/components/common/ErrorMessage";
import { AlertCircle } from "@untitledui/icons";

interface DynamicTabProps {
  section: "workforce" | "compensation" | "benefits" | "goals";
  questions: Question[];
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
  onSuccess?: () => void;
  hideHeader?: boolean;
  disableWindowRegistration?: boolean;
}

export const DynamicTab = forwardRef<
  {
    submit: () => Promise<{
      success: boolean;
      errors?: Record<string, string>;
    }>;
    validate: () => boolean;
    getAnswers: () => Record<string, unknown>;
    getErrors: () => Record<string, string>;
    isCompleted: boolean;
    isSaving: boolean;
  },
  DynamicTabProps
>(
  (
    {
      section,
      questions,
      onValidationChange,
      onNext,
      onSuccess,
      hideHeader = false,
      disableWindowRegistration = false,
    },
    ref
  ) => {
    const {
      answers,
      updateAnswer,
      errors: hookErrors,
      submitSection,
      isLoadingGet,
      apiError,
      retryGetAssessment,
    } = useAssessment({ section });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    // Track if we're in an explicit submit action (vs normal state update)
    const isExplicitSubmitRef = useRef(false);

    // Sync hook errors to local state
    useEffect(() => {
      if (Object.keys(hookErrors).length > 0) {
        setErrors(hookErrors);
      }
    }, [hookErrors]);

    const handleAnswerChange = useCallback(
      (key: string, value: unknown) => {
        updateAnswer(key, value);

        if (Object.keys(errors).length === 0) return;

        setErrors(prev => {
          const next = { ...prev };

          // Clear exact key error
          delete next[key];

          Object.keys(next).forEach(k => {
            if (k.startsWith(`${key}.`)) {
              const remainder = k.slice(key.length + 1);
              if (/^\d+\./.test(remainder)) {
                delete next[k];
              } else if (!remainder.includes(".")) {
                const incomingObj = value as Record<string, unknown>;
                if (
                  incomingObj &&
                  incomingObj[remainder] !== undefined &&
                  incomingObj[remainder] !== ""
                ) {
                  delete next[k];
                }
              }
            }
          });

          return next;
        });
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

        // Validate ARRAY type (MULTIPLE_CHOICE) - allow up to maxItems but don't block selection
        if (rules.type === "ARRAY" && Array.isArray(value)) {
          if (rules.minItems && value.length < rules.minItems) {
            newErrors[question.key] =
              rules.errorMessage || `At least ${rules.minItems} item(s) required`;
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
          if (rules.fields && Array.isArray(value)) {
            value.forEach((item: Record<string, unknown>, index: number) => {
              rules.fields!.forEach(
                (field: {
                  name: string;
                  type: string;
                  required?: boolean;
                  pattern?: string;
                  errorMessage?: string;
                }) => {
                  const fieldValue = item[field.name];
                  const fieldKey = `${question.key}.${index}.${field.name}`;
                  if (
                    field.required &&
                    (fieldValue === null || fieldValue === undefined || fieldValue === "")
                  ) {
                    newErrors[fieldKey] = field.errorMessage || `${field.name} is required`;
                    isValid = false;
                  }
                  if (
                    field.pattern &&
                    fieldValue !== null &&
                    fieldValue !== undefined &&
                    fieldValue !== ""
                  ) {
                    const regex = new RegExp(field.pattern);
                    const stringValue = String(fieldValue);
                    if (!regex.test(stringValue)) {
                      if (field.pattern === "^[a-zA-Z\\s]+$" || field.pattern === "^[a-zA-Z ]+$") {
                        newErrors[fieldKey] = "Only alphabetical";
                      } else {
                        newErrors[fieldKey] =
                          field.errorMessage || `Invalid format for ${field.name}`;
                      }
                      isValid = false;
                    }
                  }

                  // Auto-detect alphabetical pattern for text fields named "title", "occupation", etc.
                  if (
                    field.type === "text" &&
                    !field.pattern &&
                    fieldValue !== null &&
                    fieldValue !== undefined &&
                    fieldValue !== "" &&
                    (field.name === "title" || field.name === "occupation")
                  ) {
                    const stringValue = String(fieldValue).trim();
                    // Check if contains non-alphabetical characters (allow spaces)
                    if (!/^[a-zA-Z\s]+$/.test(stringValue)) {
                      newErrors[fieldKey] = "Only alphabetical";
                      isValid = false;
                    }
                  }

                  // Type validation (numeric)
                  if (
                    field.type === "number" &&
                    fieldValue !== null &&
                    fieldValue !== undefined &&
                    fieldValue !== ""
                  ) {
                    const numValue =
                      typeof fieldValue === "number" ? fieldValue : Number(fieldValue);
                    if (isNaN(numValue)) {
                      newErrors[fieldKey] = "Must be numeric digit";
                      isValid = false;
                    }
                  }
                }
              );
            });
          }
        }

        // Validate PARTICIPATION_RATES subFields individually
        if (question.questionType === "PARTICIPATION_RATES" && rules.type === "OBJECT") {
          if (rules.required) {
            const answerObj = (value as Record<string, unknown>) || {};
            question.subFields?.forEach(sub => {
              const subValue = answerObj[sub.key];
              if (subValue === null || subValue === undefined || subValue === "") {
                newErrors[`${question.key}.${sub.key}`] = "Enter a valid percentage.";
                isValid = false;
              }
            });
          }
        }
        if (question.conditionalQuestion) {
          // First, determine if the conditional question is currently visible
          const isFirstLevelShown = (() => {
            const showWhen = question.conditionalQuestion.showWhen;
            if (showWhen === "yes") return value === true;
            if (showWhen === "no") return value === false;
            return String(value || "").toLowerCase() === String(showWhen).toLowerCase();
          })();

          if (isFirstLevelShown) {
            const conditionalValue = answers[question.conditionalQuestion.question.key];
            const conditionalRules = question.conditionalQuestion.question.validationRules;

            // Only enforce required validation if the first-level CQ is marked required
            if (conditionalRules.required) {
              const isConditionalEmpty =
                conditionalRules.type === "ARRAY"
                  ? !Array.isArray(conditionalValue) || (conditionalValue as unknown[]).length === 0
                  : conditionalValue === null ||
                    conditionalValue === undefined ||
                    conditionalValue === "";

              if (isConditionalEmpty) {
                newErrors[question.conditionalQuestion.question.key] =
                  conditionalRules.errorMessage ||
                  `${question.conditionalQuestion.question.questionText} is required`;
                isValid = false;
              }
            }
            const firstLevelCq = question.conditionalQuestion.question;
            if (
              firstLevelCq.conditionalQuestion &&
              conditionalValue !== null &&
              conditionalValue !== undefined &&
              conditionalValue !== ""
            ) {
              const nestedShowWhen = firstLevelCq.conditionalQuestion.showWhen;
              const shouldShowNested =
                nestedShowWhen === "yes"
                  ? conditionalValue === true
                  : nestedShowWhen === "no"
                    ? conditionalValue === false
                    : String(conditionalValue).toLowerCase() ===
                      String(nestedShowWhen).toLowerCase();

              if (
                shouldShowNested &&
                firstLevelCq.conditionalQuestion.question.validationRules.required
              ) {
                const nestedKey = firstLevelCq.conditionalQuestion.question.key;
                const nestedValue = answers[nestedKey];

                if (nestedValue === null || nestedValue === undefined || nestedValue === "") {
                  newErrors[nestedKey] =
                    firstLevelCq.conditionalQuestion.question.validationRules.errorMessage ||
                    `${firstLevelCq.conditionalQuestion.question.questionText} is required`;
                  isValid = false;
                }
              }
            }
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
          // Handle different question types and convert to correct types
          if (question.questionType === "NUMERIC" || question.questionType === "NUMBER_INPUT") {
            cleaned[question.key] = typeof value === "number" ? value : Number(value);
          } else if (question.questionType === "YES_NO") {
            cleaned[question.key] = typeof value === "boolean" ? value : value === "yes";
          } else if (question.questionType === "STRUCTURED_ARRAY" && Array.isArray(value)) {
            cleaned[question.key] = value.map((item: Record<string, unknown>) => {
              const cleanedItem: Record<string, unknown> = { ...item };
              delete cleanedItem.id;

              if (question.validationRules?.fields) {
                question.validationRules.fields.forEach(
                  (field: {
                    name: string;
                    type: string;
                    required?: boolean;
                    pattern?: string;
                    errorMessage?: string;
                  }) => {
                    const fieldValue = cleanedItem[field.name];

                    if (
                      field.type === "number" &&
                      fieldValue !== null &&
                      fieldValue !== undefined
                    ) {
                      cleanedItem[field.name] =
                        typeof fieldValue === "number" ? fieldValue : Number(fieldValue);
                    } else if (field.type === "text") {
                      cleanedItem[field.name] = String(fieldValue || "");
                    }
                  }
                );
              }

              return cleanedItem;
            });
          } else if (
            question.questionType === "TEXT_INPUT" &&
            question.key === "lowestHealthPlanPremium"
          ) {
            // API expects number for this field
            const numValue = Number(String(value).replace(/[^0-9.]/g, ""));
            cleaned[question.key] = isNaN(numValue) ? value : numValue;
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

                if (cq.validationRules.fields) {
                  cq.validationRules.fields.forEach(
                    (field: {
                      name: string;
                      type: string;
                      required?: boolean;
                      pattern?: string;
                      errorMessage?: string;
                    }) => {
                      const fieldValue = cleanedItem[field.name];

                      if (
                        field.type === "number" &&
                        fieldValue !== null &&
                        fieldValue !== undefined
                      ) {
                        cleanedItem[field.name] =
                          typeof fieldValue === "number" ? fieldValue : Number(fieldValue);
                      } else if (field.type === "text") {
                        cleanedItem[field.name] = String(fieldValue || "");
                      }
                    }
                  );
                }

                return cleanedItem;
              });
            } else {
              cleaned[cKey] = cValue;
            }
            if (cq.conditionalQuestion?.question) {
              const nestedCq = cq.conditionalQuestion.question;
              const nestedKey = nestedCq.key;
              const nestedValue = answers[nestedKey];

              if (nestedValue !== null && nestedValue !== undefined && nestedValue !== "") {
                if (
                  nestedCq.questionType === "NUMERIC" ||
                  nestedCq.questionType === "NUMBER_INPUT"
                ) {
                  cleaned[nestedKey] =
                    typeof nestedValue === "number" ? nestedValue : Number(nestedValue);
                } else if (nestedCq.questionType === "YES_NO") {
                  cleaned[nestedKey] =
                    typeof nestedValue === "boolean" ? nestedValue : nestedValue === "yes";
                } else if (nestedCq.questionType === "TEXT_INPUT") {
                  cleaned[nestedKey] = String(nestedValue);
                } else {
                  cleaned[nestedKey] = nestedValue;
                }
              }
            }
          }
        }
      });
      if (section === "goals") {
        const rankingValue = answers["workforceGoalsRanking"];
        if (Array.isArray(rankingValue)) {
          cleaned["workforceGoalsRanking"] = rankingValue.slice(0, 3);
        }
      }

      return cleaned;
    }, [answers, questions, section]);

    const handleSubmit = useCallback(async () => {
      isExplicitSubmitRef.current = true;
      const isValid = validateAnswers();

      if (!isValid) {
        if (isExplicitSubmitRef.current) {
          setTimeout(() => {
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey) {
              const errorElement = document.querySelector(`[data-question-key="${firstErrorKey}"]`);
              if (errorElement) {
                errorElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }
            // Reset flag after scroll completes
            isExplicitSubmitRef.current = false;
          }, 100);
        } else {
          isExplicitSubmitRef.current = false;
        }
        return { success: false, errors };
      }

      // Reset flag after successful validation
      isExplicitSubmitRef.current = false;

      const cleanedAnswers = cleanAnswers();
      setIsSaving(true);

      try {
        const response = await submitSection(cleanedAnswers);
        if (response.success) {
          if (onSuccess) onSuccess();
          if (onNext) onNext();
        } else {
          if (response.fieldErrors) {
            setErrors(prev => ({ ...prev, ...response.fieldErrors }));
            setTimeout(() => {
              const firstErrorKey = Object.keys(response.fieldErrors!)[0];
              if (firstErrorKey) {
                const errorElement = document.querySelector(
                  `[data-question-key="${firstErrorKey}"]`
                );
                if (errorElement) {
                  errorElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }
            }, 100);
          }
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

    const saveWithoutValidation = useCallback(async () => {
      const cleanedAnswers = cleanAnswers();
      setIsSaving(true);
      try {
        const response = await submitSection(cleanedAnswers);
        return response;
      } catch (_error) {
        return { success: false };
      } finally {
        setIsSaving(false);
      }
    }, [cleanAnswers, submitSection]);

    const clearErrors = useCallback(() => {
      setErrors({});
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        submit: handleSubmit,
        validate: validateAnswers,
        saveWithoutValidation,
        clearErrors,
        getAnswers: () => answers,
        getErrors: () => errors,
        isCompleted: Object.keys(errors).length === 0,
        isSaving,
        isLoadingGet,
      }),
      [
        handleSubmit,
        validateAnswers,
        saveWithoutValidation,
        clearErrors,
        answers,
        errors,
        isSaving,
        isLoadingGet,
      ]
    );

    useEffect(() => {
      if (disableWindowRegistration) return;
      (window as { __dynamicTabValidation?: unknown }).__dynamicTabValidation = {
        submit: handleSubmit,
        validate: validateAnswers,
        saveWithoutValidation,
        clearErrors,
        getAnswers: () => answers,
        getErrors: () => errors,
        isCompleted: Object.keys(errors).length === 0,
        isSaving,
        isLoadingGet,
      };

      return () => {
        delete (window as { __dynamicTabValidation?: unknown }).__dynamicTabValidation;
      };
    }, [
      handleSubmit,
      validateAnswers,
      answers,
      errors,
      saveWithoutValidation,
      clearErrors,
      isSaving,
      isLoadingGet,
      disableWindowRegistration,
    ]);

    const sectionContent: Record<string, { title: React.ReactNode; description: React.ReactNode }> =
      {
        workforce: {
          title: "Workforce",
          description:
            "We’d like to get a better understanding of your workforce and how they’re structured. This will help us customize relevant solution providers.",
        },
        compensation: {
          title: "Compensation",
          description:
            "Select salary that applies best to your workforce. This doesn’t have to be exact.",
        },
        benefits: {
          title: "Benefits",
          description:
            "To understand what gaps may exist in your current benefits offerings, please select all relevant options that you currently offer.",
        },
        goals: {
          title: "Goals",
          description:
            "Pick the goal that best reflects your company’s workforce priorities. This helps us share insights and tips that fit your team’s needs.",
        },
      };

    return (
      <div className="bg-ws-white space-y-6 p-6">
        {/* Loading State - Non-blocking */}
        {isLoadingGet && (
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-ws-cyan-60 border-t-transparent"></div>
            <span className="ml-3 text-sm text-ws-gray-60">Restoring your data...</span>
          </div>
        )}

        {/* GET Error Display */}
        {apiError?.type === "get" && (
          <div className="rounded-md border border-ws-red-20 bg-ws-red-40 p-4">
            <p className="text-sm text-ws-red-40">{apiError.message}</p>
            <button
              onClick={retryGetAssessment}
              className="mt-2 text-sm font-medium text-ws-red-40 hover:text-ws-red-30"
            >
              Retry
            </button>
          </div>
        )}

        {/* POST Error Display - Show validation errors
      {apiError?.type === "post" && Object.keys(errors).length > 0 && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">{apiError.message}</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
            {Object.entries(errors).map(([key, message]) => (
              <li key={key}>{message}</li>
            ))}
          </ul>
        </div>
      )} */}

        {/* POST Error Display - Show validation errors using ErrorMessage component */}
        {apiError?.type === "post" && Object.keys(errors).length > 0 && (
          <ErrorMessage
            errorType="danger"
            alertIcon={AlertCircle}
            errorMessage={
              <div>
                <p className="font-semibold mb-2">{apiError.message}</p>
                <ul className="list-inside list-disc space-y-1">
                  {Object.entries(errors).map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </div>
            }
          />
        )}
        {/* Form Content - Always visible */}
        {sectionContent[section] && !hideHeader && (
          <>
            <h2 className="text-3xl font-semibold mb-2">{sectionContent[section].title}</h2>
            <p className="text-base text-ws-gray-90">{sectionContent[section].description}</p>
          </>
        )}

        {questions.map((question, index) => {
          const currentSubsection = (question as Question & { subsection?: string }).subsection;
          const prevQuestion = index > 0 ? questions[index - 1] : null;
          const prevSubsection = prevQuestion
            ? (prevQuestion as Question & { subsection?: string }).subsection
            : null;
          const isFirstInSubsection = currentSubsection && currentSubsection !== prevSubsection;

          return (
            <div key={question.key}>
              {/* Visual card break for subsections — mimics separate white cards */}
              {isFirstInSubsection && currentSubsection && (
                <div className="-mx-6 px-6 pt-8 pb-6 mt-6 border-t-25 border-gray-50">
                  <h2 className="text-2xl font-medium text-ws-black-90 pb-4 border-b border-ws-gray-40">
                    {currentSubsection === "HealthCare" ? "Healthcare" : currentSubsection}
                  </h2>
                </div>
              )}
              <DynamicQuestionRenderer
                question={question}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                errors={errors}
                subsectionDisplayOrder={
                  currentSubsection
                    ? questions
                        .slice(0, index + 1)
                        .filter(
                          q =>
                            (q as Question & { subsection?: string }).subsection ===
                            currentSubsection
                        ).length
                    : question.displayOrder
                }
              />
            </div>
          );
        })}
      </div>
    );
  }
);

DynamicTab.displayName = "DynamicTab";
