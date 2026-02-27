import { useEffect, useState, useCallback } from "react";
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
import { AlertCircle } from "@untitledui/icons";
import { fetchUserById } from "@/store/slices/userSlice";
import { resendVerificationEmail } from "@/store/slices/profileSlice";
import { selectProfileError } from "@/store/selectors/profileSelectors";
import { useModalConfig } from "@/hooks/useModalConfig";
import fpoHero from "@/assets/fpo-hero-image.png";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import { Tabs } from "@/components/base/tabs/tabs";
import RecommendationsPage from "../recommendations/RecommendationsPage";
import BenchmarkPage from "../benchmark/BenchmarkPage";
import { fetchDashboard } from "@/store/slices/dashboardSlice";
import {
  selectDashboardLoading,
  selectDashboardError,
  selectDashboardIsLoaded,
} from "@/store/selectors/dashboardSelectors";

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

  const { completionCount, isLoading: _isLoadingAssessment } = useAssessmentStatus();

  // Dashboard data state
  const dashboardLoading = useAppSelector(selectDashboardLoading);
  const dashboardError = useAppSelector(selectDashboardError);
  const dashboardIsLoaded = useAppSelector(selectDashboardIsLoaded);

  // Function to refetch user data
  // const refetchUserData = async () => {
  //   if (user?.id) {
  //     try {
  //       const userDetail = localStorage.getItem("userDetail");
  //       if (userDetail) {
  //         const parsedUserDetail = JSON.parse(userDetail);
  //         const accessToken = parsedUserDetail?.auth?.tokens?.accessToken;
  //         if (accessToken) {
  //           await dispatch(fetchUserById({ userId: user.id, token: accessToken })).unwrap();
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Failed to refetch user data:", error);
  //     }
  //   }
  // };
  const refetchUserData = useCallback(async () => {
    if (user?.id) {
      try {
        const userDetail = localStorage.getItem("userDetail");
        if (userDetail) {
          const parsedUserDetail = JSON.parse(userDetail);
          const accessToken = parsedUserDetail?.auth?.tokens?.accessToken;
          if (accessToken) {
            await dispatch(fetchUserById({ userId: user.id, token: accessToken })).unwrap();
          }
        }
      } catch (error) {
        console.error("Failed to refetch user data:", error);
      }
    }
  }, [user, dispatch]);

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

  // Handle visibility change and window focus to keep UI in sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetchUserData();
      }
    };

    const handleWindowFocus = () => {
      refetchUserData();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [user?.id, refetchUserData]);

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

  useEffect(() => {
    if (completionCount === 4 && !dashboardIsLoaded && !dashboardLoading) {
      dispatch(fetchDashboard());
    }
  }, [completionCount, dashboardIsLoaded, dashboardLoading, dispatch]);

  const handleRetryDashboard = () => {
    dispatch(fetchDashboard());
  };

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
      const errorMsg =
        error instanceof Error
          ? error.message
          : profileError || "Failed to resend verification email. Please try again.";

      // If email is already verified, refetch user data to update UI
      if (
        errorMsg.includes("Email address is already verified") ||
        errorMsg.toLowerCase().includes("already verified")
      ) {
        await refetchUserData();
      } else {
        setErrorMessage(errorMsg);
      }
    }
  };

  const resendSuccessModal = useModalConfig("resendSuccess", {
    isOpen: showResendSuccess,
    onClose: () => setShowResendSuccess(false),
    onConfirm: () => {
      setShowResendSuccess(false);
      navigate("/dashboard");
    },
    additionalData: { email: user?.businessEmail },
  });

  const cooldownModal = useModalConfig("cooldown", {
    isOpen: showCooldownModal,
    onClose: () => setShowCooldownModal(false),
    additionalData: { cooldown },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-ws-gray-500">
      {/* Sidebar */}
      <DashboardSidebar activeUrl="/dashboard" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-5 xl:p-10 xl:pl-0">
          <div className="space-y-6"></div>
          <div>
            <h2 className="text-4xl font-medium text-ws-black">
              {completionCount !== 4 ? `Welcome!` : `Hi ${user?.lastName}!`}
            </h2>
            {completionCount == 4 && (
              <p>
                Here's an overview of your workforce, industry, and some recommendations with partners that can add more value to your 
                benefits packages and employee support.
              </p>
            )}

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

            {/* Dashboard Error with Retry */}
            {completionCount === 4 && dashboardError && (
              <div className="mt-6">
                <ErrorMessage
                  errorType="danger"
                  textColor="text-red-700"
                  alertIcon={AlertCircle}
                  errorMessage={dashboardError}
                  onClose={() => {}} // Keep error visible until retry succeeds
                />
                <button
                  onClick={handleRetryDashboard}
                  className="mt-4 px-4 py-2 bg-ws-primary text-white rounded-lg hover:bg-ws-primary-dark transition-colors"
                  disabled={dashboardLoading}
                >
                  {dashboardLoading ? "Retrying..." : "Retry"}
                </button>
              </div>
            )}
            {/* Currently using `completionCount` to control visibility. */}
            {/* This logic will be replaced once the backend API provides the required flag */}
            {completionCount !== 4 && (
              <div className="mt-6 border border-ws-gray-50 rounded-xl p-4 bg-ws-black-80 shadow-sm flex gap-4 justify-between flex-col lg:flex-row">
                <div className="flex-1">
                  <h2 className="text-ws-cyan-10 text-3xl font-medium mb-2">
                    Thanks for signing up.
                  </h2>
                  <p className="text-ws-white text-base pr-10">
                    Pick up where you left off and complete your company assessment for results and
                    recommendations.
                  </p>
                </div>
                <div className="flex-1 rounded-lg">
                  <img src={fpoHero} alt="Insight hero" className="w-full" />
                </div>
              </div>
            )}
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
            {completionCount !== 4 ? (
              <DashboardCard
                title={`${completionCount > 0 ? `${completionCount} ` : ""}Take the Assessment`}
                description="Take our 15 minute assessment for specific recommendations to improve your business"
                avatarIconSrc={checkIcon}
                buttonLabel={completionCount > 0 ? "Continue" : "Take Assessment"}
                buttonType={emailVerify ? "primary" : "secondary"}
                buttonIsDisabled={!emailVerify}
                onClick={() => navigate("/assessment")}
              />
            ) : (
              ""
            )}
          </div>
          {/* This will be conditionally rendered; uncomment when this feature is implemented. */}
          {emailVerify && completionCount == 4 && (
            <div className="mt-10">
              {dashboardLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ws-primary"></div>
                  <p className="ml-4 text-ws-gray-300">Loading dashboard data...</p>
                </div>
              ) : (
                <Tabs>
                  <Tabs.List
                    size="md"
                    type="button-brand"
                    items={[
                      { id: "recommendations", label: "Recommendations" },
                      { id: "benchmark", label: "Benchmark" },
                    ]}
                  />
                  <Tabs.Panel id="recommendations" className="pt-12">
                    <RecommendationsPage />
                  </Tabs.Panel>
                  <Tabs.Panel id="benchmark" className="pt-12">
                    <BenchmarkPage />
                  </Tabs.Panel>
                </Tabs>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Success Modal for Resend Verification */}
      <BaseModalWithIcon
        isOpen={showResendSuccess}
        onClose={() => setShowResendSuccess(false)}
        {...resendSuccessModal}
      />

      {/* Cooldown Modal */}
      <BaseModalWithIcon
        isOpen={showCooldownModal}
        onClose={() => setShowCooldownModal(false)}
        {...cooldownModal}
      />
    </div>
  );
};

export default DashboardPage;
