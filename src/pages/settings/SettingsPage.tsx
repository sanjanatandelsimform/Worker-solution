import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Mail01, AlertCircle } from "@untitledui/icons";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { UpdateYourEmailModal } from "@/components/modals/UpdateYourEmailModal";
import { UpdateYourInformationModal } from "@/components/modals/UpdateYourInformationModal";
import SessionExpiredModal from "@/components/modals/SessionExpiredModal";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ErrorMessage from "@/components/common/ErrorMessage";
import { BaseModalWithIcon } from "@/components/modals/BaseModalWithIcon";
import signoutIcon from "@/assets/signout-icon.svg";
import trashIcon from "@/assets/trash-confirm.svg";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteUserAccount,
  // clearProfileData,
  // resendVerificationEmail,
  retakeAssessmentAction,
} from "@/store/slices/profileSlice";
import { clearUser, updateUser, logoutThunk } from "@/store/slices/authSlice";
import { selectProfileLoading, selectProfileError } from "@/store/selectors/profileSelectors";
import { selectUser } from "@/store/selectors/authSelectors";
import { validateName } from "@/utils/validation";
import { useModalConfig } from "@/hooks/useModalConfig";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import { InputGroup } from "@/components/base/input/input-group";
import { ProfileApiResponse } from "@/types/profileTypes";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // const [showPassword, setShowPassword] = useState(false);

  const userData = useAppSelector(selectUser);
  const profileLoading = useAppSelector(selectProfileLoading);
  const profileError = useAppSelector(selectProfileError);

  // Modal states
  const [activeUrl] = useState("/settings");
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isUpdateEmailModalOpen, setIsUpdateEmailModalOpen] = useState(false);
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);
  const [isUpdateInfoSuccessModalOpen, setIsUpdateInfoSuccessModalOpen] = useState(false);
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
  // const [resendVerification, setResendVerification] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [retakeError, setRetakeError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [retakeLoading, setRetakeLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Sync local form state when userData changes in Redux (e.g., after profile update from modal)
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName ?? "");
      setLastName(userData.lastName ?? "");
    }
  }, [userData]);

  const { completionCount, isFinchCompleted } = useAssessmentStatus();

  // Modal configurations using the hook
  const updateCompleteModal = useModalConfig("updateComplete", {
    isOpen: isUpdateCompletedModalOpen,
    onClose: () => setIsUpdateCompletedModalOpen(false),
  });

  const emailUpdatedModal = useModalConfig("emailUpdateSuccess", {
    isOpen: showSuccess,
    onClose: () => setShowSuccess(false),
  });

  const updateInfoSuccessModal = useModalConfig("updateInfoSuccess", {
    isOpen: isUpdateInfoSuccessModalOpen,
    onClose: () => setIsUpdateInfoSuccessModalOpen(false),
  });

  const retakeAssessmentModal = useModalConfig("retakeAssessment", {
    isOpen: isRetakeAssessmentModalOpen,
    onClose: () => setIsRetakeAssessmentModalOpen(false),
    onConfirm: () => {
      handleRetakeAssessment();
    },
    additionalData: { loading: retakeLoading },
  });

  const accountDeleteModal = useModalConfig("accountDelete", {
    isOpen: isAccountDeleteModalOpen,
    onClose: () => setIsAccountDeleteModalOpen(false),
    onConfirm: handleDeleteAccount,
  });

  // // Real-time validation for first name
  // const handleFirstNameChange = (value: string) => {
  //   const sanitized = value.replace(/^\s+/, "");
  //   setFirstName(sanitized);

  //   // Real-time validation as user types
  //   if (sanitized) {
  //     const validation = validateName("FirstName", sanitized);
  //     if (validation.isValid) {
  //       setFirstNameError("");
  //     } else {
  //       setFirstNameError(validation.message || "");
  //     }
  //   } else {
  //     setFirstNameError("First name cannot be empty");
  //   }
  // };

  // // Real-time validation for last name
  // const handleLastNameChange = (value: string) => {
  //   const sanitized = value.replace(/^\s+/, "");
  //   setLastName(sanitized);

  //   // Real-time validation as user types
  //   if (sanitized) {
  //     const validation = validateName("LastName", sanitized);
  //     if (validation.isValid) {
  //       setLastNameError("");
  //     } else {
  //       setLastNameError(validation.message || "");
  //     }
  //   } else {
  //     setLastNameError("Last name cannot be empty");
  //   }
  // };
  // Generic handler — eliminates duplication
const handleNameChange = (
  value: string,
  fieldName: "FirstName" | "LastName",
  setValue: (val: string) => void,
  setError: (err: string) => void,
  emptyErrorMsg: string
) => {
  const sanitized = value.replace(/^\s+/, "");
  setValue(sanitized);
  if (sanitized) {
    const validation = validateName(fieldName, sanitized);
    setError(validation.isValid ? "" : validation.message || "");
  } else {
    setError(emptyErrorMsg);
  }
};

const handleFirstNameChange = (value: string) =>
  handleNameChange(value, "FirstName", setFirstName, setFirstNameError, "First name cannot be empty");

const handleLastNameChange = (value: string) =>
  handleNameChange(value, "LastName", setLastName, setLastNameError, "Last name cannot be empty");

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
          messageImg: trashIcon,
          title: "Your account was deleted",
          subtitle:
            "Your profile and associated data has been permanently deleted. This action can’t be reversed. Create a new account to begin.",
          buttonText: "Create an account",
          buttonPath: "/sign-up",
          shouldClearUser: true,
        },
      });
    } catch (_error) {
      setDeleteError(typeof _error === "string" ? _error : "Failed to delete account");
      setIsAccountDeleteModalOpen(false);
    }
  }

  const handleLoginAgain = () => {
    setIsSessionExpiredModalOpen(false);
    dispatch(clearUser());
    navigate("/sign-in", { state: { from: "/settings" } });
  };

  function handleGetResponse(response: ProfileApiResponse) {
    if (response.success && response.data) {
      const updatePayload: Record<string, unknown> = {};
      if (response.data.user) {
        Object.assign(updatePayload, response.data.user);
      }
      if (response.data.email) {
        updatePayload.businessEmail = response.data.email;
      }
      if (response.data.emailVerify !== undefined) {
        updatePayload.emailVerify = response.data.emailVerify;
      }

      if (Object.keys(updatePayload).length > 0) {
        dispatch(updateUser(updatePayload));
      }

      // Sync localStorage
      const userDetail = localStorage.getItem("userDetail");
      if (userDetail) {
        const parsedUserDetail = JSON.parse(userDetail);
        if (parsedUserDetail.auth?.user) {
          Object.assign(parsedUserDetail.auth.user, updatePayload);
          localStorage.setItem("userDetail", JSON.stringify(parsedUserDetail));
        }
      }
    }

    setIsUpdateEmailModalOpen(false);
    setTimeout(() => setShowSuccess(true), 100);
  }
  // const handleResendVerification = async () => {
  //   try {
  //     await dispatch(resendVerificationEmail()).unwrap();

  //     setShowSuccess(true);
  //   } catch (error) {
  //     setResendError(
  //       error instanceof Error ? error.message : "Failed to resend verification email"
  //     );
  //     setShowError(true);
  //   }
  // };

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

  if (isRedirecting) {
    return (
      <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />
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
              Manage your profile, preferences, and account settings.
            </p>
          </div>

          {/* Error Messages */}
          {showError && profileError && (
            <div className="mt-6">
              <ErrorMessage
                errorType="danger"
                textColor="text-ws-error-700"
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
                textColor="text-ws-error-700"
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
                textColor="text-ws-error-700"
                alertIcon={AlertCircle}
                errorMessage={retakeError}
                onClose={() => setRetakeError(null)}
              />
            </div>
          )}

          {deleteError && (
            <div className="mt-6">
              <ErrorMessage
                errorType="danger"
                textColor="text-ws-error-700"
                alertIcon={AlertCircle}
                errorMessage={deleteError}
                onClose={() => setDeleteError(null)}
              />
            </div>
          )}

          <div className="space-y-6 mt-6">
            <div className="bg-ws-base-white rounded-xl p-6 ml-1 shadow-md">
              {/* Personal Info Section */}
              <div className="bg-ws-navy-25 flex gap-2 border border-ws-border-secondary rounded-xl py-8 px-6 flex-col">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-medium text-ws-text-primary">
                    Personal information
                  </h2>
                  <p className="text-base text-ws-text-tertiary mt-2">
                    Update your name, email, and personal details.
                  </p>
                </div>

                <div className="bg-ws-base-white mt-4">
                  <div className="w-full space-y-4">
                    <div className="flex items-start justify-between flex-col">
                      <div className="w-full flex gap-6 ">
                        <div className="w-full xl:w-1/2">
                          <InputGroup>
                            <Input
                              id="firstName"
                              label="First name"
                              name="firstName"
                              size="md"
                              isRequired={false}
                              placeholder="First name"
                              value={firstName}
                              onChange={handleFirstNameChange}
                              // isDisabled={profileLoading}
                              isDisabled={true}
                              helperTooltip="Your first name"
                            />
                            {firstNameError && (
                              <p className="text-ws-error-600 text-sm mt-1">{firstNameError}</p>
                            )}
                          </InputGroup>
                        </div>
                        <div className="w-full xl:w-1/2">
                          <InputGroup>
                            <Input
                              id="lastName"
                              label="Last name"
                              name="lastName"
                              size="md"
                              isRequired={false}
                              placeholder="Last name"
                              value={lastName}
                              onChange={handleLastNameChange}
                              // isDisabled={profileLoading}
                              isDisabled={true}
                              helperTooltip="Your last name"
                            />
                            {lastNameError && (
                              <p className="text-ws-error-600 text-sm mt-1">{lastNameError}</p>
                            )}
                          </InputGroup>
                        </div>
                      </div>
                      <div className="w-full">
                        <Button
                          color="link"
                          className="text-ws-navy-800 font-semibold shadow-none max-w-48 no-underline mt-2"
                          onClick={() => setIsUpdateInfoModalOpen(true)}
                        >
                          {"Update information"}
                        </Button>
                      </div>
                    </div>

                    <div className="w-full xl:w-full">
                      <InputGroup>
                        <div className="w-full flex items-start flex-col">
                          <div className="w-full flex flex-col gap-4">
                            <Input
                              id="email"
                              label="Email"
                              name="email"
                              size="md"
                              icon={Mail01}
                              iconClassName="text-ws-gray-400"
                              isRequired={false}
                              placeholder="medium@untitledui.com"
                              value={userData?.businessEmail || ""}
                              isDisabled={true}
                              helperTooltip="Your email address"
                            />
                          </div>
                          <div className="w-full">
                            <Button
                              color="link"
                              className="text-ws-navy-800 font-semibold shadow-none max-w-48 no-underline mt-2"
                              onClick={() => setIsUpdateEmailModalOpen(true)}
                              isDisabled={profileLoading || !firstName || !lastName}
                            >
                              {/* {resendVerification ? "Resend Verification Email" : "Update email"} */}
                              {"Update email"}
                            </Button>
                          </div>
                        </div>
                      </InputGroup>
                    </div>
                    <div className="w-full xl:w-full">
                      <InputGroup>
                        <Input
                          type="password"
                          id="password"
                          label="Password"
                          name="password"
                          size="md"
                          isRequired={false}
                          placeholder="Password"
                          value="********"
                          isDisabled={true}
                          showPasswordToggle={false}
                        />
                      </InputGroup>
                      <Button
                        color="link"
                        className="text-ws-navy-800 font-semibold shadow-none no-underline mt-2 normal-case"
                        onClick={() => setIsChangePasswordModalOpen(true)}
                        isDisabled={profileLoading || !firstName || !lastName}
                      >
                        Change password
                      </Button>
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
                      Retake your assessment at any time, or permanently delete your account.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    {/* Retake Assessment */}
                    <div className="flex flex-col xl:flex-row">
                      <div className="w-full xl:w-1/2 flex flex-col">
                        <label
                          htmlFor="retakeAssessment"
                          className="text-ws-text-primary font-normal text-base mt-2"
                        >
                          Retake the assessment
                        </label>
                        {/* <span className="text-ws-text-tertiary text-sm">
                          Retaking the assessment will result in loss of progress.
                        </span> */}
                      </div>
                      <div className="w-full xl:w-1/2 flex gap-4 mt-3 xl:mt-0">
                        <Button
                          color="subtle"
                          size="lg"
                          className="w-full text-base font-semibold text-ws-navy-800 hover:text-ws-base-white"
                          onClick={() => setIsRetakeAssessmentModalOpen(true)}
                          isDisabled={completionCount === 0 && !isFinchCompleted}
                        >
                          Retake the assessment
                        </Button>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="flex flex-col xl:flex-row">
                      <div className="w-full xl:w-1/2 flex flex-col">
                        <label
                          htmlFor="deleteAccount"
                          className="text-ws-text-primary font-normal text-base mt-2"
                        >
                          Delete my A2B account
                        </label>
                        {/* <span className="text-ws-text-tertiary text-sm">This cannot be undone</span> */}
                      </div>
                      <div className="w-full xl:w-1/2 flex gap-4 mt-3 xl:mt-0">
                        <Button
                          color="subtle"
                          size="lg"
                          className="w-full text-base font-semibold text-ws-error-600 hover:bg-ws-error-200 hover:border-ws-bg-overlay/18 transition-all duration-200 hover:text-ws-error-700"
                          onClick={() => setIsAccountDeleteModalOpen(true)}
                        >
                          Delete my account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <UpdateYourInformationModal
        key={String(isUpdateInfoModalOpen)}
        isOpen={isUpdateInfoModalOpen}
        onClose={() => setIsUpdateInfoModalOpen(false)}
        onSuccess={() => {
          setTimeout(() => setIsUpdateInfoSuccessModalOpen(true), 100);
        }}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <UpdateYourEmailModal
        key={userData?.firstName + userData?.lastName}
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
        onClose={async () => {
          setShowSuccess(false);
          setIsRedirecting(true);

          await dispatch(logoutThunk())
            .unwrap()
            .catch(() => {});
          setIsRedirecting(false);
          navigate("/success", {
            state: {
              messageImg: signoutIcon,
              title: "You've been logged out.",
              subtitle:
                "To protect your privacy, you've been logged out. Please verify your email to log back in.",
            },
          });
        }}
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
      <BaseModalWithIcon
        isOpen={isUpdateInfoSuccessModalOpen}
        onClose={() => setIsUpdateInfoSuccessModalOpen(false)}
        {...updateInfoSuccessModal}
      />
    </div>
  );
};

export default SettingsPage;
