import { AlertOctagon } from "@untitledui/icons";
import { BaseModalWithIcon } from "./BaseModalWithIcon";
import alertIcon from "@/assets/alert-icon.svg";

interface RetakeAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

export const RetakeAssessmentModal = ({
  isOpen,
  onClose,
  onContinue,
}: RetakeAssessmentModalProps) => {
  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    onClose();
  };

  return (
    <BaseModalWithIcon
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Are you sure?"
      subtitle={`Retaking the assessment will remove all data from your dashboard and you will need to retake the assessment form. This action can’t be reversed.`}
      subtitleOne={`If you’re certain this is what you want, confirm below to proceed.`}
      icon={<AlertOctagon className="size-6" />}
      messageImg={alertIcon}
      backgroundPattern="unsuccess"
      buttons={[
        {
          text: "Cancel",
          onClick: onClose,
          color: "secondary",
        },
        {
          text: "Yes, Retake assessment",
          onClick: handleContinue,
          color: "error",
        },
      ]}
    />
  );
};

export default RetakeAssessmentModal;
