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
import { Mail01, X } from "@untitledui/icons";

// Validation schema using Zod
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Must be min 6 characters, include number, upper case, lower case and symbol."
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface UpdateYourEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateYourEmailModal = ({ isOpen, onClose }: UpdateYourEmailModalProps) => {
  const {
    handleSubmit,
    formState: { isSubmitting },
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

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      // Handle password change logic
      console.log("Password change submitted:", data);
      // Add your password change API call here

      // Success - close modal and reset form
      reset();
      onClose();
    } catch (error) {
      console.error("Password change error:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center justify-between w-full relative">
            <div className="flex flex-col  gap-1">
              <ModalTitle>Update your email</ModalTitle>
              <ModalDescription>
                Update your email by entering a new address. After submitting, check your inbox for
                a verification link and follow the steps to confirm the update.
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
                  isRequired
                  icon={Mail01}
                  size="md"
                  label="Email"
                  hint="This is a hint text to help user."
                  placeholder="janet@jacksonfivestudio.com"
                  tooltip="This is a tooltip"
                />
              </InputGroup>

              {/* New Password */}
              <InputGroup className="relative">
                <Input
                  isRequired
                  icon={Mail01}
                  size="md"
                  label="Email"
                  hint="This is a hint text to help user."
                  placeholder="hr@jacksonfivestudio.com"
                  tooltip="This is a tooltip"
                />
              </InputGroup>
            </div>
          </ModalBody>

          <ModalFooter>
            {/* <Button type="button" color="secondary" size="md" onClick={handleClose}>
              Cancel
            </Button> */}
            <Button
              type="submit"
              color="primary"
              size="md"
              className="w-full"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Email"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
