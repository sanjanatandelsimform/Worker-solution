import { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useRef } from "react";
import { DynamicQuestionRenderer } from "./DynamicQuestionRenderer";
import type { Question } from "@/types/questionTypes";
import { useAssessment } from "@/hooks/useAssessment";
import ErrorMessage from "@/components/common/ErrorMessage";
import { AlertCircle } from "@untitledui/icons";
import type { StateOption } from "@/hooks/useStatesLookup";

interface AddressItem {
  state?: string;
  zipCode?: string;
}
interface DynamicTabProps {
  section: "workforce" | "compensation" | "benefits" | "goals";
  questions: Question[];
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
  onSuccess?: () => void;
  onSubmitStart?: () => void;
  onEmptySubmission?: () => void;
  onApiError?: (errorMessage: string) => void;
  hideHeader?: boolean;
  disableWindowRegistration?: boolean;
  stateOptions?: StateOption[];
}

// Health and Wellness option values from the supplementalBenefits question.
// If any of these are selected, the HealthCare subsection is shown.
const HEALTH_WELLNESS_VALUES = new Set([
  "Healthcare",
  "Dental",
  "Vision",
  "Medical FSA",
  "HSA",
  "Limited Purpose FSA",
  "Dependent Care FSA",
  "Medical Expense Help",
  "Mental Health",
]);

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
      onSubmitStart,
      onEmptySubmission,
      onApiError,
      hideHeader = false,
      disableWindowRegistration = false,
      stateOptions,
    },
    ref
  ) => {
    const {
      answers,
      updateAnswer,
      updateAnswers,
      errors: hookErrors,
      submitSection,
      isLoadingGet,
      apiError,
      retryGetAssessment,
    } = useAssessment({ section });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const isExplicitSubmitRef = useRef(false);
    const [showApiError, setShowApiError] = useState(true);

    useEffect(() => {
      if (Object.keys(hookErrors).length > 0) {
        setErrors(hookErrors);
      }
    }, [hookErrors]);

    useEffect(() => {
      if (!answers || Object.keys(answers).length === 0) return;

      let needsUpdate = false;
      const updatedAnswers: Record<string, unknown> = {};

      Object.entries(answers).forEach(([key, value]) => {
        if (!Array.isArray(value)) return;

        const updatedArray = value.map((item: Record<string, unknown>) => {
          if (
            item &&
            typeof item === "object" &&
            item.zipCode &&
            typeof item.zipCode === "string" &&
            item.zipCode.trim() !== "" &&
            item.__zipValidityState === undefined
          ) {
            needsUpdate = true;
            return {
              ...item,
              __zipValidityState: "valid" as const,
              __zipIsValid: true,
            };
          }
          return item;
        });

        if (needsUpdate) {
          updatedAnswers[key] = updatedArray;
        }
      });

      if (needsUpdate) {
        Object.entries(updatedAnswers).forEach(([key, val]) => {
          updateAnswer(key, val);
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answers]);

    const validateAnswers = useCallback(() => {
      const newErrors: Record<string, string> = {};
      let isValid = true;

      // Derive HealthCare visibility at validation time so hidden questions are skipped
      const selectedBenefits = Array.isArray(answers["supplementalBenefits"])
        ? (answers["supplementalBenefits"] as string[])
        : [];
      const isHealthCareVisible = selectedBenefits.some(v => HEALTH_WELLNESS_VALUES.has(v));

      questions.forEach(question => {
        // ── Skip HealthCare subsection questions when the section is hidden ──
        if (
          (question as Question & { subsection?: string }).subsection === "HealthCare" &&
          !isHealthCareVisible
        ) {
          return;
        }

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
                    const defaultMessage =
                      field.name === "zipCode"
                        ? "Zip code is required"
                        : field.name === "state"
                          ? "State is required"
                          : `${field.name} is required`;

                    newErrors[fieldKey] = field.errorMessage || defaultMessage;
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

                  if (
                    field.type === "text" &&
                    !field.pattern &&
                    fieldValue !== null &&
                    fieldValue !== undefined &&
                    fieldValue !== "" &&
                    (field.name === "title" || field.name === "occupation")
                  ) {
                    const stringValue = String(fieldValue).trim();
                    if (!/^[a-zA-Z\s]+$/.test(stringValue)) {
                      newErrors[fieldKey] = "Only alphabetical";
                      isValid = false;
                    }
                  }

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

                  if (
                    field.name === "zipCode" &&
                    fieldValue !== null &&
                    fieldValue !== undefined &&
                    fieldValue !== ""
                  ) {
                    const zipValidityState = (item as Record<string, unknown>)
                      .__zipValidityState as string | undefined;

                    const stateFieldKey = `${question.key}.${index}.state`;

                    if (zipValidityState === "state_mismatch") {
                      if (!newErrors[stateFieldKey]) {
                        newErrors[stateFieldKey] = "State does not match zipcode";
                      }
                      newErrors[fieldKey] = "";
                      isValid = false;
                    } else if (zipValidityState === "invalid_zip") {
                      if (!newErrors[stateFieldKey]) {
                        newErrors[stateFieldKey] = "State does not match zipcode";
                      }
                      if (!newErrors[fieldKey]) {
                        newErrors[fieldKey] = "Incorrect zip code";
                      }
                      isValid = false;
                    } else if (zipValidityState === "valid") {
                      // Explicitly valid — no error
                    } else if (zipValidityState === "pending" || zipValidityState === undefined) {
                      const zipIsValid = (item as Record<string, unknown>).__zipIsValid as
                        | boolean
                        | undefined;

                      if (zipIsValid === false) {
                        if (!newErrors[fieldKey]) {
                          newErrors[fieldKey] = "Please enter a valid ZIP code";
                        }
                        isValid = false;
                      }
                    }
                  }
                }
              );
            });

            const hasStateField = rules.fields.some(f => f.name === "state");
            const hasZipField = rules.fields.some(f => f.name === "zipCode");

            if (hasStateField && hasZipField) {
              const seenStateZip = new Set<string>();

              value.forEach((item: AddressItem, index: number) => {
                const state = item.state?.trim().toUpperCase();
                const zip = item.zipCode?.trim();

                if (!state || !zip) return;

                const comboKey = `${state}-${zip}`;

                if (seenStateZip.has(comboKey)) {
                  const duplicateStateKey = `${question.key}.${index}.state`;
                  const duplicateZipKey = `${question.key}.${index}.zipCode`;
                  if (!newErrors[duplicateStateKey]) {
                    newErrors[duplicateStateKey] = "This location is already added";
                  }
                  if (!newErrors[duplicateZipKey]) {
                    newErrors[duplicateZipKey] = "This location is already added";
                  }
                  isValid = false;
                } else {
                  seenStateZip.add(comboKey);
                }
              });
            }
          }
        }
        if (question.questionType === "PARTICIPATION_RATES") {
          if (question.subFields && question.subFields.length > 0) {
            const ratesAnswer =
              answers[question.key] &&
              typeof answers[question.key] === "object" &&
              !Array.isArray(answers[question.key])
                ? (answers[question.key] as Record<string, unknown>)
                : {};

            for (const subField of question.subFields) {
              const val = ratesAnswer[subField.key];

              if (val === null || val === undefined || val === "") {
                if (question.isRequired) {
                  newErrors[`${question.key}.${subField.key}`] = "Enter a valid percentage.";
                  isValid = false;
                }
              } else {
                const num = typeof val === "number" ? val : Number(String(val).replace(/%$/, ""));
                if (isNaN(num) || num < 0 || num > 100) {
                  newErrors[`${question.key}.${subField.key}`] =
                    "Please enter a percentage between 0 and 100";
                  isValid = false;
                }
              }
            }
          }
        }
        if (question.conditionalQuestion) {
          // const isFirstLevelShown = (() => {
          //   const showWhen = question.conditionalQuestion.showWhen;
          //   if (showWhen === "yes") return value === true;
          //   if (showWhen === "no") return value === false;
          //   return String(value || "").toLowerCase() === String(showWhen).toLowerCase();
          // })();
          const isFirstLevelShown = (() => {
            const showWhen = question.conditionalQuestion.showWhen;
            if (showWhen === "yes") return value === true || String(value).toLowerCase() === "yes";
            if (showWhen === "no") return value === false || String(value).toLowerCase() === "no";
            return String(value || "").toLowerCase() === String(showWhen).toLowerCase();
          })();

          if (isFirstLevelShown) {
            const conditionalValue = answers[question.conditionalQuestion.question.key];
            const conditionalRules = question.conditionalQuestion.question.validationRules;

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

      const INTERNAL_FIELDS = new Set([
        "id",
        "__zipStateAbbreviation",
        "__zipIsValid",
        "__zipValidityState",
        "__zipStateFips",
      ]);

      const hasRealData = (item: Record<string, unknown>): boolean =>
        Object.entries(item).some(([key, val]) => {
          if (INTERNAL_FIELDS.has(key)) return false;
          if (val === null || val === undefined) return false;
          if (typeof val === "string") return val.trim() !== "";
          return true;
        });

      // Derive HealthCare visibility at clean time so hidden answers are excluded
      const selectedBenefits = Array.isArray(answers["supplementalBenefits"])
        ? (answers["supplementalBenefits"] as string[])
        : [];
      const isHealthCareVisible = selectedBenefits.some(v => HEALTH_WELLNESS_VALUES.has(v));

      questions.forEach(question => {
        // ── Exclude HealthCare subsection answers when the section is hidden ──
        if (
          (question as Question & { subsection?: string }).subsection === "HealthCare" &&
          !isHealthCareVisible
        ) {
          return;
        }

        const value = answers[question.key];

        if (value === null || value === undefined) {
          // Skip but allow conditional child
        } else {
          if (question.questionType === "NUMERIC" || question.questionType === "NUMBER_INPUT") {
            cleaned[question.key] = typeof value === "number" ? value : Number(value);
          } else if (question.questionType === "YES_NO") {
            cleaned[question.key] = typeof value === "boolean" ? value : value === "yes";
          } else if (question.questionType === "STRUCTURED_ARRAY" && Array.isArray(value)) {
            const mappedItems = value.map((item: Record<string, unknown>) => {
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

            const nonEmptyItems = mappedItems.filter(hasRealData);

            if (nonEmptyItems.length > 0) {
              cleaned[question.key] = nonEmptyItems;
            }
          } else if (
            question.questionType === "TEXT_INPUT" &&
            question.key === "lowestHealthPlanPremium"
          ) {
            const numValue = Number(String(value).replace(/[^0-9.]/g, ""));
            cleaned[question.key] = isNaN(numValue) ? value : numValue;
          } else {
            if (Array.isArray(value) && value.length === 0) {
              // Do not include this field in the payload
            } else {
              cleaned[question.key] = value;
            }
          }
        }

        if (question.conditionalQuestion?.question) {
          const cq = question.conditionalQuestion.question;
          const cKey = cq.key;
          const cValue = answers[cKey];
          const parentValue = answers[question.key];
          const showWhen = question.conditionalQuestion.showWhen;

          let conditionMet = false;
          // if (showWhen === "yes") {
          //   conditionMet = parentValue === true;
          // } else if (showWhen === "no") {
          //   conditionMet = parentValue === false;
          // } else {
          //   conditionMet =
          //     String(parentValue || "").toLowerCase() === String(showWhen).toLowerCase();
          // }
          if (showWhen === "yes") {
            conditionMet = parentValue === true || String(parentValue).toLowerCase() === "yes";
          } else if (showWhen === "no") {
            conditionMet = parentValue === false || String(parentValue).toLowerCase() === "no";
          } else {
            conditionMet =
              String(parentValue || "").toLowerCase() === String(showWhen).toLowerCase();
          }

          if (conditionMet && cValue !== null && cValue !== undefined && cValue !== "") {
            if (cq.questionType === "NUMERIC" || cq.questionType === "NUMBER_INPUT") {
              cleaned[cKey] = typeof cValue === "number" ? cValue : Number(cValue);
            } else if (cq.questionType === "YES_NO") {
              cleaned[cKey] = typeof cValue === "boolean" ? cValue : cValue === "yes";
            } else if (cq.questionType === "STRUCTURED_ARRAY" && Array.isArray(cValue)) {
              const mappedItems = cValue.map((item: Record<string, unknown>) => {
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

              const nonEmptyItems = mappedItems.filter(hasRealData);

              if (nonEmptyItems.length > 0) {
                cleaned[cKey] = nonEmptyItems;
              }
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

      // Final sanitization: remove any fields with empty arrays or null/undefined values
      Object.keys(cleaned).forEach(key => {
        const val = cleaned[key];
        if (val === null || val === undefined) {
          delete cleaned[key];
        } else if (Array.isArray(val) && val.length === 0) {
          delete cleaned[key];
        }
      });

      return cleaned;
    }, [answers, questions, section]);

    const stripHiddenConditionalData = useCallback(
      (rawAnswers: Record<string, unknown>): Record<string, unknown> => {
        const cleaned = { ...rawAnswers };

        for (const question of questions) {
          if (!question.conditionalQuestion) continue;

          const { showWhen, question: conditionalQ } = question.conditionalQuestion;
          const parentValue = cleaned[question.key];

          // let conditionMet = false;
          // if (showWhen === "yes") {
          //   conditionMet = parentValue === true;
          // } else if (showWhen === "no") {
          //   conditionMet = parentValue === false;
          // } else {
          //   conditionMet =
          //     String(parentValue || "").toLowerCase() === String(showWhen).toLowerCase();
          // }

          let conditionMet = false;
          if (showWhen === "yes") {
            conditionMet = parentValue === true || String(parentValue).toLowerCase() === "yes";
          } else if (showWhen === "no") {
            conditionMet = parentValue === false || String(parentValue).toLowerCase() === "no";
          } else {
            conditionMet =
              String(parentValue || "").toLowerCase() === String(showWhen).toLowerCase();
          }
          if (!conditionMet && conditionalQ?.key && conditionalQ.key in cleaned) {
            delete cleaned[conditionalQ.key];
          }
        }

        return cleaned;
      },
      [questions]
    );

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
            isExplicitSubmitRef.current = false;
          }, 100);
        } else {
          isExplicitSubmitRef.current = false;
        }
        return { success: false, errors };
      }

      isExplicitSubmitRef.current = false;

      const cleanedAnswers = cleanAnswers();

      const hasAnyAnswers =
        Object.keys(cleanedAnswers).length > 0 &&
        Object.values(cleanedAnswers).some(value => {
          if (value === null || value === undefined || value === "") return false;
          if (Array.isArray(value)) return value.length > 0;
          return true;
        });

      if (!hasAnyAnswers && section === "goals") {
        if (onEmptySubmission) {
          onEmptySubmission();
          return { success: false, error: "No answers provided" };
        }
      }

      if (onSubmitStart) onSubmitStart();

      setIsSaving(true);

      const cleanedForSubmission = { ...cleanedAnswers };
      Object.entries(cleanedForSubmission).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          cleanedForSubmission[key] = val.map((item: Record<string, unknown>) => {
            if (
              item &&
              typeof item === "object" &&
              ("__zipStateAbbreviation" in item ||
                "__zipIsValid" in item ||
                "__zipValidityState" in item ||
                "__zipStateFips" in item)
            ) {
              const {
                __zipStateAbbreviation: _sa,
                __zipIsValid: _iv,
                __zipValidityState: _vs,
                __zipStateFips: _zfips,
                ...rest
              } = item as Record<string, unknown>;
              if (_zfips && !rest.stateFips) {
                rest.stateFips = _zfips;
              }

              // Fallback: resolve stateFips from stateOptions when still missing
              if (!rest.stateFips && rest.state && stateOptions) {
                const matchedState = stateOptions.find(
                  s => s.id.toUpperCase() === (rest.state as string).toUpperCase()
                );
                if (matchedState?.stateFips) {
                  rest.stateFips = matchedState.stateFips;
                }
              }

              return rest;
            }
            // (e.g., user manually typed zip without triggering any autocomplete)
            if (
              item &&
              typeof item === "object" &&
              !item.stateFips &&
              item.state &&
              item.zipCode &&
              stateOptions
            ) {
              const matchedState = stateOptions.find(
                s => s.id.toUpperCase() === (item.state as string).toUpperCase()
              );
              if (matchedState?.stateFips) {
                return { ...item, stateFips: matchedState.stateFips };
              }
            }
            return item;
          });
        }
      });

      const preparedPayload = stripHiddenConditionalData(cleanedForSubmission);
      try {
        const response = await submitSection(preparedPayload);
        if (response.success) {
          if (onSuccess) onSuccess();
          if (onNext) onNext();
        } else {
          if (onApiError) {
            const rawError = response.error;
            const errorMsg =
              typeof rawError === "string" && rawError
                ? rawError
                : "Failed to submit assessment. Please try again.";
            onApiError(errorMsg);
          }
          if (response.fieldErrors) {
            const normalizedFieldErrors: Record<string, string> = { ...response.fieldErrors };
            Object.entries(normalizedFieldErrors).forEach(([key, message]) => {
              if (key.endsWith(".state") && message === "Required") {
                normalizedFieldErrors[key] = "State is required";
              }
            });
            setErrors(prev => ({ ...prev, ...normalizedFieldErrors }));
            setTimeout(() => {
              const firstErrorKey = Object.keys(normalizedFieldErrors)[0];
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
        const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";
        if (onApiError) {
          onApiError(errorMsg);
        }
        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setIsSaving(false);
      }
    }, [
      validateAnswers,
      errors,
      cleanAnswers,
      submitSection,
      stripHiddenConditionalData,
      onSuccess,
      onNext,
      onSubmitStart,
      onEmptySubmission,
      onApiError,
      section,
    ]);

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

    const handleErrorChange = useCallback((updates: Record<string, string>) => {
      setErrors(prev => {
        const next = { ...prev };
        Object.entries(updates).forEach(([key, msg]) => {
          if (msg === "") {
            if (next[key] !== undefined) {
              delete next[key];
            }
          } else {
            next[key] = msg;
          }
        });
        return next;
      });
    }, []);

    const handleAnswerChange = useCallback(
      (key: string, value: unknown) => {
        updateAnswer(key, value);
        updateAnswers({ [key]: value });

        setErrors(prev => {
          if (Object.keys(prev).length === 0) return prev;

          const next = { ...prev };
          const question = questions.find(q => q.key === key);

          // ── When supplementalBenefits changes, clear all HealthCare errors
          //    if no Health & Wellness option is now selected ─────────────────
          if (key === "supplementalBenefits" && Array.isArray(value)) {
            const stillVisible = (value as string[]).some(v => HEALTH_WELLNESS_VALUES.has(v));
            if (!stillVisible) {
              Object.keys(next).forEach(errorKey => {
                // Remove errors belonging to any HealthCare-subsection question key
                const matchingQuestion = questions.find(
                  q =>
                    (q as Question & { subsection?: string }).subsection === "HealthCare" &&
                    (errorKey === q.key || errorKey.startsWith(`${q.key}.`))
                );
                if (matchingQuestion) delete next[errorKey];
              });
            }
          }

          // ── Conditional child: clear child errors when parent hides it ────
          const conditionalQ = question?.conditionalQuestion?.question;
          const conditionalKey = conditionalQ?.key;
          if (conditionalKey) {
            const showWhen = question?.conditionalQuestion?.showWhen;
            let conditionMet = false;
            // if (showWhen === "yes") conditionMet = value === true;
            // else if (showWhen === "no") conditionMet = value === false;
            // else
            //   conditionMet = String(value || "").toLowerCase() === String(showWhen).toLowerCase();
            if (showWhen === "yes")
              conditionMet = value === true || String(value).toLowerCase() === "yes";
            else if (showWhen === "no")
              conditionMet = value === false || String(value).toLowerCase() === "no";
            else
              conditionMet = String(value || "").toLowerCase() === String(showWhen).toLowerCase();
            if (!conditionMet) {
              Object.keys(next).forEach(errorKey => {
                if (errorKey === conditionalKey || errorKey.startsWith(`${conditionalKey}.`)) {
                  delete next[errorKey];
                }
              });
              if (next[key]) delete next[key];
              return next;
            }
          }

          // ── STRUCTURED_ARRAY / plain array ───────────────────────────────────
          if (Array.isArray(value)) {
            const previousArray = (answers[key] as Array<Record<string, unknown>>) ?? [];
            const newArray = value as Array<Record<string, unknown>>;

            const isStructuredArray =
              newArray.length > 0 &&
              typeof newArray[0] === "object" &&
              newArray[0] !== null &&
              "id" in (newArray[0] as object);

            if (isStructuredArray) {
              if (newArray.length > previousArray.length) return next;

              if (previousArray.length > newArray.length) {
                const reIndexed: Record<string, string> = {};
                Object.keys(next).forEach(errorKey => {
                  if (!errorKey.startsWith(`${key}.`)) {
                    reIndexed[errorKey] = next[errorKey];
                    return;
                  }
                  const remainder = errorKey.slice(key.length + 1);
                  const match = remainder.match(/^(\d+)\.(.+)$/);
                  if (!match) {
                    reIndexed[errorKey] = next[errorKey];
                    return;
                  }
                  const oldIndex = parseInt(match[1], 10);
                  const fieldName = match[2];
                  const oldId = (previousArray[oldIndex] as Record<string, unknown>)?.id;
                  if (!oldId) return;
                  const newIndex = (newArray as Array<Record<string, unknown>>).findIndex(
                    i => i.id === oldId
                  );
                  if (newIndex === -1) return;
                  reIndexed[`${key}.${newIndex}.${fieldName}`] = next[errorKey];
                });
                return reIndexed;
              }

              previousArray.forEach((prevItem, idx) => {
                const newItem = (newArray as Array<Record<string, unknown>>).find(
                  i => i.id === (prevItem as Record<string, unknown>).id
                );
                if (!newItem) return;
                Object.keys(newItem).forEach(fieldName => {
                  if (fieldName.startsWith("__") || fieldName === "id") return;
                  if (fieldName === "state") {
                    const zipValidityState = newItem.__zipValidityState as string | undefined;
                    if (zipValidityState === "state_mismatch") {
                      return;
                    }
                  }
                  if (
                    (prevItem as Record<string, unknown>)[fieldName] !== newItem[fieldName] &&
                    newItem[fieldName] !== ""
                  ) {
                    delete next[`${key}.${idx}.${fieldName}`];
                  }
                });
              });
              return next;
            }

            // Plain array (MULTIPLE_CHOICE) — clear error when at least one selected
            if (newArray.length > 0) {
              delete next[key];
            }
            return next;
          }
          if (
            value !== null &&
            value !== undefined &&
            typeof value === "object" &&
            !Array.isArray(value)
          ) {
            const valueObj = value as Record<string, unknown>;

            delete next[key];

            Object.entries(valueObj).forEach(([subKey, subVal]) => {
              if (subVal !== null && subVal !== undefined && subVal !== "") {
                const subFieldErrorKey = `${key}.${subKey}`;
                if (next[subFieldErrorKey] !== undefined) {
                  delete next[subFieldErrorKey];
                }
              }
            });

            return next;
          }
          if (value !== null && value !== undefined && value !== "") {
            delete next[key];
          }

          return next;
        });
      },
      [questions, updateAnswer, updateAnswers, answers]
    );

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
            "We’d like to get a better understanding of your workforce and how it’s structured. This will help us customize relevant solutions.",
        },
        compensation: {
          title: "Compensation",
          description:
            "Select salary ranges that apply best to your workforce. This doesn’t have to be exact.",
        },
        benefits: {
          title: "Benefits",
          description:
            "To understand what gaps may exist in your current benefits offerings, please select all relevant options that you currently offer.",
        },
        goals: {
          title: "Goals",
          description:
            "Pick the goal that best reflects your company's workforce priorities. This helps us share insights and tips that fit your team's needs.",
        },
      };

    // Split questions into: those without a subsection, and grouped by subsection
    const noSubsectionQuestions = questions.filter(
      q => !(q as Question & { subsection?: string }).subsection
    );

    const subsectionMap = new Map<string, Question[]>();
    questions.forEach(q => {
      const sub = (q as Question & { subsection?: string }).subsection;
      if (sub) {
        if (!subsectionMap.has(sub)) {
          subsectionMap.set(sub, []);
        }
        subsectionMap.get(sub)!.push(q);
      }
    });

    // Derive whether the HealthCare subsection should be visible.
    // It shows only when the user has selected at least one Health & Wellness option.
    const selectedSupplementalBenefits = Array.isArray(answers["supplementalBenefits"])
      ? (answers["supplementalBenefits"] as string[])
      : [];
    const isHealthCareVisible = selectedSupplementalBenefits.some(v =>
      HEALTH_WELLNESS_VALUES.has(v)
    );

    const renderQuestion = (question: Question, idx: number, subsectionQuestions?: Question[]) => {
      const displayOrderValue = subsectionQuestions
        ? subsectionQuestions.slice(0, idx + 1).length
        : question.displayOrder;

      return (
        <DynamicQuestionRenderer
          key={question.key}
          question={question}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          errors={errors}
          subsectionDisplayOrder={displayOrderValue}
          onErrorChange={handleErrorChange}
          stateOptions={stateOptions}
        />
      );
    };

    return (
      <div className="space-y-4">
        {isLoadingGet && (
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-ws-border-primary border-t-transparent"></div>
            <span className="ml-3 text-sm text-ws-text-tertiary">Restoring your data...</span>
          </div>
        )}

        {apiError?.type === "get" && (
          <div className="rounded-md border border-ws-error-600 bg-ws-error-600 p-4">
            <p className="text-sm text-ws-error-600">{apiError.message}</p>
            <button
              onClick={retryGetAssessment}
              className="mt-2 text-sm font-medium text-ws-error-600 hover:text-ws-error-600"
            >
              Retry
            </button>
          </div>
        )}
        {apiError?.type === "post" && Object.keys(errors).length > 0 && showApiError && (
          <ErrorMessage
            errorType="danger"
            alertIcon={AlertCircle}
            onClose={() => setShowApiError(false)}
            classess="fixed top-4 right-4 z-50 w-80 shadow-lg"
            textColor="text-ws-error-600"
            errorMessage={
              <div>
                <p className="font-semibold mb-1">{apiError.message}</p>
                <ul className="list-disc list-inside space-y-0.5 font-normal">
                  {Object.entries(errors).map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </div>
            }
          />
        )}
        {/* Main card: section header + questions without a subsection */}
        {(noSubsectionQuestions.length > 0 || (!hideHeader && sectionContent[section])) && (
          <div className="bg-ws-base-white rounded-lg border border-ws-border-primary shadow-sm p-6 space-y-6">
            {sectionContent[section] && !hideHeader && (
              <>
                <h2 className="text-ws-text-primary text-3xl font-semibold mb-2">
                  {sectionContent[section].title}
                </h2>
                <p className="text-base text-ws-text-secondary">
                  {sectionContent[section].description}
                </p>
              </>
            )}
            {noSubsectionQuestions.map((question, idx) => renderQuestion(question, idx))}
          </div>
        )}

        {/* One card per subsection — HealthCare is hidden unless a Health & Wellness benefit is selected */}
        {Array.from(subsectionMap.entries()).map(([subsection, subsectionQuestions]) => {
          if (subsection === "HealthCare" && !isHealthCareVisible) return null;

          return (
            <div
              key={subsection}
              className="bg-ws-base-white rounded-lg border border-ws-border-primary shadow-sm p-6 space-y-6"
            >
              <h2 className="text-2xl font-medium text-ws-text-primary pb-4">
                {subsection === "HealthCare" ? "Healthcare" : subsection}
              </h2>
              {subsectionQuestions.map((question, idx) =>
                renderQuestion(question, idx, subsectionQuestions)
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

DynamicTab.displayName = "DynamicTab";
