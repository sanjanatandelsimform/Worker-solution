import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectRegistrationFormData } from "@/store/selectors/registrationFormSelectors";
import type { RegistrationData, Industry } from "@/types/auth";
import { ErrorState, getErrorState } from "@/utils/errorHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { registrationSchema, type RegistrationFormData } from "@/services/validation/authSchemas";
import { Link, useNavigate } from "react-router-dom";
import { clearFormData, saveFormData } from "@/store/slices/registrationFormSlice";
import { getIndustries, signup } from "@/services/api/authApi";
import checkmarkIcon from "@/assets/finch-checkmark.svg";
import { InputGroup } from "@/components/base/input/input-group";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { AlertCircle, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import ErrorMessage from "@/components/common/ErrorMessage";

export function RegistrationForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const savedFormData = useAppSelector(selectRegistrationFormData);

  const [phoneNumber, setPhoneNumber] = useState(savedFormData?.businessPhone || "");
  const [submitError, setSubmitError] = useState<ErrorState | null>(null);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(true);
  const [industryError, setIndustryError] = useState<string | null>(null);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    trigger,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: savedFormData?.firstName || "",
      lastName: savedFormData?.lastName || "",
      legalBusinessName: savedFormData?.legalBusinessName || "",
      industry: savedFormData?.industry || "",
      zipCode: savedFormData?.zipCode || "",
      businessEmail: savedFormData?.businessEmail || "",
      businessPhone: savedFormData?.businessPhone || "",
      password: "", // Never persist passwords
      confirmPassword: "", // Never persist passwords
      // agreeToTerms: savedFormData?.agreeToTerms || false,
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
      // "agreeToTerms",
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
    // agreeToTerms,
  ] = watchedFields;

  // Auto-save form data on change (except passwords)
  useEffect(() => {
    const formData: Partial<RegistrationFormData> = {
      firstName,
      lastName,
      legalBusinessName,
      industry,
      zipCode,
      businessEmail,
      businessPhone: phoneNumber,
      // agreeToTerms,
      // Do NOT persist passwords
    };
    dispatch(saveFormData(formData));
  }, [
    firstName,
    lastName,
    legalBusinessName,
    industry,
    zipCode,
    businessEmail,
    phoneNumber,
    // agreeToTerms,
    dispatch,
  ]);
  // Fetch industries on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIsLoadingIndustries(true);
        const data = await getIndustries();
        console.log("Fetched industries:", data.data.industries);

        // Sort industries alphabetically by name
        const sortedIndustries = (data.data.industries || []).sort((a, b) =>
          a.industry_name.localeCompare(b.industry_name)
        );

        setIndustries(sortedIndustries);
        setIndustryError(null);
      } catch (error) {
        console.error("Failed to load industries:", error);
        setIndustryError(
          error instanceof Error ? error.message : "Failed to load industries. Please try again."
        );
      } finally {
        setIsLoadingIndustries(false);
      }
    };
    fetchIndustries();
  }, []);

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setSubmitError(null);

      const isValid = await trigger();
      if (!isValid) return;

      const registrationData: RegistrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        businessName: data.legalBusinessName,
        industry: data.industry,
        zipCode: parseInt(data.zipCode, 10),
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        // acceptTerms: data.agreeToTerms,
      };

      const { user, tokens } = await signup(registrationData);

      // Clear form data after successful registration
      dispatch(clearFormData());

      navigate("/success", {
        state: {
          messageImg: checkmarkIcon,
          title: "Account created successfully!",
          subtitle: "Welcome aboard! Start your success journey with Lafayette Square Institute®",
          buttonText: "Let's Get Started",
          buttonPath: "/dashboard",
          user,
          tokens,
        },
      });

      // Clear passwords from form
      setValue("password", "");
      setValue("confirmPassword", "");
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError(getErrorState(error));
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-ws-light-teal-50">
      {/* Container */}
      <div className="flex w-3xl items-center justify-center rounded-xl border border-ws-border-primary bg-ws-base-white p-10">
        {/* Content */}
        <div className="flex w-full flex-col items-center">
          {/* Logo */}
          <div className="flex items-center justify-center px-2 py-1">
            <h1 className="text-3xl font-semibold leading-15 text-ws-text-primary">Sign up</h1>
          </div>

          {/* Header */}
          <div className="flex w-full flex-col items-start gap-2">
            <p className="w-full flex items-center justify-center text-center font-normal text-lg text-ws-text-secondary">
              We’re excited that you’ve decided to try our BeneStats platform. Before we begin we’ll
              need to collect some information about your business.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-8">
            {/* Fields - Grid Layout */}
            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-4">
              {/* Row 1 - First Name & Last Name */}
              <InputGroup>
                <Input
                  name="firstName"
                  label="First Name"
                  isRequired
                  size="md"
                  hint={errors.firstName?.message}
                  placeholder="First Name"
                  isInvalid={!!errors.firstName}
                  value={firstName}
                  maxLength={20}
                  className={errors.firstName ? "error-ring" : ""}
                  tooltip={errors.firstName ? errors.firstName.message : undefined}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("firstName", sanitized);
                    trigger("firstName");
                  }}
                  //helperTooltip={"Enter the first name of the primary account holder"}
                />
              </InputGroup>
              <InputGroup>
                <Input
                  name="lastName"
                  label="Last Name"
                  isRequired
                  size="md"
                  hint={errors.lastName?.message}
                  placeholder="Last Name"
                  value={lastName}
                  isInvalid={!!errors.lastName}
                  maxLength={20}
                  className={errors.lastName ? "error-ring" : ""}
                  tooltip={errors.lastName ? errors.lastName.message : undefined}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("lastName", sanitized);
                    trigger("lastName");
                  }}
                  helperTooltip={"Enter the last name of the primary account holder"}
                />
              </InputGroup>

              {/* Row 2 - Legal Business Name & Industry */}
              <InputGroup>
                <Input
                  name="legalBusinessName"
                  label="Legal Business Name"
                  isRequired
                  size="md"
                  hint={errors.legalBusinessName?.message}
                  placeholder="Legal Business Name"
                  isInvalid={!!errors.legalBusinessName}
                  value={legalBusinessName}
                  maxLength={50}
                  className={errors.legalBusinessName ? "error-ring" : ""}
                  tooltip={errors.legalBusinessName ? errors.legalBusinessName.message : undefined}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("legalBusinessName", sanitized);
                    trigger("legalBusinessName");
                  }}
                  helperTooltip={"Enter the legal business name of the primary account holder"}
                />
              </InputGroup>
              <InputGroup>
                <Input
                  name="businessPhone"
                  label="Business Phone Number"
                  isRequired
                  placeholder="(555) 000-0000"
                  type="tel"
                  size="md"
                  prefix="+1"
                  hint={errors.businessPhone?.message}
                  isInvalid={!!errors.businessPhone}
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
                  tooltip={errors.businessPhone ? errors.businessPhone.message : undefined}
                  helperTooltip={"Enter the business phone number of the primary account holder"}
                />
                {/* <InputGroup
                  className={errors.businessPhone ? "error-ring" : "col-start-2"}
                  // label="Business Phone Number"
                  hint={errors.businessPhone?.message}
                  isInvalid={!!errors.businessPhone}
                  leadingAddon={
                    <NativeSelect
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      options={COUNTRY_CODES}
                    />
                  }
                > */}
                {/* <InputBase
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
                    tooltip={errors.businessPhone ? errors.businessPhone.message : undefined}
                  />
                </InputGroup> */}
              </InputGroup>

              {/* Row 3 - Zip Code & (empty space for layout) */}
              <InputGroup>
                <Input
                  name="zipCode"
                  label="Zip Code"
                  isRequired
                  size="md"
                  hint={errors.zipCode?.message}
                  placeholder="01234"
                  isInvalid={!!errors.zipCode}
                  value={zipCode}
                  maxLength={5}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={errors.zipCode ? "error-ring" : ""}
                  tooltip={errors.zipCode ? errors.zipCode.message : undefined}
                  onChange={value => {
                    // Only allow numeric input
                    const numericValue = value.replace(/\D/g, "");
                    setValue("zipCode", numericValue);
                    trigger("zipCode");
                  }}
                  helperTooltip={"Enter the zip code of the primary account holder"}
                />
              </InputGroup>
              <InputGroup isRequired>
                <Select
                  label="Select Your Industry"
                  isRequired
                  className="w-full flex items-start"
                  size="sm"
                  placeholder="Select Option"
                  items={industries.map(i => ({
                    id: i.industry_code, // Changed from i.id.toString()
                    label: i.industry_name,
                  }))}
                  selectedKey={industry || null}
                  onSelectionChange={key => {
                    const stringKey = key ? String(key) : "";
                    setValue("industry", stringKey);
                    // This prevents popover positioning from resetting
                    // setTimeout(() => {
                    trigger("industry");
                    // }, 0);
                  }}
                  isDisabled={isLoadingIndustries || !!industryError}
                  isInvalid={!!errors.industry || !!industryError}
                  hint={industryError || errors.industry?.message}
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
              </InputGroup>
              {isLoadingIndustries && (
                <p className="text-sm text-gray-600 mt-1.5">Loading industries...</p>
              )}
            </div>

            <div className="grid w-full grid-cols-1 my-4">
              {/* Row 4 - Business Email & Business Phone */}
              <InputGroup className="col-start-1 w-full block">
                <Input
                  name="businessEmail"
                  label="Work Email Address"
                  isRequired
                  size="md"
                  hint={errors.businessEmail?.message}
                  placeholder="email@email.com"
                  icon={Mail01}
                  iconClassName="text-ws-gray-400"
                  isInvalid={!!errors.businessEmail}
                  value={businessEmail}
                  className={errors.businessEmail ? "error-ring" : ""}
                  tooltip={errors.businessEmail ? errors.businessEmail.message : undefined}
                  helperTooltip={"Enter the business email address of the primary account holder"}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("businessEmail", sanitized);
                    trigger("businessEmail");
                  }}
                />
              </InputGroup>
            </div>

            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-4">
              {/* Row 5 - Password & Confirm Password */}
              <InputGroup className="relative">
                <Input
                  name="password"
                  label="Password"
                  isRequired
                  hint={errors.password?.message}
                  placeholder="Password"
                  size="md"
                  type="password"
                  tooltip={errors.password ? errors.password.message : undefined}
                  isInvalid={!!errors.password}
                  value={password}
                  className="relative"
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("password", sanitized);
                    trigger("password");
                  }}
                  onCopy={(e: React.ClipboardEvent<HTMLInputElement>) => e.preventDefault()}
                  onContextMenu={(e: React.MouseEvent<HTMLInputElement>) => e.preventDefault()}
                />
              </InputGroup>

              <InputGroup className="relative">
                <Input
                  name="confirmPassword"
                  label="Confirm Password"
                  isRequired
                  hint={errors.confirmPassword?.message}
                  placeholder="Confirm Password"
                  size="md"
                  type="password"
                  isInvalid={!!errors.confirmPassword}
                  tooltip={errors.confirmPassword ? errors.confirmPassword.message : undefined}
                  value={confirmPassword}
                  className="relative"
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("confirmPassword", sanitized);
                    trigger("confirmPassword");
                  }}
                  onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => e.preventDefault()}
                  onContextMenu={(e: React.MouseEvent<HTMLInputElement>) => e.preventDefault()}
                />
              </InputGroup>
            </div>

            {/* Agreement Section */}
            <div className="col-span-2 mt-6 flex items-center flex-col justify-center gap-2">
              <div className="flex gap-2 items-start">
                <p className="text-sm font-normal leading-5 text-ws-text-secondary">
                  By clicking Create Account, you are confirming that you have read and agree to the
                  BeneStats{" "}
                  <Link
                    to="/terms-page"
                    className="cursor-pointer text-ws-light-teal-850 underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="cursor-pointer text-ws-light-teal-850 underline"
                  >
                    Privacy Policies
                  </Link>
                  {"."}
                </p>
              </div>
              {/* {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-ws-error-600">{errors.agreeToTerms.message}</p>
              )} */}
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
                className="w-full"
                isDisabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>

              {/* Sign in link */}
              <p className="text-sm font-normal leading-5 text-ws-text-secondary">
                Already have an account?{" "}
                <Link to="/sign-in" className="font-normal underline text-ws-light-teal-850">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
