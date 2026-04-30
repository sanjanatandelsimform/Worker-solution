import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../base/buttons/button";
import { Input } from "../base/input/input";
import { InputGroup } from "../base/input/input-group";
import { AlertCircle } from "@untitledui/icons";
import { forgotPassword } from "@/services/api/authApi";
import siteLogo from "@/assets/logo.svg";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/services/validation/authSchemas";
import checkmarkIcon from "@/assets/success-check.svg";
import ErrorMessage from "../common/ErrorMessage";
import { getErrorState, type ErrorState } from "@/utils/errorHandler";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<ErrorState | null>(null);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
    reset,
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      await forgotPassword(data.email);
      reset();

      // Navigate to success page
      navigate("/success", {
        state: {
          messageImg: checkmarkIcon,
          title: "Email Verification!",
          subtitle:
            "A link has been sent to your email. Please check your inbox to reset your password and verify your email",
          buttonText: "Back to login",
          buttonPath: "/sign-in",
        },
      });
    } catch (err) {
      console.error("Forgot password error:", err);
      // Automatically determine error type based on error characteristics
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
            <div className="flex w-full flex-col items-center gap-3">
              <h2 className="w-full text-3xl text-center font-semibold leading-9.5 text-ws-text-primary">
                Forgot your password?
              </h2>
              <p className="w-full text-base font-normal leading-6 text-ws-text-tertiary">
                Enter the email address associated with your account and we'll send you a link to
                reset your password.
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex w-full flex-col items-center gap-6 rounded-xl">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full cursor-pointer flex-col gap-5"
            >
              {/* Email Input Field */}
              <InputGroup>
                <Input
                  name="email"
                  label="Business Email Address"
                  //icon={Mail01}
                  iconClassName="text-ws-gray-400"
                  size="md"
                  placeholder="Enter your email"
                  hint={errors.email?.message}
                  isInvalid={!!errors.email}
                  value={getValues("email")}
                  tooltip={errors.email ? errors.email.message : undefined}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("email", sanitized);
                    trigger("email");
                  }}
                  helperTooltip={"Enter the business email address of the primary account holder"}
                  isRequired
                />
              </InputGroup>

              {/* Error Messages */}
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
                {/* Submit Button */}
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  isDisabled={isSubmitting}
                  className="w-full mt-2"
                >
                  {isSubmitting ? "Sending..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </div>

          {/* Sign in link */}
          <div className="flex w-full items-baseline justify-center gap-1">
            <p className="text-sm font-normal leading-5 text-ws-text-tertiary">
              Don’t have an account?
            </p>
            <Link to="/sign-up" className="text-sm font-normal underline text-ws-light-teal-850">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
