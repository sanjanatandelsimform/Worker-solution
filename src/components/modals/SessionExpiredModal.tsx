import { AlertTriangle } from "@untitledui/icons";
import { BaseModalWithIcon } from "./BaseModalWithIcon";
import alertIcon from "@/assets/alert-icon.svg";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginAgain: () => void;
}

export const SessionExpiredModal = ({
  isOpen,
  onClose,
  onLoginAgain,
}: SessionExpiredModalProps) => {
  return (
    <BaseModalWithIcon
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Session Expired"
      subtitle="Your session has expired. Please log in again to continue."
      icon={<AlertTriangle className="size-6" />}
      messageImg={alertIcon}
      backgroundPattern="unsuccess"
      buttons={[
        {
          text: "Cancel",
          onClick: onClose,
          color: "secondary",
        },
        {
          text: "Log In Again",
          onClick: onLoginAgain,
          color: "primary",
        },
      ]}
    />
  );
};

export default SessionExpiredModal;
