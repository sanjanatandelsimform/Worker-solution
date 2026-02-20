import { DynamicTab } from "@/components/assessment/DynamicTab";
import questionData from "@/data/assessment/questionData.json";
import type { Question } from "@/types/questionTypes";

interface BenefitsTabProps {
  onNext?: () => void;
  onSuccess?: () => void;
}

export default function BenefitsTab({ onNext, onSuccess }: BenefitsTabProps) {
  const benefitsSection = questionData.sections.find(section => section.name === "Benefits");

  if (!benefitsSection) {
    return <div className="text-red-600">Benefits section not found in question data</div>;
  }

  return (
    <>
      <DynamicTab
        section="benefits"
        questions={benefitsSection.questions as Question[]}
        onNext={onNext}
        onSuccess={onSuccess}
      />
      <div className="w-full mt-12 space-y-5">
        <div className="flex bg-ws-white p-6">
          <h2 className="text-2xl font-medium text-ws-black-90">Benefits</h2>
        </div>
        <div className="flex flex-col bg-ws-white p-6">
          <div className="flex border-b border-ws-gray-40 pb-2">
            <h2 className="text-2xl font-medium text-ws-black-90">Retirement</h2>
          </div>
          <div className="mt-6">
            <p>Questions</p>
          </div>
        </div>

        <div className="flex flex-col bg-ws-white p-6">
          <div className="flex border-b border-ws-gray-40 pb-2">
            <h2 className="text-2xl font-medium text-ws-black-90">Healthcare</h2>
          </div>
          <div className="mt-6">
            <p>Questions</p>
          </div>
        </div>
      </div>
    </>
  );
}
