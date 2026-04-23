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
import { updateProfileData } from "@/store/slices/profileSlice";
import { updateUser } from "@/store/slices/authSlice";
import { selectUser } from "@/store/selectors/authSelectors";
import { selectProfileLoading } from "@/store/selectors/profileSelectors";
import { validateEmail } from "@/utils/validation";
import { Label } from "react-aria-components";
import { ProfileApiResponse } from "@/types/profileTypes";

interface UpdateYourEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  // getResponse: (response: {
  //   success: boolean;
  //   data?: { email?: string };
  //   message?: string;
  // }) => void;
  getResponse: (response: ProfileApiResponse) => void;
}

export const UpdateYourEmailModal = ({
  isOpen,
  onClose,
  getResponse,
}: UpdateYourEmailModalProps) => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUser);
  const profileLoading = useAppSelector(selectProfileLoading);

  const [newEmail, setNewEmail] = useState("");
  const [newEmailError, setNewEmailError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [firstName, setFirstName] = useState(() => userData?.firstName ?? "");
  const [lastName, setLastName] = useState(() => userData?.lastName ?? "");



  const isFormValid = firstName.trim() !== "" && lastName.trim() !== "";

  const handleNewEmailChange = (value: string) => {
    setNewEmail(value);
    setShowError(false);

    if (!value.trim()) {
      setNewEmailError("Email cannot be empty");
      return;
    }

    if (!validateEmail(value)) {
      setNewEmailError("Please enter a valid email address");
      return;
    }

    const currentEmail = userData?.businessEmail || "";
    if (value.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setNewEmailError("New email must be different from current email");
      return;
    }

    setNewEmailError("");
  };

  // Validate email for submit (runs full validation)
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
      setShowError(true);
      return;
    }

    try {
      const payload = {
        
         firstName: firstName.trim(),
        lastName: lastName.trim(),
        
        newEmail: newEmail.trim(),
        currentEmail: userData?.businessEmail?.trim() ?? "",
      };

      const response = (await dispatch(updateProfileData(payload)).unwrap()) as ProfileApiResponse;
      const updatedFields: Record<string, unknown> = {};
      if (response.data?.user) {
        const apiUser = response.data.user;
        updatedFields.firstName = apiUser.firstName;
        updatedFields.lastName = apiUser.lastName;
        updatedFields.businessEmail = apiUser.businessEmail;
        if (apiUser.emailVerified !== undefined) {
          updatedFields.emailVerify = apiUser.emailVerified;
        }
      }

      updatedFields.businessEmail = newEmail.trim();

      dispatch(updateUser(updatedFields));

      if (response.success) {
        handleClose();
        getResponse(response);
      } else {
        setNewEmailError(response.message || "Failed to update");
        setShowError(true);
      }
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : JSON.stringify(error);

      if (errorMessage.includes("already in use") || errorMessage.includes("409")) {
        setNewEmailError("This email is already in use");
      } else {
        setNewEmailError(errorMessage || "Failed to update");
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
              <ModalTitle>Update your information</ModalTitle>
              <ModalDescription>
                {showSuccess
                  ? "Check your inbox for a verification link and follow the steps to confirm the update."
                  : "Update your account by entering new information. After submitting, check your inbox for a verification link and follow the steps to confirm the update."}
              </ModalDescription>
            </div>
            <div className="absolute -right-2 -top-2">
              <Button
                iconTrailing={<X data-icon className="text-ws-gray-70" />}
                onClick={handleClose}
                color="link"
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

            {showError && newEmailError && (
              <div className="mb-4">
                <ErrorMessage
                  errorType="danger"
                  textColor="text-red-700"
                  alertIcon={AlertCircle}
                  errorMessage={newEmailError}
                  onClose={() => setShowError(false)}
                />
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <InputGroup>
                  <div className="flex flex-col gap-1.5 w-full">
                    <Label className="text-sm font-medium text-ws-text-secondary">
                      First Name <span className="text-ws-error-600">*</span>
                    </Label>

                    <Input
                      size="md"
                      placeholder="First Name"
                      value={firstName || ""}
                      onChange={value => setFirstName(value)}
                    />
                  </div>
                </InputGroup>
                <InputGroup className="relative">
                  <div className="flex flex-col gap-1.5 w-full">
                    <Label className="text-sm font-medium text-ws-text-secondary">
                      Last Name <span className="text-ws-error-600">*</span>
                    </Label>
                    <Input
                      size="md"
                      placeholder="Last Name"
                      value={lastName || ""}
                      onChange={value => setLastName(value)}
                    />
                  </div>
                </InputGroup>
              </div>
              <InputGroup className="relative">
                <div className="flex flex-col gap-1.5 w-full">
                  <Label className="text-sm font-medium text-ws-text-secondary">
                    Current Email <span className="text-ws-error-600">*</span>
                  </Label>
                  <Input
                    icon={Mail01}
                    iconClassName="text-ws-gray-400"
                    size="md"
                    placeholder="current@email.com"
                    value={userData?.businessEmail || ""}
                    isDisabled={true}
                  />
                </div>
              </InputGroup>

              <InputGroup className="relative">
                <div className="flex flex-col gap-1.5 w-full">
                  <Label className="text-sm font-medium text-ws-text-secondary">
                    New Email <span className="text-ws-error-600">*</span>
                  </Label>
                  <Input
                    // isRequired
                    icon={Mail01}
                    iconClassName="text-ws-gray-400"
                    size="md"
                    placeholder="new@email.com"
                    value={newEmail}
                    onChange={handleNewEmailChange}
                  />
                </div>
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
                // isDisabled={profileLoading || !newEmail.trim() || !!newEmailError}
                isDisabled={profileLoading || !isFormValid || !newEmail.trim() || !!newEmailError}
              >
                {profileLoading ? "Updating..." : "Update information"}
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default UpdateYourEmailModal;
