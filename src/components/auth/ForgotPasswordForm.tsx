import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "../base/buttons/button";
import { Input } from "../base/input/input";
import { InputGroup } from "../base/input/input-group";
import { Mail01, AlertCircle } from "@untitledui/icons";
import { forgotPassword } from "@/services/api/authApi";
import siteLogo from "@/assets/logo.svg";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/services/validation/authSchemas";
import checkmarkIcon from "@/assets/finch-checkmark.svg";
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
    <div className="flex min-h-screen items-center justify-center bg-ws-primary-200">
      <div className="flex w-2xl items-center justify-center rounded-xl border border-ws-primary-100 bg-ws-white py-22">
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
                Forgot your password?
              </h2>
              <p className="w-full text-medium font-normal leading-6 text-ws-black-10">
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
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-medium text-ws-black-20">
                    Business Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="email"
                    icon={Mail01}
                    size="md"
                    placeholder="olivia@untitledui.com"
                    hint={errors.email?.message}
                    isInvalid={!!errors.email}
                    value={getValues("email")}
                    tooltip={errors.email ? errors.email.message : undefined}
                    onChange={value => {
                      const sanitized = value.replace(/^\s+/, "");
                      setValue("email", sanitized);
                      trigger("email");
                    }}
                  />
                </div>
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
                  className="w-auto bg-ws-primary-900 text-ws-white hover:bg-ws-primary-900-hover focus:bg-ws-primary-900-hover active:bg-ws-primary-900-hover"
                >
                  {isSubmitting ? "Sending..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </div>

          {/* Sign in link */}
          <div className="flex w-full items-baseline justify-center gap-1">
            <p className="text-sm font-normal leading-5 text-ws-black-10">
              Already have an account?
            </p>
            <Button href="/sign-in" color="link-color" size="md" className="text-ws-primary-500 font-bold">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
