import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { Input, InputBase } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Eye, EyeOff, Mail01 } from "@untitledui/icons";
import { NativeSelect } from "../base/select/select-native";
import { signup } from "@/services/api/authApi";
import { cx } from "@/utils/cx";
import type { RegistrationData } from "@/types/auth";

// Validation schema using Zod
const registrationSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First Name is required")
      .min(2, "First Name must be at least 2 characters")
      .max(20, "First Name must not exceed 20 characters"),
    lastName: z
      .string()
      .min(1, "Last Name is required")
      .max(20, "Last Name must not exceed 20 characters"),
    legalBusinessName: z
      .string()
      .min(1, "Legal Business Name is required")
      .min(2, "Legal Business Name must be at least 2 characters")
      .max(50, "Legal Business Name must not exceed 50 characters"),
    industry: z.string().min(1, "Industry is required"),
    zipCode: z
      .string()
      .min(1, "Zip Code is required")
      .regex(/^\d{5}$/, "Zip Code must be exactly 5 digits"),
    businessEmail: z
      .string()
      .min(1, "Business Email Address is required")
      .email("Enter a valid email address"),
    businessPhone: z
      .string()
      .min(1, "Business Phone is required")
      .refine(
        (value) => /^\d{10}$/.test(value.replace(/\D/g, "")),
        "Phone number must be exactly 10 digits",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and privacy policies",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

const industries = [
  {
    id: "Manufacturing",
    label: "Manufacturing",
    supportingText: "Manufacturing",
  },
  { id: "Retail", label: "Retail", supportingText: "Retail" },
  { id: "Healthcare", label: "Healthcare", supportingText: "Healthcare" },
  { id: "Technology", label: "Technology", supportingText: "Technology" },
  { id: "Finance", label: "Finance", supportingText: "Finance" },
  { id: "Construction", label: "Construction", supportingText: "Construction" },
  { id: "Education", label: "Education", supportingText: "Education" },
  { id: "Hospitality", label: "Hospitality", supportingText: "Hospitality" },
  {
    id: "Transportation",
    label: "Transportation",
    supportingText: "Transportation",
  },
  { id: "Other", label: "Other", supportingText: "Other" },
];

export const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      legalBusinessName: "",
      industry: "",
      zipCode: "",
      businessEmail: "",
      businessPhone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const legalBusinessName = watch("legalBusinessName");
  const zipCode = watch("zipCode");
  const businessEmail = watch("businessEmail");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const agreeToTerms = watch("agreeToTerms");

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setSubmitError(null);

      // Map form data to API format
      const registrationData: RegistrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        businessName: data.legalBusinessName,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        industry: data.industry as any,
        zipCode: data.zipCode,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.agreeToTerms,
      };

      // Call signup API
      await signup(registrationData);

      // Clear password fields from form state after successful submission
      setValue("password", "");
      setValue("confirmPassword", "");

      // Redirect to email verification page on success
      navigate("/email-verification");
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      {/* Container */}
      <div className="flex w-181.5 items-center justify-center rounded-xl border border-solid border-(--color-border-primary) bg-primary px-6 py-8 shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
        {/* Content */}
        <div className="flex w-full flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
            <h1
              className="text-[48px] font-bold leading-15 tracking-[-0.96px]"
              style={{
                fontFamily: "var(--font-family-display)",
                color: "var(--color-text-black)",
              }}
            >
              BeneStat
            </h1>
          </div>

          {/* Header */}
          <div className="flex w-full flex-col items-start gap-2">
            <h2
              className="w-full text-[36px] font-semibold leading-11 tracking-[-0.72px]"
              style={{
                fontFamily: "var(--font-family-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Sign up
            </h2>
            <p
              className="w-full text-[18px] font-normal leading-7"
              style={{
                fontFamily: "var(--font-family-body)",
                color: "var(--color-text-tertiary)",
              }}
            >
              We're excited that you've decided to try our Worker Solutions®
              platform. Before we begin we'll need to collect some information
              about your business.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full cursor-pointer"
            noValidate={false}
          >
            {/* Fields - Grid Layout */}
            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-4">
              {/* Row 1 - First Name & Last Name */}
              <InputGroup>
                <Input
                  name="firstName"
                  size="md"
                  isRequired
                  label="First Name"
                  hint={errors.firstName?.message}
                  placeholder="First Name"
                  isInvalid={!!errors.firstName}
                  value={firstName}
                  maxLength={20}
                  onChange={(value) => {
                    setValue("firstName", value);
                    trigger("firstName");
                  }}
                />
              </InputGroup>

              <InputGroup>
                <Input
                  name="lastName"
                  size="md"
                  isRequired
                  label="Last Name"
                  hint={errors.lastName?.message}
                  placeholder="Last Name"
                  isInvalid={!!errors.lastName}
                  value={lastName}
                  maxLength={20}
                  onChange={(value) => {
                    setValue("lastName", value);
                    trigger("lastName");
                  }}
                />
              </InputGroup>

              {/* Row 2 - Legal Business Name & Industry */}
              <InputGroup>
                <Input
                  name="legalBusinessName"
                  size="md"
                  isRequired
                  label="Legal Business Name"
                  hint={errors.legalBusinessName?.message}
                  placeholder="Legal Business Name"
                  isInvalid={!!errors.legalBusinessName}
                  value={legalBusinessName}
                  maxLength={50}
                  onChange={(value) => {
                    setValue("legalBusinessName", value);
                    trigger("legalBusinessName");
                  }}
                />
              </InputGroup>

              <div className="flex flex-col gap-1.5">
                <NativeSelect
                  label="Industry"
                  value={watch("industry") || ""}
                  onChange={(e) => {
                    setValue("industry", e.target.value);
                    trigger("industry");
                  }}
                  options={[
                    { label: "Select an industry", value: "", disabled: true },
                    ...industries.map((ind) => ({
                      label: ind.label,
                      value: ind.id,
                    })),
                  ]}
                  isRequired
                  style={{ color: "var(--color-text-primary)" }}
                  selectClassName={cx(
                    "!text-primary",
                    errors.industry &&
                      "ring-error_subtle focus-visible:ring-error",
                  )}
                />
                {errors.industry && (
                  <p
                    className="text-sm"
                    style={{ color: "red" }}
                    // style={{ color: "var(--color-text-error-primary)" }}
                  >
                    {errors.industry.message}
                  </p>
                )}
              </div>

              {/* Row 3 - Zip Code & (empty space for layout) */}
              <InputGroup>
                <Input
                  name="zipCode"
                  size="md"
                  isRequired
                  label="Zip Code"
                  hint={errors.zipCode?.message}
                  placeholder=""
                  isInvalid={!!errors.zipCode}
                  value={zipCode}
                  maxLength={5}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(value) => {
                    // Only allow numeric input
                    const numericValue = value.replace(/\D/g, "");
                    setValue("zipCode", numericValue);
                    trigger("zipCode");
                  }}
                />
              </InputGroup>

              {/* Row 4 - Business Email & Business Phone */}
              <InputGroup className="col-start-1">
                <Input
                  name="businessEmail"
                  size="md"
                  isRequired
                  label="Business Email Address"
                  hint={errors.businessEmail?.message}
                  placeholder="olivia@untitledui.com"
                  icon={Mail01}
                  isInvalid={!!errors.businessEmail}
                  value={businessEmail}
                  onChange={(value) => {
                    setValue("businessEmail", value);
                    trigger("businessEmail");
                  }}
                />
              </InputGroup>
              <InputGroup
                className="col-start-2"
                isRequired
                label="Business Phone"
                hint={errors.businessPhone?.message}
                isInvalid={!!errors.businessPhone}
                leadingAddon={
                  <NativeSelect
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    options={[
                      { label: "US +1", value: "US" },
                      { label: "UK +44", value: "UK" },
                      { label: "IN +91", value: "IN" },
                      { label: "CA +1", value: "CA" },
                      { label: "AU +61", value: "AU" },
                      { label: "DE +49", value: "DE" },
                      { label: "FR +33", value: "FR" },
                      { label: "JP +81", value: "JP" },
                      { label: "CN +86", value: "CN" },
                    ]}
                  />
                }
              >
                <InputBase
                  placeholder="(555) 000-0000"
                  type="tel"
                  size="sm"
                  value={phoneNumber}
                  maxLength={10}
                  onChange={(e: any) => {
                    const inputValue =
                      typeof e === "string"
                        ? e
                        : e?.target?.value || e?.value || "";
                    // Only allow numeric input and limit to 10 digits
                    const numericValue = inputValue
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setPhoneNumber(numericValue);
                    setValue("businessPhone", numericValue);
                    trigger("businessPhone");
                  }}
                />
              </InputGroup>

              {/* Row 5 - Password & Confirm Password */}
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
                  value={password}
                  maxLength={8}
                  className="relative"
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
                    <EyeOff className="size-5 text-gray-400" />
                  ) : (
                    <Eye className="size-5 text-gray-400" />
                  )}
                </Button>
              </InputGroup>

              <InputGroup className="relative">
                <Input
                  name="confirmPassword"
                  isRequired
                  label="Confirm Password"
                  hint={errors.confirmPassword?.message}
                  placeholder="Confirm Password"
                  size="md"
                  type={showConfirmPassword ? "text" : "password"}
                  isInvalid={!!errors.confirmPassword}
                  value={confirmPassword}
                  maxLength={8}
                  className="relative"
                  onChange={(value) => {
                    setValue("confirmPassword", value);
                    trigger("confirmPassword");
                  }}
                />
                <Button
                  color="tertiary"
                  size="sm"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-0 top-7"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5 text-gray-400" />
                  ) : (
                    <Eye className="size-5 text-gray-400" />
                  )}
                </Button>
              </InputGroup>
            </div>

            {/* Agreement Section */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <Checkbox
                size="sm"
                isSelected={agreeToTerms}
                onChange={(selected) => {
                  setValue("agreeToTerms", selected);
                  trigger("agreeToTerms");
                }}
              />
              <p
                className="text-sm font-normal leading-5"
                style={{
                  fontFamily: "var(--font-family-body)",
                  color: "var(--color-text-primary)",
                }}
              >
                I've read and agree to the Worker Solutions®{" "}
                <span
                  className="cursor-pointer"
                  style={{ color: "var(--color-cyan-500)" }}
                >
                  Terms
                </span>{" "}
                and{" "}
                <span
                  className="cursor-pointer"
                  style={{ color: "var(--color-cyan-500)" }}
                >
                  Privacy Policies
                </span>
              </p>
            </div>
            {errors.agreeToTerms && (
              <p className="mt-1 text-sm text-error-primary">
                {errors.agreeToTerms.message}
              </p>
            )}

            {/* Submit Error Display */}
            {submitError && (
              <div
                className="mt-4 rounded-lg border border-error-primary bg-error-secondary px-4 py-3 text-sm"
                role="alert"
                style={{ color: "var(--color-text-error-primary)" }}
              >
                {submitError}
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 flex w-full flex-col items-center gap-5">
              {/* Create Account Button */}
              <Button
                type="submit"
                color="primary"
                size="lg"
                isDisabled={isSubmitting}
                className="w-auto"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>

              {/* Sign in link */}
              <p
                className="text-sm font-normal leading-5"
                style={{
                  fontFamily: "var(--font-family-body)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                Already have an account?{" "}
                <Button
                  type="button"
                  color="link-color"
                  size="md"
                  href="/sign-in"
                  className="font-extrabold"
                >
                  Sign in
                </Button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
