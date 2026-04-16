import { AlertOctagon } from "@untitledui/icons";
import { BaseModalWithIcon } from "./BaseModalWithIcon";
import alertIcon from "@/assets/alert-icon.svg";

interface AccountDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

export const AccountDeleteModal = ({ isOpen, onClose, onContinue }: AccountDeleteModalProps) => {
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
      title="Confirm Account Deletion"
      subtitle={`Deleting your account will permanently erase your profile and all associated data. This action can’t be reversed.`}
      subtitleOne={`If you’re certain this is what you want, confirm below to proceed.`}
      icon={<AlertOctagon className="size-6" />}
      messageImg={alertIcon}
      backgroundPattern="unsuccess"
      buttons={[
        {
          text: "Cancel",
          onClick: onClose,
          color: "tertiary",
        },
        {
          text: "Yes, Delete my account",
          onClick: handleContinue,
          color: "error",
        },
      ]}
    />
  );
};

export default AccountDeleteModal;
