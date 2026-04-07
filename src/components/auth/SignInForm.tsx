import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Checkbox } from "@/components/base/checkbox/checkbox";
// import { GoogleSSOButton } from "./GoogleSSOButton";
import { Eye, EyeOff, AlertCircle } from "@untitledui/icons";
import type { SignInData } from "@/types/auth";
import { signin } from "@/services/api/authApi";
// import checkmarkIcon from "@/assets/finch-checkmark.svg";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import siteLogo from "@/assets/logo.svg";
import { signInSchema, type SignInFormData } from "@/services/validation/authSchemas";
import { getErrorState, type ErrorState } from "@/utils/errorHandler";
import ErrorMessage from "@/components/common/ErrorMessage";
import { ChangePasswordModal } from "@/components/modals";
import { Label } from "../base/input/label";

export const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorState | null>(null);
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
  const dispatch = useAppDispatch();

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
      if (user && tokens) {
        dispatch(
          setUser({
            user: {
              id: user.id,
              businessEmail: user.businessEmail || "",
              firstName: user.firstName,
              lastName: user.lastName,
              businessName: user.businessName,
              phoneNumber: user.businessPhone || user.phoneNumber,
              industry: user.industry,
              zipCode: typeof user.zipCode === "string" ? parseInt(user.zipCode) : user.zipCode,
              authMethod: user.googleId ? "google" : "email",
              emailVerify: user.emailVerify ?? false,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
            tokens,
          })
        );
      }
      // Clear password field
      setValue("password", "");
      // Navigate to dashboard page
      navigate("/dashboard");
      // navigate("/success", {
      //   state: {
      //     messageImg: checkmarkIcon,
      //     title: "Sign In Successful!",
      //     subtitle: "Welcome back! Continue your success journey with BeneStats®",
      //     buttonText: "Go to Dashboard",
      //     buttonPath: "/dashboard",
      //     user: user,
      //     tokens: tokens,
      //   },
      // });
    } catch (error) {
      setErrorMessage(getErrorState(error));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ws-light-teal-50">
      <div className="flex w-2xl items-center justify-center rounded-xl border border-ws-border-primary bg-ws-base-white py-30">
        <div className="flex w-sm max-w-sm flex-col items-center gap-8">
          {/* Header */}
          <div className="flex w-full flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center justify-center">
              <img src={siteLogo} alt="Logo" className="max-w-80" />
            </div>

            {/* Title and Description */}
            <div className="flex w-full flex-col items-start gap-3 text-center">
              <h2 className="w-full text-3xl font-semibold leading-9.5 text-ws-text-primary">
                Log in to your account
              </h2>
              <p className="w-full text-base font-normal leading-6 text-ws-text-tertiary">
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
                <div className="flex flex-col gap-1.5 w-full">
                  <Label className="text-sm font-medium text-ws-text-secondary">
                    Email <span className="text-ws-error-600">*</span>
                  </Label>
                  <Input
                    name="email"
                    size="md"
                    hint={errors.email?.message}
                    placeholder="Enter your email"
                    isInvalid={!!errors.email}
                    value={email}
                    tooltip={errors.email ? errors.email.message : undefined}
                    onChange={value => {
                      const sanitized = value.replace(/^\s+/, "");
                      setValue("email", sanitized);
                      if (errors.email) trigger("email");
                    }}
                    onBlur={() => trigger("email")}
                  />
                </div>
              </InputGroup>

              {/* Password Input Field */}
              <InputGroup className="relative">
                <div className="flex flex-col gap-1.5 w-full">
                  <Label className="text-sm font-medium text-ws-black-20">
                    Password <span className="text-ws-error-600">*</span>
                  </Label>
                  <Input
                    name="password"
                    hint={errors.password?.message}
                    placeholder="Password"
                    size="md"
                    type={showPassword ? "text" : "password"}
                    isInvalid={!!errors.password}
                    value={password}
                    minLength={8}
                    maxLength={20}
                    tooltip={errors.password ? errors.password.message : undefined}
                    onChange={value => {
                      const sanitized = value.replace(/^\s+/, "");
                      setValue("password", sanitized);
                      if (errors.password) trigger("password");
                    }}
                    onBlur={() => trigger("password")}
                  />
                </div>
                <Button
                  color="tertiary"
                  size="sm"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-7"
                >
                  {!errors.password && (
                    <>
                      {showPassword ? (
                        <Eye className="size-5 text-ws-gray-400" />
                      ) : (
                        <EyeOff className="size-5 text-ws-gray-400" />
                      )}
                    </>
                  )}
                </Button>
              </InputGroup>

              {/* Error Message Display */}
              {errorMessage && (
                <ErrorMessage
                  errorType={errorMessage.type}
                  alertIcon={AlertCircle}
                  errorMessage={errorMessage.message}
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
                    className="text-ws-text-secondary"
                  />
                </div>

                <Button
                  type="button"
                  color="link-color"
                  className="text-ws-navy-800"
                  href="/forgot-password"
                  size="md"
                >
                  Forgot password?
                </Button>
              </div>

              <div className="flex w-full flex-col items-start">
                {/* Sign in Button */}
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  isDisabled={isSubmitting}
                  className="w-full mt-1"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          </div>

          {/* Sign up link */}
          <div className="flex w-full items-baseline justify-center gap-1">
            <p className="text-sm font-normal leading-5 text-ws-text-tertiary">Don't have an account?</p>
            <Button
              href="/sign-up" 
              color="link-color"
              className="text-ws-light-teal-850 font-semibold"
              size="md"
            >
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
