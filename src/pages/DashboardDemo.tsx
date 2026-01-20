import { useState } from "react";
import { DashboardSidebar } from "@/components/demo/DashboardSidebar";
import emailIcon from "@/assets/mail-icon.svg";
import checkIcon from "@/assets/file-check.svg";
import DashboardCard from "./DashboardCard";

export const DashboardDemo = () => {
  const [activeUrl, setActiveUrl] = useState("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-dashboard">
      {/* Sidebar */}
      <DashboardSidebar activeUrl={activeUrl} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div className="space-y-6">
            {/* Stats Cards */}
            {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Users", value: "2,420", change: "+12.5%" },
                { label: "Revenue", value: "$45,231", change: "+8.2%" },
                { label: "Active Projects", value: "18", change: "-2.4%" },
                { label: "Completion Rate", value: "94.2%", change: "+3.1%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border-primary bg-primary p-6"
                >
                  <p className="text-sm font-medium text-tertiary">
                    {stat.label}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-3xl font-semibold text-primary">
                      {stat.value}
                    </p>
                    <span
                      className={`text-sm font-medium ${
                        stat.change.startsWith("+")
                          ? "text-success-600"
                          : "text-error-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div> */}
          </div>
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
        </main>
      </div>
    </div>
  );
};

export default DashboardDemo;
