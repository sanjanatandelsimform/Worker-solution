import type { FC, HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { ChevronDown, Share04 } from "@untitledui/icons";
import { Link as AriaLink } from "react-aria-components";
import { Badge } from "@/components/base/badges/badges";
import { cx, sortCx } from "@/utils/cx";

const styles = sortCx({
  root: "group relative flex w-full cursor-pointer items-center rounded-md bg-ws-white outline-focus-ring transition duration-100 ease-linear select-none hover:bg-ws-primary-400 select-none hover:text-ws-white focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
  rootSelected: "bg-ws-primary-400 hover:bg-ws-primary-400",
});

interface NavItemBaseProps {
  /** Whether the nav item shows only an icon. */
  iconOnly?: boolean;
  /** Whether the collapsible nav item is open. */
  open?: boolean;
  /** URL to navigate to when the nav item is clicked. */
  href?: string;
  /** Type of the nav item. */
  type: "link" | "collapsible" | "collapsible-child";
  /** Icon component to display. */
  icon?: FC<HTMLAttributes<HTMLOrSVGElement>>;
  /** Badge to display. */
  badge?: ReactNode;
  /** Whether the nav item is currently active. */
  current?: boolean;
  /** Whether to truncate the label text. */
  truncate?: boolean;
  /** Handler for click events. */
  onClick?: MouseEventHandler;
  /** Content to display. */
  children?: ReactNode;
  /** Whether the navigation is collapsed (for tablet responsive behavior). */
  isCollapsed?: boolean;
}

export const NavItemBase = ({
  current,
  type,
  badge,
  href,
  icon: Icon,
  children,
  truncate = true,
  onClick,
  isCollapsed = false,
}: NavItemBaseProps) => {
  const iconElement = Icon && (
    <Icon
      aria-hidden="true"
      className={cx(
        "size-5 shrink-0 text-ws-primary-300 transition-all duration-300 group-hover:text-ws-white hover:text-ws-white",
        current && "text-ws-white"
      )}
      style={{
        marginRight: isCollapsed ? 0 : "0.5rem",
      }}
    />
  );

  const badgeElement =
    badge && (typeof badge === "string" || typeof badge === "number") && !isCollapsed ? (
      <Badge className="ml-3" color="gray" type="pill-color" size="sm">
        {badge}
      </Badge>
    ) : null;

  const labelElement = !isCollapsed && (
    <span
      className={cx(
        "flex-1 text-md font-medium text-ws-primary-300 transition-all duration-300 group-hover:text-ws-white hover:text-ws-white",
        truncate && "truncate",
        current && "text-ws-white"
      )}
    >
      {children}
    </span>
  );

  const isExternal = href && href.startsWith("http");
  const externalIcon = isExternal && (
    <Share04 className="size-4 stroke-[2.5px] text-fg-quaternary" />
  );

  if (type === "collapsible") {
    return (
      <summary
        className={cx("px-3 py-2", styles.root, current && styles.rootSelected)}
        onClick={onClick}
      >
        {iconElement}

        {labelElement}

        {badgeElement}

        <ChevronDown
          aria-hidden="true"
          className="ml-3 size-4 shrink-0 stroke-[2.5px] text-fg-quaternary in-open:-scale-y-100"
        />
      </summary>
    );
  }

  if (type === "collapsible-child") {
    return (
      <AriaLink
        href={href!}
        target={isExternal ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className={cx("py-2 pr-3 pl-10", styles.root, current && styles.rootSelected)}
        onClick={onClick}
        aria-current={current ? "page" : undefined}
      >
        {labelElement}
        {externalIcon}
        {badgeElement}
      </AriaLink>
    );
  }

  return (
    <AriaLink
      href={href!}
      target={isExternal ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className={cx(
        "w-full p-2.5",
        isCollapsed && "justify-center",
        styles.root,
        current && styles.rootSelected
      )}
      onClick={onClick}
      aria-current={current ? "page" : undefined}
    >
      {iconElement}
      {labelElement}
      {externalIcon}
      {badgeElement}
    </AriaLink>
  );
};
