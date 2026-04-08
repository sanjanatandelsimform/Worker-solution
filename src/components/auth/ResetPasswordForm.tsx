import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../base/buttons/button";
import { Input } from "../base/input/input";
import { InputGroup } from "../base/input/input-group";
import { Eye, EyeOff, AlertCircle } from "@untitledui/icons";
import { resetPassword } from "@/services/api/authApi";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/services/validation/authSchemas";
import checkmarkIcon from "@/assets/finch-checkmark.svg";
import siteLogo from "@/assets/logo.svg";
import { SuccessModalWithLogo } from "../modals/SuccessModalWithLogo";
import ErrorMessage from "../common/ErrorMessage";
import { getErrorState, type ErrorState } from "@/utils/errorHandler";
import { Label } from "../base/input/label";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
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
      setError({
        message: "Invalid or missing reset token. Please request a new password reset link.",
        type: "warning",
      });
      return;
    }

    try {
      setError(null);
      await resetPassword(resetToken, data.newPassword);
      setIsOpen(true);
      reset();
    } catch (err) {
      console.error("Reset password error:", err);
      setError(getErrorState(err));
    }
  };

  const handleGetStarted = () => {
    setIsOpen(false);
    navigate("/sign-in");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-ws-light-teal-50">
      <div className="flex w-2xl items-center justify-center rounded-xl border border-ws-border-primary bg-ws-base-white py-22">
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          {/* Header */}
          <div className="flex w-full flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center justify-center">
              <img src={siteLogo} alt="Logo" className="max-w-80" />
            </div>

            {/* Title and Description */}
            <div className="flex w-full flex-col items-center gap-3 text-center">
              <h2 className="w-full text-3xl font-semibold leading-9.5 text-ws-black">
                Reset Password
              </h2>
              <p className="w-full text-medium font-normal leading-6 text-ws-text-tertiary">
                Please enter a new password below.
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
                <div className="flex flex-col gap-1.5 w-full">
                  <Label className="text-sm font-medium text-ws-text-secondary">
                    Password <span className="text-ws-error-600">*</span>
                  </Label>
                  <Input
                    name="newPassword"
                    placeholder="Password"
                    size="md"
                    type={showPassword ? "text" : "password"}
                    hint={errors.newPassword?.message}
                    isInvalid={!!errors.newPassword}
                    value={getValues("newPassword")}
                    tooltip={errors.newPassword ? errors.newPassword.message : undefined}
                    onChange={value => {
                      const sanitized = value.replace(/^\s+/, "");
                      setValue("newPassword", sanitized);
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
                    {!errors.newPassword && (
                      <>
                        {showPassword ? (
                          <Eye className="size-5 text-ws-gray-400" />
                        ) : (
                          <EyeOff className="size-5 text-ws-gray-400" />
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </InputGroup>

              {/* Confirm Password Input Field */}
              <InputGroup className="relative">
                <div className="flex flex-col gap-1.5 w-full">
                  <Label className="text-sm font-medium text-ws-text-secondary">
                    Confirm Password <span className="text-ws-error-600">*</span>
                  </Label>
                  <Input
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    size="md"
                    type={showConfirmPassword ? "text" : "password"}
                    hint={errors.confirmPassword?.message}
                    isInvalid={!!errors.confirmPassword}
                    value={getValues("confirmPassword")}
                    tooltip={errors.confirmPassword ? errors.confirmPassword.message : undefined}
                    onChange={value => {
                      const sanitized = value.replace(/^\s+/, "");
                      setValue("confirmPassword", sanitized);
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
                    {!errors.confirmPassword && (
                      <>
                        {showConfirmPassword ? (
                          <Eye className="size-5 text-ws-gray-400" />
                        ) : (
                          <EyeOff className="size-5 text-ws-gray-400" />
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </InputGroup>

              {/* Error and Success Messages */}
              {error && (
                <ErrorMessage
                  errorType={error.type}
                  alertIcon={AlertCircle}
                  errorMessage={error.message}
                  onClose={() => setError(null)}
                />
              )}

              {/* Actions */}
              <div className="flex w-full flex-col items-center gap-4">
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
            <p className="text-sm font-normal leading-5 text-ws-text-tertiary">
              Remember your password?
            </p>
            <Button
              href="/sign-in"
              color="link-color"
              size="md"
              className="text-ws-primary-light-teal-850 font-bold"
            >
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
          text: "Log in",
          onClick: handleGetStarted,
          color: "primary",
        }}
      />
    </div>
  );
}
