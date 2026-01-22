import type { AnchorHTMLAttributes, ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { cx } from "@/utils/cx";
import { styles } from "./social-button-styles";
import {
  AppleLogo,
  DribbleLogo,
  FacebookLogo,
  FigmaLogo,
  FigmaLogoOutlined,
  GoogleLogo,
  TwitterLogo,
} from "./social-logos";

// styles moved to social-button-styles.ts

interface CommonProps {
  social: "google" | "facebook" | "apple" | "twitter" | "figma" | "dribble";
  disabled?: boolean;
  theme?: "brand" | "color" | "gray";
  size?: keyof typeof styles.sizes;
}

interface ButtonProps
  extends
    CommonProps,
    DetailedHTMLProps<
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "slot">,
      HTMLButtonElement
    > {
  slot?: AriaButtonProps["slot"];
}

interface LinkProps
  extends
    CommonProps,
    DetailedHTMLProps<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color">, HTMLAnchorElement> {}

export type SocialButtonProps = ButtonProps | LinkProps;

export const SocialButton = ({
  size = "lg",
  theme = "brand",
  social,
  className,
  children,
  disabled,
  ...otherProps
}: SocialButtonProps) => {
  const href = "href" in otherProps ? otherProps.href : undefined;
  const Component = href ? AriaLink : AriaButton;

  const isIconOnly = !children;

  const socialToColor = {
    google: "gray",
    facebook: "facebook",
    apple: "black",
    twitter: "black",
    figma: "black",
    dribble: "dribble",
  } as const;

  const colorStyles = theme === "brand" ? styles.colors[socialToColor[social]] : styles.colors.gray;

  const logos = {
    google: GoogleLogo,
    facebook: FacebookLogo,
    apple: AppleLogo,
    twitter: TwitterLogo,
    figma: theme === "gray" ? FigmaLogoOutlined : FigmaLogo,
    dribble: DribbleLogo,
  };

  const Logo = logos[social];

  let props = {};

  if (href) {
    props = {
      ...otherProps,

      href: disabled ? undefined : href,

      // Since anchor elements do not support the `disabled` attribute and state,
      // we need to specify `data-rac` and `data-disabled` in order to be able
      // to use the `disabled:` selector in classes.
      ...(disabled ? { "data-rac": true, "data-disabled": true } : {}),
    };
  } else {
    props = {
      ...otherProps,

      type: otherProps.type || "button",
      isDisabled: disabled,
    };
  }

  return (
    <Component
      isDisabled={disabled}
      {...props}
      data-icon-only={isIconOnly ? true : undefined}
      className={cx(styles.common.root, styles.sizes[size].root, colorStyles.root, className)}
    >
      <Logo
        className={cx(
          styles.common.icon,
          theme === "gray"
            ? colorStyles.icon
            : theme === "brand" &&
                (social === "facebook" || social === "apple" || social === "twitter")
              ? "text-white"
              : theme === "color" && (social === "apple" || social === "twitter")
                ? "text-alpha-black"
                : ""
        )}
        colorful={
          (theme === "brand" && (social === "google" || social === "figma")) ||
          (theme === "color" &&
            (social === "google" ||
              social === "facebook" ||
              social === "figma" ||
              social === "dribble")) ||
          undefined
        }
      />

      {children}
    </Component>
  );
};

// Move constants or functions to a separate file to comply with the react-refresh/only-export-components rule.
