import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Select } from "@/components/base/select/select";
import type { SelectItemType } from "@/components/base/select/select";
import { Button } from "@/components/base/buttons/button";
import { Plus, Trash01, InfoCircle } from "@untitledui/icons";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import type { Question, OptionGroup, QuestionOption } from "@/types/questionTypes";
import { cx } from "@/utils/cx";
import { RankingList } from "../common/RankList";
import React, { useEffect } from "react";
import questionData from "@/data/assessment/questionData.json";

// Helper to generate unique IDs
let idCounter = 0;
const generateId = () => ++idCounter;

interface DynamicQuestionRendererProps {
  question: Question;
  answers: Record<string, unknown>;
  onAnswerChange: (key: string, value: unknown) => void;
  errors: Record<string, string>;
}

export const DynamicQuestionRenderer = ({
  question,
  answers,
  onAnswerChange,
  errors,
}: DynamicQuestionRendererProps) => {
  const currentAnswer = answers[question.key];
  const error = errors[question.key];

  // Helper to manage STRUCTURED_ARRAY items
  const getArrayItems = (key: string) => {
    const items = answers[key];
    if (!items || !Array.isArray(items) || items.length === 0) {
      return [{ id: generateId() }];
    }
    return items;
  };

  const addArrayItem = (key: string) => {
    const currentItems = getArrayItems(key);
    onAnswerChange(key, [...currentItems, { id: generateId() }]);
  };

  const removeArrayItem = (key: string, itemId: number) => {
    const currentItems = getArrayItems(key);
    onAnswerChange(
      key,
      currentItems.filter((item: { id: number }) => item.id !== itemId)
    );
  };

  const updateArrayItemField = (
    key: string,
    itemId: number,
    field: string,
    value: unknown,
    fieldType?: string
  ) => {
    const currentItems = getArrayItems(key);

    // Convert value to correct type based on field type
    let convertedValue = value;
    if (fieldType === "number") {
      convertedValue = value === "" || value === null ? null : Number(value);
    } else if (fieldType === "text") {
      convertedValue = String(value || "");
    }

    onAnswerChange(
      key,
      currentItems.map((item: { id: number }) =>
        item.id === itemId ? { ...item, [field]: convertedValue } : item
      )
    );
  };

  // Render field for STRUCTURED_ARRAY
  const renderStructuredArrayField = (
    field: {
      name: string;
      type: string;
      label: string;
      placeholder?: string;
      width?: string;
      options?: Array<{ id: string; label: string }>;
      pattern?: string;
    },
    index: number,
    _showRemoveButton: boolean,
    _onRemove: () => void,
    arrayKey?: string
  ) => {
    const keyToUse = arrayKey || question.key;
    const currentItems = getArrayItems(keyToUse);
    const item = currentItems[index] || {};
    const widthClass = field.width || "flex-1";

    return (
      <div
        key={`${keyToUse}-${(item as { id: number }).id}-${field.name}`}
        className={cx("flex flex-col gap-1.5", widthClass)}
      >
        {field.type === "select" ? (
          <Select
            className="w-full flex items-start"
            key={field.name}
            size="md"
            label={field.label}
            placeholder={field.placeholder}
            items={field.options?.map(opt => ({ id: opt.id, label: opt.label }))}
            selectedKey={(item as Record<string, string>)[field.name] || ""}
            onSelectionChange={key =>
              updateArrayItemField(
                keyToUse,
                (item as { id: number }).id,
                field.name,
                key as string,
                "text"
              )
            }
          >
            {(selectItem: SelectItemType) => (
              <Select.Item id={selectItem.id}>{selectItem.label || ""}</Select.Item>
            )}
          </Select>
        ) : (
          <Input
            key={field.name}
            size="md"
            label={field.label}
            placeholder={field.placeholder}
            type={field.name === "zipCode" ? "text" : "text"}
            inputMode={field.name === "zipCode" ? "numeric" : undefined}
            value={(item as Record<string, string>)[field.name] ?? ""}
            pattern={field.name === "zipCode" ? "\\d{5}" : field.pattern}
            maxLength={field.name === "zipCode" ? 5 : undefined}
            onChange={(val: string) => {
              if (field.name !== "zipCode" || /^\d{0,5}$/.test(val)) {
                updateArrayItemField(
                  keyToUse,
                  (item as { id: number }).id,
                  field.name,
                  val,
                  field.type
                );
              }
            }}
          />
        )}
      </div>
    );
  };

  // Helper to update object-valued question (PARTICIPATION_RATES)
  const updateObjectField = (parentKey: string, fieldKey: string, value: unknown) => {
    const current = (answers[parentKey] as Record<string, unknown>) || {};
    onAnswerChange(parentKey, { ...current, [fieldKey]: value });
  };

  // ✅ NEW: Recursive helper to render nested conditional questions
  const renderConditionalQuestion = (
    conditionalConfig: Question["conditionalQuestion"],
    parentKey: string
  ): React.ReactNode => {
    if (!conditionalConfig) return null;

    const { showWhen, question: conditionalQuestion } = conditionalConfig;
    const parentValue = answers[parentKey];

    // Determine if the condition is met
    let shouldShow = false;

    if (showWhen === "yes") {
      shouldShow = parentValue === true;
    } else if (showWhen === "no") {
      shouldShow = parentValue === false;
    } else {
      // For other values (dropdown etc.) compare as strings
      shouldShow = String(parentValue) === String(showWhen);
    }

    if (!shouldShow) return null;

    // Safe typed helpers for array-based answers
    const isArrayAnswer = Array.isArray(answers[conditionalQuestion.key]);
    const arrayAnswer = isArrayAnswer ? (answers[conditionalQuestion.key] as string[]) : [];

    return (
      <div className="flex w-full flex-col gap-4 pl-6 mt-4">
        <Label className="text-base text-gray-900">
          {conditionalQuestion.displayOrder}. {conditionalQuestion.questionText}
        </Label>

        {/* TEXT_INPUT */}
        {conditionalQuestion.questionType === "TEXT_INPUT" && (
          <>
            <Input
              type="text"
              placeholder={conditionalQuestion.placeholder}
              value={String(answers[conditionalQuestion.key] || "")}
              onChange={value => onAnswerChange(conditionalQuestion.key, value)}
              size="md"
              maxLength={conditionalQuestion.validationRules?.maxLength}
            />
            {errors[conditionalQuestion.key] && (
              <span className="text-sm text-red-600">{errors[conditionalQuestion.key]}</span>
            )}
          </>
        )}

        {/* SINGLE_SELECT_DROPDOWN */}
        {conditionalQuestion.questionType === "SINGLE_SELECT_DROPDOWN" && (
          <>
            <Select
              className="w-full"
              size="md"
              placeholder={conditionalQuestion.placeholder || "Select an option"}
              items={conditionalQuestion.options?.map(opt => ({
                id: opt.value,
                label: opt.label,
              }))}
              selectedKey={String(answers[conditionalQuestion.key] || "")}
              onSelectionChange={key => onAnswerChange(conditionalQuestion.key, key as string)}
            >
              {(item: SelectItemType) => <Select.Item id={item.id}>{item.label || ""}</Select.Item>}
            </Select>
            {errors[conditionalQuestion.key] && (
              <span className="text-sm text-red-600">{errors[conditionalQuestion.key]}</span>
            )}

            {/* ✅ RECURSIVELY RENDER NESTED CONDITIONAL */}
            {conditionalQuestion.conditionalQuestion &&
              renderConditionalQuestion(
                conditionalQuestion.conditionalQuestion,
                conditionalQuestion.key
              )}
          </>
        )}

        {/* MULTIPLE_CHOICE */}
        {conditionalQuestion.questionType === "MULTIPLE_CHOICE" && (
          <>
            <div className="flex flex-col gap-4">
              {conditionalQuestion.options?.map((option: QuestionOption) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
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
              <span className="text-sm text-red-600">{errors[conditionalQuestion.key]}</span>
            )}
          </>
        )}

        {/* STRUCTURED_ARRAY */}
        {conditionalQuestion.questionType === "STRUCTURED_ARRAY" && (
          <div className="flex flex-col gap-4">
            {(() => {
              const conditionalKey = conditionalQuestion.key;
              const currentItems = getArrayItems(conditionalKey);
              const maxItems = conditionalQuestion.validationRules?.maxItems || 5;
              const canAddMore = currentItems.length < maxItems;

              return (
                <>
                  {currentItems.map((item, index) => (
                    <div key={item.id} className="flex w-full gap-4 items-start">
                      {conditionalQuestion.validationRules.fields?.map((field: any) =>
                        renderStructuredArrayField(
                          field,
                          index,
                          currentItems.length > 1,
                          () => removeArrayItem(conditionalKey, item.id),
                          conditionalKey
                        )
                      )}
                      {currentItems.length > 1 && (
                        <Button
                          color="secondary"
                          size="md"
                          iconLeading={Trash01}
                          onClick={() => removeArrayItem(conditionalKey, item.id)}
                          className="mt-6 h-10 shrink-0 px-2 bg-tertiary"
                          aria-label="Remove item"
                        />
                      )}
                    </div>
                  ))}
                  {canAddMore && (
                    <Button
                      color="secondary"
                      size="md"
                      iconLeading={Plus}
                      onClick={() => addArrayItem(conditionalKey)}
                      className="max-w-60"
                    >
                      Add another location
                    </Button>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  // Handle RANKING question type - auto-populate from workforceGoals
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

  // Main render switch
  switch (question.questionType) {
    case "SINGLE_SELECT":
      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-base">
            {question.displayOrder}. {question.questionText}
          </Label>
          <RadioGroup
            aria-label={question.questionText}
            value={String(currentAnswer || "")}
            onChange={value => onAnswerChange(question.key, value)}
          >
            <div className="flex w-full flex-col gap-4">
              {question.options?.map(option => (
                <RadioButton key={option.value} label={option.label} value={option.value} />
              ))}
            </div>
          </RadioGroup>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      );

    case "SINGLE_SELECT_DROPDOWN":
      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-base">
            {question.displayOrder}. {question.questionText}
          </Label>
          <Select
            className="w-full"
            size="md"
            placeholder={question.placeholder || "Select an option"}
            items={question.options?.map(opt => ({ id: opt.value, label: opt.label }))}
            selectedKey={String(currentAnswer || "")}
            onSelectionChange={key => {
              if (!key) {
                console.error(
                  `[DynamicQuestionRenderer] Invalid selection for question: ${question.key}`
                );
                return;
              }
              onAnswerChange(question.key, key as string);
            }}
          >
            {(item: SelectItemType) => <Select.Item id={item.id}>{item.label || ""}</Select.Item>}
          </Select>

          {question.conditionalQuestion &&
            renderConditionalQuestion(question.conditionalQuestion, question.key)}

          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      );

    case "MULTIPLE_CHOICE":
      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-base">
            {question.displayOrder}. {question.questionText}
          </Label>
          <div className="flex flex-col gap-4">
            {(question.key === "workforceGoals" || question.key === "supplementalBenefits") &&
            question.optionGroups
              ? question.optionGroups.map((group: OptionGroup) => (
                  <div key={group.groupName} className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">{group.groupName}</h3>
                    <div className="flex flex-col gap-4 pl-2">
                      {group.options.map((option: QuestionOption) => (
                        <Checkbox
                          key={option.value}
                          label={option.label}
                          isSelected={
                            (Array.isArray(currentAnswer) &&
                              currentAnswer.includes(option.value)) ||
                            false
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
                      ))}
                    </div>
                  </div>
                ))
              : question.options?.map((option: QuestionOption) => (
                  <Checkbox
                    key={option.value}
                    label={option.label}
                    isSelected={
                      (Array.isArray(currentAnswer) && currentAnswer.includes(option.value)) ||
                      false
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
                ))}
          </div>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      );

    case "YES_NO":
      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-base">
            {question.displayOrder}. {question.questionText}
          </Label>
          <RadioGroup
            aria-label={question.questionText}
            value={currentAnswer === true ? "yes" : currentAnswer === false ? "no" : ""}
            onChange={value => onAnswerChange(question.key, value === "yes")}
          >
            <div className="flex w-full flex-col gap-4">
              <RadioButton label="Yes" value="yes" />

              {currentAnswer === true &&
                question.conditionalQuestion &&
                renderConditionalQuestion(question.conditionalQuestion, question.key)}

              <RadioButton label="No" value="no" />

              {/* ✅ RENDER CONDITIONAL FOR NO */}
              {currentAnswer === false &&
                question.conditionalQuestion &&
                renderConditionalQuestion(question.conditionalQuestion, question.key)}
            </div>
          </RadioGroup>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      );

    case "NUMERIC":
    case "NUMBER_INPUT":
      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-base">
            {question.displayOrder}. {question.questionText}
          </Label>
          <Input
            type="number"
            placeholder={question.placeholder || "Enter number"}
            value={String(currentAnswer ?? "")}
            onChange={value => {
              const numValue = value === "" ? null : Number(value);
              if (numValue !== null) {
                if (
                  question.validationRules?.min !== undefined &&
                  numValue < question.validationRules.min
                ) {
                  return;
                }
                if (
                  question.validationRules?.max !== undefined &&
                  numValue > question.validationRules.max
                ) {
                  return;
                }
              }
              onAnswerChange(question.key, numValue);
            }}
            size="md"
          />
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      );

    case "TEXT_INPUT":
      return (
        <div className="flex w-full flex-col gap-2" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-base">
            {question.displayOrder}. {question.questionText}
          </Label>
          <Input
            type="text"
            placeholder={question.placeholder}
            value={String(currentAnswer || "")}
            onChange={value => onAnswerChange(question.key, value)}
            size="md"
            maxLength={question.validationRules?.maxLength}
          />
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      );

    case "STRUCTURED_ARRAY": {
      const currentItems = getArrayItems(question.key);
      const maxItems = question.validationRules?.maxItems || 5;
      const canAddMore = currentItems.length < maxItems;

      if (!question.validationRules?.fields) return null;

      return (
        <div className="flex w-full flex-col gap-4" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-base">
            {question.displayOrder}. {question.questionText}
          </Label>

          {currentItems.map((item: { id: number }, index: number) => (
            <div key={(item as { id: number }).id} className="flex w-full gap-4 items-start">
              {question.validationRules.fields!.map(field =>
                renderStructuredArrayField(field, index, currentItems.length > 1, () =>
                  removeArrayItem(question.key, (item as { id: number }).id)
                )
              )}
              {currentItems.length > 1 && (
                <Button
                  color="secondary"
                  size="md"
                  iconLeading={Trash01}
                  onClick={() => removeArrayItem(question.key, (item as { id: number }).id)}
                  className="mt-6 h-10 shrink-0 px-2 bg-tertiary"
                  aria-label="Remove item"
                />
              )}
            </div>
          ))}

          {canAddMore && (
            <Button
              color="secondary"
              size="md"
              iconLeading={Plus}
              onClick={() => addArrayItem(question.key)}
              className="max-w-60"
            >
              Add another
            </Button>
          )}

          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      );
    }

    case "PARTICIPATION_RATES":
      return (
        <div className="flex w-full flex-col gap-4" data-question-key={question.key}>
          <Label isRequired={question.isRequired} className="text-base">
            {question.displayOrder}. {question.questionText}
          </Label>

          {question.subFields?.map(sub => {
            const answerObj = (answers[question.key] as Record<string, unknown>) || {};
            const currentVal = String(answerObj[sub.key] || "");
            return (
              <div key={sub.key} className="flex w-full items-start gap-4">
                <div className="flex w-84.75 items-center gap-2 px-3 py-2">
                  <p className="overflow-hidden text-ellipsis text-base font-medium leading-6 text-gray-800 flex items-center gap-3">
                    {sub.label}
                    <Tooltip title={sub.label}>
                      <TooltipTrigger className="group relative flex cursor-pointer">
                        <InfoCircle className="size-5 text-gray-400" />
                      </TooltipTrigger>
                    </Tooltip>
                  </p>
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <Select
                    className="w-full"
                    size="md"
                    placeholder="Select"
                    items={sub.options?.map((opt: { value: string; label: string }) => ({
                      id: opt.value,
                      label: opt.label,
                    }))}
                    selectedKey={currentVal}
                    onSelectionChange={key =>
                      updateObjectField(question.key, sub.key, key as string)
                    }
                  >
                    {(item: SelectItemType) => (
                      <Select.Item id={item.id}>{item.label || ""}</Select.Item>
                    )}
                  </Select>
                  <p className="text-sm leading-5 text-gray-600">Select a range</p>
                </div>
              </div>
            );
          })}

          {errors[question.key] && (
            <span className="text-sm text-red-600">{errors[question.key]}</span>
          )}
        </div>
      );

    case "RANKING": {
      const sourceField = question.dynamicOptions?.sourceField;
      if (!sourceField) {
        return (
          <div className="text-red-600">
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
            displayOrder={question.displayOrder}
            availableOptions={availableOptions}
            value={(currentAnswer as string[]) || []}
            onChange={value => onAnswerChange(question.key, value)}
            error={error}
          />
        </div>
      );
    }

    default:
      return <div className="text-red-500">Unsupported question type: {question.questionType}</div>;
  }
};
