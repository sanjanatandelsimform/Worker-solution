import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../base/buttons/button";
import { Input } from "../base/input/input";
import { InputGroup } from "../base/input/input-group";
import { Eye, EyeOff } from "@untitledui/icons";
import { resetPassword } from "@/services/api/authApi";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/services/validation/authSchemas";
import checkmarkIcon from "@/assets/checkmark-icon.svg";
import { SuccessModalWithLogo } from "../modals/SuccessModalWithLogo";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const resetToken = searchParams.get("token");

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
    reset,
    getValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!resetToken) {
      setErrorMessage("Invalid or missing reset token. Please request a new password reset link.");
      return;
    }

    try {
      setErrorMessage(null);
      await resetPassword(resetToken, data.newPassword);
      setIsOpen(true);
      reset();
    } catch (err) {
      console.error("Reset password error:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unable to reset password. Please try again or request a new link."
      );
    }
  };

  const handleGetStarted = () => {
    setIsOpen(false);
    navigate("/sign-in");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="flex w-2xl items-center justify-center rounded-xl border border-solid border-primary bg-primary py-28">
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          {/* Header */}
          <div className="flex w-full flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
              <h1 className="text-5xl font-bold leading-15 text-primary">BeneStat</h1>
            </div>

            {/* Title and Description */}
            <div className="flex w-full flex-col items-start gap-3 text-center">
              <h2 className="w-full text-4xl font-semibold leading-9.5 text-primary">
                Reset Password
              </h2>
              <p className="w-full text-medium font-normal leading-6 text-tertiary">
                Enter your new password below. Make sure it meets all security requirements.
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex w-full flex-col items-center gap-6 rounded-xl">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full cursor-pointer flex-col gap-5"
            >
              {/* New Password Input Field */}
              <InputGroup className="relative">
                <Input
                  name="newPassword"
                  isRequired
                  label="New Password"
                  placeholder="New Password"
                  size="md"
                  type={showPassword ? "text" : "password"}
                  hint={errors.newPassword?.message}
                  isInvalid={!!errors.newPassword}
                  value={getValues("newPassword")}
                  onChange={value => {
                    setValue("newPassword", value);
                    trigger("newPassword");
                  }}
                />
                <Button
                  color="tertiary"
                  size="sm"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-7"
                >
                  {showPassword ? (
                    <Eye className="size-5 text-gray-400" />
                  ) : (
                    <EyeOff className="size-5 text-gray-400" />
                  )}
                </Button>
              </InputGroup>

              {/* Confirm Password Input Field */}
              <InputGroup className="relative">
                <Input
                  name="confirmPassword"
                  isRequired
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  size="md"
                  type={showConfirmPassword ? "text" : "password"}
                  hint={errors.confirmPassword?.message}
                  isInvalid={!!errors.confirmPassword}
                  value={getValues("confirmPassword")}
                  onChange={value => {
                    setValue("confirmPassword", value);
                    trigger("confirmPassword");
                  }}
                />
                <Button
                  color="tertiary"
                  size="sm"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-7"
                >
                  {showConfirmPassword ? (
                    <Eye className="size-5 text-gray-400" />
                  ) : (
                    <EyeOff className="size-5 text-gray-400" />
                  )}
                </Button>
              </InputGroup>

              {/* Error and Success Messages */}
              {errorMessage && (
                <div className="rounded-lg bg-error-50 border border-error-300 px-4 py-3">
                  <p className="text-error-600 text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex w-full flex-col items-start gap-4">
                {/* Submit Button */}
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  isDisabled={isSubmitting || !resetToken}
                  className="w-full"
                >
                  {isSubmitting ? "Resetting..." : "Save password"}
                </Button>
              </div>
            </form>
          </div>

          {/* Sign in link */}
          <div className="flex w-full items-baseline justify-center gap-1">
            <p className="text-sm font-normal leading-5 text-tertiary">Remember your password?</p>
            <Button href="/sign-in" color="link-color" size="md">
              Sign in
            </Button>
          </div>
        </div>
      </div>
      <SuccessModalWithLogo
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          navigate("/sign-in");
        }}
        size="xl"
        messageImg={checkmarkIcon}
        title="Password Reset Successful"
        subtitle="Your password has been updated successfully. You can now sign in using your new password."
        button={{
          text: "Login in",
          onClick: handleGetStarted,
          color: "primary",
        }}
      />
    </div>
  );
}
