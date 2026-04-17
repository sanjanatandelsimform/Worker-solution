import type { ReactNode, Ref } from "react";
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import { cx } from "@/utils/cx";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { InfoCircle } from "@untitledui/icons";

export interface CheckboxBaseProps {
  size?: "sm" | "md";
  className?: string;
  isFocusVisible?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  isIndeterminate?: boolean;
}

export const CheckboxBase = ({
  className,
  isSelected,
  isDisabled,
  isIndeterminate,
  size = "sm",
  isFocusVisible = false,
}: CheckboxBaseProps) => {
  return (
    <div
      className={cx(
        "relative flex size-4 shrink-0 cursor-pointer appearance-none items-center justify-center rounded bg-ws-base-white ring-1 ring-ws-border-primary ring-inset",
        size === "md" && "size-5 rounded-md",
        (isSelected || isIndeterminate) &&
          "bg-ws-light-teal-900 ring-ws-light-teal-900 text-ws-base-white",
        isDisabled && "cursor-not-allowed bg-disabled_subtle ring-disabled",
        isFocusVisible && "outline-2 outline-offset-2 outline-focus-ring",
        className
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 14 14"
        fill="none"
        className={cx(
          "pointer-events-none absolute h-3 w-2.5 text-ws-base-white opacity-0 transition-inherit-all",
          size === "md" && "size-3.5",
          isIndeterminate && "opacity-100",
          isDisabled && "text-fg-disabled_subtle"
        )}
      >
        <path
          d="M2.91675 7H11.0834"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 14 14"
        fill="none"
        className={cx(
          "pointer-events-none absolute size-3 text-fg-white opacity-0 transition-inherit-all",
          size === "md" && "size-3.5",
          isSelected && !isIndeterminate && "opacity-100",
          isDisabled && "text-fg-disabled_subtle"
        )}
      >
        <path
          d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
CheckboxBase.displayName = "CheckboxBase";

interface CheckboxProps extends AriaCheckboxProps {
  ref?: Ref<HTMLLabelElement>;
  size?: "sm" | "md";
  label?: ReactNode;
  hint?: ReactNode;
  tooltipText?: string;
}

export const Checkbox = ({
  label,
  hint,
  tooltipText,
  size = "sm",
  className,
  ...ariaCheckboxProps
}: CheckboxProps) => {
  const sizes = {
    sm: {
      root: "gap-2",
      textWrapper: "",
      label: "text-sm font-medium",
      hint: "text-sm",
    },
    md: {
      root: "gap-3",
      textWrapper: "gap-0.5",
      label: "text-md font-medium",
      hint: "text-md",
    },
  };

  return (
    <AriaCheckbox
      {...ariaCheckboxProps}
      className={state =>
        cx(
          "flex items-start",
          state.isDisabled && "cursor-not-allowed",
          sizes[size].root,
          typeof className === "function" ? className(state) : className
        )
      }
    >
      {({ isSelected, isIndeterminate, isDisabled, isFocusVisible }) => (
        <>
          <CheckboxBase
            size={size}
            isSelected={isSelected}
            isIndeterminate={isIndeterminate}
            isDisabled={isDisabled}
            isFocusVisible={isFocusVisible}
            className={label || hint ? "mt-0.5" : ""}
          />
          {(label || hint) && (
            <div className={cx("inline-flex flex-col items-start", sizes[size].textWrapper)}>
              {label && (
                <p className={cx("text-secondary select-none question-text", sizes[size].label)}>
                  {label}
                  {tooltipText && (
                    <Tooltip
                      title={tooltipText}
                      placement="top"
                      arrow={true}
                    >
                      <TooltipTrigger
                        isDisabled={false}
                        className="cursor-pointer text-ws-gray-400 transition duration-200 hover:text-ws-gray-600 ml-1 inline-flex align-middle"
                      >
                        <InfoCircle className="size-4" />
                      </TooltipTrigger>
                    </Tooltip>
                  )}
                </p>
              )}
              {hint && (
                <span
                  className={cx("text-ws-text-tertiary", sizes[size].hint)}
                  onClick={event => event.stopPropagation()}
                >
                  {hint}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </AriaCheckbox>
  );
};
Checkbox.displayName = "Checkbox";
