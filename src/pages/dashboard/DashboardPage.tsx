import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import emailIcon from "@/assets/mail-icon.svg";
import checkIcon from "@/assets/file-check.svg";
import DashboardCard from "./DashboardCard";
import { Tabs } from "@/components/base/tabs/tabs";
import RecommendationsPage from "../recommendations/RecommendationsPage";
import BenchmarkPage from "../benchmark/BenchmarkPage";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUser } from "@/store/selectors/authSelectors";
// import { verifyEmail } from "@/services/api/authApi";
import { BaseModalWithIcon } from "@/components/modals/BaseModalWithIcon";
import ErrorMessage from "@/components/common/ErrorMessage";
import checkmarkIcon from "@/assets/checkmark-icon.svg";
import { AlertCircle } from "@untitledui/icons";
import { fetchUserById } from "@/store/slices/userSlice";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  const emailVerify = user?.emailVerify || false;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleVerifyEmail = async () => {
    // try {
    //   setErrorMessage(null);
    //   const userDetail = localStorage.getItem("userDetail");
    //   if (!userDetail) {
    //     throw new Error("User details not found in storage.");
    //   }
    //   const parsedUserDetail = JSON.parse(userDetail);
    //   const verificationToken = parsedUserDetail?.auth?.verificationDetails?.verificationToken;
    //   const accessToken = parsedUserDetail?.auth?.tokens?.accessToken;
    //   if (!verificationToken || !accessToken) {
    //     throw new Error("Verification token or access token not found.");
    //   }
    //   const response = await verifyEmail(verificationToken, accessToken);
    //   if (response.message === "success") {
    //     setIsModalOpen(true);
    //   } else {
    //     throw new Error(response.message || "Verification failed.");
    //   }
    // } catch (error) {
    //   setErrorMessage(
    //     error instanceof Error
    //       ? error.message
    //       : "An unexpected error occurred. Please try again."
    //   );
    // }
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
              buttonIsDisabled={emailVerify}
              onClick={handleVerifyEmail} // Add click handler
            />
            <DashboardCard
              title="Take the Assessment"
              description="Take our 15 minute assessment for specific recommendations to improve your business"
              avatarIconSrc={checkIcon}
              buttonLabel="Take Assessment"
              buttonType="secondary"
              buttonIsDisabled={!emailVerify}
            />
          </div>
          {/* This will be conditionally rendered; uncomment when this feature is implemented. */}
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

      {/* Success Modal */}
      <BaseModalWithIcon
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="sm"
        title="Email Verified"
        subtitle="Your email has been successfully verified. You can now access all features."
        icon={<img src={checkmarkIcon} alt="Success" />}
        buttons={[
          {
            text: "Go to Dashboard",
            onClick: () => {
              setIsModalOpen(false);
              navigate("/dashboard");
            },
            color: "primary",
          },
        ]}
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4">
          <ErrorMessage
            errorType="danger"
            textColor="text-red-700"
            alertIcon={AlertCircle}
            errorMessage={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
