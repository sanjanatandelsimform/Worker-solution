// Ensure that this file only exports components to comply with the react-refresh/only-export-components rule.
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { Input, InputBase } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Eye, EyeOff, Mail01 } from "@untitledui/icons";
import { NativeSelect } from "../base/select/select-native";
import { Select } from "../base/select/select";
import { signup } from "@/services/api/authApi";
import type { RegistrationData, Industry } from "@/types/auth";
import { registrationSchema, type RegistrationFormData } from "@/services/validation/authSchemas";
import { INDUSTRIES, COUNTRY_CODES } from "@/constants/formOptions";
// import { SuccessModalWithLogo } from "../modals";
import checkmarkIcon from "@/assets/checkmark-icon.svg";

export const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  // const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
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
      // setIsOpen(true);
      // navigate to success page and pass modal data via location.state
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
      setSubmitError(
        error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
      );
    }
  };

  // const handleGetStarted = () => {
  //   navigate("/sign-in");
  // };
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
                  isRequired
                  label="First Name"
                  hint={errors.firstName?.message}
                  placeholder="First Name"
                  isInvalid={!!errors.firstName}
                  value={firstName}
                  maxLength={20}
                  className={errors.firstName ? "error-ring" : ""}
                  onChange={value => {
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
                  value={lastName}
                  isInvalid={!!errors.lastName}
                  maxLength={20}
                  className={errors.lastName ? "error-ring" : ""}
                  onChange={value => {
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
                  className={errors.legalBusinessName ? "error-ring" : ""}
                  onChange={value => {
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
                  isRequired
                  label="Business Email Address"
                  hint={errors.businessEmail?.message}
                  placeholder="olivia@untitledui.com"
                  icon={Mail01}
                  isInvalid={!!errors.businessEmail}
                  value={businessEmail}
                  className={errors.businessEmail ? "error-ring" : ""}
                  onChange={value => {
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
                  onChange={value => {
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
                  onChange={value => {
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
      {/* After discussion, we will uncomment this if needed; otherwise, we will remove it. */}
      {/* <SuccessModalWithLogo
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="xl"
        messageImg={checkmarkIcon}
        title="Account created successfully!"
        subtitle="Welcome aboard! Start your success journey with Worker Solutions®"
        button={{
          text: "Let's Get Started",
          onClick: handleGetStarted,
          color: "primary",
        }}
      /> */}
    </div>
  );
};

export default RegistrationForm;
