import { BaseModalWithLogo } from "./BaseModalWithLogo";
import logoutIcon from "@/assets/logout-Icon.svg";

interface LogoutVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogBackIn?: () => void;
}

export const LogoutVerificationModal = ({
  isOpen,
  onClose,
  onLogBackIn,
}: LogoutVerificationModalProps) => {
  const handleLogBackIn = () => {
    if (onLogBackIn) {
      onLogBackIn();
    }
    onClose();
  };

  return (
    <BaseModalWithLogo
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      messageImg={logoutIcon}
      title="You've been logged out"
      subtitle="You've been logged out of your account. Log back in anytime to continue."
      button={{
        text: "Log back in",
        onClick: handleLogBackIn,
        color: "primary",
      }}
    />
  );
};

export default LogoutVerificationModal;
