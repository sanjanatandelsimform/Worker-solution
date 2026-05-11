import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../base/buttons/button";
import { Input } from "../base/input/input";
import { InputGroup } from "../base/input/input-group";
import { AlertCircle } from "@untitledui/icons";
import { resetPassword } from "@/services/api/authApi";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/services/validation/authSchemas";
import checkmarkIcon from "@/assets/success-check.svg";
import siteLogo from "@/assets/logo.svg";
import ErrorMessage from "../common/ErrorMessage";
import { getErrorState, type ErrorState } from "@/utils/errorHandler";

export default function ResetPasswordForm() {
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

  // Redirect immediately if no token present in URL
  if (!resetToken) {
    return <Navigate to="/sign-in" replace />;
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError(null);
      await resetPassword(resetToken, data.newPassword);
      reset();
      navigate("/success", {
        state: {
          messageImg: checkmarkIcon,
          title: "Password reset successful",
          subtitle:
            "Your password has been updated successfully. You can now sign in using your new password.",
          buttonText: "Log in",
          buttonPath: "/sign-in",
          shouldClearUser: true,
        },
      });
    } catch (err) {
      console.error("Reset password error:", err);
      setError(getErrorState(err));
    }
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
              <h2 className="w-full text-3xl font-semibold leading-9.5 text-ws-text-primary normal-case">
                Reset password
              </h2>
              <p className="w-full text-base font-normal leading-6 text-ws-text-tertiary normal-case">
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
                  label="Confirm password"
                  placeholder="Confirm password"
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
                  isDisabled={isSubmitting}
                  className="w-full normal-case"
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
            <Link to="/sign-in" className="text-sm font-normal underline text-ws-light-teal-850">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
