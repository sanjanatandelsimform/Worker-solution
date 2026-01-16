import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/base/buttons/button";
import { Input, InputBase } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Select } from "@/components/base/select/select";
import { Eye, EyeOff, Mail01 } from "@untitledui/icons";
import { NativeSelect } from "../base/select/select-native";

// Validation schema using Zod
const registrationSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    legalBusinessName: z.string().min(1, "Legal business name is required"),
    industry: z.string().min(1, "Select an industry"),
    zipCode: z
      .string()
      .min(1, "Zip code is required")
      .regex(/^\d{5}(-\d{4})?$/, "Enter a valid zipcode"),
    businessEmail: z
      .string()
      .min(1, "Email is required")
      .refine(
        (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "Enter a valid email address"
      ),
    businessPhone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\+?1?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, "10 digits required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Must be min 6 characters, include number, upper case, lower case and symbol."
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
  { id: "technology", label: "Technology", supportingText: "Technology" },
  { id: "healthcare", label: "Healthcare", supportingText: "Healthcare" },
  { id: "finance", label: "Finance", supportingText: "Finance" },
  { id: "retail", label: "Retail", supportingText: "Retail" },
  { id: "manufacturing", label: "Manufacturing", supportingText: "Manufacturing" },
  { id: "education", label: "Education", supportingText: "Education" },
  { id: "hospitality", label: "Hospitality", supportingText: "Hospitality" },
  { id: "other", label: "Other", supportingText: "Other" },
];

export const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("US");

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onBlur",
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
  const businessPhone = watch("businessPhone");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const agreeToTerms = watch("agreeToTerms");

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      // Handle registration logic
      console.log("Form submitted:", data);
      // Add your registration logic here
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const handleSignIn = () => {
    // Handle sign in navigation
    console.log("Sign in clicked");
  };

  const items = [
    { label: "Phoenix Baker", id: "@phoenix", supportingText: "@phoenix" },
    { label: "Olivia Rhye", id: "@olivia", supportingText: "@olivia" },
    {
      label: "Lana Steiner",
      id: "@lana",
      supportingText: "@lana",
      disabled: true,
    },
    { label: "Demi Wilkinson", id: "@demi", supportingText: "@demi" },
    { label: "Candice Wu", id: "@candice", supportingText: "@candice" },
    { label: "Natali Craig", id: "@natali", supportingText: "@natali" },
    { label: "Abraham Baker", id: "@abraham", supportingText: "@abraham" },
    { label: "Adem Lane", id: "@adem", supportingText: "@adem" },
    { label: "Jackson Reed", id: "@jackson", supportingText: "@jackson" },
    { label: "Jessie Meyton", id: "@jessie", supportingText: "@jessie" },
  ];

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
              We're excited that you've decided to try our Worker Solutions® platform. Before we
              begin we'll need to collect some information about your business.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="w-full cursor-pointer">
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
                  onChange={(value) => {
                    setValue("legalBusinessName", value);
                    trigger("legalBusinessName");
                  }}
                />
              </InputGroup>

              <Select
                  className="w-full flex items-start"
                  isRequired
                  size="md"
                  label="Select Your Industry"
                  //tooltip="This is a tooltip"
                  //hint="This is a hint text to help user."
                  placeholder="Select Option"
                  items={items}
                >
                  {(item) => (
                    <Select.Item
                      id={item.id}
                      supportingText={item.supportingText}
                      isDisabled={item.isDisabled}
                      icon={item.icon}
                      avatarUrl={item.avatarUrl}
                    >
                      {item.label}
                    </Select.Item>
                  )}
                </Select>

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
                  onChange={(value) => {
                    setValue("zipCode", value);
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
               <InputGroup className="col-start-2"
                  label="Phone number"
                  hint="Enter your phone number with country code"
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
                  onChange={setPhoneNumber}
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
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
