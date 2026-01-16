import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import {
  registrationSchema,
  type RegistrationFormData,
} from "../../services/validation/authSchemas";
import { signup } from "../../services/api/authApi";
import { Input } from "../base/input/input";
import { Button } from "../base/buttons/button";
import { Checkbox } from "../base/checkbox/checkbox";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { formatPhoneNumber } from "../../utils/phoneFormatter";
import type { Industry } from "../../types/auth";

interface RegistrationFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const industryOptions: { value: Industry; label: string }[] = [
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Retail", label: "Retail" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Technology", label: "Technology" },
  { value: "Finance", label: "Finance" },
  { value: "Construction", label: "Construction" },
  { value: "Education", label: "Education" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Transportation", label: "Transportation" },
  { value: "Other", label: "Other" },
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      email: "",
      phoneNumber: "",
      industry: "" as Industry,
      zipCode: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      await signup({
        ...data,
        phoneNumber: formatPhoneNumber(data.phoneNumber),
      });

      // Clear password from form state after successful submission
      setValue("password", "");
      setValue("confirmPassword", "");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
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

      {/* First Name */}
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => (
          <Input
            label="First Name"
            type="text"
            placeholder="John"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.firstName}
            hint={errors.firstName?.message}
          />
        )}
      />

      {/* Last Name */}
      <Controller
        name="lastName"
        control={control}
        render={({ field }) => (
          <Input
            label="Last Name"
            type="text"
            placeholder="Doe"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.lastName}
            hint={errors.lastName?.message}
          />
        )}
      />

      {/* Business Name */}
      <Controller
        name="businessName"
        control={control}
        render={({ field }) => (
          <Input
            label="Business Name"
            type="text"
            placeholder="Acme Corp"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.businessName}
            hint={errors.businessName?.message}
          />
        )}
      />

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

      {/* Phone Number */}
      <Controller
        name="phoneNumber"
        control={control}
        render={({ field }) => (
          <Input
            label="Phone Number"
            type="tel"
            placeholder="1234567890"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.phoneNumber}
            hint={errors.phoneNumber?.message}
          />
        )}
      />

      {/* Industry */}
      <div>
        <label
          htmlFor="industry"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Industry
        </label>
        <Controller
          name="industry"
          control={control}
          render={({ field }) => (
            <select
              id="industry"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={!!errors.industry}
              aria-describedby={errors.industry ? "industry-error" : undefined}
            >
              <option value="">Select an industry</option>
              {industryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        />
        {errors.industry && (
          <p
            id="industry-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.industry.message}
          </p>
        )}
      </div>

      {/* Zip Code */}
      <Controller
        name="zipCode"
        control={control}
        render={({ field }) => (
          <Input
            label="Zip Code"
            type="text"
            placeholder="12345"
            maxLength={5}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.zipCode}
            hint={errors.zipCode?.message}
          />
        )}
      />

      {/* Password */}
      <div>
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
        <PasswordStrengthIndicator password={passwordValue} className="mt-2" />
      </div>

      {/* Confirm Password */}
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.confirmPassword}
            hint={errors.confirmPassword?.message}
          />
        )}
      />

      {/* Terms & Conditions Checkbox */}
      <Controller
        name="acceptTerms"
        control={control}
        render={({ field }) => (
          <Checkbox
            isSelected={field.value}
            onChange={field.onChange}
            label={
              <span className="text-sm text-gray-700">
                I accept the{" "}
                <a
                  href="/terms"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms & Conditions
                </a>
              </span>
            }
            hint={errors.acceptTerms?.message}
          />
        )}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        color="primary"
        size="lg"
        className="w-full"
        isDisabled={isSubmitting}
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </Button>

      {/* Sign In Link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/auth/sign-in" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
};
