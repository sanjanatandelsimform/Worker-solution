import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DynamicTab } from "@/components/assessment/DynamicTab";
import { BaseModalWithIcon } from "@/components/modals/BaseModalWithIcon";
import { InProgressModal } from "@/components/modals/InProgressModal";
import questionData from "@/data/assessment/questionData.json";
import type { Question } from "@/types/questionTypes";
import { CircleCheckIcon } from "@/assets/icons/CircleCheckIcon";
import { useModalConfig } from "@/hooks/useModalConfig";

interface GoalsTabProps {
  onNext?: () => void;
  onSuccess?: () => void;
}

export default function GoalsTab({ onNext, onSuccess }: GoalsTabProps) {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const [isInProgressModalOpen, setIsInProgressModalOpen] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string>("");

  const goalsSection = questionData.sections.find(section => section.name === "Goals");

  // Modal configs using the hook
  const successModal = useModalConfig("goalsComplete", {
    isOpen: showSuccessModal,
    onClose: () => setShowSuccessModal(false),
    onConfirm: () => {
      setShowSuccessModal(false);
      navigate("/dashboard");
    },
  });

  const emptyWarningModal = useModalConfig("goalsEmptyWarning", {
    isOpen: showEmptyWarning,
    onClose: () => {
      setIsInProgressModalOpen(false);
      setShowEmptyWarning(false);
    },
    onConfirm: () => {
      setIsInProgressModalOpen(false);
      setShowEmptyWarning(false);
      navigate("/assessment");
    },
  });

  const apiErrorModal = useModalConfig("goalsApiError", {
    isOpen: !!apiErrorMessage,
    onClose: () => setApiErrorMessage(""),
    onConfirm: () => setApiErrorMessage(""),
    additionalData: { errorMessage: apiErrorMessage },
  });

  if (!goalsSection) {
    return <div className="text-red-600">Goals section not found in question data</div>;
  }

  const handleSubmitStart = () => {
    setIsInProgressModalOpen(true);
    setApiErrorMessage("");
  };

  const handleSuccess = () => {
    setIsInProgressModalOpen(false);
    setShowSuccessModal(true);
    if (onSuccess) onSuccess();
  };

  const handleEmptySubmission = () => {
    setIsInProgressModalOpen(false);
    setShowEmptyWarning(true);
  };

  const handleApiError = (errorMessage: string) => {
    setIsInProgressModalOpen(false);
    setApiErrorMessage(errorMessage);
  };

  return (
    <>
      <DynamicTab
        section="goals"
        questions={goalsSection.questions as Question[]}
        onNext={onNext}
        onSuccess={handleSuccess}
        onSubmitStart={handleSubmitStart}
        onEmptySubmission={handleEmptySubmission}
        onApiError={handleApiError}
      />

      <InProgressModal
        isOpen={isInProgressModalOpen}
        onClose={() => setIsInProgressModalOpen(false)}
        title="Preparing..."
        subtitle="One moment while we prepare your results and recommendations."
      />

      <BaseModalWithIcon
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        icon={<CircleCheckIcon />}
        {...successModal}
      />

      <BaseModalWithIcon
        isOpen={showEmptyWarning}
        onClose={() => setShowEmptyWarning(false)}
        icon={<CircleCheckIcon />}
        {...emptyWarningModal}
      />

      <BaseModalWithIcon
        isOpen={!!apiErrorMessage}
        onClose={() => setApiErrorMessage("")}
        icon={<CircleCheckIcon />}
        {...apiErrorModal}
      />
    </>
  );
}
