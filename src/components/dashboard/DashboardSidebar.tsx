import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Settings01, LogOut04, Speedometer03 } from "@untitledui/icons";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";
import type { NavItemType } from "@/components/application/app-navigation/config";
// import { SuccessModalWithLogo } from "../modals/SuccessModalWithLogo";
import { signout } from "@/services/api/authApi";
// import logoutIcon from "@/assets/checkmark-icon.svg";
import { clearUser } from "@/store/slices/authSlice";
import { BaseModalWithIcon } from "../modals/BaseModalWithIcon";
import { AlertOctagon } from "@untitledui/icons";
import alertIcon from "@/assets/alert-icon.svg";

interface DashboardSidebarProps {
  activeUrl?: string;
}

export const DashboardSidebar = ({ activeUrl = "/" }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const { user, tokens } = useAppSelector(state => state.auth);

  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await signout(tokens.accessToken || undefined);
      // Only clear storage and redirect if API call succeeds
      dispatch(clearUser());
      localStorage.removeItem("userDetail");
      setIsLogoutModalOpen(false);
      navigate("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to logout. Please try again.";
      setLogoutError(errorMessage);
      setIsLogoutModalOpen(false);
    }
  };

  const handleLogoutClick = (event?: React.MouseEvent) => {
    event?.preventDefault();
    setIsLogoutModalOpen(true);
  };

  const navigationItems: NavItemType[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Speedometer03,
    },
  ];

  const settingsItems: NavItemType[] = [
    {
      label: "Settings",
      href: "/settings",
      icon: Settings01,
    },
    {
      label: "Logout",
      href: "#",
      icon: LogOut04,
      onClick: handleLogoutClick,
    },
  ];

  // Get full name or fallback to email
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.businessName || "User";

  const displayEmail = user?.email || "No email available";

  return (
    <div className="flex h-[calc(100vh-32px)] w-66 flex-col border-0 border-primary bg-primary py-10 px-6 m-4 rounded-xl shadow-xs">
      {/* Logo */}
      <div className="flex items-center justify-start">
        <div className="flex items-center justify-center rounded-xl bg-tertiary px-3 py-1">
          <h1 className="font-display text-2xl font-bold leading-8 text-black">BeneStat</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <NavList items={navigationItems} activeUrl={activeUrl} />
        <NavList
          items={settingsItems}
          activeUrl={activeUrl}
          className="mt-4 border-t border-primary"
        />

        {/* Logout Button */}
        {/* <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-tertiary transition-colors hover:bg-secondary hover:text-primary hover:bg-cyan-500 hover:text-white hover:cursor-pointer"
        >
          <LogOut04 className="h-5 w-5" />
          <span>Logout</span>
        </button> */}
      </nav>

      {/* User Account Card at Bottom - Dynamic User Info */}
      <div className="border border-gray-300 rounded-xl p-3 mt-6">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary truncate w-50">{displayName}</p>
            <p className="text-sm text-tertiary mt-1 truncate w-50">{displayEmail}</p>
          </div>
        </div>
      </div>
      {logoutError && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-red-50 p-4 border border-red-200 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Logout Failed</h3>
              <p className="mt-1 text-sm text-red-700">{logoutError}</p>
            </div>
            <button
              onClick={() => setLogoutError(null)}
              className="flex-shrink-0 text-red-400 hover:text-red-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* <SuccessModalWithLogo
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        size="xl"
        messageImg={logoutIcon}
        title="You’ve been logged out!"
        subtitle="You’ve been logged out of your account. Log back in anytime to continue"
        button={{
          text: "Log back in",
          onClick: handleLogout,
          color: "primary",
        }}
      /> */}
      <BaseModalWithIcon
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        size="sm"
        title="Are you sure you want to log out?"
        icon={<AlertOctagon className="size-6" />}
        messageImg={alertIcon}
        backgroundPattern="unsuccess"
        buttons={[
          {
            text: "Cancel",
            onClick: () => setIsLogoutModalOpen(false),
            color: "secondary",
          },
          {
            text: "Yes",
            onClick: handleLogout,
            color: "primary-destructive",
          },
        ]}
      />
    </div>
  );
};

export default DashboardSidebar;
