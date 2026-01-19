import { BaseModalWithLogo } from "./BaseModalWithLogo";
import checkmarkIcon from "@/assets/checkmark-icon.svg";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted?: () => void;
}

export const EmailVerificationModal = ({
  isOpen,
  onClose,
  onGetStarted,
}: EmailVerificationModalProps) => {
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
      title="Your email has been verified!"
      subtitle="Welcome aboard! Start your success journey with Worker Solutions®"
      button={{
        text: "Let's Get Started",
        onClick: handleGetStarted,
        color: "primary",
      }}
    />
  );
};

export default EmailVerificationModal;
