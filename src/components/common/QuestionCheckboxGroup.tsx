import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Label } from "@/components/base/input/label";
import { FieldError } from "@/components/common/FieldError";
import type { QuestionDefinition } from "@/types/additionalQuestionsTypes";
import { JSX } from "react";

interface QuestionCheckboxGroupProps {
  question: QuestionDefinition;
  displayIndex: number;
  selectedValues: string[];
  onToggle: (questionId: string, optionId: string) => void;
  error?: string;
}

export function QuestionCheckboxGroup({
  question,
  displayIndex,
  selectedValues,
  onToggle,
  error,
}: QuestionCheckboxGroupProps): JSX.Element {
  return (
    <div className="space-y-2">
      <Label isRequired={question.required} className="text-base font-normal text-ws-text-primary">
        {displayIndex}. {question.question}
      </Label>
      <FieldError message={error} />
      <div className="flex flex-col gap-3">
        {question.options.map(option => (
          <label
            key={option.id}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Checkbox
              isSelected={selectedValues.includes(option.id)}
              onChange={() => onToggle(question.id, option.id)}
            />
            <span className="text-sm font-normal text-ws-text-secondary">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
