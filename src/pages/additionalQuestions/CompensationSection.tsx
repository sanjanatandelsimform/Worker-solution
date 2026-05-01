import { Label } from "@/components/base/input/label";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
import { FieldError } from "@/components/common/FieldError";
import { QuestionRadioGroup } from "@/components/common/QuestionRadioGroup";
import { QuestionCheckboxGroup } from "@/components/common/QuestionCheckboxGroup";
import { monthOptions } from "@/data/monthOptions";
import type { QuestionAnswer, QuestionDefinition } from "@/types/additionalQuestionsTypes";
import { JSX } from "react";

const compensationQuestions: QuestionDefinition[] = [
  {
    id: "annual-raises",
    question: "Do you offer annual raises?",
    required: true,
    hasConditional: true,
    options: [
      { id: "yes-raises", label: "Yes" },
      { id: "no-raises", label: "No" },
    ],
  },
  {
    id: "shift-differentials",
    question:
      "Are your hourly employees eligible for shift differentials e.g. extra pay for nights/weekends/holidays?",
    required: false,
    options: [
      { id: "yes-shift-diff", label: "Yes" },
      { id: "no-shift-diff", label: "No" },
    ],
  },
  {
    id: "short-term-incentives",
    question:
      "Are most of your employees eligible for short-term incentives such as spot, quarterly or annual bonuses, commissions, profit sharing?",
    required: false,
    isMultiSelect: true,
    options: [
      { id: "cash_bonuses", label: "Cash bonuses" },
      { id: "profit_sharing", label: "Profit sharing" },
      { id: "commissions", label: "Commissions" },
    ],
  },
  {
    id: "long-term-incentives",
    question:
      "Are most of your employees eligible for long-term incentives such as stock plans, pension plan, deferred compensation?",
    required: false,
    isMultiSelect: true,
    options: [
      { id: "stock_options", label: "Stock options" },
      { id: "rsus", label: "Restricted Stock Units (RSUs)" },
      { id: "espps", label: "Employee Stock Purchase Plans (ESPPs)" },
      { id: "deferred_compensation", label: "Deferred compensation" },
      { id: "pension_plans", label: "Pension plans" },
    ],
  },
];

interface CompensationSectionProps {
  answers: QuestionAnswer;
  fieldErrors: Record<string, string>;
  annualRaiseMonth: string;
  onAnswerChange: (questionId: string, value: string) => void;
  onMultiSelectToggle: (questionId: string, optionId: string) => void;
  onAnnualRaiseMonthChange: (month: string) => void;
  onClearFieldError: (key: string) => void;
}

export default function CompensationSection({
  answers,
  fieldErrors,
  annualRaiseMonth,
  onAnswerChange,
  onMultiSelectToggle,
  onAnnualRaiseMonthChange,
  onClearFieldError,
}: CompensationSectionProps): JSX.Element {
  return (
    <div className="bg-ws-base-white rounded-lg border border-ws-border-primary p-6 space-y-6">
      <h2 className="text-3xl font-medium text-ws-text-primary mb-2">Compensation </h2>
      <p className="text-base font-normal text-ws-text-secondary">
        Select salary that apply best to your workforce. This doesn't have to be exact.
      </p>

      <div className="space-y-6">
        {compensationQuestions.map((question, index) => {
          if (question.isMultiSelect) {
            return (
              <QuestionCheckboxGroup
                key={question.id}
                question={question}
                displayIndex={index + 1}
                selectedValues={(answers[question.id] as string[]) || []}
                onToggle={onMultiSelectToggle}
                error={fieldErrors[question.id]}
              />
            );
          }

          // Radio question (with optional conditional month dropdown)
          return (
            <div key={question.id} className="space-y-3">
              <QuestionRadioGroup
                question={question}
                displayIndex={index + 1}
                value={(answers[question.id] as string) || ""}
                onChange={onAnswerChange}
                error={
                  question.required && !question.isDropdown ? fieldErrors[question.id] : undefined
                }
              />

              {question.hasConditional && answers[question.id] === "yes-raises" && (
                <div className="ml-6 space-y-2 pt-2">
                  <Label className="text-base font-normal text-ws-text-primary">
                    If yes, when?
                  </Label>
                  <Select
                    items={monthOptions}
                    placeholder="Select Month"
                    size="md"
                    className="w-full max-w-xs rounded-lg"
                    selectedKey={annualRaiseMonth}
                    onSelectionChange={key => {
                      onAnnualRaiseMonthChange(String(key));
                      onClearFieldError("annualRaiseMonth");
                    }}
                  >
                    {item => <SelectItem id={item.id} label={item.label} />}
                  </Select>
                  <FieldError message={fieldErrors["annualRaiseMonth"]} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
