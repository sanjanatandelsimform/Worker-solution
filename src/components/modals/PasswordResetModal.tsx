import { BaseModalWithLogo } from "./BaseModalWithLogo";
import checkmarkIcon from "@/assets/checkmark-icon.svg";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted?: () => void;
}

export const PasswordResetModal = ({
  isOpen,
  onClose,
  onGetStarted,
}: PasswordResetModalProps) => {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
    onClose();
  };

  return (
    <BaseModalWithLogo
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      messageImg={checkmarkIcon}
      title="Account created successfully!"
      subtitle="Welcome aboard! Start your success journey with Worker Solutions®"
      button={{
        text: "Let's Get Started",
        onClick: handleGetStarted,
        color: "primary",
      }}
    />
  );
};

export default PasswordResetModal;
