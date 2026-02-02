import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import emailIcon from "@/assets/mail-icon.svg";
import checkIcon from "@/assets/file-check.svg";
import DashboardCard from "./DashboardCard";
import { Tabs } from "@/components/base/tabs/tabs";
import RecommendationsPage from "../recommendations/RecommendationsPage";
import BenchmarkPage from "../benchmark/BenchmarkPage";
import { Link } from "react-router-dom";
// import { InProgressModal } from "@/components/modals/InProgressModal";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
// import { getUserById } from "@/services/api/userApi";
// import { updateUserProfile } from "@/store/slices/authSlice";
// import ErrorMessage from "@/components/common/ErrorMessage";
// import { AlertCircle } from "@untitledui/icons";
// import { getErrorState, type ErrorState } from "@/utils/errorHandler";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, tokens } = useAppSelector(state => state.auth);

  // const [isLoading, setIsLoading] = useState(true);
  // const [userData, setUserData] = useState(user);
  // const [error, setError] = useState<ErrorState | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id || !tokens?.accessToken) {
        navigate("/sign-in");
        return;
      }

      // try {
      //   setIsLoading(true);
      //   setError(null);
      //   const fetchedUser = await getUserById(user.id, tokens.accessToken);

      //   setUserData(fetchedUser);
      //   dispatch(updateUserProfile(fetchedUser));
      // } catch (error) {
      //   console.error("Failed to fetch user data:", error);
      //   const errorState = getErrorState(error);
      //   setError(errorState);

      //   // If it's an auth error, redirect to sign-in after showing error
      //   if (error instanceof Error && error.message.includes("token")) {
      //     setTimeout(() => {
      //       navigate("/sign-in");
      //     }, 3000);
      //   }
      // } finally {
      //   setIsLoading(false);
      // }
    };

    fetchUserData();
  }, [user?.id, tokens?.accessToken, dispatch, navigate]);

  // Show loading modal while fetching data
  // if (isLoading) {
  //   return (
  //     <InProgressModal
  //       isOpen={isLoading}
  //       onClose={() => {
  //         // Don't allow closing during data fetch
  //       }}
  //       onGoToDashboard={() => {
  //         // Disabled during loading
  //       }}
  //       title="Loading Dashboard..."
  //       subtitle="Please wait while we prepare your dashboard."
  //     />
  //   );
  // }

  return (
    <div className="flex h-screen overflow-hidden bg-dashboard">
      {/* Sidebar */}
      <DashboardSidebar activeUrl="/dashboard" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-10">
          {/* Error Message Display */}
          {/* {error && (
            <div className="mb-6">
              <ErrorMessage
                errorType={error.type}
                alertIcon={AlertCircle}
                errorMessage={error.message}
                onClose={() => setError(null)}
              />
            </div>
          )} */}

          <div className="space-y-6"></div>
          <div>
            <h2 className="text-4xl font-medium text-primary">
              {/* Welcome{userData?.firstName ? `, ${userData.firstName}` : ""}! */}
              Welcome!
            </h2>
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
            <DashboardCard
              title="Verify your email"
              description={
                <>
                  One quick step to secure your account. Didn't get the email?{" "}
                  <Link to="/" className="underline">
                    Resend verification
                  </Link>
                </>
              }
              avatarIconSrc={emailIcon}
              buttonLabel="Verify email"
              buttonType="primary"
            />
            <DashboardCard
              title="Take the Assessment"
              description="Take our 15 minute assessment for specific recommendations to improve your business"
              avatarIconSrc={checkIcon}
              buttonLabel="Take Assessment"
              buttonType="secondary"
              buttonIsDisabled={true}
            />
          </div>
          <div className="mt-10">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
