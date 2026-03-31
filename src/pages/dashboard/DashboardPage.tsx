import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import emailIcon from "@/assets/mail-icon.svg";
import checkIcon from "@/assets/file-check.svg";
import finchLogo from "@/assets/finch-logo.svg";
import DashboardCard from "./DashboardCard";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUser } from "@/store/selectors/authSelectors";
import { InProgressModal } from "@/components/modals/InProgressModal";
import { BaseModalWithIcon } from "@/components/modals/BaseModalWithIcon";
import ErrorMessage from "@/components/common/ErrorMessage";
import { AlertCircle, ChevronRight } from "@untitledui/icons";
import { fetchUserById } from "@/store/slices/userSlice";
import { resendVerificationEmail } from "@/store/slices/profileSlice";
import { selectProfileError } from "@/store/selectors/profileSelectors";
import { useModalConfig } from "@/hooks/useModalConfig";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import { Tabs } from "@/components/base/tabs/tabs";
import RecommendationsPage from "../recommendations/RecommendationsPage";
import BenchmarkPage from "../benchmark/BenchmarkPage";
import { fetchDashboard } from "@/store/slices/dashboardSlice";
import { CircleCheckIcon } from "@/assets/icons/CircleCheckIcon";
import { Oval } from "react-loader-spinner";
import { selectDashboardLoading, selectDashboardError } from "@/store/selectors/dashboardSelectors";
import { Button } from "@/components/base/buttons/button";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const profileError = useAppSelector(selectProfileError);

  const emailVerify = user?.emailVerify || false;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [showCooldownModal, setShowCooldownModal] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const {
    completionCount,
    assessmentData,
    isLoading: isLoadingAssessment,
  } = useAssessmentStatus({ enabled: emailVerify });
  const dashboardLoading = useAppSelector(selectDashboardLoading);
  const dashboardError = useAppSelector(selectDashboardError);
  const [showInProgressModal, setShowInProgressModal] = useState(false);
  const [showGoalsSuccessModal, setShowGoalsSuccessModal] = useState(false);
  const [showGoalsEmptyWarning, setShowGoalsEmptyWarning] = useState(false);
  const [isDashboardReady, setIsDashboardReady] = useState(false);
  const hasRunDashboardFetchRef = useRef(false);
  const fromGoalsCompletionRef = useRef(false);

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

  // Check sessionStorage once on mount for Goals completion flag.
  useEffect(() => {
    if (sessionStorage.getItem("goalsCompletionPending") === "true") {
      sessionStorage.removeItem("goalsCompletionPending");
      fromGoalsCompletionRef.current = true;
    }
  }, []);

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
    if (
      assessmentData?.status === "completed" &&
      !dashboardLoading &&
      !hasRunDashboardFetchRef.current
    ) {
      hasRunDashboardFetchRef.current = true;

      const fetchWithModal = async () => {
        setShowInProgressModal(true);
        try {
          const resultAction = await dispatch(fetchDashboard());
          setShowInProgressModal(false);

          if (fetchDashboard.fulfilled.match(resultAction)) {
            setIsDashboardReady(true);
            if (fromGoalsCompletionRef.current) {
              setShowGoalsSuccessModal(true);
              fromGoalsCompletionRef.current = false;
            }
          } else if (fetchDashboard.rejected.match(resultAction)) {
            const errorMsg = resultAction.payload as string;
            if (
              errorMsg?.toLowerCase().includes("empty") ||
              errorMsg?.toLowerCase().includes("incomplete") ||
              errorMsg?.toLowerCase().includes("no data")
            ) {
              setShowGoalsEmptyWarning(true);
            } else {
              setErrorMessage(errorMsg || "Failed to load dashboard data");
            }
          }
        } catch (error) {
          console.error("error:", error);
          setShowInProgressModal(false);
          setShowGoalsEmptyWarning(true);
        }
      };

      fetchWithModal();
    }
  }, [assessmentData?.status, dashboardLoading, dispatch]);

  const handleFetchDashboardWithModals = useCallback(async () => {
    setErrorMessage(null);
    setShowInProgressModal(true);

    try {
      const resultAction = await dispatch(fetchDashboard());
      setShowInProgressModal(false);

      if (fetchDashboard.fulfilled.match(resultAction)) {
        setIsDashboardReady(true);
        setShowGoalsSuccessModal(true);
      } else if (fetchDashboard.rejected.match(resultAction)) {
        const errorMsg = resultAction.payload as string;
        if (
          errorMsg?.toLowerCase().includes("empty") ||
          errorMsg?.toLowerCase().includes("incomplete") ||
          errorMsg?.toLowerCase().includes("no data")
        ) {
          setShowGoalsEmptyWarning(true);
        } else {
          setErrorMessage(errorMsg || "Failed to load dashboard data");
        }
      }
    } catch (_error) {
      setShowInProgressModal(false);
      setShowGoalsEmptyWarning(true);
    }
  }, [dispatch]);

  const handleRetryDashboard = () => {
    handleFetchDashboardWithModals();
  };

  const handleVerifyEmail = async () => {
    if (emailVerify) return;

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

  const goalsSuccessModal = useModalConfig("goalsComplete", {
    isOpen: showGoalsSuccessModal,
    onClose: () => setShowGoalsSuccessModal(false),
    onConfirm: () => setShowGoalsSuccessModal(false),
  });

  const goalsEmptyWarningModal = useModalConfig("goalsEmptyWarning", {
    isOpen: showGoalsEmptyWarning,
    onClose: () => setShowGoalsEmptyWarning(false),
    onConfirm: () => {
      setShowGoalsEmptyWarning(false);
      navigate("/assessment");
    },
  });

  if (isLoadingAssessment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Oval
          height={80}
          width={80}
          color="#06b6d4"
          wrapperClass="flex items-center justify-center"
          visible
          ariaLabel="oval-loading"
          secondaryColor="#0891b2"
          strokeWidth={2}
          strokeWidthSecondary={2}
        />
      </div>
    );
  }

  const handleGetStarted = () => {
    navigate("/assessment");
  };

  const handleFinchStarted = () => {
    navigate("/additional-questions");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ws-white">
      {/* Sidebar */}
      <DashboardSidebar activeUrl="/dashboard" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-5 xl:p-10 xl:pl-0">
          <div className="space-y-6"></div>
          <div>
            <h2 className="text-4xl font-bold text-ws-black-60">
              {assessmentData?.status !== "completed" ? (
                `Welcome, ${user?.firstName ? `${user.firstName}!` : ""}`
              ) : (
                <span className="font-bold mb-4 flex">{`Hi ${user?.firstName}!`}</span>
              )}
            </h2>
            <p className="text-base font-normal text-ws-black mt-4">
              BeneStats provides an overview of your workforce, industry, and some recommended
              solutions that can add more value to your benefits packages and employee support.
            </p>
            {assessmentData?.status === "completed" && (
              <p className="text-base font-normal text-ws-black">
                Here's an overview of your workforce, industry, and some recommendations with
                partners that can add more value to your benefits packages and employee support.
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
            {assessmentData?.status === "completed" && dashboardError && !showInProgressModal && (
              <div className="mt-6">
                <ErrorMessage
                  errorType="danger"
                  textColor="text-red-700"
                  alertIcon={AlertCircle}
                  errorMessage={dashboardError}
                  onClose={() => {}}
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

            {/* {assessmentData?.status !== "completed" && (
              <div className="mt-6 border border-ws-primary-100 rounded-xl p-4 bg-ws-primary-50 shadow-sm flex gap-4 justify-between flex-col lg:flex-row">
                <div className="flex-1">
                  <h2 className="text-ws-primary-900 text-3xl font-normal mb-2">
                    Thanks for signing up.
                  </h2>
                  <p className="text-ws-primary-900 text-base pr-10">
                    Pick up where you left off and complete your company assessment for results and
                    recommendations.
                  </p>
                </div>
                <div className="flex-1 rounded-lg">
                  <img src={fpoHero} alt="Insight hero" className="w-full" />
                </div>
              </div>
            )} */}

            {!emailVerify && (
              <DashboardCard
                classes="bg-ws-primary-50 border-ws-primary-100" // Custom styles for email verification card
                title="Verify your email"
                description={
                  <div className="max-w-2xl text-ws-primary-900">
                    Verify your email to unlock all BeneStats features and secure your account.
                    Didn’t recieve an email? Click the button to resend
                    <Link
                      to="#"
                      onClick={e => {
                        e.preventDefault();
                        if (!emailVerify) handleVerifyEmail();
                      }}
                      className="underline ml-2 text-sm text-ws-primary-500"
                    >
                      Resend verification
                    </Link>
                  </div>
                }
                avatarIconSrc={emailIcon}
                buttonLabel="Verify"
                buttonType="primary"
                buttonIsDisabled={emailVerify}
                onClick={handleVerifyEmail}
              />
            )}

            {assessmentData?.status !== "completed" && (
              <DashboardCard
                classes="bg-ws-primary-50 border-ws-primary-100"
                title={`${completionCount > 0 ? `${completionCount} ` : ""}Take the Assessment`}
                description={
                  <div className="max-w-2xl text-ws-primary-900">
                    Take our 15 minute assessment for specific recommendations to improve your
                    business
                  </div>
                }
                avatarIconSrc={checkIcon}
                buttonLabel={completionCount > 0 ? "Continue" : "Start assessment"}
                buttonType={emailVerify ? "primary" : "secondary"}
                buttonIsDisabled={!emailVerify}
                //onClick={() => navigate("/assessment")}
                //onClick={() => navigate("/get-more")}
                toggleButton={false}
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-4 mt-6">
            <div className="flex-1 py-6 px-7 border border-ws-primary-100 rounded-xl min-h-109 relative">
              <div className="flex items-center justify-between border-b border-ws-primary-100 pb-4 mb-4">
                <h2 className="text-ws-black-10 text-2xl font-medium">Basic Plan</h2>
                <p className="text-ws-black-10 text-base">Free</p>
              </div>
              <p className="text-ws-black-10 text-base">
                Fill out a simple assessment form and get high level recommendations to enhance your
                benefits program.
              </p>
              <ul className="text-ws-black-10 text-base list-disc list-inside my-4">
                <li>Results in 10 min</li>
                <li>Industry benchmarks</li>
                <li>Placed-based insights</li>
                <li>Annual data updates</li>
              </ul>
              <Button
                iconTrailing={<ChevronRight />}
                size="sm"
                color="primary"
                className="min-w-30 absolute bottom-6 left-7"
                onClick={handleGetStarted}
              >
                Let’s Get Started
              </Button>
            </div>
            <div className="flex-1 py-6 px-7 border border-ws-primary-100 rounded-xl min-h-109 relative">
              <div className="flex items-center justify-between border-b border-ws-primary-100 pb-4 mb-4">
                <h2 className="flex items-center text-ws-black-10 text-2xl font-medium">
                  Connect with <img src={finchLogo} alt="Finch Logo" className="ml-2" />
                </h2>
                <p className="text-ws-black-10 text-base">Free</p>
              </div>
              <p className="text-ws-black-10 text-base">
                Finch handles the connection for you, syncing all your data automatically so you get
                richer insights and expanded dashboard views — without any extra work on your end.
              </p>
              <ul className="text-ws-black-10 text-base list-disc list-inside my-4">
                <li>Results in 3-5 min</li>
                <li>Custom workforce data and insights</li>
                <li>Additional dashboard views plus everything you get in the basic plan</li>
              </ul>
              <p className="text-ws-black-10 text-base">
                By connecting with Finch, you'll be redirected to their site to complete the setup.
                Please note that data shared is secure and protected by Finch’s thorough data
                privacy policies.
              </p>
              <Button
                iconTrailing={<ChevronRight />}
                size="sm"
                color="primary"
                className="min-w-30 absolute bottom-6 left-7"
                onClick={handleFinchStarted}
              >
                Start with Finch
              </Button>
            </div>
          </div>

          {/* Tabs — only render after dashboard data is confirmed ready */}
          {emailVerify && assessmentData?.status === "completed" && isDashboardReady && (
            <div className="mt-10">
              {/* <Tabs>
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
              </Tabs> */}
              <Tabs>
                <Tabs.List
                  type="underline"
                  items={[
                    { id: "recommendations", label: "Recommendations" },
                    { id: "workforce", label: "Workforce" },
                    { id: "industry", label: "Industry" },
                  ]}
                />
                <Tabs.Panel id="recommendations" className="pt-12">
                  <RecommendationsPage />
                </Tabs.Panel>
                <Tabs.Panel id="workforce" className="pt-12">
                  <BenchmarkPage />
                </Tabs.Panel>
                <Tabs.Panel id="industry" className="pt-12">
                  Industry
                </Tabs.Panel>
              </Tabs>
            </div>
          )}
        </main>
        <div className="w-full relative lg:-top-8">
          <p className="text-xs color-base-black">
            This product provides informational insights and recommendations based on the data you
            share and industry benchmarks. It does not provide legal, financial, tax, or benefits
            advice, and recommendations are not guarantees of outcomes or results. Actual results
            may vary, and you are responsible for evaluating and implementing any recommendations
            based on your organization’s specific circumstances. Read our{" "}
            <Link to="/terms-page" className="text-ws-primary-500 underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="text-ws-primary-500 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      {/* Modals */}
      <BaseModalWithIcon
        isOpen={showResendSuccess}
        onClose={() => setShowResendSuccess(false)}
        {...resendSuccessModal}
      />

      <BaseModalWithIcon
        isOpen={showCooldownModal}
        onClose={() => setShowCooldownModal(false)}
        {...cooldownModal}
      />

      <InProgressModal
        isOpen={showInProgressModal}
        onClose={() => setShowInProgressModal(false)}
        title="Preparing..."
        subtitle="One moment while we prepare your results and recommendations."
      />

      <BaseModalWithIcon
        isOpen={showGoalsSuccessModal}
        onClose={() => setShowGoalsSuccessModal(false)}
        icon={<CircleCheckIcon />}
        {...goalsSuccessModal}
      />

      <BaseModalWithIcon
        isOpen={showGoalsEmptyWarning}
        onClose={() => setShowGoalsEmptyWarning(false)}
        icon={<CircleCheckIcon />}
        {...goalsEmptyWarningModal}
      />
    </div>
  );
};

export default DashboardPage;
