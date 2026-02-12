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
import { Input, InputBase } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { X } from "@untitledui/icons";
import { NativeSelect } from "../base/select/select-native";
import { useState } from "react";
import { TextArea } from "../base/textarea/textarea";
import { Checkbox } from "../base/checkbox/checkbox";
import { Link } from "react-router-dom";

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

export const GetInTouchModal = ({ isOpen, onClose }: UpdateYourEmailModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("US");
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
              <ModalTitle>Get in touch</ModalTitle>
              <ModalDescription>
                We’d love to hear your thoughts. Your feedback helps us improve and create a better
                experience for you.
              </ModalDescription>
            </div>
            <div className="absolute -right-2 -top-2">
              <Button
                iconTrailing={<X data-icon className="text-ws-gray-70" />}
                onClick={onClose}
                color="tertiary"
              />
            </div>
          </div>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <InputGroup className="relative">
                  <Input isRequired label="First name" size="md" placeholder="First name" />
                </InputGroup>
                <InputGroup className="relative">
                  <Input isRequired label="Last name" size="md" placeholder="Last name" />
                </InputGroup>
              </div>
              <InputGroup className="relative">
                <Input isRequired size="md" label="Email" placeholder="your@company.com" />
              </InputGroup>
              <InputGroup
                label="Phone number"
                leadingAddon={
                  <NativeSelect
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    options={[
                      { label: "US +1", value: "US" },
                      { label: "UK +44", value: "UK" },
                      { label: "IN +91", value: "IN" },
                      { label: "CA +1", value: "CA" },
                      { label: "AU +61", value: "AU" },
                      { label: "DE +49", value: "DE" },
                      { label: "FR +33", value: "FR" },
                      { label: "JP +81", value: "JP" },
                      { label: "CN +86", value: "CN" },
                    ]}
                  />
                }
              >
                <InputBase
                  placeholder="(555) 000-0000"
                  type="tel"
                  size="sm"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                />
              </InputGroup>
              <InputGroup className="relative">
                <TextArea isRequired label="Message" rows={5} placeholder="Leave us a message..." />
              </InputGroup>
              <div className="flex flex-1 items-start gap-2">
                <Checkbox
                  size="sm"
                  label={
                    <>
                      You agree to our friendly{" "}
                      <Link to="/" className="underline">
                        privacy policy.
                      </Link>
                    </>
                  }
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              color="primary"
              size="md"
              className="w-full"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Sharing..." : "Share feedback"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
