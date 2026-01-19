import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  businessInfoSchema,
  type BusinessInfoFormData,
} from "../../services/validation/authSchemas";
import { submitBusinessInfo } from "../../services/api/authApi";
import { Input } from "../base/input/input";
import { Button } from "../base/buttons/button";
import { formatPhoneNumber } from "../../utils/phoneFormatter";
import type { Industry } from "../../types/auth";

interface BusinessInfoFormProps {
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

export const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    mode: "onBlur",
    defaultValues: {
      businessName: "",
      phoneNumber: "",
      industry: "" as Industry,
      zipCode: "",
    },
  });

  const onSubmit = async (data: BusinessInfoFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      await submitBusinessInfo({
        ...data,
        phoneNumber: formatPhoneNumber(data.phoneNumber || ""),
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit business information";
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

      {/* Submit Button */}
      <Button
        type="submit"
        color="primary"
        size="lg"
        className="w-full"
        isDisabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Complete Profile"}
      </Button>
    </form>
  );
};
