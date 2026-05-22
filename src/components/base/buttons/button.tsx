import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FC,
  ReactNode,
} from "react";
import { isValidElement } from "react";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { cx } from "@/utils/cx";
import { styles } from "./button-styles";
import { isReactComponent } from "@/utils/is-react-component";

/**
 * Common props shared between button and anchor variants
 */
export interface CommonProps {
  /** Disables the button and shows a disabled state */
  isDisabled?: boolean;
  /** Shows a loading spinner and disables the button */
  isLoading?: boolean;
  /** The size variant of the button */
  size?: keyof typeof styles.sizes;
  /** The color variant of the button */
  color?: keyof typeof styles.variants;
  /** Icon component or element to show before the text */
  iconLeading?: FC<{ className?: string }> | ReactNode;
  /** Icon component or element to show after the text */
  iconTrailing?: FC<{ className?: string }> | ReactNode;
  /** Removes horizontal padding from the text content */
  noTextPadding?: boolean;
  /** When true, keeps the text visible during loading state */
  showTextWhileLoading?: boolean;
}

/**
 * Props for the button variant (non-link)
 */
export interface ButtonProps
  extends
    CommonProps,
    DetailedHTMLProps<
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "slot">,
      HTMLButtonElement
    > {
  /** Slot name for react-aria component */
  slot?: AriaButtonProps["slot"];
}

/**
 * Props for the link variant (anchor tag)
 */
interface LinkProps
  extends
    CommonProps,
    DetailedHTMLProps<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color">, HTMLAnchorElement> {}

/** Union type of button and link props */
export type Props = ButtonProps | LinkProps;

export const Button = ({
  size = "sm",
  color = "primary",
  children,
  className,
  noTextPadding,
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  isDisabled: disabled,
  isLoading: loading,
  showTextWhileLoading,
  ...otherProps
}: Props) => {
  const href = "href" in otherProps ? otherProps.href : undefined;
  const Component = href ? AriaLink : AriaButton;

  const isIcon = (IconLeading || IconTrailing) && !children;
  const isLinkType = ["link", "link-gray", "link-color", "link-destructive"].includes(color);

  noTextPadding = isLinkType || noTextPadding;

  let props = {};

  if (href) {
    props = {
      ...otherProps,

      href: disabled ? undefined : href,
    };
  } else {
    props = {
      ...otherProps,

      type: otherProps.type || "button",
      isPending: loading,
    };
  }

  return (
    <Component
      data-loading={loading ? true : undefined}
      data-icon-only={isIcon ? true : undefined}
      {...props}
      isDisabled={disabled}
      className={cx(
        styles.common.root,
        styles.sizes[size].root,
        styles.variants[color].root,
        isLinkType && styles.sizes[size].linkRoot,
        (loading || (href && (disabled || loading))) && "pointer-events-none",
        // If in `loading` state, hide everything except the loading icon (and text if `showTextWhileLoading` is true).
        loading &&
          (showTextWhileLoading
            ? "[&>*:not([data-icon=loading]):not([data-text])]:hidden"
            : "[&>*:not([data-icon=loading])]:invisible"),
        className
      )}
    >
      {/* Leading icon */}
      {isValidElement(IconLeading) && IconLeading}
      {isReactComponent(IconLeading) && (
        <IconLeading data-icon="leading" className={styles.common.icon} />
      )}

      {loading && (
        <svg
          fill="none"
          data-icon="loading"
          viewBox="0 0 20 20"
          className={cx(
            styles.common.icon,
            !showTextWhileLoading && "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          )}
        >
          {/* Background circle */}
          <circle
            className="stroke-current opacity-30"
            cx="10"
            cy="10"
            r="8"
            fill="none"
            strokeWidth="2"
          />
          {/* Spinning circle */}
          <circle
            className="origin-center animate-spin stroke-current"
            cx="10"
            cy="10"
            r="8"
            fill="none"
            strokeWidth="2"
            strokeDasharray="12.5 50"
            strokeLinecap="round"
          />
        </svg>
      )}

      {children && (
        <span data-text className={cx("transition-inherit-all", !noTextPadding && "px-0.5")}>
          {children}
        </span>
      )}

      {/* Trailing icon */}
      {isValidElement(IconTrailing) && IconTrailing}
      {isReactComponent(IconTrailing) && (
        <IconTrailing data-icon="trailing" className={styles.common.icon} />
      )}
    </Component>
  );
};

// Move constants or functions to a separate file to comply with the react-refresh/only-export-components rule.
