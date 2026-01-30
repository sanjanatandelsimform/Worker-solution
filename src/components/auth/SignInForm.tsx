import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Checkbox } from "@/components/base/checkbox/checkbox";
// import { GoogleSSOButton } from "./GoogleSSOButton";
import { Eye, EyeOff, AlertOctagon } from "@untitledui/icons";
import type { SignInData } from "@/types/auth";
import { signin } from "@/services/api/authApi";
import { ChangePasswordModal } from "../modals/ChangePasswordModal";
import checkmarkIcon from "@/assets/checkmark-icon.svg";
import { signInSchema, type SignInFormData } from "@/services/validation/authSchemas";
import ErrorMessage from "./ErrorMessage";

export const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const navigate = useNavigate();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
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
      setErrorMessage(null);

      // Trigger validation on all fields to show errors
      const isValid = await trigger();
      if (!isValid) {
        return;
      }

      const signInData: SignInData = {
        businessEmail: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      };

      const response = await signin(signInData);

      if (response.status === "error" || !response.data) {
        throw new Error(response.message || "Incorrect email or password");
      }

      const { user, tokens } = response.data;

      // Clear password field
      setValue("password", "");
      // Navigate to success page
      navigate("/success", {
        state: {
          messageImg: checkmarkIcon,
          title: "Sign In Successful!",
          subtitle: "Welcome back! Continue your success journey with Worker Solutions®",
          buttonText: "Go to Dashboard",
          buttonPath: "/dashboard",
          user: user,
          tokens: tokens,
        },
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
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
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full cursor-pointer flex-col gap-5"
            >
              {/* Email Input Field */}
              <InputGroup>
                <Input
                  name="email"
                  size="md"
                  label="Email"
                  hint={errors.email?.message}
                  placeholder="Enter your email"
                  isInvalid={!!errors.email}
                  value={email}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("email", sanitized);
                    if (errors.email) trigger("email");
                  }}
                  onBlur={() => trigger("email")}
                />
              </InputGroup>

              {/* Password Input Field */}
              <InputGroup className="relative">
                <Input
                  name="password"
                  label="Password"
                  hint={errors.password?.message}
                  placeholder="Password"
                  size="md"
                  type={showPassword ? "text" : "password"}
                  isInvalid={!!errors.password}
                  value={password}
                  minLength={8}
                  maxLength={20}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("password", sanitized);
                    if (errors.password) trigger("password");
                  }}
                  onBlur={() => trigger("password")}
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
                <ErrorMessage
                  alertIcon={AlertOctagon}
                  errorMessage={errorMessage}
                  onClose={() => setErrorMessage(null)}
                />
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex w-full items-center">
                <div className="flex flex-1 items-start gap-2">
                  <Checkbox
                    size="sm"
                    isSelected={rememberMe}
                    onChange={selected => setValue("rememberMe", selected)}
                    label="Remember for 30 days"
                  />
                </div>

                <Button type="button" color="link-color" href="/forgot-password" size="md">
                  Forgot password?
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
                {/* <div className="flex w-full flex-col items-center justify-center gap-3">
                  <GoogleSSOButton />
                </div> */}
              </div>
            </form>
          </div>

          {/* Sign up link */}
          <div className="flex w-full items-baseline justify-center gap-1">
            <p className="text-sm font-normal leading-5 text-tertiary">Don't have an account?</p>
            <Button href="/sign-up" color="link-color" size="md">
              Sign up
            </Button>
          </div>
        </div>
      </div>

      {/* Modals:-this is used directly for testing purposes */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default SignInForm;
