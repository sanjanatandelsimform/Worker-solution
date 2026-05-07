import { InfoCircle } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { FieldError } from "@/components/common/FieldError";
import { QuestionRadioGroup } from "@/components/common/QuestionRadioGroup";
import { monthOptions } from "@/data/monthOptions";
import type { QuestionAnswer, QuestionDefinition } from "@/types/additionalQuestionsTypes";
import { JSX } from "react";

const benefitsQuestions: QuestionDefinition[] = [
  {
    id: "benefits-broker",
    question: "Do you work with a benefits broker?",
    required: true,
    tooltip: {
      title:
        "A benefits broker is the advisor who helps your company find, negotiate, and manage the best benefits plans for your team",
      description: "",
    },
    options: [
      { id: "yes-broker", label: "Yes" },
      { id: "no-broker", label: "No" },
      { id: "unsure-broker", label: "Unsure" },
    ],
  },
  {
    id: "benefits-enrollment-period",
    question: "When is your benefits enrollment period?",
    required: true,
    isDropdown: true,
    options: monthOptions,
  },
  {
    id: "health-plan-monthly-premium",
    question:
      "What is the employee-only monthly premium for the lowest-cost health plan your company offers?",
    required: true,
    isNumericInput: true,
    options: [],
  },
];

const retirementQuestions: QuestionDefinition[] = [
  {
    id: "retirement-vesting-period",
    question: "What is the vesting period of your business's retirement plan?",
    required: true,
    options: [
      { id: "6mo_or_less", label: "6 months or less" },
      { id: "6mo_1yr", label: "Greater than 6 months - 1 year" },
      { id: "1yr_2yr", label: "Greater than 1 year - 2 years" },
      { id: "2yr_4yr", label: "Greater than 2 years - 4 years" },
      { id: "4yr_plus", label: "Greater than 4 years" },
    ],
  },
  {
    id: "retirement-employer-match",
    question: "Does your retirement plan feature an employer match?",
    required: true,
    hasConditional: true,
    options: [
      { id: "yes-match", label: "Yes" },
      { id: "no-match", label: "No" },
    ],
  },
  {
    id: "retirement-auto-enroll",
    question: "Does your company auto-enroll employees in retirement benefits?",
    required: true,
    options: [
      { id: "yes-autoenroll", label: "Yes" },
      { id: "no-autoenroll", label: "No" },
    ],
  },
  {
    id: "retirement-hardship-withdrawals",
    question: "Does your company's retirement plan allows for hardship withdrawals and/or loans?",
    required: true,
    options: [
      { id: "yes-hardship", label: "Yes" },
      { id: "no-hardship", label: "No" },
    ],
  },
];

interface BenefitsRetirementSectionProps {
  answers: QuestionAnswer;
  fieldErrors: Record<string, string>;
  benefitsEnrollmentMonth: string;
  retirementMatchPercentage: string;
  healthPremiumMonthly: string;
  onAnswerChange: (questionId: string, value: string) => void;
  onBenefitsEnrollmentMonthChange: (month: string) => void;
  onRetirementMatchPercentageChange: (value: string) => void;
  onHealthPremiumMonthlyChange: (value: string) => void;
  onClearFieldError: (key: string) => void;
}

export default function BenefitsRetirementSection({
  answers,
  fieldErrors,
  benefitsEnrollmentMonth,
  retirementMatchPercentage,
  healthPremiumMonthly,
  onAnswerChange,
  onBenefitsEnrollmentMonthChange,
  onRetirementMatchPercentageChange,
  onHealthPremiumMonthlyChange,
  onClearFieldError,
}: BenefitsRetirementSectionProps): JSX.Element {
  return (
    <div className="bg-ws-base-white rounded-lg border border-ws-border-primary p-6 space-y-6">
      <h2 className="text-3xl font-medium text-ws-text-primary mb-2">Benefits </h2>
      <p className="text-base font-normal text-ws-text-secondary">
        To understand what gaps may exist in your current benefits offerings, please select all
        relevant options that you currently offer.
      </p>

      {/* Benefits questions */}
      <div className="space-y-6">
        {benefitsQuestions.map((question, index) => (
          <div key={question.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <Label
                isRequired={question.required}
                className="text-base font-normal text-ws-text-primary"
              >
                {index + 1}. {question.question}
              </Label>
              {question.tooltip && (
                <Tooltip
                  title={question.tooltip.title}
                  description={question.tooltip.description}
                  placement="top"
                  arrow={true}
                >
                  <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                    <InfoCircle className="size-5 text-ws-gray-400" />
                  </TooltipTrigger>
                </Tooltip>
              )}
            </div>

            {question.required && !question.isDropdown && !question.isNumericInput && (
              <FieldError message={fieldErrors[question.id]} />
            )}

            {!question.isDropdown && !question.isNumericInput ? (
              <RadioGroup
                value={(answers[question.id] as string) || ""}
                onChange={value => onAnswerChange(question.id, value)}
                className="flex flex-col gap-3"
              >
                {question.options.map(option => (
                  <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                    <RadioButton value={option.id} />
                    <span className="text-sm font-normal text-ws-text-secondary">
                      {option.label}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            ) : question.isDropdown ? (
              <>
                <FieldError message={fieldErrors[question.id]} />
                <Select
                  items={question.options}
                  placeholder="Select Month"
                  size="md"
                  className="w-full max-w-xs rounded-lg"
                  selectedKey={benefitsEnrollmentMonth}
                  onSelectionChange={key => {
                    onBenefitsEnrollmentMonthChange(String(key));
                    onClearFieldError(question.id);
                  }}
                >
                  {item => <SelectItem id={item.id} label={item.label} />}
                </Select>
              </>
            ) : (
              <>
                <FieldError message={fieldErrors[question.id]} />
                <Input
                  type="number"
                  size="md"
                  placeholder="Enter amount"
                  value={healthPremiumMonthly}
                  onWheel={event => {
                    (event.target as HTMLInputElement).blur();
                  }}
                  onChange={value => {
                    onHealthPremiumMonthlyChange(value);
                    onClearFieldError(question.id);
                  }}
                  isInvalid={!!fieldErrors[question.id]}
                  hint={fieldErrors[question.id] ? undefined : "i.e. $300"}
                  className="w-full max-w-xs"
                  inputClassName="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Retirement subsection within Benefits */}
      <div className="w-full">
        <h3 className="text-2xl font-medium text-ws-text-primary pb-2 mb-6 border-b border-ws-border-primary">
          Retirement
        </h3>

        <div className="space-y-6">
          {retirementQuestions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <QuestionRadioGroup
                question={question}
                displayIndex={index + 3}
                value={(answers[question.id] as string) || ""}
                onChange={onAnswerChange}
                error={fieldErrors[question.id]}
              />

              {question.hasConditional && answers[question.id] === "yes-match" && (
                <div className="ml-6 space-y-2 pt-2">
                  <Label className="text-sm font-normal text-ws-text-secondary">
                    If yes, What is the percentage?
                  </Label>
                  <Input
                    type="number"
                    size="md"
                    placeholder="e.g. 3"
                    value={retirementMatchPercentage}
                    onWheel={event => {
                      (event.target as HTMLInputElement).blur();
                    }}
                    onChange={value => {
                      onRetirementMatchPercentageChange(value);
                      onClearFieldError("retirementMatchPercentage");
                    }}
                    isInvalid={!!fieldErrors["retirementMatchPercentage"]}
                    className="w-full max-w-xs"
                    inputClassName="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <FieldError message={fieldErrors["retirementMatchPercentage"]} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
