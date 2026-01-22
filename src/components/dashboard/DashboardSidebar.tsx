import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { Settings01, LogOut04, Speedometer03 } from "@untitledui/icons";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { SuccessModalWithLogo } from "../modals/SuccessModalWithLogo";
import { signout } from "@/services/api/authApi";
import logoutIcon from "@/assets/checkmark-icon.svg";
import { clearUser } from "@/store/slices/authSlice";

interface DashboardSidebarProps {
  activeUrl?: string;
}

export const DashboardSidebar = ({ activeUrl = "/" }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signout();
      dispatch(clearUser());
      localStorage.removeItem("userDetail");
      setIsLogoutModalOpen(false);
      navigate("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(clearUser());
      localStorage.removeItem("userDetail");
      setIsLogoutModalOpen(false);
      navigate("/sign-in");
    }
  };

  const handleLogoutClick = (event?: React.MouseEvent) => {
    event?.preventDefault(); // Prevent default navigation behavior
    setIsLogoutModalOpen(true);
  };

  const navigationItems: NavItemType[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Speedometer03,
      //badge: <Badge color="brand">New</Badge>,
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
      </nav>

      {/* User Account Card at Bottom */}
      <div className="border border-gray-300 rounded-xl p-3 mt-6">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">John Doe</p>
            <p className="text-sm text-tertiary mt-1">john@example.com</p>
          </div>
        </div>
      </div>

      <SuccessModalWithLogo
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
      />
    </div>
  );
};

export default DashboardSidebar;
