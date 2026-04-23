import { useState, useEffect } from "react";
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
import { X, AlertCircle } from "@untitledui/icons";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfileData } from "@/store/slices/profileSlice";
import { updateUser } from "@/store/slices/authSlice";
import { selectUser } from "@/store/selectors/authSelectors";
import { selectProfileLoading } from "@/store/selectors/profileSelectors";
import { validateName } from "@/utils/validation";
import { Label } from "react-aria-components";
import type { ProfileApiResponse } from "@/types/profileTypes";

interface UpdateYourInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdateYourInformationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: UpdateYourInformationModalProps) => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUser);
  const profileLoading = useAppSelector(selectProfileLoading);

  const [firstName, setFirstName] = useState(() => userData?.firstName ?? "");
  const [lastName, setLastName] = useState(() => userData?.lastName ?? "");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [showError, setShowError] = useState(false);
  const [apiError, setApiError] = useState("");

  // Sync form state when modal opens or userData changes
  useEffect(() => {
    if (isOpen && userData) {
      setFirstName(userData.firstName ?? "");
      setLastName(userData.lastName ?? "");
      setFirstNameError("");
      setLastNameError("");
      setShowError(false);
      setApiError("");
    }
  }, [isOpen, userData]);

  const handleFirstNameChange = (value: string) => {
    const sanitized = value.replace(/^\s+/, "");
    setFirstName(sanitized);
    setShowError(false);

    if (sanitized) {
      const validation = validateName("First name", sanitized);
      setFirstNameError(validation.isValid ? "" : validation.message || "");
    } else {
      setFirstNameError("First name cannot be empty");
    }
  };

  const handleLastNameChange = (value: string) => {
    const sanitized = value.replace(/^\s+/, "");
    setLastName(sanitized);
    setShowError(false);

    if (sanitized) {
      const validation = validateName("Last name", sanitized);
      setLastNameError(validation.isValid ? "" : validation.message || "");
    } else {
      setLastNameError("Last name cannot be empty");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const firstNameValidation = validateName("First name", firstName);
    const lastNameValidation = validateName("Last name", lastName);

    if (!firstNameValidation.isValid || !lastNameValidation.isValid) {
      setFirstNameError(firstNameValidation.isValid ? "" : firstNameValidation.message || "");
      setLastNameError(lastNameValidation.isValid ? "" : lastNameValidation.message || "");
      return;
    }

    try {
      const response = (await dispatch(
        updateProfileData({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        })
      ).unwrap()) as ProfileApiResponse;

      const updatedFields: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };

      if (response.data?.user) {
        updatedFields.firstName = response.data.user.firstName;
        updatedFields.lastName = response.data.user.lastName;
      }

      dispatch(updateUser(updatedFields));

      // Sync localStorage
      const userDetail = localStorage.getItem("userDetail");
      if (userDetail) {
        const parsedUserDetail = JSON.parse(userDetail);
        if (parsedUserDetail.auth?.user) {
          Object.assign(parsedUserDetail.auth.user, updatedFields);
          localStorage.setItem("userDetail", JSON.stringify(parsedUserDetail));
        }
      }

      handleClose();
      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "Failed to update information";
      setApiError(errorMessage);
      setShowError(true);
    }
  };

  const handleClose = () => {
    setFirstNameError("");
    setLastNameError("");
    setShowError(false);
    setApiError("");
    onClose();
  };

  const hasChanges =
    firstName.trim() !== (userData?.firstName ?? "").trim() ||
    lastName.trim() !== (userData?.lastName ?? "").trim();

  const isFormValid = firstName.trim() !== "" && lastName.trim() !== "";

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center justify-between w-full relative">
            <div className="flex flex-col gap-1">
              <ModalTitle>Update Your Information</ModalTitle>
              <ModalDescription>
                Update your account by entering new information.
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
            {showError && apiError && (
              <div className="mb-4">
                <ErrorMessage
                  errorType="danger"
                  textColor="text-red-700"
                  alertIcon={AlertCircle}
                  errorMessage={apiError}
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
                      value={firstName}
                      onChange={handleFirstNameChange}
                      isInvalid={!!firstNameError}
                    />
                    {firstNameError && (
                      <p className="text-ws-error-600 text-sm">{firstNameError}</p>
                    )}
                  </div>
                </InputGroup>
                <InputGroup>
                  <div className="flex flex-col gap-1.5 w-full">
                    <Label className="text-sm font-medium text-ws-text-secondary">
                      Last Name <span className="text-ws-error-600">*</span>
                    </Label>
                    <Input
                      size="md"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={handleLastNameChange}
                      isInvalid={!!lastNameError}
                    />
                    {lastNameError && (
                      <p className="text-ws-error-600 text-sm">{lastNameError}</p>
                    )}
                  </div>
                </InputGroup>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              color="primary"
              size="md"
              className="w-full"
              isDisabled={
                profileLoading ||
                !isFormValid ||
                !hasChanges ||
                !!firstNameError ||
                !!lastNameError
              }
            >
              {profileLoading ? "Updating..." : "Update Information"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default UpdateYourInformationModal;
