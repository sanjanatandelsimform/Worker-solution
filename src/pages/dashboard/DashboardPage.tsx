import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import emailIcon from "@/assets/mail-icon.svg";
import checkIcon from "@/assets/file-check.svg";
import DashboardCard from "./DashboardCard";
import { Tabs } from "@/components/base/tabs/tabs";
import RecommendationsPage from "../recommendations/RecommendationsPage";
import BenchmarkPage from "../benchmark/BenchmarkPage";

export const DashboardPage = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-dashboard">
      {/* Sidebar */}
      <DashboardSidebar activeUrl="/dashboard" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div className="space-y-6"></div>
          <div>
            <h2 className="text-4xl font-medium text-primary">Welcome!</h2>
            <div className="mt-6 border border-gray-300 rounded-xl p-4 bg-dashboard-card shadow-sm flex gap-4 justify-between">
              <div className="flex-1">
                <h2 className="text-dashboard-card-title text-3xl font-medium mb-2">
                  Thanks for signing up.
                </h2>
                <p className="text-white">
                  👋 Welcome aboard! Please check your inbox and verify your
                  email to get started.
                </p>
              </div>
              <div className="flex-1 bg-dashboard-card-image rounded-lg p-4 flex items-center justify-center text-2xl font-medium text-white">
                FPO Img
              </div>
            </div>
            <DashboardCard
              title="Verify your email"
              description="One quick step to secure your account. Didn’t get the email? Resend verification"
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
