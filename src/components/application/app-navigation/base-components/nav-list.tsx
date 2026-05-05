import { useState } from "react";
import { cx } from "@/utils/cx";
import type { NavItemDividerType, NavItemType } from "../config";
import { NavItemBase } from "./nav-item";
import { Tooltip } from "@/components/base/tooltip/tooltip";

interface NavListProps {
  /** URL of the currently active item. */
  activeUrl?: string;
  /** Additional CSS classes to apply to the list. */
  className?: string;
  /** List of items to display. */
  items: (NavItemType | NavItemDividerType)[];
  /** Whether the navigation is collapsed (for tablet responsive behavior). */
  isCollapsed?: boolean;
}

export const NavList = ({ activeUrl, items, className, isCollapsed = false }: NavListProps) => {
  const [open, setOpen] = useState(false);
  const activeItem = items.find(
    item => item.href === activeUrl || item.items?.some(subItem => subItem.href === activeUrl)
  );
  const [currentItem, setCurrentItem] = useState(activeItem);

  return (
    <ul
      className={cx(
        "mt-0 flex flex-col w-full px-0 lg:px-0" ,
        isCollapsed ? "items-center" : "items-start",
        className
      )}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return (
            <li key={index} className="w-full px-0.5 py-2">
              <hr className="h-px w-full border-none bg-border-secondary" />
            </li>
          );
        }

        if (item.items?.length) {
          return (
            <details
              key={item.label}
              open={activeItem?.href === item.href}
              className="appearance-none py-0.5"
              onToggle={e => {
                setOpen(e.currentTarget.open);
                setCurrentItem(item);
              }}
            >
              <Tooltip
                placement="right"
                title={item.label}
                isDisabled={!isCollapsed}
                delay={200}
                arrow
              >
                <NavItemBase
                  href={item.href}
                  badge={item.badge}
                  icon={item.icon}
                  type="collapsible"
                  isCollapsed={isCollapsed}
                >
                  {!isCollapsed && item.label}
                </NavItemBase>
              </Tooltip>

              <dd>
                <ul className="py-0.5 md:w-full">
                  {item.items.map(childItem => (
                    <li key={childItem.label} className="py-0.5">
                      <NavItemBase
                        href={childItem.href}
                        badge={childItem.badge}
                        type="collapsible-child"
                        current={activeUrl === childItem.href}
                      >
                        {childItem.label}
                      </NavItemBase>
                    </li>
                  ))}
                </ul>
              </dd>
            </details>
          );
        }

        return (
          <li
            key={item.label}
            className={`py-0.5 first:mt-4 text-ws-gray-200 last:mt-4 lg:last:mt-0 ${isCollapsed ? "w-auto" : "w-full"}`}
          >
            <Tooltip
              placement="right"
              title={item.label}
              isDisabled={!isCollapsed}
              delay={200}
              arrow
              arrowRouted="transform rotate-90"
            >
              <NavItemBase
                type="link"
                badge={item.badge}
                icon={item.icon}
                href={item.href}
                current={currentItem?.href === item.href}
                open={open && currentItem?.href === item.href}
                onClick={item.onClick}
                isCollapsed={isCollapsed}
              >
                {!isCollapsed && item.label}
              </NavItemBase>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
};
