import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import emailIcon from "@/assets/mail-icon.svg";
import finchLogo from "@/assets/finch-logo.svg";
import DashboardCard from "./DashboardCard";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUser } from "@/store/selectors/authSelectors";
import { selectUser as selectDetailedUser } from "@/store/selectors/userSelector";
import { BaseModalWithIcon } from "@/components/modals/BaseModalWithIcon";
import ErrorMessage from "@/components/common/ErrorMessage";
import { AlertCircle, ChevronRight } from "@untitledui/icons";
import { fetchUserById } from "@/store/slices/userSlice";
import { resendVerificationEmail } from "@/store/slices/profileSlice";
import { selectProfileError } from "@/store/selectors/profileSelectors";
import { useModalConfig } from "@/hooks/useModalConfig";
import fpoHero from "@/assets/fpo-hero-image.png";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import { useFinchConnect } from "@/hooks/useFinchConnect";
import { useDashboardStatusPolling } from "@/hooks/useDashboardStatusPolling";
import { Tabs } from "@/components/base/tabs/tabs";
import BenchmarkPage from "../benchmark/BenchmarkPage";
import { fetchWorkforce } from "@/store/slices/workforceSlice";
import { CircleCheckIcon } from "@/assets/icons/CircleCheckIcon";
import { AssessmentIcon } from "@/assets/icons/AssessmentIcon";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/base/buttons/button";
import RecommendationsFinchPage from "../recommendations/RecommendationsFinchPage";
import BenchmarkFinchPage from "../benchmark/BenchmarkFinchPage";
import WorkforcePage from "../workforce/WorkforcePage";
import { fetchRecommendations } from "@/store/slices/recommendationsSlice";
import { ArrowLeft } from "@/assets/icons/ArrowLeft";
import Declarations from "@/components/common/Declarations";
import DynamicLoadingModal from "@/components/dashboard/DynamicLoadingModal";
import { XhexagonIcon } from "@/assets/icons/XhexagonIcon";

const BASE_TAB_ITEMS = [{ id: "finchRecommendations", label: "Recommendations" }];

const FINCH_CONNECTED_TAB_ITEMS = [
  { id: "finchWorkforce", label: "Workforce" },
  { id: "finchIndustry", label: "Industry" },
];

const BASIC_TAB_ITEMS = [{ id: "industry", label: "Industry" }];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);
  const detailedUser = useAppSelector(selectDetailedUser);
  const dispatch = useAppDispatch();
  const profileError = useAppSelector(selectProfileError);
  const {
    connectWithFinch,
    isLoading: isFinchLoading,
    isPageLoading: isFinchPageLoading,
    error: finchError,
    clearError: clearFinchError,
  } = useFinchConnect();

  const emailVerify = user?.emailVerify || false;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [showCooldownModal, setShowCooldownModal] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [isEmailVerifiedModalOpen, setIsEmailVerifiedModalOpen] = useState(() => {
    const state = location.state as { emailVerified?: boolean } | null;
    if (state?.emailVerified) {
      // Clear navigation state to prevent re-trigger on refresh
      window.history.replaceState({}, document.title);
      return true;
    }
    return false;
  });
  const {
    completionCount,
    assessmentData,
    isConnected,
    isLoading: isLoadingAssessment,
    isFinchCompleted,
    isFinchAssessmentIncomplete,
  } = useAssessmentStatus({ enabled: emailVerify });
  const [showGoalsSuccessModal, setShowGoalsSuccessModal] = useState(false);
  const [showGoalsEmptyWarning, setShowGoalsEmptyWarning] = useState(false);
  const [activeTab, setActiveTab] = useState("finchRecommendations");
  const fromGoalsCompletionRef = useRef(false);
  const mainRef = useRef<HTMLElement>(null);

  // Refs to prevent duplicate API calls
  const fetchInProgressRef = useRef(false);
  const lastFetchedUserIdRef = useRef<string | null>(null);

  const refetchUserData = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id) return;

      // Check if detailed user data already exists in Redux (persists across remounts)
      if (!forceRefresh && detailedUser?.id === user.id) {
        console.log("[DashboardPage] User data already exists in Redux, skipping API call");
        return;
      }

      // Prevent concurrent duplicate calls
      if (!forceRefresh && fetchInProgressRef.current) {
        return;
      }
      if (!forceRefresh && lastFetchedUserIdRef.current === user.id) {
        return;
      }

      try {
        const userDetail = localStorage.getItem("userDetail");
        if (userDetail) {
          const parsedUserDetail = JSON.parse(userDetail);
          const accessToken = parsedUserDetail?.auth?.tokens?.accessToken;
          if (accessToken) {
            fetchInProgressRef.current = true;
            await dispatch(fetchUserById({ userId: user.id, token: accessToken })).unwrap();
            lastFetchedUserIdRef.current = user.id;
          }
        }
      } catch (error) {
        console.error("Failed to refetch user data:", error);
      } finally {
        fetchInProgressRef.current = false;
      }
    },
    [user?.id, detailedUser?.id, dispatch]
  );

  // Fetch user data only once on mount or when user ID changes
  useEffect(() => {
    // Reset tracking when user ID changes to allow new fetch
    if (user?.id && lastFetchedUserIdRef.current !== user.id) {
      lastFetchedUserIdRef.current = null;
    }
    refetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Handle visibility change and window focus to keep UI in sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Force refresh on visibility change
        refetchUserData(true);
      }
    };

    const handleWindowFocus = () => {
      // Force refresh on window focus
      refetchUserData(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [refetchUserData]);

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

  const handleCloseEmailVerifiedModal = () => {
    setIsEmailVerifiedModalOpen(false);
  };

  useEffect(() => {
    if (isConnected) dispatch(fetchWorkforce());
    if (isConnected || assessmentData?.data?.status === "completed")
      dispatch(fetchRecommendations());
  }, [isConnected, dispatch, assessmentData?.data?.status]);

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

  const emailVerifiedModal = useModalConfig("emailVerified", {
    isOpen: isEmailVerifiedModalOpen,
    onClose: handleCloseEmailVerifiedModal,
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

  const shouldPollDashboardStatus = isConnected || assessmentData?.data?.status === "completed";
  const {
    isRecommendationTabReady,
    isWorkforceTabReady,
    isIndustryTabReady,
    hasExceededProcessingWindow,
    isRecommendationTabStale,
    isWorkforceTabStale,
    isIndustryTabStale,
    isAutomatedProvider,
  } = useDashboardStatusPolling({ enabled: shouldPollDashboardStatus });

  const [isLoadingModalDismissed, setIsLoadingModalDismissed] = useState(false);
  const allTabsReady = isRecommendationTabReady && isWorkforceTabReady && isIndustryTabReady;
  const isDashboardVisible = assessmentData?.data?.status === "completed" || isConnected;
  const showLoadingModal = isDashboardVisible && !allTabsReady && !hasExceededProcessingWindow && !isLoadingModalDismissed;

  if (isLoadingAssessment || isFinchPageLoading) {
    return (
      <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />
    );
  }

  const handleGetStarted = () => {
    navigate("/assessment");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ws-base-white">
      {/* Sidebar */}
      <DashboardSidebar activeUrl="/dashboard" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main
          ref={mainRef}
          className="flex flex-1 flex-col justify-between overflow-y-auto p-5 xl:p-10 xl:pl-2"
        >
          <div className="space-y-6"></div>
          <div className="w-full">
            <h2 className="text-4xl font-bold text-ws-text-primary">
              {assessmentData?.data?.status !== "completed" && !isFinchAssessmentIncomplete ? (
                `Welcome, ${user?.firstName ? `${user.firstName}!` : ""}`
              ) : (
                <span className="font-bold mb-4 flex">{`Hi, ${user?.firstName}!`}</span>
              )}
            </h2>
            {!emailVerify && (
              <p className="text-base font-normal text-ws-text-secondary mt-4">
                A2B provides an overview of your workforce, industry, and some recommended solutions
                that may add more value to your benefits packages and employee support.
              </p>
            )}
            {emailVerify &&
              assessmentData?.data?.status == "completed" &&
              assessmentData?.assessmentType === "manual" && (
                <p className="text-base font-normal text-ws-text-primary mt-4">
                  Here's an overview of your workforce, industry, and some recommendations with
                  partners that may add more value to your benefits packages and employee support.
                </p>
              )}
            {emailVerify && assessmentData?.assessmentType == "finch" && isConnected && (
              <p className="text-base font-normal text-ws-text-primary mt-4">
                Here's an overview of your workforce, industry, and some recommendations with
                partners that may add more value to your benefits packages and employee support.
              </p>
            )}

            {emailVerify && assessmentData?.data?.status !== "completed" && !isConnected && (
              <p className="text-base font-normal text-ws-text-primary mt-4">
                Connect your payroll to A2B with Finch or manually answer a few questions to receive
                an overview of your workforce, industry, and some recommendations with partners that
                can add more value to your benefits packages and employee support.
              </p>
            )}
            {/* Error Message */}
            {errorMessage && (
              <div className="mt-6">
                <ErrorMessage
                  errorType="danger"
                  textColor="text-ws-error-700"
                  alertIcon={AlertCircle}
                  errorMessage={errorMessage}
                  onClose={() => setErrorMessage(null)}
                />
              </div>
            )}

            {completionCount > 0 && emailVerify && assessmentData?.data?.status !== "completed" && (
              <div className="mt-6 border border-ws-border-primary rounded-xl p-4 bg-ws-light-teal-50 flex gap-4 justify-between flex-col lg:flex-row">
                <div className="flex-1">
                  <h2 className="text-ws-navy-900 text-xl font-medium mb-2">
                    Complete your assessment
                  </h2>
                  <p className="text-ws-navy-900 text-base font-normal pr-10">
                    Pick up where you left off and complete your company assessment for results and
                    recommendations.
                  </p>
                </div>
                <div className="flex-1 rounded-lg">
                  <img
                    src={fpoHero}
                    alt="Insight hero"
                    className="w-full h-full max-h-25 object-cover rounded-lg"
                  />
                </div>
              </div>
            )}

            {!emailVerify && (
              <DashboardCard
                classes="bg-ws-light-teal-50 bg-ws-primary-50 border-ws-border-primary" // Custom styles for email verification card
                title="Verify your email"
                description={
                  <div className="max-w-auto text-ws-primary-900">
                    Verify your email to unlock all A2B features and secure your account. Didn’t
                    receive an email? Click the button to resend.
                  </div>
                }
                avatarIconSrc={emailIcon}
                buttonLabel="Verify"
                buttonType="primary"
                buttonIsDisabled={emailVerify}
                onClick={handleVerifyEmail}
              />
            )}

            {emailVerify && assessmentData?.data?.status !== "completed" && !isConnected && (
              <DashboardCard
                classes={
                  completionCount > 0
                    ? "border-ws-border-primary"
                    : "bg-ws-light-teal-50 border-ws-border-primary"
                }
                title="Take the assessment"
                titleClass="text-ws-text-primary"
                description={
                  completionCount > 0 ? (
                    <div className="text-base max-w-3xl text-ws-navy-900">
                      Complete our quick assessment for customized recommendations and insights.
                    </div>
                  ) : (
                    <div className="text-base max-w-4xl text-ws-navy-900">
                      Get started on your assessment. Choose the best plan to achieve your workforce
                      goal at no cost to you.
                    </div>
                  )
                }
                avatarIconSrc={<ArrowLeft />}
                buttonLabel={completionCount > 0 ? "Continue" : "Start assessment"}
                buttonType={emailVerify ? "primary" : "secondary"}
                buttonIsDisabled={!emailVerify}
                onClick={() => navigate("/assessment")}
                //onClick={() => navigate("/get-more")}
                toggleButton={completionCount > 0 ? true : false}
              />
            )}
          </div>
          {completionCount === 0 &&
            emailVerify &&
            assessmentData?.data?.status !== "completed" &&
            !isConnected && (
              <div className="flex flex-col mt-6">
                <div className="flex justify-between gap-4 flex-col xl:flex-row">
                  <div className="flex-1 py-6 px-7 border border-ws-border-primary rounded-xl flex flex-col">
                    <div className="flex items-center justify-between border-b border-ws-border-primary pb-4 mb-4">
                      <h2 className="flex items-center text-ws-text-primary text-2xl font-medium">
                        Connect with <img src={finchLogo} alt="Finch Logo" className="ml-2" />
                      </h2>
                      <p className="text-ws-text-tertiary text-base">Free</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-ws-text-tertiary text-base">
                        Finch handles the connection for you, syncing all your data automatically so
                        you get richer insights and expanded dashboard views, without any extra work
                        on your end.
                      </p>
                      <ul className="text-ws-text-tertiary text-base list-disc list-inside my-4">
                        <li>Results in as little as 3-5 minutes*</li>
                        <li>Custom workforce data and insights</li>
                        <li>
                          Additional dashboard views plus everything you receive in manual entry
                        </li>
                      </ul>
                      <p className="text-ws-text-tertiary text-base">
                        “Start with Finch" will open a secure popup window where you'll sign in to
                        your payroll provider through Finch, a trusted third-party data connector.
                        Your payroll and workforce data is securely transmitted to A2B to power the
                        benefits and workforce analytics in your dashboard.
                      </p>
                      <p className="text-xs text-ws-text-tertiary mt-4">
                        *Result loading time is payroll provider-specific
                      </p>
                    </div>
                    <div className="mt-5">
                      <Button
                        iconTrailing={<ChevronRight />}
                        size="sm"
                        color="primary"
                        className="min-w-30 bg-ws-navy-800"
                        onClick={connectWithFinch}
                        isDisabled={isFinchLoading}
                      >
                        Start with Finch
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 py-6 px-7 border border-ws-border-primary rounded-xl flex flex-col">
                    <div className="flex items-center justify-between border-b border-ws-border-primary pb-4 mb-4">
                      <h2 className="text-ws-text-primary text-2xl font-medium">Manual Entry</h2>
                      <p className="text-ws-text-tertiary text-base">Free</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-ws-text-tertiary text-base">
                        Fill out a simple assessment form and get high level recommendations to
                        enhance your benefits program.
                      </p>

                      <ul className="text-ws-text-tertiary text-base list-disc list-inside my-4">
                        <li>Results in 10 min</li>
                        <li>Industry benchmarks</li>
                        <li>Placed-based insights</li>
                        <li>Annual data updates</li>
                      </ul>
                    </div>
                    <div className="mt-5">
                      <Button
                        iconTrailing={<ChevronRight />}
                        size="sm"
                        color="primary"
                        className="min-w-30 bg-ws-navy-800"
                        onClick={handleGetStarted}
                      >
                        Let’s get started
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* {!emailVerify && <Declarations />} */}

          {finchError && (
            <div className="mb-4">
              <ErrorMessage
                errorType="danger"
                textColor="text-ws-error-700"
                alertIcon={AlertCircle}
                errorMessage={finchError}
                onClose={clearFinchError}
              />
            </div>
          )}

          {/* This code is require in next sprint*/}
          {/* {emailVerify && assessmentData?.data?.status === "completed" && !isFinchCompleted && (
            <DashboardCard
              classes="bg-ws-base-white border-ws-border-primary mt-10 shadow-none"
              toggleAvatar={true}
              title="Connect to Finch"
              titleClass="text-ws-text-primary"
              avatarIconSrc={<ConnectIcon className="text-ws-navy-900" />}
              avatarClassName="bg-ws-navy-200"
              description="Get a more detailed assessment by connecting your HR provider to Finch"
              descriptionClass="text-ws-text-tertiary"
              toggleButton={true}
              buttonLabel="Connect"
              onClick={connectWithFinch}
              buttonIsDisabled={isFinchLoading}
            />
          )} */}
          <DashboardCard
            classes="bg-ws-navy-100 border-ws-border-primary mt-10 shadow-none"
            toggleAvatar={true}
            title="Reconnect to Finch"
            titleClass="text-ws-text-primary"
            avatarIconSrc={<XhexagonIcon className="text-ws-warning-700" />}
            avatarClassName="bg-ws-warning-200"
            description="There was an issue connecting your payroll data. Please reconnect to Finch."
            descriptionClass="text-ws-text-tertiary"
            toggleButton={true}
            buttonLabel="Reconnect"
            buttonType={"secondary"}
            buttonClasses="h-9"
            onClick={() => navigate("/additional-questions")}
          />
          {emailVerify && isConnected && !isFinchCompleted && (
            <DashboardCard
              classes="bg-ws-navy-100 border-ws-border-primary mt-10 shadow-none"
              toggleAvatar={true}
              title="Complete your assessment"
              titleClass="text-ws-text-primary"
              avatarIconSrc={<AssessmentIcon className="text-ws-primary-900" />}
              avatarClassName="bg-ws-navy-200"
              description="Pick up where you left off and complete your company assessment for results and recommendations."
              descriptionClass="text-ws-text-tertiary"
              toggleButton={true}
              buttonLabel="Continue"
              buttonType={"secondary"}
              buttonClasses="h-9"
              onClick={() => navigate("/additional-questions")}
            />
          )}
          {emailVerify && isDashboardVisible && (
            <div className="mt-10">
              <Tabs selectedKey={activeTab} onSelectionChange={key => setActiveTab(String(key))}>
                <Tabs.List
                  className="bg-ws-light-teal-50 pt-0 pl-6 pr-6 rounded-t-lg text-ws-light-teal-900 overflow-auto"
                  type="underline"
                  items={[
                    ...BASE_TAB_ITEMS,
                    ...(isConnected ? FINCH_CONNECTED_TAB_ITEMS : BASIC_TAB_ITEMS),
                  ]}
                />

                {/* TO DO : Once the SSE API Is ready We'll utilize this component */}
                {/* <Tabs.Panel id="recommendations" className="pt-0">
                    <RecommendationsPage />
                  </Tabs.Panel> */}
                {!isConnected && (
                  <Tabs.Panel id="industry" className="pt-0">
                    <BenchmarkPage />
                  </Tabs.Panel>
                )}
                <Tabs.Panel id="finchRecommendations" className="pt-0">
                  <RecommendationsFinchPage
                    isReady={isRecommendationTabReady}
                    isStale={isRecommendationTabStale && isConnected}
                    isAutomatedProvider={isAutomatedProvider}
                    onNavigateToWorkforce={() => {
                      setActiveTab("finchWorkforce");
                      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </Tabs.Panel>
                {isConnected && (
                  <Tabs.Panel id="finchIndustry" className="pt-0">
                    <BenchmarkFinchPage
                      isReady={isIndustryTabReady}
                      isStale={isIndustryTabStale && isConnected}
                      isAutomatedProvider={isAutomatedProvider}
                    />
                  </Tabs.Panel>
                )}
                {isConnected && (
                  <Tabs.Panel id="finchWorkforce" className="pt-0">
                    <WorkforcePage
                      isReady={isWorkforceTabReady}
                      isStale={isWorkforceTabStale && isConnected}
                      isAutomatedProvider={isAutomatedProvider}
                    />
                  </Tabs.Panel>
                )}
              </Tabs>
            </div>
          )}
          <div className="mt-auto pt-6">
            <Declarations />
          </div>
        </main>
      </div>

      {/* Modals */}
      <DynamicLoadingModal shouldShow={showLoadingModal} onClose={() => setIsLoadingModalDismissed(true)} />

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

      <BaseModalWithIcon
        isOpen={isEmailVerifiedModalOpen}
        onClose={handleCloseEmailVerifiedModal}
        {...emailVerifiedModal}
      />
    </div>
  );
};

export default DashboardPage;
