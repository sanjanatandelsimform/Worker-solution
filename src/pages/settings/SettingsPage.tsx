import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";

export const SettingsPage = () => {
  const [activeUrl] = useState("/settings");

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
          <div className="space-y-6 mt-6">
            <div className="bg-gray-card border border-gray-300 rounded-xl p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-black">Personal info</h2>
                  <p className="text-sm text-gray-600">
                    Update your photo and personal details here.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button color="secondary" size="sm">
                    Cancel
                  </Button>
                  <Button color="primary" size="sm">
                    Save
                  </Button>
                </div>
              </div>
              <hr className="border-t border-gray-200 my-4" />
              <div className="bg-primary border border-primary rounded-xl py-8 px-6">
                <div>
                  <Input
                    name="email"
                    size="md"
                    isRequired={true}
                    label="Email"
                    placeholder="Enter your email"
                    value={"email"}
                    onChange={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
