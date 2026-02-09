import { DynamicTab } from "@/components/assessment/DynamicTab";
import questionData from "@/data/assessment/questionData.json";
import type { Question } from "@/types/questionTypes";

interface WorkforceTabProps {
  onNext?: () => void;
  onSuccess?: () => void;
}

export default function WorkforceTab({ onNext, onSuccess }: WorkforceTabProps) {
  const workforceSection = questionData.sections.find(section => section.name === "Workforce");

  if (!workforceSection) {
    return <div className="text-red-600">Workforce section not found in question data</div>;
  }

  return (
    <DynamicTab
      section="workforce"
      questions={workforceSection.questions as Question[]}
      onNext={onNext}
      onSuccess={onSuccess}
    />
  );
}
