// Ensure that this file only exports components to comply with the react-refresh/only-export-components rule.
import { useState, useEffect } from "react";
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
import { signup, getIndustries } from "@/services/api/authApi";
import type { RegistrationData, Industry } from "@/types/auth";
import { registrationSchema, type RegistrationFormData } from "@/services/validation/authSchemas";
import { COUNTRY_CODES } from "@/constants/formOptions";
import checkmarkIcon from "@/assets/checkmark-icon.svg";
import ErrorMessage from "../common/ErrorMessage";
import { getErrorState, type ErrorState } from "@/utils/errorHandler";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { saveFormData, clearFormData } from "@/store/slices/registrationFormSlice";
import { selectRegistrationFormData } from "@/store/selectors/registrationFormSelectors";

// // Load saved form data OUTSIDE the component (synchronous)
// const loadSavedFormData = () => {
//   try {
//     const savedFormData = sessionStorage.getItem("registrationFormData");
//     if (savedFormData) {
//       const parsedData = JSON.parse(savedFormData);
//       return {
//         firstName: parsedData.firstName || "",
//         lastName: parsedData.lastName || "",
//         legalBusinessName: parsedData.legalBusinessName || "",
//         industry: parsedData.industry || "",
//         zipCode: parsedData.zipCode || "",
//         businessEmail: parsedData.businessEmail || "",
//         businessPhone: parsedData.businessPhone || "",
//         password: parsedData.password || "",
//         confirmPassword: parsedData.confirmPassword || "",
//         agreeToTerms: parsedData.agreeToTerms || false,
//         countryCode: parsedData.countryCode || "US",
//         phoneNumber: parsedData.businessPhone || "",
//       };
//     }
//   } catch (error) {
//     console.error("Error loading saved form data:", error);
//   }
//   return {
//     firstName: "",
//     lastName: "",
//     legalBusinessName: "",
//     industry: "",
//     zipCode: "",
//     businessEmail: "",
//     businessPhone: "",
//     password: "",
//     confirmPassword: "",
//     agreeToTerms: false,
//     countryCode: "US",
//     phoneNumber: "",
//   };
// };

export const RegistrationForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const savedFormData = useAppSelector(selectRegistrationFormData);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(savedFormData?.businessPhone || "");
  const [countryCode, setCountryCode] = useState("US");
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
      agreeToTerms: savedFormData?.agreeToTerms || false,
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
      agreeToTerms,
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
    agreeToTerms,
    dispatch,
  ]);
  // Fetch industries on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIsLoadingIndustries(true);
        const data = await getIndustries();
        // console.log("Fetched industries:", data.data.industries);
        setIndustries(data.data.industries || []);
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

  console.log("industries", industries);

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
        acceptTerms: data.agreeToTerms,
      };

      await signup(registrationData);

      // Clear form data after successful registration
      dispatch(clearFormData());

      navigate("/success", {
        state: {
          messageImg: checkmarkIcon,
          title: "Account created successfully!",
          subtitle: "Welcome aboard! Start your success journey with Worker Solutions®",
          buttonText: "Let's Get Started",
          buttonPath: "/sign-in",
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
    <div className="flex min-h-screen items-center justify-center md:p-8 bg-ws-gray-20">
      {/* Container */}
      <div className="flex w-3xl items-center justify-center rounded-xl border border-ws-gray-50 bg-ws-white p-10">
        {/* Content */}
        <div className="flex w-full flex-col items-center gap-8">
          {/* Logo */}
          <div className="flex items-center justify-center px-2 py-1">
            <h1 className="text-5xl font-bold leading-15 text-ws-black">BeneStats</h1>
          </div>

          {/* Header */}
          <div className="flex w-full flex-col items-start gap-2">
            <h2 className="w-full text-4xl font-semibold leading-9.5 text-ws-black">Sign up</h2>
            <p className="w-full text-medium font-normal leading-6 text-ws-black-10">
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
                  tooltip={errors.firstName ? errors.firstName.message : undefined}
                  onChange={value => {
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
                  tooltip={errors.lastName ? errors.lastName.message : undefined}
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
                  tooltip={errors.legalBusinessName ? errors.legalBusinessName.message : undefined}
                  onChange={value => {
                    const sanitized = value.replace(/^\s+/, "");
                    setValue("legalBusinessName", sanitized);
                    trigger("legalBusinessName");
                  }}
                />
              </InputGroup>
              <Select
                className="w-full flex items-start"
                size="md"
                label="Select Your Industry"
                placeholder="Select Option"
                items={industries.map(i => ({
                  id: i.industry_code, // Changed from i.id.toString()
                  label: i.industry_name,
                }))}
                selectedKey={industry}
                onSelectionChange={key => {
                  setValue("industry", key as string);
                  trigger("industry");
                }}
                isDisabled={isLoadingIndustries || !!industryError}
                isInvalid={!!errors.industry || !!industryError}
                hint={industryError || errors.industry?.message}
                tooltip={errors.industry ? errors.industry.message : undefined}
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
              {isLoadingIndustries && (
                <p className="text-sm text-gray-600 mt-1.5">Loading industries...</p>
              )}
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
                  tooltip={errors.zipCode ? errors.zipCode.message : undefined}
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
                  tooltip={errors.businessEmail ? errors.businessEmail.message : undefined}
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
                  tooltip={errors.businessPhone ? errors.businessPhone.message : undefined}
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
                  tooltip={errors.password ? errors.password.message : undefined}
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
                  {!errors.password && (
                    <>
                      {showPassword ? (
                        <Eye className="size-5 text-ws-gray-70" />
                      ) : (
                        <EyeOff className="size-5 text-ws-gray-70" />
                      )}
                    </>
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
                  tooltip={errors.confirmPassword ? errors.confirmPassword.message : undefined}
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
                  {!errors.password && (
                    <>
                      {showConfirmPassword ? (
                        <Eye className="size-5 text-ws-gray-70" />
                      ) : (
                        <EyeOff className="size-5 text-ws-gray-70" />
                      )}
                    </>
                  )}
                </Button>
              </InputGroup>
            </div>

            {/* Agreement Section */}
            <div className="col-span-2 mt-6 flex items-center flex-col justify-center gap-2">
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
                <p className="text-sm font-normal leading-5 text-ws-black">
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
                className="w-full"
                isDisabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Get started"}
              </Button>

              {/* Sign in link */}
              <p className="text-sm font-normal leading-5 text-ws-black">
                Already have an account?{" "}
                <Link to="/sign-in" className="font-semibold text-cyan-500">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
