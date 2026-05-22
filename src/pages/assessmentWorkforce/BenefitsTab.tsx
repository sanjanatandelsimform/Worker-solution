import { DynamicTab } from "@/components/assessment/DynamicTab";
import questionData from "@/data/assessment/questionData.json";
import type { Question } from "@/types/questionTypes";

interface BenefitsTabProps {
  onNext?: () => void;
  onSuccess?: () => void;
}

export default function BenefitsTab({ onNext, onSuccess }: BenefitsTabProps) {
  const benefitsSection = questionData.sections.find(s => s.name === "Benefits");

  if (!benefitsSection) {
    return <div className="text-ws-error-600">Benefits section not found in question data</div>;
  }

  const allQuestions = benefitsSection.questions as Question[];

  return (
    <div className="w-full -mt-2 -mx-2">
      <DynamicTab
        section="benefits"
        questions={allQuestions}
        onNext={onNext}
        onSuccess={onSuccess}
      />
    </div>
  );
}
