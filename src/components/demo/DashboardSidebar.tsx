import {
  Settings01,
  LogOut04,
  Speedometer03,
} from "@untitledui/icons";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";
import type { NavItemType } from "@/components/application/app-navigation/config";

interface DashboardSidebarProps {
  activeUrl?: string;
}

export const DashboardSidebar = ({
  activeUrl = "/",
}: DashboardSidebarProps) => {
  const navigationItems: NavItemType[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Speedometer03,
      //badge: <Badge color="brand">New</Badge>,
    },
    // Keep this commented for future use if we want to add nested items{
    //   label: "Team",
    //   href: "/team",
    //   icon: Users01,
    //   items: [
    //     { label: "All Members", href: "/team/members" },
    //     { label: "Add Member", href: "/team/add" },
    //     { label: "Permissions", href: "/team/permissions" },
    //   ],
    // },
  ];

  const settingsItems: NavItemType[] = [
    {
      label: "Settings",
      href: "/settings",
      icon: Settings01,
    },
    {
      label: "Logout",
      href: "/logout",
      icon: LogOut04,
    },
  ];

  return (
    <div className="flex h-[calc(100vh-32px)] w-66 flex-col border-0 border-primary bg-primary py-10 px-6 m-4 rounded-xl shadow-xs">
      {/* Logo */}
      <div className="flex items-center justify-start">
        <div className="flex items-center justify-center rounded-xl bg-tertiary px-3 py-1">
          <h1 className="font-display text-2xl font-bold leading-8 text-black">
            BeneStat
          </h1>
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
    </div>
  );
};

export default DashboardSidebar;
