import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { Settings01, LogOut04, Menu01, XClose, Home05 } from "@untitledui/icons";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";
import type { NavItemType } from "@/components/application/app-navigation/config";
// This is require
// import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { signout } from "@/services/api/authApi";
import { BaseModalWithIcon } from "../modals/BaseModalWithIcon";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { Button } from "../base/buttons/button";
import { useModalConfig } from "@/hooks/useModalConfig";
import signoutIcon from "@/assets/signout-icon.svg";
import siteLogo from "@/assets/logo-small.svg";
import { Tooltip, TooltipTrigger } from "../base/tooltip/tooltip";

interface DashboardSidebarProps {
  activeUrl?: string;
}

export const DashboardSidebar = ({ activeUrl = "/" }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutButtonDisabled, setIsLogoutButtonDisabled] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed on tablet

  const { user, tokens } = useAppSelector(state => state.auth);

  // Check if we're in the tablet range (768px - 1023px)
  const isMd = useBreakpoint("md"); // >= 768px
  const isLg = useBreakpoint("lg"); // >= 1024px
  const isTabletRange = isMd && !isLg; // 768px - 1023px

  // Determine if sidebar should show collapsed (only in tablet range)
  const shouldBeCollapsed = isTabletRange && isCollapsed;

  const handleLogout = async () => {
    setIsLogoutButtonDisabled(true); // Disable the button to prevent multiple clicks
    setLogoutError(null);
    try {
      const storedState = localStorage.getItem("userDetail");
      let currentToken = tokens?.accessToken;

      if (storedState) {
        const parsedState = JSON.parse(storedState);
        currentToken = parsedState?.auth?.tokens?.accessToken || currentToken;
      }

      await signout(currentToken || undefined);

      navigate("/success", {
        state: {
          messageImg: signoutIcon,
          title: "You've been logged out",
          subtitle: "You've been logged out of your account. Log back in anytime to continue.",
          buttonText: "Log back in",
          buttonPath: "/sign-in",
          pageType: "logout",
          shouldClearUser: true,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);

      navigate("/success", {
        state: {
          messageImg: signoutIcon,
          title: "You've been logged out",
          subtitle: "You've been logged out of your account. Log back in anytime to continue.",
          buttonText: "Log back in",
          buttonPath: "/sign-in",
          pageType: "logout",
          shouldClearUser: true,
        },
      });
    } finally {
      setIsLogoutButtonDisabled(false);
      setIsLogoutModalOpen(false);
    }
  };

  const handleLogoutClick = (event?: React.MouseEvent) => {
    event?.preventDefault();
    setIsLogoutModalOpen(true);
  };

  const logoutModalConfig = useModalConfig("logoutConfirmation", {
    isOpen: isLogoutModalOpen,
    onClose: () => setIsLogoutModalOpen(false),
    onConfirm: handleLogout,
    additionalData: { isDisabled: isLogoutButtonDisabled },
  });

  {
    /* Dashboard left navigation menu items configuration */
  }
  const navigationItems: NavItemType[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home05,
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

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.businessName || "User";

  const displayEmail = user?.businessEmail || "No email available";

  // Get user initials
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user?.businessName) {
      const words = user.businessName.split(" ");
      if (words.length >= 2) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
      }
      return user.businessName.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`flex h-[calc(100vh-40px)] xl:h-[calc(100vh-80px)] flex-col border-0 border-ws-border-primary bg-ws-base-white py-6 lg:py-10 m-5 xl:m-10 rounded-lg inset-shadow-sm shadow-md transition-all duration-300 ease-in-out ${
        isTabletRange ? (isCollapsed ? "w-20 px-3" : "w-66 px-6") : "w-66 px-6"
      }`}
    >
      {/* Header with Logo and Toggle Button */}
      <div className="flex items-center justify-between">
        {/* Logo - Hidden when collapsed on tablet */}
        {(!isTabletRange || !isCollapsed) && (
          <div className="flex items-center justify-start overflow-hidden flex-1">
            <div className="flex items-center justify-center transition-all duration-300">
              <img src={siteLogo} alt="BeneStats Logo" className="w-full" />
            </div>
          </div>
        )}

        {/* Toggle Button - Only visible on tablet */}
        {isTabletRange && (
          <Button
            onClick={toggleSidebar}
            color="primary"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={isCollapsed ? "w-full" : ""}
          >
            {isCollapsed ? (
              <Menu01 className="size-5 text-ws-base-white" />
            ) : (
              <XClose className="size-5 text-ws-base-white" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <NavList items={navigationItems} activeUrl={activeUrl} isCollapsed={shouldBeCollapsed} />
        <NavList
          items={settingsItems}
          activeUrl={activeUrl}
          className="mt-4 border-t border-ws-border-primary"
          isCollapsed={shouldBeCollapsed}
        />
      </nav>

      {/* User Account Card at Bottom - Dynamic User Info */}
      <div className="border border-ws-border-secondary rounded-xl p-2 lg:p-3 mt-6 overflow-hidden ">
        {isTabletRange && isCollapsed ? (
          // Show initials when collapsed
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-ws-light-teal-900 text-ws-base-white font-semibold text-sm">
              {getUserInitials()}
            </div>
          </div>
        ) : (
          // Show full info when expanded
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ws-text-primary truncate transition-opacity duration-300">
                {displayName}
              </p>
              <p className="text-sm text-ws-text-tertiary mt-1 truncate transition-opacity duration-300">
                <Tooltip title={displayEmail}>
                  <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                    {displayEmail}
                  </TooltipTrigger>
                </Tooltip>
              </p>
              {/* This is require */}
              {/* <p className="text-sm text-ws-text-tertiary mt-1 truncate transition-opacity duration-300">
                  <Tooltip title={displayEmail} placement="top" arrow>
                    <TooltipTrigger className="cursor-pointer">
                      <span className="block truncate">{displayEmail}</span>
                    </TooltipTrigger>
                  </Tooltip>
                </p> */}
            </div>
          </div>
        )}
      </div>
      {logoutError && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-ws-error-50 p-4 border border-ws-error-200 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-ws-error-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-ws-error-800">Logout Failed</h3>
              <p className="mt-1 text-sm text-ws-error-700">{logoutError}</p>
            </div>
            <button
              onClick={() => setLogoutError(null)}
              className="flex-shrink-0 text-ws-error-400 hover:text-ws-error-600"
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
      <BaseModalWithIcon
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        {...logoutModalConfig}
      />
    </div>
  );
};

export default DashboardSidebar;
