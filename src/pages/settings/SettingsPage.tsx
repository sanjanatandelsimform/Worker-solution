import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Mail01 } from "@untitledui/icons";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { UpdateYourEmailModal } from "@/components/modals/UpdateYourEmailModal";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import RetakeAssessmentModal from "@/components/modals/RetakeAssessmentModal";
import AccountDeleteModal from "@/components/modals/AccountDeleteModal";
import UpdateCompletedModal from "@/components/modals/UpdateCompletedModal";

export const SettingsPage = () => {
  const [activeUrl] = useState("/settings");
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isUpdateEmailModalOpen, setIsUpdateEmailModalOpen] = useState(false);
  const [isRetakeAssessmentModalOpen, setIsRetakeAssessmentModalOpen] = useState(false);
  const [isAccountDeleteModalOpen, setIsAccountDeleteModalOpen] = useState(false);
  const [isUpdateCompletedModalOpen, setIsUpdateCompletedModalOpen] = useState(false);

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
              </div>
              <hr className="border-t border-gray-200 mt-5 mb-6" />
              <div className="bg-primary border border-primary rounded-xl py-8 px-6 mb-6">
                <div className="flex mb-6">
                  <div className="w-1/3">
                    <label htmlFor="firstName" className="text-black font-medium text-sm">
                      Name <span>*</span>
                    </label>
                  </div>
                  <div className="w-2/3 flex  gap-4">
                    <Input
                      id="firstName"
                      name="firstName"
                      size="md"
                      isRequired={true}
                      placeholder="First name"
                      value={"First name"}
                    />
                    <Input
                      id="lastName"
                      name="lastName"
                      size="md"
                      isRequired={true}
                      placeholder="Last name"
                      value={"Last name"}
                    />
                  </div>
                </div>
                <div className="flex mb-6">
                  <div className="w-1/3">
                    <label htmlFor="email" className="text-black font-medium text-sm">
                      Email address <span>*</span>
                    </label>
                  </div>
                  <div className="w-2/3 flex flex-col  gap-4">
                    <Input
                      id="email"
                      name="email"
                      size="md"
                      icon={Mail01}
                      isRequired={true}
                      placeholder="medium@untitledui.com"
                      //value={"email"}
                      isDisabled={true}
                    />
                    <Button color="link-color" onClick={() => setIsUpdateEmailModalOpen(true)}>
                      Update email
                    </Button>
                  </div>
                </div>
                <div className="flex mb-6">
                  <div className="w-1/3">
                    <label htmlFor="password" className="text-black font-medium text-sm">
                      Password <span>*</span>
                    </label>
                  </div>
                  <div className="w-2/3 flex flex-col  gap-4">
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      size="md"
                      isRequired={true}
                      placeholder="Password"
                      value={"password"}
                      isDisabled={true}
                    />
                    <Button color="link-color" onClick={() => setIsChangePasswordModalOpen(true)}>
                      Change password
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-black">Account Management</h2>
                  <p className="text-sm text-gray-600">
                    Update your photo and personal details here.
                  </p>
                </div>
              </div>
              <hr className="border-t border-gray-200 mt-5 mb-6" />
              <div className="bg-primary border border-primary rounded-xl py-8 px-6 mb-6">
                <div className="flex mb-6">
                  <div className="w-1/2 flex flex-col">
                    <label htmlFor="firstName" className="text-black font-medium text-sm">
                      Retake the assessment
                    </label>
                    <span className="text-gray-600 text-sm">
                      Retaking the assessment will result in loss of progress.
                    </span>
                  </div>
                  <div className="w-1/2 flex  gap-4">
                    <Button
                      color="secondary"
                      size="md"
                      className="w-full"
                      onClick={() => setIsRetakeAssessmentModalOpen(true)}
                    >
                      Retake Assessment
                    </Button>
                  </div>
                </div>
                <div className="flex mb-6">
                  <div className="w-1/2 flex flex-col">
                    <label htmlFor="firstName" className="text-black font-medium text-sm">
                      Delete account
                    </label>
                    <span className="text-gray-600 text-sm">This cannot be undone</span>
                  </div>
                  <div className="w-1/2 flex  gap-4">
                    <Button
                      color="primary-destructive"
                      size="md"
                      className="w-full"
                      onClick={() => setIsAccountDeleteModalOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button color="secondary" size="sm">
                  Cancel
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => setIsUpdateCompletedModalOpen(true)}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <UpdateYourEmailModal
        isOpen={isUpdateEmailModalOpen}
        onClose={() => setIsUpdateEmailModalOpen(false)}
      />
      <RetakeAssessmentModal
        isOpen={isRetakeAssessmentModalOpen}
        onClose={() => setIsRetakeAssessmentModalOpen(false)}
      />
      <AccountDeleteModal
        isOpen={isAccountDeleteModalOpen}
        onClose={() => setIsAccountDeleteModalOpen(false)}
      />
      <UpdateCompletedModal
        isOpen={isUpdateCompletedModalOpen}
        onClose={() => setIsUpdateCompletedModalOpen(false)}
        //onBackToSettings={() => setIsUpdateCompletedModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
