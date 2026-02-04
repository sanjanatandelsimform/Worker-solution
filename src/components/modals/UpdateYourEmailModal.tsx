import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/components/base/modal/modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Mail01, X, AlertCircle } from "@untitledui/icons";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateEmailAddress } from "@/store/slices/profileSlice";
import { selectUser } from "@/store/selectors/authSelectors";
import { selectProfileLoading, selectProfileError } from "@/store/selectors/profileSelectors";
import { validateEmail } from "@/utils/validation";

interface UpdateYourEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  getResponse: (response: {
    success: boolean;
    data?: { email?: string };
    message?: string;
  }) => void;
}

export const UpdateYourEmailModal = ({
  isOpen,
  onClose,
  getResponse,
}: UpdateYourEmailModalProps) => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUser);
  const profileLoading = useAppSelector(selectProfileLoading);
  const profileError = useAppSelector(selectProfileError);

  const [newEmail, setNewEmail] = useState("");
  const [newEmailError, setNewEmailError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle new email input change
  const handleNewEmailChange = (value: string) => {
    setNewEmail(value);
    setNewEmailError("");
    setShowError(false);
  };

  // Validate email
  const validateNewEmail = (): boolean => {
    if (!newEmail.trim()) {
      setNewEmailError("Email cannot be empty");
      return false;
    }

    if (!validateEmail(newEmail)) {
      setNewEmailError("Please enter a valid email address");
      return false;
    }

    const currentEmail = userData?.businessEmail || "";
    if (newEmail.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setNewEmailError("New email must be different from current email");
      return false;
    }

    return true;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateNewEmail()) {
      return;
    }

    try {
      const response = await dispatch(updateEmailAddress({ email: newEmail.trim() })).unwrap();
      console.log("Email update successful:", response);

      if (response.success) {
        handleClose();
        getResponse(response);
      } else {
        setNewEmailError(response.message || "Failed to update email");
        setShowError(true);
      }
    } catch (error: unknown) {
      console.error("Email update failed:", error);

      const errorMessage =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : JSON.stringify(error);

      if (errorMessage.includes("already in use") || errorMessage.includes("409")) {
        setNewEmailError("This email is already in use");
      } else {
        setNewEmailError(errorMessage || "Failed to update email");
      }
      setShowError(true);
    }
  };

  const handleClose = () => {
    setNewEmailError("");
    setShowError(false);
    setShowSuccess(false);
    setNewEmail("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center justify-between w-full relative">
            <div className="flex flex-col gap-1">
              <ModalTitle>Update your email</ModalTitle>
              <ModalDescription>
                {showSuccess
                  ? "Check your inbox for a verification link and follow the steps to confirm the update."
                  : "Update your email by entering a new address. After submitting, check your inbox for a verification link and follow the steps to confirm the update."}
              </ModalDescription>
            </div>
            <div className="absolute -right-2 -top-2">
              <Button
                iconTrailing={<X data-icon className="text-gray-400" />}
                onClick={handleClose}
                color="tertiary"
              />
            </div>
          </div>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            {showSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  Verification email sent! Please check your inbox.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <InputGroup className="relative">
                <Input
                  icon={Mail01}
                  size="md"
                  label="Current Email"
                  placeholder="current@email.com"
                  value={userData?.businessEmail || ""}
                  isDisabled={true}
                />
              </InputGroup>

              <InputGroup className="relative">
                <Input
                  isRequired
                  icon={Mail01}
                  size="md"
                  label="New Email"
                  placeholder="new@email.com"
                  value={newEmail}
                  onChange={handleNewEmailChange}
                />
              </InputGroup>
            </div>
          </ModalBody>

          <ModalFooter>
            {showSuccess ? (
              <Button
                type="button"
                color="primary"
                size="md"
                className="w-full"
                onClick={handleClose}
              >
                Close
              </Button>
            ) : (
              <Button
                type="submit"
                color="primary"
                size="md"
                className="w-full"
                isDisabled={profileLoading || !newEmail.trim() || !!newEmailError}
              >
                {profileLoading ? "Updating..." : "Update Email"}
              </Button>
            )}
          </ModalFooter>
        </form>
        {showError && profileError && (
          <div className="mb-4">
            <ErrorMessage
              errorType="danger"
              textColor="text-red-700"
              alertIcon={AlertCircle}
              errorMessage={profileError}
              onClose={() => setShowError(false)}
            />
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateYourEmailModal;
