import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "../base/buttons/button";
import { Input } from "../base/input/input";
import { InputGroup } from "../base/input/input-group";
import { Mail01 } from "@untitledui/icons";
import { forgotPassword } from "@/services/api/authApi";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/services/validation/authSchemas";
import checkmarkIcon from "@/assets/checkmark-icon.svg";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage(null);
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
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to process request. Please try again."
      );
    }
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
            <div className="flex w-full flex-col items-start gap-3">
              <h2 className="w-full text-4xl font-semibold leading-9.5 text-primary">
                Forgot your password?
              </h2>
              <p className="w-full text-medium font-normal leading-6 text-tertiary">
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
                  icon={Mail01}
                  size="md"
                  label="Business Email Address"
                  placeholder="olivia@untitledui.com"
                  hint={errors.email?.message}
                  isInvalid={!!errors.email}
                  value={getValues("email")}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("email", sanitized);
                    trigger("email");
                  }}
                />
              </InputGroup>

              {/* Error Messages */}
              {errorMessage && (
                <div className="rounded-lg bg-error-50 border border-error-300 px-4 py-3">
                  <p className="text-error-600 text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex w-full flex-col items-center gap-4">
                {/* Submit Button */}
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  isDisabled={isSubmitting}
                  className="w-auto"
                >
                  {isSubmitting ? "Sending..." : "Send Link"}
                </Button>
              </div>
            </form>
          </div>

          {/* Sign in link */}
          <div className="flex w-full items-baseline justify-center gap-1">
            <p className="text-sm font-normal leading-5 text-tertiary">Already have an account?</p>
            <Button href="/sign-in" color="link-color" size="md">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
