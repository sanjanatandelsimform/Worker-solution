"use no memo";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Eye, EyeOff, X } from "@untitledui/icons";
import { ChangePasswordSuccessModal } from "./ChangePasswordSuccessModal";
import { ChangePasswordFailedModal } from "./ChangePasswordFailedModal";
import { InProgressModal } from "./InProgressModal";

// Validation schema using Zod
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Must be min 6 characters, include number, upper case, lower case and symbol.",
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({
  isOpen,
  onClose,
}: ChangePasswordModalProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailedModalOpen, setIsFailedModalOpen] = useState(false);
  const [isInProgressModalOpen, setIsInProgressModalOpen] = useState(false);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const currentPassword = watch("currentPassword");
  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      // Handle password change logic
      console.log("Password change submitted:", data);
      // Add your password change API call here

      // Success - close change password modal and show success modal
      reset();
      onClose();
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Password change error:", error);
    }
  };

  const handleUpdateClick = () => {
    // Check if all fields are empty
    if (!currentPassword && !newPassword && !confirmPassword) {
      setIsFailedModalOpen(true);
      return;
    }

    // Check if there are validation errors
    if (Object.keys(errors).length > 0) {
      setIsFailedModalOpen(true);
      return;
    }

    // If validation passes, submit the form
    handleSubmit(onSubmit)();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={handleClose} size="lg">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center justify-between w-full relative">
              <div className="flex flex-col  gap-1">
                <ModalTitle>Change your Password</ModalTitle>
                <ModalDescription>
                  To update your password, enter your current password and
                  choose a new one that meets the security requirements.
                </ModalDescription>
              </div>
              <div className="absolute -right-2 -top-2">
                <Button
                  iconTrailing={<X data-icon className="text-gray-400" />}
                  onClick={onClose}
                  color="tertiary"
                />
              </div>
            </div>
          </ModalHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <div className="flex flex-col gap-4">
                {/* Current Password */}
                <InputGroup className="relative">
                  <Input
                    name="currentPassword"
                    isRequired
                    label="Current Password"
                    hint={errors.currentPassword?.message}
                    placeholder="Enter current password"
                    size="md"
                    type={showCurrentPassword ? "text" : "password"}
                    isInvalid={!!errors.currentPassword}
                    value={currentPassword}
                    className="relative"
                    //onFocus={() => setIsInProgressModalOpen(true)}
                    onChange={(value) => {
                      setValue("currentPassword", value);
                      trigger("currentPassword");
                    }}
                  />
                  <Button
                    color="tertiary"
                    size="sm"
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={
                      showCurrentPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-0 top-7"
                  >
                    {showCurrentPassword ? (
                      <Eye className="size-5 text-gray-400" />
                    ) : (
                      <EyeOff className="size-5 text-gray-400" />
                    )}
                  </Button>
                </InputGroup>

                {/* New Password */}
                <InputGroup className="relative">
                  <Input
                    name="newPassword"
                    isRequired
                    label="New Password"
                    hint={errors.newPassword?.message}
                    placeholder="Enter new password"
                    size="md"
                    type={showNewPassword ? "text" : "password"}
                    isInvalid={!!errors.newPassword}
                    value={newPassword}
                    className="relative"
                    //onFocus={() => setIsInProgressModalOpen(true)}
                    onChange={(value) => {
                      setValue("newPassword", value);
                      trigger("newPassword");
                    }}
                  />
                  <Button
                    color="tertiary"
                    size="sm"
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-0 top-7"
                  >
                    {showNewPassword ? (
                      <Eye className="size-5 text-gray-400" />
                    ) : (
                      <EyeOff className="size-5 text-gray-400" />
                    )}
                  </Button>
                </InputGroup>

                {/* Confirm Password */}
                <InputGroup className="relative">
                  <Input
                    name="confirmPassword"
                    isRequired
                    label="Confirm Password"
                    hint={errors.confirmPassword?.message}
                    placeholder="Confirm new password"
                    size="md"
                    type={showConfirmPassword ? "text" : "password"}
                    isInvalid={!!errors.confirmPassword}
                    value={confirmPassword}
                    className="relative"
                    //onFocus={() => setIsInProgressModalOpen(true)}
                    onChange={(value) => {
                      setValue("confirmPassword", value);
                      trigger("confirmPassword");
                    }}
                  />
                  <Button
                    color="tertiary"
                    size="sm"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-0 top-7"
                  >
                    {showConfirmPassword ? (
                      <Eye className="size-5 text-gray-400" />
                    ) : (
                      <EyeOff className="size-5 text-gray-400" />
                    )}
                  </Button>
                </InputGroup>
              </div>
            </ModalBody>

            <ModalFooter>
              {/* <Button type="button" color="secondary" size="md" onClick={handleClose}>
              Cancel
            </Button> */}
              <Button
                type="button"
                color="primary"
                size="md"
                className="w-full"
                isDisabled={isSubmitting}
                onClick={handleUpdateClick}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Success Modal */}
      <ChangePasswordSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onBackToSettings={() => {
          console.log("Back to Settings clicked");
          setIsSuccessModalOpen(false);
        }}
      />

      {/* Failed Modal */}
      <ChangePasswordFailedModal
        isOpen={isFailedModalOpen}
        onClose={() => setIsFailedModalOpen(false)}
        onContinue={() => {
          console.log("Continue clicked in failed modal");
          setIsFailedModalOpen(false);
        }}
      />

      {/* In Progress Modal */}
      <InProgressModal
        isOpen={isInProgressModalOpen}
        onClose={() => setIsInProgressModalOpen(false)}
        onGoToDashboard={() => {
          console.log("Go to Dashboard clicked");
          setIsInProgressModalOpen(false);
        }}
      />
    </>
  );
};
