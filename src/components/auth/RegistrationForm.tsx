// Ensure that this file only exports components to comply with the react-refresh/only-export-components rule.
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { Input, InputBase } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Eye, EyeOff, Mail01, AlertCircle } from "@untitledui/icons";
import { NativeSelect } from "../base/select/select-native";
import { Select } from "../base/select/select";
import { signup } from "@/services/api/authApi";
import type { RegistrationData, Industry } from "@/types/auth";
import { registrationSchema, type RegistrationFormData } from "@/services/validation/authSchemas";
import { INDUSTRIES, COUNTRY_CODES } from "@/constants/formOptions";
import checkmarkIcon from "@/assets/checkmark-icon.svg";
import ErrorMessage from "../common/ErrorMessage";
import { getErrorState, type ErrorState } from "@/utils/errorHandler";

export const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [submitError, setSubmitError] = useState<ErrorState | null>(null);
  const navigate = useNavigate();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    trigger,
    // control,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onSubmit", // <-- important for submit validation
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

  const watchedFields = useWatch({
    control,
    name: [
      "firstName",
      "lastName",
      "legalBusinessName",
      "industry",
      "zipCode",
      "businessEmail",
      "password",
      "confirmPassword",
      "agreeToTerms",
    ],
  });

  const [
    firstName,
    lastName,
    legalBusinessName,
    industry,
    zipCode,
    businessEmail,
    password,
    confirmPassword,
    agreeToTerms,
  ] = watchedFields;

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setSubmitError(null);

      // Validate all fields before processing
      const isValid = await trigger();
      if (!isValid) return; // Show errors, don't submit

      const registrationData: RegistrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        businessName: data.legalBusinessName,
        industry: data.industry as Industry,
        zipCode: parseInt(data.zipCode, 10),
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.agreeToTerms,
      };

      await signup(registrationData);

      navigate("/success", {
        state: {
          messageImg: checkmarkIcon,
          title: "Account created successfully!",
          subtitle: "Welcome aboard! Start your success journey with Worker Solutions®",
          buttonText: "Let's Get Started",
          buttonPath: "/sign-in",
        },
      });
      setValue("password", "");
      setValue("confirmPassword", "");
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError(getErrorState(error));
    }
  };

  // const handleGetStarted = () => {
  //   navigate("/sign-in");
  // };
  console.log("errors", errors);
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      {/* Container */}
      <div className="flex w-3xl items-center justify-center rounded-xl border border-solid border-primary bg-primary p-10">
        {/* Content */}
        <div className="flex w-full flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
            <h1 className="text-5xl font-bold leading-15 text-primary">BeneStat</h1>
          </div>

          {/* Header */}
          <div className="flex w-full flex-col items-start gap-2">
            <h2 className="w-full text-4xl font-semibold leading-9.5 text-primary">Sign up</h2>
            <p className="w-full text-medium font-normal leading-6 text-tertiary">
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
                  label="First Name"
                  hint={errors.firstName?.message}
                  placeholder="First Name"
                  isInvalid={!!errors.firstName}
                  value={firstName}
                  maxLength={20}
                  className={errors.firstName ? "error-ring" : ""}
                  onChange={value => {
                    // Remove leading spaces only
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("firstName", sanitized);
                    trigger("firstName");
                  }}
                />
              </InputGroup>

              <InputGroup>
                <Input
                  name="lastName"
                  size="md"
                  label="Last Name"
                  hint={errors.lastName?.message}
                  placeholder="Last Name"
                  value={lastName}
                  isInvalid={!!errors.lastName}
                  maxLength={20}
                  className={errors.lastName ? "error-ring" : ""}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("lastName", sanitized);
                    trigger("lastName");
                  }}
                />
              </InputGroup>

              {/* Row 2 - Legal Business Name & Industry */}
              <InputGroup>
                <Input
                  name="legalBusinessName"
                  size="md"
                  label="Legal Business Name"
                  hint={errors.legalBusinessName?.message}
                  placeholder="Legal Business Name"
                  isInvalid={!!errors.legalBusinessName}
                  value={legalBusinessName}
                  maxLength={50}
                  className={errors.legalBusinessName ? "error-ring" : ""}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("legalBusinessName", sanitized);
                    trigger("legalBusinessName");
                  }}
                />
              </InputGroup>

              <Select
                // className="w-full flex items-start"
                className={errors.industry ? "error-ring" : "w-full flex items-start"}
                size="md"
                label="Select Your Industry"
                placeholder="Select Option"
                items={INDUSTRIES}
                selectedKey={industry}
                onSelectionChange={key => {
                  setValue("industry", key as string);
                  trigger("industry");
                }}
                isInvalid={!!errors.industry}
                hint={errors.industry?.message}
              >
                {item => (
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
                  label="Zip Code"
                  hint={errors.zipCode?.message}
                  placeholder=""
                  isInvalid={!!errors.zipCode}
                  value={zipCode}
                  maxLength={5}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={errors.zipCode ? "error-ring" : ""}
                  onChange={value => {
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
                  label="Business Email Address"
                  hint={errors.businessEmail?.message}
                  placeholder="olivia@untitledui.com"
                  icon={Mail01}
                  isInvalid={!!errors.businessEmail}
                  value={businessEmail}
                  className={errors.businessEmail ? "error-ring" : ""}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("businessEmail", sanitized);
                    trigger("businessEmail");
                  }}
                />
              </InputGroup>
              <InputGroup
                // className="col-start-2"
                className={errors.businessPhone ? "error-ring" : "col-start-2"}
                label="Business Phone Number"
                hint={errors.businessPhone?.message}
                isInvalid={!!errors.businessPhone}
                leadingAddon={
                  <NativeSelect
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    options={COUNTRY_CODES}
                  />
                }
              >
                <InputBase
                  placeholder="(555) 000-0000"
                  type="tel"
                  size="sm"
                  value={phoneNumber}
                  maxLength={10}
                  onChange={(e: React.ChangeEvent<HTMLInputElement> | string) => {
                    const inputValue = typeof e === "string" ? e : e?.target?.value || "";
                    // Only allow numeric input and limit to 10 digits
                    const numericValue = inputValue.replace(/\D/g, "").slice(0, 10);
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
                  label="Password"
                  hint={errors.password?.message}
                  placeholder="Password"
                  size="md"
                  type={showPassword ? "text" : "password"}
                  isInvalid={!!errors.password}
                  value={password}
                  className="relative"
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("password", sanitized);
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

              <InputGroup className="relative">
                <Input
                  name="confirmPassword"
                  label="Confirm Password"
                  hint={errors.confirmPassword?.message}
                  placeholder="Confirm Password"
                  size="md"
                  type={showConfirmPassword ? "text" : "password"}
                  isInvalid={!!errors.confirmPassword}
                  value={confirmPassword}
                  className="relative"
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("confirmPassword", sanitized);
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
                    <Eye className="size-5 text-gray-400" />
                  ) : (
                    <EyeOff className="size-5 text-gray-400" />
                  )}
                </Button>
              </InputGroup>
            </div>

            {/* Agreement Section */}
            <div className="mt-6 flex items-center flex-col justify-center gap-2">
              <div className="flex gap-2 items-start">
                <Checkbox
                  size="sm"
                  isSelected={agreeToTerms}
                  onChange={selected => {
                    setValue("agreeToTerms", selected);
                    trigger("agreeToTerms");
                  }}
                  aria-label="I agree to the Terms and Privacy Policies"
                />
                <p className="text-sm font-normal leading-5 text-primary">
                  I've read and agree to the Worker Solutions®{" "}
                  <Link to="/terms-page" className="cursor-pointer text-cyan-500">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="cursor-pointer text-cyan-500">
                    Privacy Policies
                  </Link>
                </p>
              </div>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-error-primary">{errors.agreeToTerms.message}</p>
              )}
            </div>

            {/* Submit Error Display */}
            {submitError && (
              <ErrorMessage
                errorType={submitError.type}
                alertIcon={AlertCircle}
                errorMessage={submitError.message}
                onClose={() => setSubmitError(null)}
              />
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
              <p className="text-sm font-normal leading-5 text-tertiary">
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
