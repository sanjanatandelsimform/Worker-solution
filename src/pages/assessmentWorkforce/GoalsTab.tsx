import { DynamicTab } from "@/components/assessment/DynamicTab";
import questionData from "@/data/assessment/questionData.json";
import type { Question } from "@/types/questionTypes";

interface GoalsTabProps {
  onNext?: () => void;
  onSuccess?: () => void;
}

export default function GoalsTab({ onNext, onSuccess }: GoalsTabProps) {
  const goalsSection = questionData.sections.find(section => section.name === "Goals");

  if (!goalsSection) {
    return <div className="text-red-600">Goals section not found in question data</div>;
  }

  // Only signal success to the parent (AssessmentWorkforce).
  // Navigation and sessionStorage are handled exclusively by AssessmentWorkforce
  // to prevent double-navigation / double key-setting.
  const handleSuccess = () => {
    if (onSuccess) onSuccess();
  };

  return (
    <DynamicTab
      section="goals"
      questions={goalsSection.questions as Question[]}
      onNext={onNext}
      onSuccess={handleSuccess}
    />
  );
}
