import { DynamicTab } from "@/components/assessment/DynamicTab";
import questionData from "@/data/assessment/questionData.json";
import type { Question } from "@/types/questionTypes";

interface CompensationTabProps {
  onNext?: () => void;
  onSuccess?: () => void;
}

export default function CompensationTab({ onNext, onSuccess }: CompensationTabProps) {
  const compensationSection = questionData.sections.find(
    section => section.name === "Compensation"
  );

  if (!compensationSection) {
    return <div className="text-ws-error-600">Compensation section not found in question data</div>;
  }

  return (
    <DynamicTab
      section="compensation"
      questions={compensationSection.questions as Question[]}
      onNext={onNext}
      onSuccess={onSuccess}
    />
  );
}
