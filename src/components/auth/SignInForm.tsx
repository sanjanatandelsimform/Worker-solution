import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Checkbox } from "@/components/base/checkbox/checkbox";
// import { GoogleSSOButton } from "./GoogleSSOButton";
import { AlertCircle } from "@untitledui/icons";
import type { SignInData } from "@/types/auth";
import { signin } from "@/services/api/authApi";
// import checkmarkIcon from "@/assets/success-check.svg";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import siteLogo from "@/assets/logo.svg";
import { signInSchema, type SignInFormData } from "@/services/validation/authSchemas";
import { getErrorState, type ErrorState } from "@/utils/errorHandler";
import ErrorMessage from "@/components/common/ErrorMessage";
import { ChangePasswordModal } from "@/components/modals";

export const SignInForm = () => {
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
                Log in to Your Account
              </h2>
              <p className="w-full text-base font-normal leading-6 text-ws-text-tertiary">
                Welcome back! Please enter your details.
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex w-full flex-col items-center gap-6 rounded-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
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
                  tooltip={errors.email ? errors.email.message : undefined}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("email", sanitized);
                    if (errors.email) trigger("email");
                  }}
                  onBlur={() => trigger("email")}
                  isRequired
                  helperTooltip="Use your business email associated with BeneStats®"
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
                  type="password"
                  isInvalid={!!errors.password}
                  value={password}
                  minLength={8}
                  maxLength={20}
                  isRequired
                  tooltip={errors.password ? errors.password.message : undefined}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("password", sanitized);
                    if (errors.password) trigger("password");
                  }}
                  onBlur={() => trigger("password")}
                  showPasswordToggle={false}
                />
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
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-ws-navy-800 hover:text-ws-navy-800 hover:underline"
                >
                  Forgot password?
                </Link>
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
            <p className="text-sm font-normal leading-5 text-ws-text-tertiary">
              Don't have an account?
            </p>
            <Link
              to="/sign-up"
              className="text-sm font-semibold text-ws-light-teal-850 hover:text-ws-light-teal-800"
            >
              Sign up
            </Link>
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
