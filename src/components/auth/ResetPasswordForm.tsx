import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Eye, EyeOff } from "@untitledui/icons";
import type { Industry, SignInData } from "@/types/auth";
import { signin } from "@/services/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

import {
  signInSchema,
  type SignInFormData,
} from "@/services/validation/authSchemas";

export const ResetPasswordForm = () => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const signInData: SignInData = {
        businessEmail: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      };
      const response = {
        status: true,
        message: "loginSuccess",
        data: {
          user: {
            id: "cc010f29-60d8-4df1-8015-981112195de9",
            firstName: "test",
            lastName: "test",
            businessName: "Simform",
            industry: "fgggfgfg",
            zipCode: 395107,
            businessEmail: "yash@gmail.com",
            businessPhone: "1234567890",
            googleId: null,
            emailVerify: false,
            resetToken: null,
            resetTokenExpiry: null,
            refreshToken:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYzAxMGYyOS02MGQ4LTRkZjEtODAxNS05ODExMTIxOTVkZTkiLCJlbWFpbCI6Inlhc2hAZ21haWwuY29tIiwicmVtZW1iZXIiOnRydWUsImlhdCI6MTc2ODU2MDg2OSwiZXhwIjoxNzcxMTUyODY5fQ.B2p7GipW76hRO4hgb1RYF9NDicSHiYmJ2JMu1CVzNdY",
            count: 1,
            createdAt: "2026-01-16T10:25:02.051Z",
            updatedAt: "2026-01-16T10:54:47.859Z",
          },
          tokens: {
            accessToken:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYzAxMGYyOS02MGQ4LTRkZjEtODAxNS05ODExMTIxOTVkZTkiLCJlbWFpbCI6Inlhc2hAZ21haWwuY29tIiwiY291bnQiOjEsImlhdCI6MTc2ODgxOTEzNCwiZXhwIjoxNzY4ODI2MzM0fQ.lha52AgLNaaQFPVRhli5niNav5picuuM-Iu8IPIFmyc",
            refreshToken:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYzAxMGYyOS02MGQ4LTRkZjEtODAxNS05ODExMTIxOTVkZTkiLCJlbWFpbCI6Inlhc2hAZ21haWwuY29tIiwicmVtZW1iZXIiOnRydWUsImlhdCI6MTc2ODgxOTEzNCwiZXhwIjoxNzcxNDExMTM0fQ.Roe_QtpdfYPks9Gs8afjib3UdNZSpaDujdNYSMEYqZs",
          },
        },
      };
      const response1 = await signin(signInData);
      console.log("response", response1);
      // Since the API is not deployed yet, this is used directly for testing purposes.
      if (response.status !== true) {
        throw new Error(response.message || "Sign in failed");
      } else {
        console.log("Sign in successful:", response, response.data.user.id);
        // Store user data in Redux
        dispatch(
          setUser({
            user: {
              id: response.data.user.id,
              email: response.data.user.businessEmail,
              firstName: response.data.user.firstName,
              lastName: response.data.user.lastName,
              businessName: response.data.user.businessName,
              phoneNumber: response.data.user.businessPhone,
              industry: response.data.user.industry as Industry,
              zipCode: response.data.user.zipCode.toString(),
              authMethod: response.data.user.googleId ? "google" : "email",
              emailVerified: response.data.user.emailVerify,
              profileComplete: true,
              createdAt: response.data.user.createdAt,
              updatedAt: response.data.user.updatedAt,
            },
            tokens: response.data.tokens,
          }),
        );

        setValue("email", "");
        setValue("password", "");
        setErrorMessage(null); // Clear any previous error messages
        setIsOpen(true);
      }
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
      <div className="flex w-2xl items-center justify-center rounded-xl border border-solid border-primary bg-primary py-28">
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          {/* Header */}
          <div className="flex w-full flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
              <h1 className="text-5xl font-bold leading-15 text-primary">
                BeneStat
              </h1>
            </div>

            {/* Title and Description */}
            <div className="flex w-full flex-col items-start gap-3 text-center">
              <h2 className="w-full text-4xl font-semibold leading-9.5 text-primary">
                Reset Password
              </h2>
              <p className="w-full text-medium font-normal leading-6 text-tertiary">
                Enter the email address associated with your account and we’ll send you a link to reset your password.
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
                  name="password"
                  isRequired
                  label="New Password"
                  placeholder="New Password"
                  size="md"
                  type={showPassword ? "text" : "password"}
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

              {/* Confirm Password Input Field */}
              <InputGroup className="relative">
                <Input
                  name="confirmPassword"
                  isRequired
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  size="md"
                  type={showPassword ? "text" : "password"}
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
                  {isSubmitting ? "Saving..." : "Save password"}
                </Button>
              </div>
            </form>
          </div>

          {/* Sign in link */}
          <div className="flex w-full items-baseline justify-center gap-1">
            <p className="text-sm font-normal leading-5 text-tertiary">
              Already have an account?
            </p>
            <Button href="/sign-in" color="link-color" size="md">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
