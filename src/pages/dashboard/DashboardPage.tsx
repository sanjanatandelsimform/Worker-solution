import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import emailIcon from "@/assets/mail-icon.svg";
import checkIcon from "@/assets/file-check.svg";
import DashboardCard from "./DashboardCard";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUser } from "@/store/selectors/authSelectors";
import { BaseModalWithIcon } from "@/components/modals/BaseModalWithIcon";
import ErrorMessage from "@/components/common/ErrorMessage";
import checkmarkIcon from "@/assets/checkmark-icon.svg";
import { AlertCircle, CheckCircle } from "@untitledui/icons";
import { fetchUserById } from "@/store/slices/userSlice";
import { resendVerificationEmail } from "@/store/slices/profileSlice";
import { selectProfileError } from "@/store/selectors/profileSelectors";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const profileError = useAppSelector(selectProfileError);

  const emailVerify = user?.emailVerify || false;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [showCooldownModal, setShowCooldownModal] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0); // Cooldown in seconds

  useEffect(() => {
    if (user?.id) {
      const userDetail = localStorage.getItem("userDetail");
      if (userDetail) {
        const parsedUserDetail = JSON.parse(userDetail);
        const accessToken = parsedUserDetail?.auth?.tokens?.accessToken;
        if (accessToken) {
          dispatch(fetchUserById({ userId: user.id, token: accessToken }));
        }
      }
    }
  }, [user?.id, dispatch]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(prev => {
          const newCooldown = prev - 1;
          if (newCooldown === 0) {
            setShowCooldownModal(false);
          }
          return newCooldown;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleVerifyEmail = async () => {
    if (emailVerify) {
      return;
    }

    if (cooldown > 0) {
      setShowCooldownModal(true);
      return;
    }

    try {
      setErrorMessage(null);
      await dispatch(resendVerificationEmail()).unwrap();
      setCooldown(60);
      setShowResendSuccess(true);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : profileError || "Failed to resend verification email. Please try again."
      );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dashboard">
      {/* Sidebar */}
      <DashboardSidebar activeUrl="/dashboard" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div>
            <h2 className="text-4xl font-medium text-primary">Welcome!</h2>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-6">
                <ErrorMessage
                  errorType="danger"
                  textColor="text-red-700"
                  alertIcon={AlertCircle}
                  errorMessage={errorMessage}
                  onClose={() => setErrorMessage(null)}
                />
              </div>
            )}

            <div className="mt-6 border border-gray-300 rounded-xl p-4 bg-dashboard-card shadow-sm flex gap-4 justify-between flex-col lg:flex-row">
              <div className="flex-1">
                <h2 className="text-dashboard-card-title text-3xl font-medium mb-2">
                  Thanks for signing up.
                </h2>
                <p className="text-white">
                  👋 Welcome aboard! Please check your inbox and verify your email to get started.
                </p>
              </div>
              <div className="flex-1 bg-dashboard-card-image rounded-lg p-4 flex items-center justify-center text-2xl font-medium text-white">
                FPO Img
              </div>
            </div>
            {!emailVerify && (
              <DashboardCard
                title="Verify your email"
                description={
                  <>
                    One quick step to secure your account. Didn't get the email?{" "}
                    <Link
                      to="#"
                      onClick={e => {
                        e.preventDefault();
                        if (!emailVerify) {
                          handleVerifyEmail();
                        }
                      }}
                      className="underline"
                    >
                      Resend verification
                    </Link>
                  </>
                }
                avatarIconSrc={emailIcon}
                buttonLabel="Verify email"
                buttonType="primary"
                buttonIsDisabled={emailVerify}
                onClick={handleVerifyEmail}
              />
            )}
            <DashboardCard
              title="Take the Assessment"
              description="Take our 15 minute assessment for specific recommendations to improve your business"
              avatarIconSrc={checkIcon}
              buttonLabel="Take Assessment"
              buttonType="secondary"
              buttonIsDisabled={!emailVerify}
              onClick={() => navigate("/assessment")}
            />
          </div>
        </main>
      </div>

      {/* Success Modal for Resend Verification */}
      <BaseModalWithIcon
        isOpen={showResendSuccess}
        onClose={() => setShowResendSuccess(false)}
        size="sm"
        title="Email sent"
        subtitle={`We’ve sent a verification link to ${user?.businessEmail}. Verify your email to continue.`}
        icon={<CheckCircle className="size-6" />}
        messageImg={checkmarkIcon}
        backgroundPattern="success"
        buttons={[
          {
            text: "Return to dashboard",
            onClick: () => {
              setShowResendSuccess(false);
              navigate("/dashboard");
            },
            color: "primary",
          },
        ]}
      />

      {/* Cooldown Modal */}
      <BaseModalWithIcon
        isOpen={showCooldownModal}
        onClose={() => setShowCooldownModal(false)}
        size="sm"
        title="Please wait"
        subtitle={`Email just sent. Please wait ${cooldown} seconds before trying again.`}
        icon={<AlertCircle className="size-6 text-yellow-500" />}
        backgroundPattern="unsuccess"
        buttons={[
          {
            text: "Okay",
            onClick: () => setShowCooldownModal(false),
            color: "primary",
          },
        ]}
      />
    </div>
  );
};

export default DashboardPage;
