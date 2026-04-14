import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Mail01, AlertCircle, Eye, EyeOff } from "@untitledui/icons";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { UpdateYourEmailModal } from "@/components/modals/UpdateYourEmailModal";
import SessionExpiredModal from "@/components/modals/SessionExpiredModal";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ErrorMessage from "@/components/common/ErrorMessage";
import { BaseModalWithIcon } from "@/components/modals/BaseModalWithIcon";
import checkmarkIcon from "@/assets/finch-checkmark.svg";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteUserAccount,
  // clearProfileData,
  resendVerificationEmail,
  retakeAssessmentAction,
} from "@/store/slices/profileSlice";
import { clearUser, updateUser } from "@/store/slices/authSlice";
import { selectProfileLoading, selectProfileError } from "@/store/selectors/profileSelectors";
import { selectUser } from "@/store/selectors/authSelectors";
import { validateName } from "@/utils/validation";
import { useModalConfig } from "@/hooks/useModalConfig";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import { InputGroup } from "@/components/base/input/input-group";
import { Label } from "@/components/base/input/label";

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const userData = useAppSelector(selectUser);
  const profileLoading = useAppSelector(selectProfileLoading);
  const profileError = useAppSelector(selectProfileError);

  // Modal states
  const [activeUrl] = useState("/settings");
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isUpdateEmailModalOpen, setIsUpdateEmailModalOpen] = useState(false);
  const [isRetakeAssessmentModalOpen, setIsRetakeAssessmentModalOpen] = useState(false);
  const [isAccountDeleteModalOpen, setIsAccountDeleteModalOpen] = useState(false);
  const [isUpdateCompletedModalOpen, setIsUpdateCompletedModalOpen] = useState(false);
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState(() => userData?.firstName ?? "");
  const [lastName, setLastName] = useState(() => userData?.lastName ?? "");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [showError, setShowError] = useState(false);
  const [resendVerification, setResendVerification] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [retakeLoading, setRetakeLoading] = useState(false);
  const [retakeError, setRetakeError] = useState<string | null>(null);
  const { completionCount, isFinchCompleted } = useAssessmentStatus();

  // Modal configurations using the hook
  const updateCompleteModal = useModalConfig("updateComplete", {
    isOpen: isUpdateCompletedModalOpen,
    onClose: () => setIsUpdateCompletedModalOpen(false),
  });

  const emailUpdatedModal = useModalConfig("emailUpdated", {
    isOpen: showSuccess,
    onClose: () => setShowSuccess(false),
    onConfirm: () => setShowSuccess(false),
  });

  const retakeAssessmentModal = useModalConfig("retakeAssessment", {
    isOpen: isRetakeAssessmentModalOpen,
    onClose: () => setIsRetakeAssessmentModalOpen(false),
    onConfirm: handleRetakeAssessment,
    additionalData: { loading: retakeLoading },
  });

  const accountDeleteModal = useModalConfig("accountDelete", {
    isOpen: isAccountDeleteModalOpen,
    onClose: () => setIsAccountDeleteModalOpen(false),
    onConfirm: handleDeleteAccount,
  });

  // Calculate hasChanges
  // const hasChanges = useMemo(() => {
  //   if (!userData) return false;
  //   return firstName !== userData.firstName || lastName !== userData.lastName;
  // }, [firstName, lastName, userData]);

  // Handler functions
  // const handleSave = async () => {
  //   const firstNameValidation = validateName("FirstName", firstName);
  //   const lastNameValidation = validateName("LastName", lastName);

  //   if (!firstNameValidation.isValid || !lastNameValidation.isValid) {
  //     setFirstNameError(firstNameValidation.isValid ? "" : firstNameValidation.message || "");
  //     setLastNameError(lastNameValidation.isValid ? "" : lastNameValidation.message || "");
  //     return;
  //   }

  //   try {
  //     await dispatch(
  //       updateProfileData({
  //         firstName: firstName.trim(),
  //         lastName: lastName.trim(),
  //       })
  //     ).unwrap();

  //     dispatch(
  //       updateUser({
  //         firstName: firstName.trim(),
  //         lastName: lastName.trim(),
  //       })
  //     );

  //     setIsUpdateCompletedModalOpen(true);
  //     setShowError(false);
  //   } catch (_error) {
  //     setShowError(true);
  //   }
  // };

  // const handleCancel = () => {
  //   if (userData) {
  //     setFirstName(userData.firstName);
  //     setLastName(userData.lastName);
  //     setFirstNameError("");
  //     setLastNameError("");
  //     setShowError(false);
  //   }
  // };

  // Real-time validation for first name
  const handleFirstNameChange = (value: string) => {
    const sanitized = value.replace(/^\s+/, "");
    setFirstName(sanitized);

    // Real-time validation as user types
    if (sanitized) {
      const validation = validateName("FirstName", sanitized);
      if (validation.isValid) {
        setFirstNameError("");
      } else {
        setFirstNameError(validation.message || "");
      }
    } else {
      setFirstNameError("First name cannot be empty");
    }
  };

  // Real-time validation for last name
  const handleLastNameChange = (value: string) => {
    const sanitized = value.replace(/^\s+/, "");
    setLastName(sanitized);

    // Real-time validation as user types
    if (sanitized) {
      const validation = validateName("LastName", sanitized);
      if (validation.isValid) {
        setLastNameError("");
      } else {
        setLastNameError(validation.message || "");
      }
    } else {
      setLastNameError("Last name cannot be empty");
    }
  };

  async function handleRetakeAssessment() {
    setRetakeLoading(true);
    setRetakeError(null);
    try {
      await dispatch(retakeAssessmentAction()).unwrap();
      setIsRetakeAssessmentModalOpen(false);
      navigate("/dashboard");
    } catch (error) {
      setIsRetakeAssessmentModalOpen(false);
      setRetakeError(typeof error === "string" ? error : "Failed to retake assessment");
      setShowError(true);
    } finally {
      setRetakeLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!userData?.id) return;

    try {
      await dispatch(deleteUserAccount(userData.id)).unwrap();

      // Clear profile data and user state
      // dispatch(clearProfileData());
      // dispatch(clearUser());
      // localStorage.removeItem("userDetail");

      // Close the modal before navigation
      setIsAccountDeleteModalOpen(false);

      // Redirect to success page with account deletion message
      navigate("/success", {
        state: {
          messageImg: checkmarkIcon,
          title: "Your account has been deleted",
          subtitle:
            "Your profile and associated data has been permenantly deleted. This action can’t be reversed. Create a new account to begin.",
          buttonText: "Create an account",
          buttonPath: "/sign-up",
          shouldClearUser: true,
        },
      });
    } catch (_error) {
      console.error("Failed to delete account:", _error);
      setIsAccountDeleteModalOpen(false);
    }
  }

  const handleLoginAgain = () => {
    setIsSessionExpiredModalOpen(false);
    dispatch(clearUser());
    navigate("/sign-in", { state: { from: "/settings" } });
  };

  const handleGetResponse = (response: {
    success: boolean;
    data?: { email?: string; emailVerify?: boolean };
    message?: string;
  }) => {
    if (response.success && response.data) {
      dispatch(
        updateUser({
          businessEmail: response.data.email,
          emailVerify: response.data.emailVerify,
        })
      );

      const userDetail = localStorage.getItem("userDetail");
      if (userDetail) {
        const parsedUserDetail = JSON.parse(userDetail);
        if (parsedUserDetail.auth?.user) {
          parsedUserDetail.auth.user.businessEmail = response.data.email;
          parsedUserDetail.auth.user.emailVerify = response.data.emailVerify ?? false;
          localStorage.setItem("userDetail", JSON.stringify(parsedUserDetail));
        }
      }
    }

    setIsUpdateEmailModalOpen(false);
    setTimeout(() => setShowSuccess(true), 100);
    setResendVerification(true);
  };

  const handleResendVerification = async () => {
    try {
      await dispatch(resendVerificationEmail()).unwrap();

      setShowSuccess(true);
    } catch (error) {
      setResendError(
        error instanceof Error ? error.message : "Failed to resend verification email"
      );
      setShowError(true);
    }
  };

  if (!userData) {
    return (
      <div className="flex h-screen overflow-hidden bg-ws-navy-250">
        <DashboardSidebar activeUrl={activeUrl} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-ws-text-tertiary">Loading user data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ws-base-white">
      <DashboardSidebar activeUrl={activeUrl} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-10 pl-0">
          <div>
            <h2 className="text-4xl font-bold text-ws-text-primary">Settings</h2>
            <p className="text-base text-ws-text-secondary mt-4">
              Manage your profile, preferences, and account settings
            </p>
          </div>

          {/* Error Messages */}
          {showError && profileError && (
            <div className="mt-6">
              <ErrorMessage
                errorType="danger"
                textColor="text-red-700"
                alertIcon={AlertCircle}
                errorMessage={profileError}
                onClose={() => setShowError(false)}
              />
            </div>
          )}

          {resendError && (
            <div className="mt-6">
              <ErrorMessage
                errorType="danger"
                textColor="text-red-700"
                alertIcon={AlertCircle}
                errorMessage={resendError}
                onClose={() => setResendError(null)}
              />
            </div>
          )}

          {retakeError && (
            <div className="mt-6">
              <ErrorMessage
                errorType="danger"
                textColor="text-red-700"
                alertIcon={AlertCircle}
                errorMessage={retakeError}
                onClose={() => setRetakeError(null)}
              />
            </div>
          )}

          <div className="space-y-6 mt-6">
            <div className="bg-ws-base-white rounded-xl p-6 ml-1 box-shadow">
              {/* Personal Info Section */}
              <div className="bg-ws-navy-25 flex gap-2 border border-ws-border-primary rounded-xl py-8 px-6 flex-col">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-medium text-ws-text-primary">
                    Personal information
                  </h2>
                  <p className="text-base text-ws-text-tertiary mt-2">
                    Update your name, email, and personal details
                  </p>
                </div>

                <div className="bg-ws-base-white mt-4">
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between gap-6">
                      <div className="w-full xl:w-1/2">
                        <InputGroup>
                          <div className="flex flex-col gap-1.5 w-full">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              size="md"
                              isRequired={true}
                              placeholder="First name"
                              value={firstName}
                              onChange={handleFirstNameChange}
                              isDisabled={profileLoading}
                            />
                            {firstNameError && (
                              <p className="text-ws-error-600 text-sm mt-1">{firstNameError}</p>
                            )}
                          </div>
                        </InputGroup>
                      </div>
                      <div className="w-full xl:w-1/2">
                        <InputGroup>
                          <div className="flex flex-col gap-1.5 w-full">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              size="md"
                              isRequired={true}
                              placeholder="Last name"
                              value={lastName}
                              onChange={handleLastNameChange}
                              isDisabled={profileLoading}
                            />
                            {lastNameError && (
                              <p className="text-ws-error-600 text-sm mt-1">{lastNameError}</p>
                            )}
                          </div>
                        </InputGroup>
                      </div>
                    </div>
                    <div className="w-full xl:w-full">
                      <InputGroup>
                        <div className="flex flex-col gap-1.5 w-full">
                          <Label htmlFor="email">
                            Email address <span className="text-ws-error-600">*</span>
                          </Label>
                          <div className="w-full flex flex-col gap-4">
                            <Input
                              id="email"
                              name="email"
                              size="md"
                              icon={Mail01}
                              iconClassName="text-ws-gray-400"
                              isRequired={true}
                              placeholder="medium@untitledui.com"
                              value={userData?.businessEmail || ""}
                              isDisabled={true}
                            />
                            <Button
                              color="link-disable-color"
                              className="text-ws-navy-800 font-semibold shadow-none"
                              onClick={
                                resendVerification
                                  ? handleResendVerification
                                  : () => setIsUpdateEmailModalOpen(true)
                              }
                              isDisabled={profileLoading || !firstName || !lastName}
                            >
                              {resendVerification ? "Resend Verification Email" : "Update email"}
                            </Button>
                          </div>
                        </div>
                      </InputGroup>
                    </div>
                    <div className="w-full xl:w-full">
                      <InputGroup>
                        <div className="flex flex-col gap-1.5 w-full">
                          <Label htmlFor="changePassword">Change Password</Label>
                          <div className="w-full flex flex-col gap-4">
                            <Input
                              type="password"
                              id="password"
                              name="password"
                              size="md"
                              isRequired={true}
                              placeholder="Password"
                              value="********"
                              isDisabled={true}
                            />
                            <Button
                              color="tertiary"
                              size="sm"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              className="absolute right-0 top-7"
                            >
                              <>
                                {showPassword ? (
                                  <Eye className="size-5 text-ws-gray-400" />
                                ) : (
                                  <EyeOff className="size-5 text-ws-gray-400" />
                                )}
                              </>
                            </Button>
                            <Button
                              color="link-disable-color"
                              className="text-ws-navy-800 font-semibold shadow-none"
                              onClick={() => setIsChangePasswordModalOpen(true)}
                              isDisabled={profileLoading || !firstName || !lastName}
                            >
                              Change password
                            </Button>
                          </div>
                        </div>
                      </InputGroup>
                    </div>
                  </div>
                </div>
                <hr className="border-t border-ws-border-primary mt-5 mb-6" />

                <div className="w-full flex flex-col justify-between gap-2">
                  <div className="flex flex-col mb-4">
                    <h2 className="text-3xl font-medium text-ws-text-primary">
                      Account Management
                    </h2>
                    <p className="text-base text-ws-text-tertiary mt-2">
                      Update your photo and personal details here.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    {/* Retake Assessment */}
                    <div className="flex flex-col xl:flex-row">
                      <div className="w-full xl:w-1/2 flex flex-col">
                        <label
                          htmlFor="retakeAssessment"
                          className="text-ws-text-primary font-medium text-base mt-2"
                        >
                          Retake the assessment
                        </label>
                        {/* <span className="text-ws-text-tertiary text-sm">
                          Retaking the assessment will result in loss of progress.
                        </span> */}
                      </div>
                      <div className="w-full xl:w-1/2 flex gap-4 mt-3 xl:mt-0">
                        <Button
                          color="secondary"
                          size="md"
                          className="w-full text-base font-semibold text-ws-navy-800"
                          onClick={() => setIsRetakeAssessmentModalOpen(true)}
                          isDisabled={completionCount === 0 && !isFinchCompleted}
                        >
                          Retake Assessment
                        </Button>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="flex flex-col xl:flex-row">
                      <div className="w-full xl:w-1/2 flex flex-col">
                        <label
                          htmlFor="deleteAccount"
                          className="text-ws-text-primary font-medium text-base mt-2"
                        >
                          Delete account
                        </label>
                        {/* <span className="text-ws-text-tertiary text-sm">This cannot be undone</span> */}
                      </div>
                      <div className="w-full xl:w-1/2 flex gap-4 mt-3 xl:mt-0">
                        <Button
                          color="secondary"
                          size="md"
                          className="w-full text-base font-semibold text-ws-error-600"
                          onClick={() => setIsAccountDeleteModalOpen(true)}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="bg-ws-base-white border border-ws-border-primary rounded-xl py-8 px-6 mb-6"> */}
              {/* Name Fields */}
              {/* <div className="flex mb-6 flex-col xl:flex-row">
                  <div className="w-full xl:w-1/3 mb-3 xl:mb-0">
                    <label
                      htmlFor="firstName"
                      className="text-ws-text-secondary font-medium text-sm"
                    >
                      Name <span className="text-ws-error-600">*</span>
                    </label>
                  </div>
                  <div className="w-full xl:w-2/3 flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Input
                          id="firstName"
                          name="firstName"
                          size="md"
                          isRequired={true}
                          placeholder="First name"
                          value={firstName}
                          onChange={handleFirstNameChange}
                          isDisabled={profileLoading}
                        />
                        {firstNameError && (
                          <p className="text-ws-error-600 text-sm mt-1">{firstNameError}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          id="lastName"
                          name="lastName"
                          size="md"
                          isRequired={true}
                          placeholder="Last name"
                          value={lastName}
                          onChange={handleLastNameChange}
                          isDisabled={profileLoading}
                        />
                        {lastNameError && (
                          <p className="text-ws-error-600 text-sm mt-1">{lastNameError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div> */}

              {/* Email Field */}
              {/* <div className="flex mb-6 flex-col xl:flex-row">
                  <div className="w-full xl:w-1/3 mb-3 xl:mb-0">
                    <label htmlFor="email" className="text-ws-text-secondary font-medium text-sm">
                      Email address <span className="text-ws-error-600">*</span>
                    </label>
                  </div>
                  <div className="w-full xl:w-2/3 flex flex-col gap-4">
                    <Input
                      id="email"
                      name="email"
                      size="md"
                      icon={Mail01}
                      isRequired={true}
                      placeholder="medium@untitledui.com"
                      value={userData?.businessEmail || ""}
                      isDisabled={true}
                    />
                    <Button
                      color="link-color"
                      className="max-w-22"
                      onClick={
                        resendVerification
                          ? handleResendVerification
                          : () => setIsUpdateEmailModalOpen(true)
                      }
                      isDisabled={profileLoading || !firstName || !lastName}
                    >
                      {resendVerification ? "Resend Verification Email" : "Update email"}
                    </Button>
                  </div>
                </div> */}

              {/* Password Field */}
              {/* <div className="flex mb-6 flex-col xl:flex-row">
                  <div className="w-full xl:w-1/3 mb-3 xl:mb-0">
                    <label
                      htmlFor="password"
                      className="text-ws-text-secondary font-medium text-sm"
                    >
                      Password <span className="text-ws-error-600">*</span>
                    </label>
                  </div>
                  <div className="w-full xl:w-2/3 flex flex-col gap-4">
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      size="md"
                      isRequired={true}
                      placeholder="Password"
                      value="********"
                      isDisabled={true}
                    />
                    <Button
                      color="link-color"
                      className="max-w-22"
                      onClick={() => setIsChangePasswordModalOpen(true)}
                      isDisabled={profileLoading || !firstName || !lastName}
                    >
                      Change password
                    </Button>
                  </div>
                </div> */}
              {/* </div> */}

              {/* Account Management Section */}
              {/* <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-ws-text-primary">Account Management</h2>
                  <p className="text-sm text-ws-text-tertiary">
                    Update your photo and personal details here.
                  </p>
                </div>
              </div>
              <hr className="border-t border-ws-border-primary mt-5 mb-6" />

              <div className="bg-ws-base-white border border-ws-border-primary rounded-xl py-8 px-6 mb-6"> */}
              {/* Retake Assessment */}
              {/* <div className="flex mb-6 flex-col xl:flex-row">
                  <div className="w-full xl:w-1/2 flex flex-col">
                    <label
                      htmlFor="firstName"
                      className="text-ws-text-secondary font-medium text-sm"
                    >
                      Retake the assessment
                    </label>
                    <span className="text-ws-text-tertiary text-sm">
                      Retaking the assessment will result in loss of progress.
                    </span>
                  </div>
                  <div className="w-full xl:w-1/2 flex gap-4 mt-3 xl:mt-0">
                    <Button
                      color="secondary"
                      size="md"
                      className="w-full"
                      onClick={() => setIsRetakeAssessmentModalOpen(true)}
                      isDisabled={completionCount === 0}
                    >
                      Retake Assessment
                    </Button>
                  </div>
                </div> */}

              {/* Delete Account */}
              {/* <div className="flex mb-6 flex-col xl:flex-row">
                  <div className="w-full xl:w-1/2 flex flex-col">
                    <label
                      htmlFor="firstName"
                      className="text-ws-text-secondary font-medium text-sm"
                    >
                      Delete account
                    </label>
                    <span className="text-ws-text-tertiary text-sm">This cannot be undone</span>
                  </div>
                  <div className="w-full xl:w-1/2 flex gap-4 mt-3 xl:mt-0">
                    <Button
                      color="secondary"
                      size="md"
                      className="w-full text-red-700"
                      onClick={() => setIsAccountDeleteModalOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div> */}

              {/* Action Buttons */}
              {/* <div className="flex items-center justify-end gap-3">
                <Button
                  color="secondary"
                  size="sm"
                  onClick={handleCancel}
                  isDisabled={!hasChanges || profileLoading}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  onClick={handleSave}
                  // isDisabled={profileLoading || !firstName || !lastName}

                  isDisabled={
                    !hasChanges ||
                    profileLoading ||
                    !!firstNameError ||
                    !!lastNameError ||
                    !firstName ||
                    !lastName
                  }
                >
                  {profileLoading ? "Saving..." : "Save"}
                </Button>
              </div> */}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <UpdateYourEmailModal
        isOpen={isUpdateEmailModalOpen}
        onClose={() => setIsUpdateEmailModalOpen(false)}
        getResponse={handleGetResponse}
      />
      <SessionExpiredModal
        isOpen={isSessionExpiredModalOpen}
        onClose={() => setIsSessionExpiredModalOpen(false)}
        onLoginAgain={handleLoginAgain}
      />

      {/* Refactored modals using the hook */}
      <BaseModalWithIcon
        isOpen={isUpdateCompletedModalOpen}
        onClose={() => setIsUpdateCompletedModalOpen(false)}
        {...updateCompleteModal}
      />
      <BaseModalWithIcon
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        {...emailUpdatedModal}
      />
      <BaseModalWithIcon
        isOpen={isRetakeAssessmentModalOpen}
        onClose={() => setIsRetakeAssessmentModalOpen(false)}
        {...retakeAssessmentModal}
      />
      <BaseModalWithIcon
        isOpen={isAccountDeleteModalOpen}
        onClose={() => setIsAccountDeleteModalOpen(false)}
        {...accountDeleteModal}
      />
    </div>
  );
};

export default SettingsPage;
