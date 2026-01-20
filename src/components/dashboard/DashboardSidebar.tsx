import {
  Home03,
  BarChart01,
  Users01,
  Settings01,
  File02,
  Mail01,
  LifeBuoy01,
  LogOut01,
} from "@untitledui/icons";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { Badge } from "@/components/base/badges/badges";

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
      icon: Home03,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: BarChart01,
      badge: <Badge color="brand">New</Badge>,
    },
    {
      label: "Team",
      href: "/team",
      icon: Users01,
      items: [
        { label: "All Members", href: "/team/members" },
        { label: "Add Member", href: "/team/add" },
        { label: "Permissions", href: "/team/permissions" },
      ],
    },
    {
      label: "Reports",
      href: "/reports",
      icon: File02,
      badge: <Badge color="success">12</Badge>,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: Mail01,
      badge: <Badge color="error">5</Badge>,
    },
  ];

  const settingsItems: NavItemType[] = [
    {
      label: "Settings",
      href: "/settings",
      icon: Settings01,
    },
    {
      label: "Help & Support",
      href: "/support",
      icon: LifeBuoy01,
    },
    {
      label: "Logout",
      href: "/logout",
      icon: LogOut01,
    },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border-primary bg-primary">
      {/* Logo */}
      <div className="flex items-center justify-start p-6">
        <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
          <h1 className="font-display text-2xl font-bold leading-8 text-black">
            BeneStat
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <NavList items={navigationItems} activeUrl={activeUrl} />
        <NavList items={settingsItems} activeUrl={activeUrl} className="mt-8" />
      </nav>

      {/* User Account Card at Bottom */}
      <div className="border-t border-border-secondary p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-600 text-white">
            <span className="text-sm font-semibold">JD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">John Doe</p>
            <p className="text-xs text-tertiary">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
