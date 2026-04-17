import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { Label } from "@/components/base/input/label";
import { FieldError } from "@/components/common/FieldError";
import type { QuestionDefinition } from "@/types/additionalQuestionsTypes";
import { JSX } from "react";

interface QuestionRadioGroupProps {
  question: QuestionDefinition;
  displayIndex: number;
  value: string;
  onChange: (questionId: string, value: string) => void;
  error?: string;
}

export function QuestionRadioGroup({
  question,
  displayIndex,
  value,
  onChange,
  error,
}: QuestionRadioGroupProps): JSX.Element {
  return (
    <div className="space-y-3">
      <Label isRequired={question.required} className="text-base text-ws-text-primary">
        {displayIndex}. {question.question}
      </Label>
      <FieldError message={error} />
      <RadioGroup
        value={value}
        onChange={val => onChange(question.id, val)}
        className="flex flex-col gap-3"
      >
        {question.options.map(option => (
          <label key={option.id} className="flex items-center gap-3 cursor-pointer">
            <RadioButton
              value={option.id}
              className="border border-ws-border-primary rounded-full"
            />
            <span className="text-sm font-normal text-ws-text-secondary">{option.label}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
