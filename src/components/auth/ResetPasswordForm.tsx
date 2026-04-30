import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../base/buttons/button";
import { Input } from "../base/input/input";
import { InputGroup } from "../base/input/input-group";
import { AlertCircle } from "@untitledui/icons";
import { resetPassword } from "@/services/api/authApi";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/services/validation/authSchemas";
import checkmarkIcon from "@/assets/success-check.svg";
import siteLogo from "@/assets/logo.svg";
import { SuccessModalWithLogo } from "../modals/SuccessModalWithLogo";
import ErrorMessage from "../common/ErrorMessage";
import { getErrorState, type ErrorState } from "@/utils/errorHandler";

export default function ResetPasswordForm() {
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
        <div className="flex w-full max-w-sm flex-col items-center gap-8">
          {/* Header */}
          <div className="flex w-full flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center justify-center">
              <img src={siteLogo} alt="Logo" className="max-w-80" />
            </div>

            {/* Title and Description */}
            <div className="flex w-full flex-col items-center gap-3 text-center">
              <h2 className="w-full text-3xl font-semibold leading-9.5 text-ws-text-primary">
                Reset password
              </h2>
              <p className="w-full text-base font-normal leading-6 text-ws-text-tertiary">
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
                <Input
                  name="newPassword"
                  label="Password"
                  placeholder="Password"
                  size="md"
                  type="password"
                  isRequired
                  hint={errors.newPassword?.message}
                  isInvalid={!!errors.newPassword}
                  value={getValues("newPassword")}
                  tooltip={errors.newPassword ? errors.newPassword.message : undefined}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("newPassword", sanitized);
                    trigger("newPassword");
                  }}
                  showPasswordToggle={false}
                />
              </InputGroup>

              {/* Confirm Password Input Field */}
              <InputGroup className="relative">
                <Input
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  size="md"
                  type="password"
                  isRequired
                  hint={errors.confirmPassword?.message}
                  isInvalid={!!errors.confirmPassword}
                  value={getValues("confirmPassword")}
                  tooltip={errors.confirmPassword ? errors.confirmPassword.message : undefined}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("confirmPassword", sanitized);
                    trigger("confirmPassword");
                  }}
                  showPasswordToggle={false}
                />
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
            <Link to="/sign-in" className="font-normal underline text-ws-light-teal-850">
              Sign in
            </Link>
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
