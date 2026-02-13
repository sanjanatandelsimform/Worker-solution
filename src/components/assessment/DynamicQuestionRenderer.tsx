import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Select } from "@/components/base/select/select";
import type { SelectItemType } from "@/components/base/select/select";
import { Button } from "@/components/base/buttons/button";
import { Plus, Trash01, InfoCircle } from "@untitledui/icons";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import type { Question } from "@/types/questionTypes";
import { cx } from "@/utils/cx";

interface DynamicQuestionRendererProps {
  question: Question;
  answers: Record<string, unknown>;
  onAnswerChange: (key: string, value: unknown) => void;
  errors: Record<string, string>;
}

// Helper to generate unique IDs
let idCounter = 0;
const generateId = () => ++idCounter;

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
            currentAnswer === question.conditionalQuestion.showWhen &&
            question.conditionalQuestion.question.questionType === "TEXT_INPUT" && (
              <div className="flex w-full flex-col gap-2 pl-6 mt-4">
                <Label className="text-base text-gray-900">
                  {question.conditionalQuestion.question.questionText}
                </Label>
                <Input
                  type="text"
                  placeholder={question.conditionalQuestion.question.placeholder}
                  value={String(answers[question.conditionalQuestion.question.key] || "")}
                  onChange={value =>
                    onAnswerChange(question.conditionalQuestion!.question.key, value)
                  }
                  size="md"
                  maxLength={question.conditionalQuestion.question.validationRules.maxLength}
                />
                {errors[question.conditionalQuestion.question.key] && (
                  <span className="text-sm text-red-600">
                    {errors[question.conditionalQuestion.question.key]}
                  </span>
                )}
              </div>
            )}

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
            {question.options?.map(option => (
              <Checkbox
                key={option.value}
                label={option.label}
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

              {currentAnswer === true && question.conditionalQuestion?.showWhen === "yes" && (
                <div className="flex w-full flex-col gap-4 pl-6">
                  <Label className="text-base text-gray-900">
                    {question.conditionalQuestion.question.questionText}
                  </Label>

                  {question.conditionalQuestion.question.questionType === "TEXT_INPUT" && (
                    <Input
                      type="text"
                      placeholder={question.conditionalQuestion.question.placeholder}
                      value={String(answers[question.conditionalQuestion.question.key] || "")}
                      onChange={value =>
                        onAnswerChange(question.conditionalQuestion!.question.key, value)
                      }
                      size="md"
                    />
                  )}

                  {question.conditionalQuestion.question.questionType ===
                    "SINGLE_SELECT_DROPDOWN" && (
                    <Select
                      className="w-full"
                      size="md"
                      placeholder={
                        question.conditionalQuestion.question.placeholder || "Select an option"
                      }
                      items={question.conditionalQuestion.question.options?.map(opt => ({
                        id: opt.value,
                        label: opt.label,
                      }))}
                      selectedKey={String(answers[question.conditionalQuestion.question.key] || "")}
                      onSelectionChange={key =>
                        onAnswerChange(question.conditionalQuestion!.question.key, key as string)
                      }
                    >
                      {(item: SelectItemType) => (
                        <Select.Item id={item.id}>{item.label || ""}</Select.Item>
                      )}
                    </Select>
                  )}

                  {question.conditionalQuestion.question.questionType === "STRUCTURED_ARRAY" && (
                    <div className="flex flex-col gap-4">
                      {(() => {
                        const conditionalKey = question.conditionalQuestion!.question.key;
                        const currentItems = getArrayItems(conditionalKey);
                        const maxItems =
                          question.conditionalQuestion!.question.validationRules.maxItems || 5;
                        const canAddMore = currentItems.length < maxItems;

                        return (
                          <>
                            {currentItems.map((item, index) => (
                              <div key={item.id} className="flex w-full gap-4 items-start">
                                {question.conditionalQuestion!.question.validationRules.fields!.map(
                                  field =>
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
              )}

              <RadioButton label="No" value="no" />

              {currentAnswer === false && question.conditionalQuestion?.showWhen === "no" && (
                <div className="flex w-full flex-col gap-4 pl-6">
                  <Label className="text-base text-gray-900">
                    {question.conditionalQuestion.question.questionText}
                  </Label>

                  {question.conditionalQuestion.question.questionType === "STRUCTURED_ARRAY" && (
                    <div className="flex flex-col gap-4">
                      {(() => {
                        const conditionalKey = question.conditionalQuestion!.question.key;
                        const currentItems = getArrayItems(conditionalKey);
                        const maxItems =
                          question.conditionalQuestion!.question.validationRules.maxItems || 5;
                        const canAddMore = currentItems.length < maxItems;

                        return (
                          <>
                            {currentItems.map((item, index) => (
                              <div key={item.id} className="flex w-full gap-4 items-start">
                                {question.conditionalQuestion!.question.validationRules.fields!.map(
                                  field =>
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
              )}
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
              // Client-side validation for min/max
              if (numValue !== null) {
                if (
                  question.validationRules.min !== undefined &&
                  numValue < question.validationRules.min
                ) {
                  return; // Prevent invalid input
                }
                if (
                  question.validationRules.max !== undefined &&
                  numValue > question.validationRules.max
                ) {
                  return; // Prevent invalid input
                }
              }
              onAnswerChange(question.key, numValue);
            }}
            size="md"
          />
          {/* {question.validationRules.min !== undefined &&
            question.validationRules.max !== undefined && (
              <p className="text-sm text-gray-600">
                Enter a value between {question.validationRules.min} and{" "}
                {question.validationRules.max}
              </p>
            )} */}
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
            maxLength={question.validationRules.maxLength}
          />
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      );

    case "STRUCTURED_ARRAY": {
      const currentItems = getArrayItems(question.key);
      const maxItems = question.validationRules.maxItems || 5;
      const canAddMore = currentItems.length < maxItems;

      if (!question.validationRules.fields) return null;

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

    default:
      return <div className="text-red-500">Unsupported question type: {question.questionType}</div>;
  }
};
