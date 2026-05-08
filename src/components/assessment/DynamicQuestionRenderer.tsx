import React, { useEffect, useCallback } from "react";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { RadioButton, RadioButtonBase, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Select } from "@/components/base/select/select";
import type { SelectItemType } from "@/components/base/select/select";
import { Button } from "@/components/base/buttons/button";
import { Plus, Trash01, InfoCircle } from "@untitledui/icons";
import type { Question, OptionGroup, QuestionOption } from "@/types/questionTypes";
import { cx } from "@/utils/cx";
import { RankingList } from "../common/RankList";
import { ZipCodeAutocomplete } from "../common/ZipCodeAutocomplete";
import questionData from "@/data/assessment/questionData.json";
import { InputInfo } from "@/assets/icons/inputInfo";
import type { ZipValidityState } from "@/components/common/ZipCodeAutocomplete";
import type { StateOption } from "@/hooks/useStatesLookup";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";

/**
 * "Does not offer" exclusive options per benefits group.
 * Selecting one of these deselects and disables every other option in its group.
 */
const EXCLUSIVE_BENEFIT_OPTIONS = new Set([
  "My company does not offer retirement/savings benefits",
  "My company does not offer health and wellness benefit",
  "My company does not offer any supplemental benefits",
]);

/** Tooltips for specific option values */
const OPTION_TOOLTIPS: Record<string, string> = {
  "Earned Wage Access":
    "Earned Wage Access (EWA) is a financial benefit allowing employees to access a portion of their already-earned wages before their scheduled payday.",
  "Student loan support":
    "Education support includes benefits such as tuition reimbursement, scholarships, and education stipends.",
};
/** Tooltips for specific question keys */
const QUESTION_TOOLTIPS: Record<string, string> = {
  retirementNonElectiveMatch:
    "A non-elective match (or non-elective contribution) is a 401(k) employer contribution made to all eligible employees, regardless of whether the employee contributes their own money.",
};

// Helper to generate unique IDs
let idCounter = 0;
const generateId = () => ++idCounter;

// --- Module-level layout constants ---
const HALF_WIDTH_SELECT_KEYS = new Set(["payrollProvider", "benefitEnrollmentMonth"]);
const HALF_WIDTH_CONDITIONAL_SELECT_KEYS = new Set(["retirementProvider"]);
const HALF_WIDTH_NUMERIC_KEYS = new Set(["lowestHealthPlanPremium"]);
const HALF_WIDTH_CONDITIONAL_NUMERIC_KEYS = new Set(["retirementMatchPercentage"]);
const HALF_WIDTH_YES_NO_KEYS = new Set(["offersAnnualRaises"]);

/** Returns true when a conditional question should be revealed. */
function computeShouldShow(showWhen: string, parentValue: unknown): boolean {
  if (showWhen === "yes") {
    return parentValue === true || String(parentValue).toLowerCase() === "yes";
  }
  if (showWhen === "no") {
    return parentValue === false || String(parentValue).toLowerCase() === "no";
  }
  return String(parentValue || "").toLowerCase() === String(showWhen).toLowerCase();
}

// ─── StructuredArrayField ─────────────────────────────────────────────────────

interface StructuredArrayFieldDef {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  width?: string;
  options?: Array<{ id: string; label: string }>;
  pattern?: string;
}

interface StructuredArrayFieldProps {
  field: StructuredArrayFieldDef;
  index: number;
  arrayKey: string;
  answers: Record<string, unknown>;
  errors: Record<string, string>;
  onAnswerChange: (key: string, value: unknown) => void;
  onErrorChange?: (updates: Record<string, string>) => void;
  stateOptions?: StateOption[];
}

const StructuredArrayField = ({
  field,
  index,
  arrayKey,
  answers,
  errors,
  onAnswerChange,
  onErrorChange,
  stateOptions,
}: StructuredArrayFieldProps): React.ReactNode => {
  const currentItems = (answers[arrayKey] as Array<{ id: number }>) || [];
  const item = currentItems[index] || { id: generateId() };
  const itemId = (item as { id: number }).id;
  const widthClass = field.width || "flex-1";

  const fieldErrorKey = `${arrayKey}.${index}.${field.name}`;
  const fieldError = errors[fieldErrorKey];

  let displayFieldError: string | undefined;
  if (fieldError) {
    if (field.name === "state") {
      displayFieldError = fieldError === "Required" ? "State is required" : fieldError;
    } else if (field.name === "zipCode") {
      displayFieldError = fieldError === "" ? undefined : fieldError;
    } else {
      displayFieldError = fieldError;
    }
  }

  const questionError = errors[arrayKey];
  const hasError = !!displayFieldError || !!questionError;

  console.debug(`[renderStructuredArrayField] ${fieldErrorKey}:`, {
    fieldError,
    questionError,
    hasError,
    errors: Object.keys(errors).filter(k => k.startsWith(arrayKey)),
  });

  const updateField = (fieldName: string, value: string) => {
    const current = (answers[arrayKey] as Array<Record<string, unknown>>) ?? [];
    const updated = current.map(i => (i.id === itemId ? { ...i, [fieldName]: value } : i));
    onAnswerChange(arrayKey, updated);
    if (value !== "" && value !== null && value !== undefined) {
      const currentIndex = current.findIndex(i => i.id === itemId);
      if (currentIndex !== -1) {
        const errKey = `${arrayKey}.${currentIndex}.${fieldName}`;
        const pairedKey =
          fieldName === "zipCode"
            ? `${arrayKey}.${currentIndex}.state`
            : fieldName === "state"
              ? `${arrayKey}.${currentIndex}.zipCode`
              : null;
        if (fieldName === "state") return;
        onErrorChange?.(pairedKey ? { [errKey]: "", [pairedKey]: "" } : { [errKey]: "" });
      }
    }
  };

  if (field.type === "select") {
    return (
      <div className={cx("flex flex-col gap-1.5", widthClass)}>
        <Select
          className="w-full flex items-start"
          size="md"
          label={field.label}
          placeholder={field.placeholder}
          items={field.options?.map(opt => ({ id: opt.id, label: opt.label }))}
          selectedKey={(item as unknown as Record<string, string>)[field.name] || ""}
          onSelectionChange={key => updateField(field.name, key as string)}
          isInvalid={hasError}
        >
          {(selectItem: SelectItemType) => (
            <Select.Item id={selectItem.id}>{selectItem.label || ""}</Select.Item>
          )}
        </Select>
        {displayFieldError && (
          <span className="text-sm text-ws-error-600">{displayFieldError}</span>
        )}
      </div>
    );
  }

  if (field.name === "state") {
    return (
      <div className={cx("flex flex-col gap-1.5", widthClass)}>
        <Select
          className="w-full flex items-start"
          size="md"
          label={field.label}
          placeholder={field.placeholder}
          items={field.options?.map(opt => ({ id: opt.id, label: opt.label }))}
          selectedKey={(item as unknown as Record<string, string>)[field.name] || ""}
          onSelectionChange={key => {
            const selectedState = key as string;
            const latestItems = (answers[arrayKey] as Array<Record<string, unknown>>) ?? [];
            const currentItem = latestItems.find(i => i.id === itemId);
            const currentIndex = latestItems.findIndex(i => i.id === itemId);
            if (currentIndex === -1) return;

            const currentZipValue = (currentItem?.zipCode as string) ?? "";
            const currentZipValidityState = currentItem?.__zipValidityState as
              | ZipValidityState
              | undefined;
            const currentZipStateAbbreviation = currentItem?.__zipStateAbbreviation as
              | string
              | undefined;
            const stateFieldKey = `${arrayKey}.${currentIndex}.state`;
            const zipFieldKey = `${arrayKey}.${currentIndex}.zipCode`;
            const selectedStateFips =
              stateOptions?.find(s => s.id.toUpperCase() === selectedState.toUpperCase())
                ?.stateFips ?? "";

            const hasZipContext =
              currentZipValue &&
              currentZipStateAbbreviation &&
              (currentZipValidityState === "valid" || currentZipValidityState === "state_mismatch");

            if (hasZipContext) {
              const isMismatch =
                currentZipStateAbbreviation!.toUpperCase() !== selectedState.toUpperCase();
              onAnswerChange(
                arrayKey,
                latestItems.map(i =>
                  i.id === itemId
                    ? {
                        ...i,
                        [field.name]: selectedState,
                        stateFips: selectedStateFips,
                        __zipValidityState: (isMismatch
                          ? "state_mismatch"
                          : "valid") as ZipValidityState,
                        __zipIsValid: !isMismatch,
                      }
                    : i
                )
              );
              onErrorChange?.(
                isMismatch
                  ? { [stateFieldKey]: "State does not match zipcode", [zipFieldKey]: "" }
                  : { [stateFieldKey]: "", [zipFieldKey]: "" }
              );
            } else {
              onAnswerChange(
                arrayKey,
                latestItems.map(i =>
                  i.id === itemId
                    ? { ...i, [field.name]: selectedState, stateFips: selectedStateFips }
                    : i
                )
              );
              onErrorChange?.({ [stateFieldKey]: "" });
            }
          }}
          isInvalid={hasError}
        >
          {(selectItem: SelectItemType) => (
            <Select.Item id={selectItem.id}>{selectItem.label || ""}</Select.Item>
          )}
        </Select>
        {displayFieldError && (
          <span className="text-sm text-ws-error-600">{displayFieldError}</span>
        )}
      </div>
    );
  }

  if (field.name === "zipCode") {
    return (
      <div className={cx("flex flex-col gap-1.5", widthClass)}>
        <label className="block text-sm font-normal text-foreground mb-0.2">{field.label}</label>
        <ZipCodeAutocomplete
          value={(item as unknown as Record<string, string>)[field.name] ?? ""}
          onChange={(val: string) => {
            const latestItems = answers[arrayKey] as Array<Record<string, unknown>>;
            if (!latestItems || !Array.isArray(latestItems)) return;
            onAnswerChange(
              arrayKey,
              latestItems.map(i =>
                i.id === itemId
                  ? {
                      ...i,
                      [field.name]: val,
                      __zipStateAbbreviation: null,
                      __zipIsValid: false,
                      __zipValidityState: "pending" as const,
                    }
                  : i
              )
            );
          }}
          placeholder={field.placeholder}
          isInvalid={!!displayFieldError && displayFieldError !== "State does not match zipcode"}
          selectedStateAbbreviation={
            (item as unknown as Record<string, string>)["state"] ?? undefined
          }
          onSuggestionSelect={suggestion => {
            const latestItems = answers[arrayKey] as Array<Record<string, unknown>>;
            if (!latestItems || !Array.isArray(latestItems)) return;
            const currentItem = latestItems.find(i => i.id === itemId);
            const currentState = (currentItem?.state as string) ?? "";
            const mismatch =
              currentState !== "" &&
              suggestion.stateAbbreviation.toUpperCase() !== currentState.toUpperCase();
            const resolvedStateFips = (() => {
              if (
                suggestion.stateAbbreviation &&
                currentState &&
                suggestion.stateAbbreviation.toUpperCase() === currentState.toUpperCase()
              ) {
                return suggestion.stateFips ?? "";
              }
              return (
                stateOptions?.find(s => s.id.toUpperCase() === currentState.toUpperCase())
                  ?.stateFips ?? ""
              );
            })();
            onAnswerChange(
              arrayKey,
              latestItems.map(i =>
                i.id === itemId
                  ? {
                      ...i,
                      [field.name]: suggestion.zip,
                      stateFips: resolvedStateFips,
                      __zipStateAbbreviation: suggestion.stateAbbreviation,
                      __zipStateFips: suggestion.stateFips ?? "",
                      __zipIsValid: !mismatch,
                      __zipValidityState: (mismatch
                        ? "state_mismatch"
                        : "valid") as ZipValidityState,
                    }
                  : i
              )
            );
          }}
          onValidityChange={(isValid: boolean, zipValidityState) => {
            const latestItems = answers[arrayKey] as Array<Record<string, unknown>>;
            if (!latestItems || !Array.isArray(latestItems)) return;
            const current = latestItems.find(i => i.id === itemId);
            if (
              !current ||
              (current.__zipIsValid === isValid && current.__zipValidityState === zipValidityState)
            )
              return;
            onAnswerChange(
              arrayKey,
              latestItems.map(i =>
                i.id === itemId
                  ? { ...i, __zipIsValid: isValid, __zipValidityState: zipValidityState }
                  : i
              )
            );
            const currentIndex = latestItems.findIndex(i => i.id === itemId);
            if (currentIndex === -1) return;
            const stateFieldKey = `${arrayKey}.${currentIndex}.state`;
            const zipFieldKey = `${arrayKey}.${currentIndex}.zipCode`;
            if (zipValidityState === "state_mismatch") {
              onErrorChange?.({
                [stateFieldKey]: "State does not match zipcode",
                [zipFieldKey]: "",
              });
            } else if (zipValidityState === "invalid_zip") {
              onErrorChange?.({
                [stateFieldKey]: "State does not match zipcode",
                [zipFieldKey]: "Incorrect zip code",
              });
            } else {
              onErrorChange?.({ [stateFieldKey]: "", [zipFieldKey]: "" });
            }
          }}
        />
        {displayFieldError && displayFieldError !== "State does not match zipcode" && (
          <span className="text-sm text-ws-error-600">{displayFieldError}</span>
        )}
      </div>
    );
  }

  return (
    <div className={cx("flex flex-col gap-1.5", widthClass)}>
      <Input
        size="md"
        label={field.label}
        placeholder={field.placeholder}
        type="text"
        value={(item as unknown as Record<string, string>)[field.name] ?? ""}
        pattern={field.pattern}
        isInvalid={hasError}
        tooltip={displayFieldError ?? undefined}
        onChange={(val: string) => updateField(field.name, val)}
      />
      {displayFieldError && <span className="text-sm text-ws-error-600">{displayFieldError}</span>}
    </div>
  );
};

// ─── ConditionalQuestion ──────────────────────────────────────────────────────

interface ConditionalQuestionProps {
  conditionalConfig: NonNullable<Question["conditionalQuestion"]>;
  parentKey: string;
  answers: Record<string, unknown>;
  errors: Record<string, string>;
  onAnswerChange: (key: string, value: unknown) => void;
  onErrorChange?: (updates: Record<string, string>) => void;
  stateOptions?: StateOption[];
  addArrayItem: (key: string) => void;
  removeArrayItem: (key: string, itemId: number) => void;
}

const ConditionalQuestion = ({
  conditionalConfig,
  parentKey,
  answers,
  errors,
  onAnswerChange,
  onErrorChange,
  stateOptions,
  addArrayItem,
  removeArrayItem,
}: ConditionalQuestionProps): React.ReactNode => {
  const { showWhen, question: conditionalQuestion } = conditionalConfig;
  const parentValue = answers[parentKey];

  if (!computeShouldShow(String(showWhen), parentValue)) return null;

  const isArrayAnswer = Array.isArray(answers[conditionalQuestion.key]);
  const arrayAnswer = isArrayAnswer ? (answers[conditionalQuestion.key] as string[]) : [];

  const sharedProps = {
    answers,
    errors,
    onAnswerChange,
    onErrorChange,
    stateOptions,
    addArrayItem,
    removeArrayItem,
  };

  return (
    <div className="flex w-full flex-col gap-4 pl-6 mt-4">
      <Label
        isRequired={conditionalQuestion.isRequired}
        className="text-ws-text-primary custom-label"
      >
        {conditionalQuestion.questionText}
      </Label>

      {conditionalQuestion.questionType === "TEXT_INPUT" && (
        <>
          <Input
            type="text"
            placeholder={conditionalQuestion.placeholder}
            value={String(answers[conditionalQuestion.key] || "")}
            onChange={value => onAnswerChange(conditionalQuestion.key, value)}
            size="md"
            maxLength={conditionalQuestion.validationRules?.maxLength}
            isInvalid={errors[conditionalQuestion.key] ? true : false}
            tooltip={errors[conditionalQuestion.key] ? errors[conditionalQuestion.key] : undefined}
          />
          {errors[conditionalQuestion.key] && (
            <span className="text-sm text-ws-error-600">{errors[conditionalQuestion.key]}</span>
          )}
        </>
      )}

      {conditionalQuestion.questionType === "NUMBER_INPUT" && (
        <>
          <Input
            type="text"
            placeholder={conditionalQuestion.placeholder || "Enter number"}
            inputMode="numeric"
            value={String(answers[conditionalQuestion.key] ?? "")}
            className={
              HALF_WIDTH_CONDITIONAL_NUMERIC_KEYS.has(conditionalQuestion.key)
                ? "w-full md:w-1/2"
                : "w-full"
            }
            onChange={value => {
              const filtered = value.replace(/[^0-9]/g, "");
              const numValue = filtered === "" ? null : Number(filtered);
              if (numValue !== null) {
                if (
                  conditionalQuestion.validationRules?.min !== undefined &&
                  numValue < conditionalQuestion.validationRules.min
                )
                  return;
                if (
                  conditionalQuestion.validationRules?.max !== undefined &&
                  numValue > conditionalQuestion.validationRules.max
                )
                  return;
              }
              onAnswerChange(conditionalQuestion.key, numValue);
            }}
            size="md"
            isInvalid={errors[conditionalQuestion.key] ? true : false}
            tooltip={errors[conditionalQuestion.key] ? errors[conditionalQuestion.key] : undefined}
          />
          {errors[conditionalQuestion.key] && (
            <span className="text-sm text-ws-error-600">{errors[conditionalQuestion.key]}</span>
          )}
        </>
      )}

      {conditionalQuestion.questionType === "SINGLE_SELECT_DROPDOWN" && (
        <>
          <Select
            className={
              HALF_WIDTH_CONDITIONAL_SELECT_KEYS.has(conditionalQuestion.key)
                ? "w-full md:w-1/2"
                : "w-full"
            }
            size="md"
            placeholder={conditionalQuestion.placeholder || "Select an option"}
            items={conditionalQuestion.options?.map(opt => ({
              id: opt.value,
              label: opt.label,
            }))}
            selectedKey={
              answers[conditionalQuestion.key] ? String(answers[conditionalQuestion.key]) : ""
            }
            onSelectionChange={key => onAnswerChange(conditionalQuestion.key, key as string)}
            isInvalid={errors[conditionalQuestion.key] ? true : false}
          >
            {(item: SelectItemType) => <Select.Item id={item.id}>{item.label || ""}</Select.Item>}
          </Select>
          {errors[conditionalQuestion.key] && (
            <span className="text-sm text-ws-error-600">{errors[conditionalQuestion.key]}</span>
          )}
          {conditionalQuestion.conditionalQuestion && (
            <ConditionalQuestion
              conditionalConfig={conditionalQuestion.conditionalQuestion}
              parentKey={conditionalQuestion.key}
              {...sharedProps}
            />
          )}
        </>
      )}

      {conditionalQuestion.questionType === "MULTIPLE_CHOICE" && (
        <>
          <div className="flex flex-col gap-4 custom-question-options">
            {conditionalQuestion.options?.map((option: QuestionOption) => (
              <Checkbox
                key={option.value}
                label={option.label}
                className="font-normal"
                isSelected={isArrayAnswer && arrayAnswer.includes(option.value)}
                onChange={isChecked => {
                  const current = isArrayAnswer
                    ? (answers[conditionalQuestion.key] as string[])
                    : [];
                  const next = isChecked
                    ? [...current, option.value]
                    : current.filter((v: string) => v !== option.value);
                  onAnswerChange(conditionalQuestion.key, next);
                }}
              />
            ))}
          </div>
          {errors[conditionalQuestion.key] && (
            <span className="text-sm text-ws-error-600">{errors[conditionalQuestion.key]}</span>
          )}
        </>
      )}

      {conditionalQuestion.questionType === "STRUCTURED_ARRAY" &&
        (() => {
          const conditionalKey = conditionalQuestion.key;
          const currentItems = (answers[conditionalKey] as Array<{ id: number }>) || [];
          const maxItems = conditionalQuestion.validationRules?.maxItems || 5;
          const canAddMore = currentItems.length < maxItems;

          if (currentItems.length === 0) {
            const newArray = [{ id: generateId() }];
            onAnswerChange(conditionalKey, newArray);
            return null;
          }

          return (
            <div className="flex flex-col gap-4">
              {currentItems.map((item, index) => (
                <div key={item.id} className="flex w-full gap-4">
                  {conditionalQuestion.validationRules.fields?.map(
                    (field: StructuredArrayFieldDef) => (
                      <StructuredArrayField
                        key={`${conditionalKey}-${item.id}-${field.name}`}
                        field={field}
                        index={index}
                        arrayKey={conditionalKey}
                        answers={answers}
                        errors={errors}
                        onAnswerChange={onAnswerChange}
                        onErrorChange={onErrorChange}
                        stateOptions={stateOptions}
                      />
                    )
                  )}
                  {currentItems.length > 1 && (
                    <Button
                      color="tertiary"
                      size="md"
                      iconLeading={Trash01}
                      onClick={() => removeArrayItem(conditionalKey, item.id)}
                      className="mt-6 h-10 shrink-0 px-2 bg-tertiary *:data-icon:text-ws-navy-800 border border-ws-navy-800"
                      aria-label="Remove item"
                    />
                  )}
                </div>
              ))}
              {canAddMore && (
                <Button
                  color="tertiary"
                  size="md"
                  iconLeading={Plus}
                  onClick={() => addArrayItem(conditionalKey)}
                  className="max-w-60 text-sm font-semibold text-ws-navy-800 border border-ws-navy-800"
                >
                  Add another location
                </Button>
              )}
            </div>
          );
        })()}
    </div>
  );
};

// ─── GroupedMultipleChoiceOptions ─────────────────────────────────────────────

interface GroupedMultipleChoiceOptionsProps {
  optionGroups: OptionGroup[];
  questionKey: string;
  currentSelections: string[];
  onAnswerChange: (key: string, value: unknown) => void;
}

const GroupedMultipleChoiceOptions = ({
  optionGroups,
  questionKey,
  currentSelections,
  onAnswerChange,
}: GroupedMultipleChoiceOptionsProps) => (
  <>
    {optionGroups.map((group: OptionGroup) => {
      const exclusiveOption = group.options.find((o: QuestionOption) =>
        EXCLUSIVE_BENEFIT_OPTIONS.has(o.label)
      );
      const isExclusiveSelected =
        !!exclusiveOption && currentSelections.includes(exclusiveOption.value);

      return (
        <div key={group.groupName} className="flex flex-col gap-3">
          <h3 className="text-sm font-normal text-ws-text-primary">{group.groupName}</h3>
          <div className="flex flex-col gap-4 pl-2 font-normal text-ws-text-secondary">
            {group.options.map((option: QuestionOption) => {
              const isThisExclusive = EXCLUSIVE_BENEFIT_OPTIONS.has(option.label);
              const isOptionDisabled = isExclusiveSelected && !isThisExclusive;

              return (
                <Checkbox
                  key={option.value}
                  className="font-normal"
                  label={option.label}
                  tooltipText={OPTION_TOOLTIPS[option.label]}
                  isDisabled={isOptionDisabled}
                  isSelected={currentSelections.includes(option.value)}
                  onChange={isChecked => {
                    const current = [...currentSelections];
                    if (isChecked) {
                      if (isThisExclusive) {
                        const groupValues = new Set(
                          group.options.map((o: QuestionOption) => o.value)
                        );
                        onAnswerChange(questionKey, [
                          ...current.filter(v => !groupValues.has(v)),
                          option.value,
                        ]);
                      } else {
                        const withoutExclusive = exclusiveOption
                          ? current.filter(v => v !== exclusiveOption.value)
                          : current;
                        onAnswerChange(questionKey, [...withoutExclusive, option.value]);
                      }
                    } else {
                      onAnswerChange(
                        questionKey,
                        current.filter((v: string) => v !== option.value)
                      );
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      );
    })}
  </>
);

interface DynamicQuestionRendererProps {
  question: Question;
  answers: Record<string, unknown>;
  onAnswerChange: (key: string, value: unknown) => void;
  errors: Record<string, string>;
  subsectionDisplayOrder?: number;
  /** Called to push real-time field-level errors up to the parent (DynamicTab) */
  onErrorChange?: (updates: Record<string, string>) => void;
  stateOptions?: StateOption[];
}

export const DynamicQuestionRenderer = ({
  question,
  answers,
  onAnswerChange,
  errors,
  subsectionDisplayOrder,
  onErrorChange,
  stateOptions,
}: DynamicQuestionRendererProps) => {
  const currentAnswer = answers[question.key];
  const error = errors[question.key];
  const displayOrder = subsectionDisplayOrder ?? question.displayOrder;

  const handlePercentageChange = useCallback(
    (value: string, subFieldKey: string) => {
      const digitsOnly = value.replace(/[^0-9]/g, "");

      const currentObj =
        currentAnswer && typeof currentAnswer === "object" && !Array.isArray(currentAnswer)
          ? (currentAnswer as Record<string, unknown>)
          : {};

      if (digitsOnly === "") {
        onAnswerChange(question.key, {
          ...currentObj,
          [subFieldKey]: null,
        });
        return;
      }

      const numValue = Number(digitsOnly);

      // if (isNaN(numValue) || numValue > 100) return;
      if (Number.isNaN(numValue) || numValue > 100) return;

      onAnswerChange(question.key, {
        ...currentObj,
        [subFieldKey]: numValue,
      });
    },
    [currentAnswer, onAnswerChange, question.key]
  );

  useEffect(() => {
    console.debug(`[DynamicQuestionRenderer] Mounted: ${question.key}`, {
      questionKey: question.key,
      questionType: question.questionType,
      timestamp: Date.now(),
    });

    return () => {
      console.debug(`[DynamicQuestionRenderer] Unmounted: ${question.key}`, {
        questionKey: question.key,
        timestamp: Date.now(),
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getArrayItems = (key: string) => {
    const items = answers[key];
    if (!items || !Array.isArray(items) || items.length === 0) {
      const newArray = [{ id: generateId() }];
      onAnswerChange(key, newArray);
      return newArray;
    }
    return items;
  };

  const addArrayItem = useCallback(
    (key: string) => {
      const currentItems = answers[key];

      if (!currentItems || !Array.isArray(currentItems) || currentItems.length === 0) {
        onAnswerChange(key, [{ id: generateId() }]);
        return;
      }

      onAnswerChange(key, [...currentItems, { id: generateId() }]);
    },
    [answers, onAnswerChange]
  );

  const removeArrayItem = (key: string, itemId: number) => {
    const currentItems = getArrayItems(key);
    onAnswerChange(
      key,
      currentItems.filter((item: { id: number }) => item.id !== itemId)
    );
  };

  const conditionalProps = {
    answers,
    errors,
    onAnswerChange,
    onErrorChange,
    stateOptions,
    addArrayItem,
    removeArrayItem,
  };

  useEffect(() => {
    if (question.questionType === "RANKING" && question.dynamicOptions?.sourceField) {
      const sourceField = question.dynamicOptions.sourceField;
      const selectedGoals = answers[sourceField];

      if (
        Array.isArray(selectedGoals) &&
        selectedGoals.length >= 3 &&
        (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0))
      ) {
        onAnswerChange(question.key, selectedGoals.slice(0, 3));
      }
    }
  }, [
    question.questionType,
    question.dynamicOptions,
    question.key,
    answers,
    currentAnswer,
    onAnswerChange,
  ]);

  switch (question.questionType) {
    case "SINGLE_SELECT":
      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-ws-text-primary custom-label">
            {displayOrder}. {question.questionText}
          </Label>
          {error && (
            <div className="flex items-center gap-2">
              <InputInfo className="text-ws-error-600" />
              <span className="text-sm text-ws-error-600">{error}</span>
            </div>
          )}
          <RadioGroup
            aria-label={question.questionText}
            className="font-normal"
            value={String(currentAnswer || "")}
            onChange={value => onAnswerChange(question.key, value)}
          >
            {/* <div className="flex w-full flex-col gap-4 custom-question-options">
              {question.options?.map(option => (
                <RadioButton key={option.value} label={option.label} value={option.value} />
              ))}
            </div> */}
            <div className="flex w-full flex-col gap-4 custom-question-options">
              {question.options?.map(option => (
                <React.Fragment key={option.value}>
                  <RadioButton label={option.label} value={option.value} className="test91" />
                  {/* Render conditional inline after the matching option */}
                  {question.conditionalQuestion &&
                    String(question.conditionalQuestion.showWhen).toLowerCase() ===
                      option.value.toLowerCase() && (
                      <ConditionalQuestion
                        conditionalConfig={question.conditionalQuestion}
                        parentKey={question.key}
                        {...conditionalProps}
                      />
                    )}
                </React.Fragment>
              ))}
            </div>
          </RadioGroup>
        </div>
      );
    case "SINGLE_SELECT_DROPDOWN":
      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-ws-text-primary custom-label">
            {displayOrder}. {question.questionText}
          </Label>
          <Select
            className={
              HALF_WIDTH_SELECT_KEYS.has(question.key)
                ? "w-full md:w-1/2 custom-input"
                : "w-full custom-input"
            }
            size="md"
            placeholder={question.placeholder || "Select an option"}
            items={question.options?.map(opt => ({
              id: opt.value,
              label: opt.label,
            }))}
            selectedKey={currentAnswer ? String(currentAnswer) : ""}
            onSelectionChange={key => {
              console.debug("[DynamicQuestionRenderer] Option changed:", {
                questionKey: question.key,
                newValue: key,
                previousValue: currentAnswer,
                timestamp: Date.now(),
              });
              onAnswerChange(question.key, key as string);
            }}
            isInvalid={error ? true : false}
          >
            {(item: SelectItemType) => (
              <Select.Item className="text-ws-text-secondary" id={item.id}>
                {item.label || ""}
              </Select.Item>
            )}
          </Select>
          {error && (
            <div className="flex items-center gap-2">
              <InputInfo className="text-ws-error-600" />
              <span className="text-sm text-ws-error-600">{error}</span>
            </div>
          )}
          {question.conditionalQuestion && (
            <ConditionalQuestion
              conditionalConfig={question.conditionalQuestion}
              parentKey={question.key}
              {...conditionalProps}
            />
          )}
        </div>
      );
    case "MULTIPLE_CHOICE":
      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <Label
            isRequired={question.isRequired}
            className="text-ws-text-primary font-normal custom-label"
          >
            {displayOrder}. {question.questionText}
          </Label>
          {error && (
            <div className="flex items-center gap-2">
              <InputInfo className="text-ws-error-600" />
              <span className="text-sm text-ws-error-600">{error}</span>
            </div>
          )}
          <div className="flex flex-col gap-4 custom-question-options">
            {(question.key === "workforceGoals" || question.key === "supplementalBenefits") &&
            question.optionGroups ? (
              <GroupedMultipleChoiceOptions
                optionGroups={question.optionGroups}
                questionKey={question.key}
                currentSelections={Array.isArray(currentAnswer) ? currentAnswer : []}
                onAnswerChange={onAnswerChange}
              />
            ) : (
              question.options?.map((option: QuestionOption) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  className="font-normal"
                  isSelected={
                    (Array.isArray(currentAnswer) && currentAnswer.includes(option.value)) || false
                  }
                  onChange={isChecked => {
                    const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                    if (isChecked) {
                      onAnswerChange(question.key, [...current, option.value]);
                    } else {
                      onAnswerChange(
                        question.key,
                        current.filter((v: string) => v !== option.value)
                      );
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      );

    case "YES_NO": {
      const boolValue = answers[question.key];
      const showWhen = question.conditionalQuestion?.showWhen;
      // Determine if conditional should show after "Yes" or after "No"
      const showAfterYes = showWhen === "yes" && boolValue === true && question.conditionalQuestion;
      const showAfterNo = showWhen === "no" && boolValue === false && question.conditionalQuestion;
      // For non-yes/no showWhen values, fall back to showing after the radio group
      const showAfterGroup =
        question.conditionalQuestion && showWhen !== "yes" && showWhen !== "no";

      return (
        <div
          className={cx(
            "flex flex-col gap-2",
            HALF_WIDTH_YES_NO_KEYS.has(question.key) ? "w-full md:w-1/2" : "w-full"
          )}
          data-question-key={question.key}
        >
          <Label isRequired={question.isRequired} className="text-ws-text-primary custom-label">
            {displayOrder}. {question.questionText}
            {QUESTION_TOOLTIPS[question.key] && (
              <Tooltip title={QUESTION_TOOLTIPS[question.key]} placement="top" arrow={true}>
                <TooltipTrigger
                  isDisabled={false}
                  className="cursor-pointer text-ws-gray-400 transition duration-200 hover:text-ws-gray-600 ml-1 inline-flex align-middle"
                >
                  <InfoCircle className="size-4" />
                </TooltipTrigger>
              </Tooltip>
            )}
          </Label>
          {error && (
            <div className="flex items-center gap-2">
              <InputInfo className="text-ws-error-600" />
              <span className="text-sm text-ws-error-600">{error}</span>
            </div>
          )}
          {/* {error && <span className="text-sm text-ws-error-600">{error}</span>} */}
          <div className="flex w-full flex-col gap-4 custom-question-options">
            <RadioGroup
              aria-label={question.questionText}
              className="font-normal"
              value={boolValue === true ? "true" : boolValue === false ? "false" : ""}
              onChange={val => {
                const booleanValue = val === "true" ? true : val === "false" ? false : null;
                onAnswerChange(question.key, booleanValue);
              }}
            >
              <RadioButton value="true" label="Yes" className="font-normal" />
              {showAfterYes && (
                <ConditionalQuestion
                  conditionalConfig={question.conditionalQuestion!}
                  parentKey={question.key}
                  {...conditionalProps}
                />
              )}
              <RadioButton value="false" label="No" className="font-normal" />
              {showAfterNo && (
                <ConditionalQuestion
                  conditionalConfig={question.conditionalQuestion!}
                  parentKey={question.key}
                  {...conditionalProps}
                />
              )}
            </RadioGroup>
          </div>
          {showAfterGroup && (
            <ConditionalQuestion
              conditionalConfig={question.conditionalQuestion!}
              parentKey={question.key}
              {...conditionalProps}
            />
          )}
        </div>
      );
    }

    case "NUMERIC":
    case "NUMBER_INPUT":
      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-ws-text-primary custom-label">
            {displayOrder}. {question.questionText}
          </Label>
          <Input
            className={
              HALF_WIDTH_NUMERIC_KEYS.has(question.key)
                ? "w-full md:w-1/2 custom-input"
                : "w-full custom-input"
            }
            type="text"
            inputMode="numeric"
            placeholder={question.placeholder || "Enter number"}
            value={String(currentAnswer ?? "")}
            onChange={value => {
              const filtered = value.replace(/[^0-9]/g, "");
              if (filtered === "") {
                onAnswerChange(question.key, null);
                return;
              }
              const numValue = Number(filtered);
              if (
                question.validationRules?.min !== undefined &&
                numValue < question.validationRules.min
              )
                return;
              if (
                question.validationRules?.max !== undefined &&
                numValue > question.validationRules.max
              )
                return;
              onAnswerChange(question.key, numValue);
            }}
            size="md"
            isInvalid={error ? true : false}
            tooltip={error ? error : undefined}
          />
          {error && (
            <div className="flex items-center gap-2">
              <InputInfo className="text-ws-error-600" />
              <span className="text-sm text-ws-error-600">{error}</span>
            </div>
          )}
        </div>
      );

    case "TEXT_INPUT":
      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-ws-text-primary custom-label">
            {displayOrder}. {question.questionText}
          </Label>
          <Input
            type="text"
            placeholder={question.placeholder}
            value={String(currentAnswer || "")}
            onChange={value => onAnswerChange(question.key, value)}
            size="md"
            maxLength={question.validationRules?.maxLength}
            isInvalid={error ? true : false}
          />
          {error && <span className="text-sm text-ws-error-600">{error}</span>}
        </div>
      );

    case "STRUCTURED_ARRAY": {
      const currentItems = (answers[question.key] as Array<{ id: number }>) || [];
      const maxItems = question.validationRules?.maxItems || 5;
      const canAddMore = currentItems.length < maxItems;
      if (!question.validationRules?.fields) return null;

      if (currentItems.length === 0) {
        const newArray = [{ id: generateId() }];
        onAnswerChange(question.key, newArray);
        return null;
      }

      return (
        <div className="flex w-full flex-col gap-4" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-ws-text-primary custom-label">
            {displayOrder}. {question.questionText}
          </Label>

          {currentItems.map((item: { id: number }, index: number) => (
            <div key={(item as { id: number }).id} className="flex w-full gap-4 custom-input">
              {question.validationRules.fields!.map(field => (
                <StructuredArrayField
                  key={`${question.key}-${(item as { id: number }).id}-${field.name}`}
                  field={field}
                  index={index}
                  arrayKey={question.key}
                  answers={answers}
                  errors={errors}
                  onAnswerChange={onAnswerChange}
                  onErrorChange={onErrorChange}
                  stateOptions={stateOptions}
                />
              ))}
              {currentItems.length > 1 && (
                <Button
                  color="tertiary"
                  size="md"
                  iconLeading={Trash01}
                  onClick={() => removeArrayItem(question.key, (item as { id: number }).id)}
                  className="mt-6 h-10 shrink-0 px-2 bg-tertiary *:data-icon:text-ws-navy-800 border border-ws-navy-800"
                  aria-label="Remove item"
                />
              )}
            </div>
          ))}

          {canAddMore && (
            <Button
              color="tertiary"
              size="md"
              iconLeading={Plus}
              onClick={() => addArrayItem(question.key)}
              className={cx(
                "max-w-60 text-sm font-semibold text-ws-navy-800 border border-ws-navy-800",
                error && "border-ws-error-600"
              )}
            >
              {question.key === "topWorkLocations"
                ? "Add another location"
                : "Add another occupation"}
            </Button>
          )}

          {error && <span className="text-sm text-ws-error-600">{error}</span>}
        </div>
      );
    }

    case "PARTICIPATION_RATES":
      return (
        <div className="flex flex-col gap-2" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-ws-text-primary custom-label">
            {displayOrder}. {question.questionText}
          </Label>
          <div className="flex flex-col gap-2 custom-question-options mt-2">
            {question.subFields?.map(subField => {
              const subFieldValue =
                currentAnswer && typeof currentAnswer === "object" && !Array.isArray(currentAnswer)
                  ? (currentAnswer as Record<string, unknown>)[subField.key]
                  : undefined;

              const subFieldError = errors?.[`${question.key}.${subField.key}`] ?? "";

              return (
                <div
                  key={subField.key}
                  className="flex items-start justify-between gap-6 flex-col md:flex-row"
                >
                  <span className="text-sm font-medium text-ws-text-primary">{subField.label}</span>
                  <div className="flex flex-col gap-1 w-full max-w-xs">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Percentage"
                      size="md"
                      value={
                        subFieldValue != null && subFieldValue !== "" ? `${subFieldValue}%` : ""
                      }
                      onChange={(value: string) => handlePercentageChange(value, subField.key)}
                      isInvalid={!!subFieldError}
                      tooltip={subFieldError || undefined}
                      helperTooltip={`Expected '<25%' | '26-50%' | '51-75%' | '76%+', received number`}
                    />
                    {!subFieldError && (
                      <span className="text-xs text-ws-text-tertiary">i.e. 30%</span>
                    )}
                    {subFieldError && (
                      <div className="flex items-center gap-1">
                        {/* <InputInfo className="text-ws-error-600" /> */}
                        <span className="text-sm text-ws-error-600 font-normal">
                          {subFieldError}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    case "RANKING": {
      const sourceField = question.dynamicOptions?.sourceField;
      if (!sourceField) {
        return (
          <div className="text-ws-error-600">
            RANKING question requires dynamicOptions.sourceField configuration
          </div>
        );
      }

      const selectedGoals = answers[sourceField];
      const selectedGoalsArray = Array.isArray(selectedGoals) ? selectedGoals : [];

      const goalsSection = questionData.sections.find(section => section.name === "Goals");
      const workforceGoalsQuestion = goalsSection?.questions.find(q => q.key === sourceField);

      const allWorkforceOptions: Array<{ label: string; value: string }> = [];
      if (workforceGoalsQuestion?.options) {
        workforceGoalsQuestion.options.forEach(opt => {
          allWorkforceOptions.push({
            label: opt.label,
            value: opt.value,
          });
        });
      }

      const availableOptions = allWorkforceOptions.filter(opt =>
        selectedGoalsArray.includes(opt.value)
      );

      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <RankingList
            label={question.questionText}
            isRequired={question.isRequired}
            displayOrder={displayOrder}
            availableOptions={availableOptions}
            value={(currentAnswer as string[]) || []}
            onChange={value => onAnswerChange(question.key, value)}
            error={error}
            maxItems={question.validationRules?.maxItems || 3}
          />
        </div>
      );
    }

    default:
      return (
        <div className="text-ws-error-600">Unsupported question type: {question.questionType}</div>
      );
  }
};
