"use no memo";
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
import { ChangePasswordSuccessModal } from "./ChangePasswordSuccessModal";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { changePassword } from "@/store/slices/profileSlice";
import {
  selectProfileLoading,
  selectProfileError,
  selectPasswordAttempts,
  selectIsAccountLocked,
  selectLockoutExpiry,
} from "@/store/selectors/profileSelectors";
import { validatePassword, isPasswordDifferent } from "@/utils/validation";

/** Extracts the leading digit count from "... N attempt(s) remaining ..." without regex (ReDoS-safe). */
function parseAttemptsRemainingFromError(error: string): number | undefined {
  const markers = ["attempts remaining", "attempt remaining"] as const;
  for (const marker of markers) {
    const idx = error.indexOf(marker);
    if (idx === -1) continue;
    let i = idx - 1;
    while (
      i >= 0 &&
      (error[i] === " " || error[i] === "\t" || error[i] === "\n" || error[i] === "\r")
    ) {
      i--;
    }
    const digitEnd = i + 1;
    while (i >= 0 && error[i] >= "0" && error[i] <= "9") {
      i--;
    }
    const digits = error.slice(i + 1, digitEnd);
    if (digits.length === 0) continue;
    const n = Number.parseInt(digits, 10);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const dispatch = useAppDispatch();
  const profileLoading = useAppSelector(selectProfileLoading);
  const profileError = useAppSelector(selectProfileError);
  const passwordAttempts = useAppSelector(selectPasswordAttempts);
  const isAccountLocked = useAppSelector(selectIsAccountLocked);
  const lockoutExpiry = useAppSelector(selectLockoutExpiry);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showError, setShowError] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [lockoutMessage, setLockoutMessage] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("");
      setShowError(false);
      setLockoutMessage("");
    }
  }, [isOpen]);

  // Update attempts remaining from Redux
  useEffect(() => {
    setAttemptsRemaining(5 - passwordAttempts);
  }, [passwordAttempts]);

  // Handle account lockout
  useEffect(() => {
    if (isAccountLocked && lockoutExpiry) {
      const remaining = Math.ceil((lockoutExpiry - Date.now()) / 1000 / 60);
      setLockoutMessage(`Account locked for ${remaining} minutes. Please try again later.`);
    } else {
      setLockoutMessage("");
    }
  }, [isAccountLocked, lockoutExpiry]);

  // Validate passwords
  const validatePasswords = (): boolean => {
    let isValid = true;

    // Validate current password
    if (!currentPassword.trim()) {
      setCurrentPasswordError("Current password is required");
      isValid = false;
    } else {
      setCurrentPasswordError("");
    }

    // Validate new password
    const newPasswordValidation = validatePassword(newPassword);
    if (!newPasswordValidation.isValid) {
      setNewPasswordError(newPasswordValidation.message || "Invalid password");
      isValid = false;
    } else if (!isPasswordDifferent(currentPassword, newPassword)) {
      setNewPasswordError("New password must be different from current password");
      isValid = false;
    } else {
      setNewPasswordError("");
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleUpdateClick = async () => {
    // Check if account is locked
    if (isAccountLocked) {
      setShowError(true);
      return;
    }

    // Validate passwords
    if (!validatePasswords()) {
      return;
    }

    try {
      await dispatch(
        changePassword({
          currentPassword,
          newPassword,
        })
      ).unwrap();

      // Success - close change password modal and show success modal
      onClose();
      setIsSuccessModalOpen(true);
      setShowError(false);
    } catch (error: unknown) {
      setShowError(true);
      if (typeof error === "string") {
        const remaining = parseAttemptsRemainingFromError(error);
        if (remaining !== undefined) {
          setAttemptsRemaining(remaining);
        }
      }
    }
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setShowError(false);
    onClose();
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={handleClose} size="md">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center justify-between w-full relative">
              <div className="flex flex-col  gap-1">
                <ModalTitle>Change Your Password</ModalTitle>
                <ModalDescription>
                  To update your password, enter your current password and choose a new one that
                  meets the security requirements.
                </ModalDescription>
              </div>
              <div className="absolute -right-2 -top-2">
                <Button
                  iconTrailing={<X className="size-7 stroke-1 text-ws-gray-400" />}
                  onClick={onClose}
                  color="link"
                />
              </div>
            </div>
          </ModalHeader>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleUpdateClick();
            }}
          >
            <ModalBody>
              {/* Account Lockout Message */}
              {isAccountLocked && lockoutMessage && (
                <div className="mb-4 p-4 bg-ws-error-50 border border-ws-error-200 rounded-lg">
                  <p className="text-ws-error-800 text-sm font-medium">{lockoutMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {showError && profileError && !isAccountLocked && (
                <div className="mb-4">
                  <ErrorMessage
                    errorType="danger"
                    textColor="text-ws-error-700"
                    alertIcon={AlertCircle}
                    errorMessage={`${profileError}${attemptsRemaining > 0 ? ` (${attemptsRemaining} attempts remaining)` : ""}`}
                  />
                </div>
              )}

              <div className="flex flex-col gap-4">
                {/* Current Password */}
                <InputGroup className="relative">
                  <Input
                    name="currentPassword"
                    isRequired
                    label="Current Password"
                    hint={currentPasswordError}
                    placeholder="Enter current password"
                    size="md"
                    type="password"
                    isInvalid={!!currentPasswordError}
                    value={currentPassword}
                    className="relative"
                    isDisabled={profileLoading || isAccountLocked}
                    onChange={(value: string) => {
                      setCurrentPassword(value);
                      setShowError(false);

                      // Real-time format validation for current password
                      if (!value.trim()) {
                        setCurrentPasswordError("Current password is required");
                      } else if (value.length < 8) {
                        setCurrentPasswordError("Password must be at least 8 characters");
                      } else {
                        setCurrentPasswordError("");
                      }
                    }}
                    showPasswordToggle={false}
                  />
                </InputGroup>

                {/* New Password */}
                <InputGroup className="relative">
                  <Input
                    name="newPassword"
                    isRequired
                    label="New Password"
                    hint={newPasswordError}
                    placeholder="Enter new password"
                    size="md"
                    type="password"
                    isInvalid={!!newPasswordError}
                    value={newPassword}
                    className="relative"
                    isDisabled={profileLoading || isAccountLocked}
                    onChange={(value: string) => {
                      setNewPassword(value);
                      setShowError(false);

                      // Real-time validation for new password
                      const newPasswordValidation = validatePassword(value);
                      if (!newPasswordValidation.isValid) {
                        setNewPasswordError(newPasswordValidation.message || "Invalid password");
                      } else if (currentPassword && !isPasswordDifferent(currentPassword, value)) {
                        setNewPasswordError("New password must be different from current password");
                      } else {
                        setNewPasswordError("");
                      }

                      // Re-validate confirm password if it has a value
                      if (confirmPassword) {
                        if (value !== confirmPassword) {
                          setConfirmPasswordError("Passwords do not match");
                        } else {
                          setConfirmPasswordError("");
                        }
                      }
                    }}
                  />
                </InputGroup>

                {/* Confirm Password */}
                <InputGroup className="relative">
                  <Input
                    name="confirmPassword"
                    isRequired
                    label="Confirm New Password"
                    hint={confirmPasswordError}
                    placeholder="Confirm new password"
                    size="md"
                    type="password"
                    isInvalid={!!confirmPasswordError}
                    value={confirmPassword}
                    className="relative"
                    isDisabled={profileLoading || isAccountLocked}
                    onChange={(value: string) => {
                      setConfirmPassword(value);
                      setShowError(false);

                      // Real-time validation for confirm password
                      if (!value.trim()) {
                        setConfirmPasswordError("Please confirm your password");
                      } else if (newPassword !== value) {
                        setConfirmPasswordError("Passwords do not match");
                      } else {
                        setConfirmPasswordError("");
                      }
                    }}
                  />
                </InputGroup>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                type="submit"
                color="primary"
                size="xl"
                className="w-full"
                isDisabled={
                  profileLoading ||
                  isAccountLocked ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  !!currentPasswordError ||
                  !!newPasswordError ||
                  !!confirmPasswordError
                }
              >
                {profileLoading ? "Updating..." : "Update"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Success Modal */}
      <ChangePasswordSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        onBackToSettings={handleSuccessModalClose}
      />
    </>
  );
};
