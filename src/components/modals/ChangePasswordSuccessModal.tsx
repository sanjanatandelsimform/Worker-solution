import { CheckCircle } from "@untitledui/icons";
import { BaseModalWithIcon } from "./BaseModalWithIcon";
import checkmarkIcon from "@/assets/checkmark-icon.svg";

interface ChangePasswordSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToSettings?: () => void;
}

export const ChangePasswordSuccessModal = ({
  isOpen,
  onClose,
  onBackToSettings,
}: ChangePasswordSuccessModalProps) => {
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
      title="Your password has been changed."
      subtitle="All set! Your password has been successfully updated."
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

export default ChangePasswordSuccessModal;
