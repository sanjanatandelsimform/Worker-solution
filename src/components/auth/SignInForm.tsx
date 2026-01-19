import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { GoogleSSOButton } from "./GoogleSSOButton";
import { Eye, EyeOff } from "@untitledui/icons";
import type { SignInData } from "@/types/auth";
import { signin } from "@/services/api/authApi";
import { ChangePasswordModal } from "../modals/ChangePasswordModal";
import { EmailVerificationModal } from "../modals/EmailVerificationModal";

// Validation schema using Zod
const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine(
      (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Please enter correct email format.",
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must be min 8 characters, include number, upper case, lower case and symbol.",
    ),
  rememberMe: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] =
    useState(false);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");
  const email = watch("email");
  const password = watch("password");

  const onSubmit = async (data: SignInFormData) => {
    try {
      const signInData: SignInData = {
        businessEmail: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      };

      // Call signin API
      await signin(signInData);
      setErrorMessage(null); // Clear any previous error messages
      // Handle sign in logic
      console.log("Form submitted:", data);
      // Open EmailVerificationModal for layout preview
      setIsEmailVerificationModalOpen(true);
      // Add your authentication logic here
    } catch (error) {
      console.error("Sign in error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      {/* Container */}
      <div className="flex w-2xl items-center justify-center rounded-xl border border-solid border-primary bg-primary py-28">
        {/* Content */}
        <div className="flex w-full max-w-90 flex-col items-center gap-8">
          {/* Header */}
          <div className="flex w-full flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
              <h1 className="text-5xl font-bold leading-15 text-primary">
                BeneStat
              </h1>
            </div>

            {/* Text and supporting text */}
            <div className="flex w-full flex-col items-start gap-3 text-center">
              <h2 className="w-full text-4xl font-semibold leading-9.5 text-primary">
                Log in to your account
              </h2>
              <p className="w-full text-medium font-normal leading-6 text-tertiary">
                Welcome back! Please enter your details.
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex w-full flex-col items-center gap-6 rounded-xl">
            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full cursor-pointer flex-col gap-5"
            >
              {/* Email Input Field */}
              <InputGroup>
                <Input
                  name="email"
                  size="md"
                  isRequired={true}
                  label="Email"
                  hint={errors.email?.message}
                  placeholder="Enter your email"
                  isInvalid={!!errors.email}
                  className={errors.email ? "error-ring" : ""}
                  value={email}
                  onChange={(value) => {
                    setValue("email", value);
                    trigger("email");
                  }}
                />
              </InputGroup>

              {/* Password Input Field */}
              <InputGroup className="relative">
                <Input
                  name="password"
                  isRequired
                  label="Password"
                  hint={errors.password?.message}
                  placeholder="Password"
                  size="md"
                  type={showPassword ? "text" : "password"}
                  isInvalid={!!errors.password}
                  className={errors.password ? "error-ring" : ""}
                  value={password}
                  maxLength={8}
                  onChange={(value) => {
                    setValue("password", value);
                    trigger("password");
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

              {/* Error Message Display */}
              {errorMessage && (
                <div className="text-red-500 text-sm">{errorMessage}</div>
              )}

              {/* Row - Checkbox and Forgot Password */}
              <div className="flex w-full items-center">
                {/* Checkbox */}
                <div className="flex flex-1 items-start gap-2">
                  <Checkbox
                    size="sm"
                    isSelected={rememberMe}
                    onChange={(selected) => setValue("rememberMe", selected)}
                    label="Remember for 30 days"
                  />
                </div>

                {/* Forgot Password Button */}
                <Button
                  type="button"
                  color="link-color"
                  size="md"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                >
                  Forgot password
                </Button>
              </div>

              {/* Actions */}
              <div className="flex w-full flex-col items-start gap-4">
                {/* Sign in Button */}
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  isDisabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>

                {/* Social button groups */}
                <div className="flex w-full flex-col items-center justify-center gap-3">
                  <GoogleSSOButton />
                </div>
              </div>
            </form>
          </div>

          {/* Row - Sign up link */}
          <div className="flex w-full items-baseline justify-center gap-1">
            <p className="text-sm font-normal leading-5 text-tertiary">
              Don't have an account?
            </p>
            <Button href="/register" color="link-color" size="md">
              Sign up
            </Button>
          </div>
        </div>
      </div>
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <EmailVerificationModal
        isOpen={isEmailVerificationModalOpen}
        onClose={() => setIsEmailVerificationModalOpen(false)}
        onGetStarted={() => {
          console.log("Get Started clicked");
          setIsEmailVerificationModalOpen(false);
        }}
      />
    </div>
  );
};

export default SignInForm;
