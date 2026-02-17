import type { ReactNode, Ref } from "react";
import type { TextProps as AriaTextProps } from "react-aria-components";
import { Text as AriaText } from "react-aria-components";
import { cx } from "@/utils/cx";

interface HintTextProps extends AriaTextProps {
  /** Indicates that the hint text is an error message. */
  isInvalid?: boolean;
  ref?: Ref<HTMLElement>;
  children: ReactNode;
}

export const HintText = ({ isInvalid, className, ...props }: HintTextProps) => {
  return (
    <AriaText
      {...props}
      slot={isInvalid ? "errorMessage" : "description"}
      className={cx(
        "text-sm text-ws-black-10",

        // Invalid state
        isInvalid && "text-ws-red-30",
        "group-invalid:text-ws-red-30",

        className
      )}
    />
  );
};

HintText.displayName = "HintText";
