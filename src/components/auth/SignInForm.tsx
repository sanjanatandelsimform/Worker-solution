import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import {
  signInSchema,
  type SignInFormData,
} from "../../services/validation/authSchemas";
import { signin } from "../../services/api/authApi";
import { Input } from "../base/input/input";
import { Button } from "../base/buttons/button";
import { Checkbox } from "../base/checkbox/checkbox";

interface SignInFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
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
    setIsSubmitting(true);
    setApiError(null);

    try {
      await signin(data);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign in failed";
      setApiError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* API Error Message */}
      {apiError && (
        <div
          className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
          aria-live="assertive"
        >
          {apiError}
        </div>
      )}

      {/* Email */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Input
            label="Email"
            type="email"
            placeholder="john@acmecorp.com"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.email}
            hint={errors.email?.message}
          />
        )}
      />

      {/* Password */}
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.password}
            hint={errors.password?.message}
          />
        )}
      />

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <Checkbox
              isSelected={field.value}
              onChange={field.onChange}
              label="Remember for 30 days"
            />
          )}
        />

        <Link
          to="/auth/password-reset"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        color="primary"
        size="lg"
        className="w-full"
        isDisabled={isSubmitting}
      >
        {isSubmitting ? "Signing In..." : "Sign In"}
      </Button>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link to="/auth/register" className="text-blue-600 hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
};
