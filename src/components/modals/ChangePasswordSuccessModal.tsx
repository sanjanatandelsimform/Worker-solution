import { CheckCircle } from "@untitledui/icons";
import { BaseModalWithIcon } from "./BaseModalWithIcon";
// import checkmarkIcon from "@/assets/finch-checkmark.svg";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { logoutThunk } from "@/store/slices/authSlice";

interface ChangePasswordSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToSettings?: () => void;
}

/**
 * After password change: invalidate sessions, clear auth, redirect to sign-in.
 * Uses logoutThunk: 1) Call logout API, 2) Clear storage, 3) Clear Redux.
 */
export const ChangePasswordSuccessModal = ({
  isOpen,
  onClose,
}: ChangePasswordSuccessModalProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleBackToSignIn = async () => {
    await dispatch(logoutThunk())
      .unwrap()
      .catch(() => {});
    onClose();
    navigate("/sign-in", { replace: true });
  };

  return (
    <BaseModalWithIcon
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Your password has been changed."
      subtitle="All set! Your password has been successfully updated."
      icon={<CheckCircle className="size-6" />}
      // messageImg={checkmarkIcon}
      backgroundPattern="success"
      buttons={[
        {
          text: "Log in",
          onClick: handleBackToSignIn,
          color: "primary",
        },
      ]}
    />
  );
};

export default ChangePasswordSuccessModal;
