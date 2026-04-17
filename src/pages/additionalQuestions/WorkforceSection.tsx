import { QuestionRadioGroup } from "@/components/common/QuestionRadioGroup";
import { QuestionCheckboxGroup } from "@/components/common/QuestionCheckboxGroup";
import type { QuestionAnswer, QuestionDefinition } from "@/types/additionalQuestionsTypes";
import { JSX } from "react";

const questions: QuestionDefinition[] = [
  {
    id: "benefits-updates",
    question: "Where are employees most likely to receive benefits updates?",
    required: true,
    isMultiSelect: true,
    options: [
      { id: "work_email", label: "Work (email and/or text)" },
      { id: "personal_email", label: "Personal device (email and/or text)" },
      { id: "office_signs", label: "In-office (flyer, in person-announcements etc.)" },
    ],
  },
  {
    id: "deskless-employees",
    question: "Are many employees deskless (performing job duties outside of an office setting)?",
    required: true,
    options: [
      { id: "yes-deskless", label: "Yes" },
      { id: "no-deskless", label: "No" },
    ],
  },
  {
    id: "commute-methods",
    question: "What is the most common commute methods among your employees?",
    required: false,
    isMultiSelect: true,
    options: [
      { id: "train", label: "Train" },
      { id: "bus", label: "Bus" },
      { id: "car", label: "Car" },
      { id: "bike", label: "Bike" },
      { id: "walking", label: "Walking" },
      { id: "group_transportation", label: "Group Transportation (i.e. Carpooling, Company bus)" },
    ],
  },
  {
    id: "commute-duration",
    question: "How long are employees commuting to the office (estimated average time)",
    required: false,
    options: [
      { id: ">15min", label: "> 15min" },
      { id: "15-30min", label: "15-30min" },
      { id: "30-1hr", label: "30-1hr min" },
      { id: "1hr+", label: "1hr +" },
    ],
  },
];

interface WorkforceSectionProps {
  answers: QuestionAnswer;
  fieldErrors: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  onMultiSelectToggle: (questionId: string, optionId: string) => void;
}

export default function WorkforceSection({
  answers,
  fieldErrors,
  onAnswerChange,
  onMultiSelectToggle,
}: WorkforceSectionProps): JSX.Element {
  return (
    <div className="bg-ws-base-white rounded-lg border border-ws-border-primary shadow-sm p-6 space-y-6">
      <h2 className="text-3xl font-semibold mb-2">Workforce</h2>
      <p className="text-base text-ws-gray-90">
        We'd like to get a better understanding of your workforce and how they're structured. This
        will help us customize relevant solution providers.
      </p>

      <div className="space-y-8">
        {questions.map((question, index) =>
          question.isMultiSelect ? (
            <QuestionCheckboxGroup
              key={question.id}
              question={question}
              displayIndex={index + 1}
              selectedValues={(answers[question.id] as string[]) || []}
              onToggle={onMultiSelectToggle}
              error={fieldErrors[question.id]}
            />
          ) : (
            <QuestionRadioGroup
              key={question.id}
              question={question}
              displayIndex={index + 1}
              value={(answers[question.id] as string) || ""}
              onChange={onAnswerChange}
              error={fieldErrors[question.id]}
            />
          )
        )}
      </div>
    </div>
  );
}
