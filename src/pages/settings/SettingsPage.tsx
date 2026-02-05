import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Mail01, AlertCircle } from "@untitledui/icons";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { UpdateYourEmailModal } from "@/components/modals/UpdateYourEmailModal";
import SessionExpiredModal from "@/components/modals/SessionExpiredModal";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import RetakeAssessmentModal from "@/components/modals/RetakeAssessmentModal";
import AccountDeleteModal from "@/components/modals/AccountDeleteModal";
import UpdateCompletedModal from "@/components/modals/UpdateCompletedModal";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateProfileData,
  deleteUserAccount,
  clearProfileData,
  resendVerificationEmail,
} from "@/store/slices/profileSlice";
import { clearUser, updateUser } from "@/store/slices/authSlice";
import { selectProfileLoading, selectProfileError } from "@/store/selectors/profileSelectors";
import { selectUser } from "@/store/selectors/authSelectors";
import { validateName } from "@/utils/validation";
import { CheckCircle } from "@untitledui/icons";
import { BaseModalWithIcon } from "../../components/modals/BaseModalWithIcon";
import checkmarkIcon from "@/assets/checkmark-icon.svg";

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const userData = useAppSelector(selectUser);
  const profileLoading = useAppSelector(selectProfileLoading);
  const profileError = useAppSelector(selectProfileError);
  const [activeUrl] = useState("/settings");
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isUpdateEmailModalOpen, setIsUpdateEmailModalOpen] = useState(false);
  const [isRetakeAssessmentModalOpen, setIsRetakeAssessmentModalOpen] = useState(false);
  const [isAccountDeleteModalOpen, setIsAccountDeleteModalOpen] = useState(false);
  const [isUpdateCompletedModalOpen, setIsUpdateCompletedModalOpen] = useState(false);
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false);
  const [firstName, setFirstName] = useState(() => userData?.firstName ?? "");
  const [lastName, setLastName] = useState(() => userData?.lastName ?? "");

  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendVerification, setResendVerification] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Calculate hasChanges derived from state
  const hasChanges = useMemo(() => {
    if (!userData) return false;
    return firstName !== userData.firstName || lastName !== userData.lastName;
  }, [firstName, lastName, userData]);

  // Handle save
  const handleSave = async () => {
    const firstNameValidation = validateName("FirstName", firstName);
    const lastNameValidation = validateName("LastName", lastName);

    if (!firstNameValidation.isValid || !lastNameValidation.isValid) {
      setFirstNameError(firstNameValidation.isValid ? "" : firstNameValidation.message || "");
      setLastNameError(lastNameValidation.isValid ? "" : lastNameValidation.message || "");
      return;
    }

    try {
      await dispatch(
        updateProfileData({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        })
      ).unwrap();

      dispatch(
        updateUser({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        })
      );

      setIsUpdateCompletedModalOpen(true);
      setShowError(false);
    } catch (_error) {
      setShowError(true);
    }
  };
  // Handle cancel
  const handleCancel = () => {
    if (userData) {
      setFirstName(userData.firstName);
      setLastName(userData.lastName);
      setFirstNameError("");
      setLastNameError("");
      setShowError(false);
    }
  };

  // Handle modal close and refresh
  const handleUpdateCompletedClose = () => {
    setIsUpdateCompletedModalOpen(false);
  };

  // Handle retake assessment
  const handleRetakeAssessment = () => {
    setIsRetakeAssessmentModalOpen(false);
    navigate("/assessment");
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!userData?.id) return;

    try {
      await dispatch(deleteUserAccount(userData.id)).unwrap();

      dispatch(clearProfileData());
      dispatch(clearUser());
      localStorage.removeItem("userDetail");

      navigate("/success", {
        state: {
          messageImg: checkmarkIcon,
          title: "Account Deleted",
          subtitle: "Your account has been successfully deleted.",
          buttonText: "Return to Sign In",
          buttonPath: "/sign-in",
          shouldClearUser: true,
        },
      });
    } catch (_error) {
      console.error("Failed to delete account:", _error);
    }
  };

  // Handle session expiry
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

    setTimeout(() => {
      setShowSuccess(true);
    }, 100);

    setResendVerification(true);
  };

  const handleBackToSettings = () => {
    setShowSuccess(false);
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    try {
      await dispatch(resendVerificationEmail()).unwrap();

      navigate("/success", {
        state: {
          messageImg: checkmarkIcon,
          title: "Your email has been verified!",
          subtitle: "Welcome aboard! Start your success journey with Bene Sol",
          buttonText: "Return to Dashboard",
          buttonPath: "/dashboard",
        },
      });
    } catch (error) {
      setResendError(
        error instanceof Error ? error.message : "Failed to resend verification email"
      );
      setShowError(true);
    }
  };

  if (!userData) {
    return (
      <div className="flex h-screen overflow-hidden bg-dashboard">
        <DashboardSidebar activeUrl={activeUrl} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-gray-600">Loading user data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dashboard">
      {/* Sidebar */}
      <DashboardSidebar activeUrl={activeUrl} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div>
            <h2 className="text-4xl font-medium text-primary">Settings</h2>
            <p className="text-base text-black mt-4">
              Here's an overview of your workforce, industry, and some recommendations with partners
              that can add more value to your benefits packages and employee support.
            </p>
          </div>
          {/* Error Message */}
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

          <div className="space-y-6 mt-6">
            <div className="bg-gray-card border border-gray-300 rounded-xl p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-black">Personal info</h2>
                  <p className="text-sm text-gray-600">
                    Update your photo and personal details here.
                  </p>
                </div>
              </div>
              <hr className="border-t border-gray-200 mt-5 mb-6" />
              <div className="bg-primary border border-primary rounded-xl py-8 px-6 mb-6">
                <div className="flex mb-6">
                  <div className="w-1/3">
                    <label htmlFor="firstName" className="text-black font-medium text-sm">
                      Name <span>*</span>
                    </label>
                  </div>
                  <div className="w-2/3 flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Input
                          id="firstName"
                          name="firstName"
                          size="md"
                          isRequired={true}
                          placeholder="First name"
                          value={firstName}
                          onChange={value => {
                            const sanitized = value.replace(/^\s+/, "");
                            setFirstName(sanitized);
                          }}
                          isDisabled={profileLoading}
                        />
                        {firstNameError && (
                          <p className="text-red-600 text-sm mt-1">{firstNameError}</p>
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
                          onChange={value => {
                            const sanitized = value.replace(/^\s+/, "");
                            setLastName(sanitized);
                          }}
                          isDisabled={profileLoading}
                        />
                        {lastNameError && (
                          <p className="text-red-600 text-sm mt-1">{lastNameError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex mb-6">
                  <div className="w-1/3">
                    <label htmlFor="email" className="text-black font-medium text-sm">
                      Email address <span>*</span>
                    </label>
                  </div>
                  <div className="w-2/3 flex flex-col  gap-4">
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
                <div className="flex mb-6">
                  <div className="w-1/3">
                    <label htmlFor="password" className="text-black font-medium text-sm">
                      Password <span>*</span>
                    </label>
                  </div>
                  <div className="w-2/3 flex flex-col  gap-4">
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
                      onClick={() => setIsChangePasswordModalOpen(true)}
                      isDisabled={profileLoading || !firstName || !lastName}
                    >
                      Change password
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-black">Account Management</h2>
                  <p className="text-sm text-gray-600">
                    Update your photo and personal details here.
                  </p>
                </div>
              </div>
              <hr className="border-t border-gray-200 mt-5 mb-6" />
              <div className="bg-primary border border-primary rounded-xl py-8 px-6 mb-6">
                <div className="flex mb-6">
                  <div className="w-1/2 flex flex-col">
                    <label htmlFor="firstName" className="text-black font-medium text-sm">
                      Retake the assessment
                    </label>
                    <span className="text-gray-600 text-sm">
                      Retaking the assessment will result in loss of progress.
                    </span>
                  </div>
                  <div className="w-1/2 flex  gap-4">
                    <Button
                      color="secondary"
                      size="md"
                      className="w-full"
                      onClick={() => setIsRetakeAssessmentModalOpen(true)}
                    >
                      Retake Assessment
                    </Button>
                  </div>
                </div>
                <div className="flex mb-6">
                  <div className="w-1/2 flex flex-col">
                    <label htmlFor="firstName" className="text-black font-medium text-sm">
                      Delete account
                    </label>
                    <span className="text-gray-600 text-sm">This cannot be undone</span>
                  </div>
                  <div className="w-1/2 flex  gap-4">
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
              </div>
              <div className="flex items-center justify-end gap-3">
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
                  isDisabled={!hasChanges || profileLoading || !!firstNameError || !!lastNameError}
                >
                  {profileLoading ? "Saving..." : "Save"}
                </Button>
              </div>
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
      <RetakeAssessmentModal
        isOpen={isRetakeAssessmentModalOpen}
        onClose={() => setIsRetakeAssessmentModalOpen(false)}
        onContinue={handleRetakeAssessment}
      />
      <AccountDeleteModal
        isOpen={isAccountDeleteModalOpen}
        onClose={() => setIsAccountDeleteModalOpen(false)}
        onContinue={handleDeleteAccount}
      />
      <UpdateCompletedModal
        isOpen={isUpdateCompletedModalOpen}
        onClose={handleUpdateCompletedClose}
      />
      <SessionExpiredModal
        isOpen={isSessionExpiredModalOpen}
        onClose={() => setIsSessionExpiredModalOpen(false)}
        onLoginAgain={handleLoginAgain}
      />

      <BaseModalWithIcon
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        size="sm"
        title="Email updated"
        subtitle="All set! Your email has been updated. We've sent a verification link to your new address. Please verify your email."
        icon={<CheckCircle className="size-6" />}
        messageImg={checkmarkIcon}
        backgroundPattern="success"
        buttons={[
          {
            text: "Back to Settings",
            onClick: handleBackToSettings,
            color: "primary",
          },
        ]}
      />
    </div>
  );
};

export default SettingsPage;
