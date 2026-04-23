import { AlertOctagon } from "@untitledui/icons";
import { BaseModalWithIcon } from "./BaseModalWithIcon";
import alertIcon from "@/assets/alert-icon.svg";

interface ChangePasswordFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

export const ChangePasswordFailedModal = ({
  isOpen,
  onClose,
  onContinue,
}: ChangePasswordFailedModalProps) => {
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
      title="Uh-oh"
      subtitle="You have not filled anything out. Your recommendations will not be as accurate. Are you sure you want to proceed?"
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
          text: "Continue",
          onClick: handleContinue,
          color: "error",
        },
      ]}
    />
  );
};

export default ChangePasswordFailedModal;
