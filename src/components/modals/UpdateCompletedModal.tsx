import { CheckCircle } from "@untitledui/icons";
import { BaseModalWithIcon } from "./BaseModalWithIcon";
import checkmarkIcon from "@/assets/finch-checkmark.svg";

interface UpdateCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToSettings?: () => void;
}

export const UpdateCompletedModal = ({
  isOpen,
  onClose,
  onBackToSettings,
}: UpdateCompletedModalProps) => {
  const handleBackToSettings = () => {
    if (onBackToSettings) {
      onBackToSettings();
    }
    onClose();
  };

  return (
    <BaseModalWithIcon
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Update Complete"
      subtitle="All set! Your changes have been saved."
      icon={<CheckCircle className="size-6" />}
      messageImg={checkmarkIcon}
      backgroundPattern="success"
      buttons={[
        {
          text: "Back to Settings",
          onClick: handleBackToSettings,
          color: "primary",
        },
      ]}
    />
  );
};

export default UpdateCompletedModal;
