import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DynamicTab } from "@/components/assessment/DynamicTab";
import { BaseModalWithIcon } from "@/components/modals/BaseModalWithIcon";
import questionData from "@/data/assessment/questionData.json";
import type { Question } from "@/types/questionTypes";
import checkmarkIcon from "@/assets/checkmark-icon.svg";
import alertIcon from "@/assets/alert-icon.svg";
import { CircleCheckIcon } from "@/assets/icons/CircleCheckIcon";

interface GoalsTabProps {
  onNext?: () => void;
  onSuccess?: () => void;
}

export default function GoalsTab({ onNext, onSuccess }: GoalsTabProps) {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);

  const goalsSection = questionData.sections.find(section => section.name === "Goals");

  if (!goalsSection) {
    return <div className="text-red-600">Goals section not found in question data</div>;
  }

  const handleSuccess = () => {
    setShowSuccessModal(true);
    if (onSuccess) onSuccess();
  };

  const handleDashboardNavigation = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

  const handleCancelWarning = () => {
    setShowEmptyWarning(false);
  };

  const handleContinueWithEmpty = () => {
    setShowEmptyWarning(false);
    if (onNext) onNext();
  };

  return (
    <>
      <DynamicTab
        section="goals"
        questions={goalsSection.questions as Question[]}
        onNext={onNext}
        onSuccess={handleSuccess}
      />

      {/* Success Modal - "You're done!" */}
      <BaseModalWithIcon
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="sm"
        title="You're done!"
        subtitle="See your results and recommendations on your dashboard"
        messageImg={checkmarkIcon}
        icon={<CircleCheckIcon />}
        backgroundPattern="success"
        buttons={[
          {
            text: "Go to Dashboard",
            onClick: handleDashboardNavigation,
            color: "primary",
          },
        ]}
      />

      {/* Empty Submission Warning Modal - "Uh-oh" */}
      <BaseModalWithIcon
        isOpen={showEmptyWarning}
        onClose={handleCancelWarning}
        size="sm"
        title="Uh-oh"
        subtitle="You have not filled anything out. Your recommendations will not be as accurate. Are you sure you want to proceed?"
        messageImg={alertIcon}
        icon={<CircleCheckIcon />}
        backgroundPattern="unsuccess"
        buttons={[
          {
            text: "Cancel",
            onClick: handleCancelWarning,
            color: "secondary",
          },
          {
            text: "Continue",
            onClick: handleContinueWithEmpty,
            color: "primary",
          },
        ]}
      />
    </>
  );
}
