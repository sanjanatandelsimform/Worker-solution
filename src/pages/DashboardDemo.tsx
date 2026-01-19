import { useState } from "react";
import { DashboardSidebar } from "@/components/demo/DashboardSidebar";
import { Button } from "@/components/base/buttons/button";

export const DashboardDemo = () => {
  const [activeUrl, setActiveUrl] = useState("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      {/* Sidebar */}
      <DashboardSidebar activeUrl={activeUrl} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border-primary bg-primary px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
              <p className="text-sm text-tertiary">Welcome back, John!</p>
            </div>
            <div className="flex items-center gap-3">
              <Button color="secondary" size="md">
                Export
              </Button>
              <Button color="primary" size="md">
                Create New
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-border-primary bg-primary p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {[
                  {
                    user: "Sarah Johnson",
                    action: "completed task",
                    project: "Website Redesign",
                    time: "2 hours ago",
                  },
                  {
                    user: "Mike Chen",
                    action: "uploaded file to",
                    project: "Marketing Campaign",
                    time: "4 hours ago",
                  },
                  {
                    user: "Emily Davis",
                    action: "commented on",
                    project: "Mobile App",
                    time: "6 hours ago",
                  },
                ].map((activity) => (
                  <div
                    key={activity.user}
                    className="flex items-center justify-between border-b border-border-secondary py-3 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                        <span className="text-sm font-semibold">
                          {activity.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-primary">
                          <span className="font-semibold">{activity.user}</span>{" "}
                          {activity.action}{" "}
                          <span className="font-semibold">
                            {activity.project}
                          </span>
                        </p>
                        <p className="text-xs text-tertiary">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-border-primary bg-primary p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary">
                Quick Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  color="primary"
                  size="md"
                  onClick={() => setActiveUrl("/team/add")}
                >
                  Add Team Member
                </Button>
                <Button
                  color="secondary"
                  size="md"
                  onClick={() => setActiveUrl("/reports")}
                >
                  View Reports
                </Button>
                <Button
                  color="secondary"
                  size="md"
                  onClick={() => setActiveUrl("/messages")}
                >
                  Check Messages
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardDemo;
