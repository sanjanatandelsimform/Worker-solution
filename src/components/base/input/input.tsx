"use client";

import {
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  createContext,
  useContext,
} from "react";
import { InfoCircle } from "@untitledui/icons";
import type {
  InputProps as AriaInputProps,
  TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import {
  Group as AriaGroup,
  Input as AriaInput,
  TextField as AriaTextField,
} from "react-aria-components";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { cx, sortCx } from "@/utils/cx";
import { InputInfo } from "@/assets/icons/inputInfo";

export interface InputBaseProps extends TextFieldProps {
  /** Tooltip message on hover. */
  tooltip?: string;
  /**
   * Input size.
   * @default "sm"
   */
  size?: "sm" | "md";
  /** Placeholder text. */
  placeholder?: string;
  /** Prefix text displayed inside the input field. */
  prefix?: string;
  /** Class name for the icon. */
  iconClassName?: string;
  /** Class name for the input. */
  inputClassName?: string;
  /** Class name for the input wrapper. */
  wrapperClassName?: string;
  /** Class name for the tooltip. */
  tooltipClassName?: string;
  /** Keyboard shortcut to display. */
  shortcut?: string | boolean;
  ref?: Ref<HTMLInputElement>;
  groupRef?: Ref<HTMLDivElement>;
  /** Icon component to display on the left side of the input. */
  icon?: ComponentType<HTMLAttributes<HTMLOrSVGElement>>;
}

export const InputBase = ({
  ref,
  tooltip,
  shortcut,
  groupRef,
  size = "sm",
  isInvalid,
  isDisabled,
  icon: Icon,
  prefix,
  placeholder,
  wrapperClassName,
  tooltipClassName,
  inputClassName,
  iconClassName,
  // Omit this prop to avoid invalid HTML attribute warning
  isRequired: _isRequired,
  ...inputProps
}: Omit<InputBaseProps, "label" | "hint">) => {
  // Check if the input has a leading icon or tooltip
  const hasTrailingIcon = tooltip || isInvalid;
  const hasLeadingIcon = Icon || prefix;

  // If the input is inside a `TextFieldContext`, use its context to simplify applying styles
  const context = useContext(TextFieldContext);

  const inputSize = context?.size || size;

  const sizes = sortCx({
    sm: {
      root: cx("px-3 py-2", hasTrailingIcon && "pr-9", hasLeadingIcon && "pl-10"),
      iconLeading: "left-3",
      iconTrailing: "right-3",
      shortcut: "pr-2.5",
    },
    md: {
      root: cx("px-3.5 py-2.5", hasTrailingIcon && "pr-9.5", hasLeadingIcon && "pl-10.5"),
      iconLeading: "left-3.5",
      iconTrailing: "right-3.5",
      shortcut: "pr-3",
    },
  });

  return (
    <AriaGroup
      {...{ isDisabled, isInvalid }}
      ref={groupRef}
      className={({ isFocusWithin, isDisabled, isInvalid }) =>
        cx(
          "relative flex w-full flex-row place-content-center place-items-center rounded-lg bg-ws-base-white shadow-xs ring-1 ring-ws-border-primary transition-shadow duration-100 ease-linear ring-inset border-0",

          isFocusWithin && !isDisabled && isInvalid && "ring-2 ring-ws-red-10",

          // Disabled state styles
          isDisabled && "cursor-not-allowed bg-ws-gray-10 ring-ws-border-primary",
          "group-disabled:cursor-not-allowed group-disabled:bg-ws-gray-10 group-disabled:ring-ws-border-primary",

          // Invalid state styles
          isInvalid && "ring-1 ring-ws-error-600",
          "group-invalid:ring-ws-error-600",

          // Invalid state with focus-within styles
          isInvalid && isFocusWithin && "ring-2 ring-ws-error-600",
          isFocusWithin && "group-invalid:ring-2 group-invalid:ring-ws-error-600",

          context?.wrapperClassName,
          wrapperClassName
        )
      }
    >
      {/* Leading icon and Payment icon */}
      {Icon && (
        <Icon
          className={cx(
            "pointer-events-none absolute size-5 text-ws-gray-60",
            isDisabled && "text-ws-gray-30",
            sizes[inputSize].iconLeading,
            context?.iconClassName,
            iconClassName
          )}
        />
      )}

      {/* Prefix text */}
      {prefix && (
        <span className={cx("absolute left-3 my-auto text-md text-ws-text-tertiary", isDisabled && "text-disabled")}>
          {prefix}
        </span>
      )}

      {/* Input field */}
      <AriaInput
        {...(inputProps as AriaInputProps)}
        ref={ref}
        placeholder={placeholder}
        className={cx(
          "m-0 w-full bg-transparent text-md text-ws-gray-500 ring-0 outline-hidden placeholder:text-ws-gray-500 autofill:rounded-lg autofill:text-ws-text-primary question-text",
          isDisabled && "cursor-not-allowed bg-ws-gray-10 text-disabled",
          sizes[inputSize].root,
          context?.inputClassName,
          inputClassName
        )}
      />

      {/* Tooltip and help icon */}
      {tooltip && !isInvalid && (
        <Tooltip title={tooltip} placement="top" arrow={true}>
          <TooltipTrigger
            className={cx(
              "absolute cursor-pointer text-ws-gray-60 transition duration-200 hover:text-ws-error-600 focus:text-ws-error-600",
              sizes[inputSize].iconTrailing,
              context?.tooltipClassName,
              tooltipClassName
            )}
          >
            <InputInfo className="size-6" />
          </TooltipTrigger>
        </Tooltip>
      )}

      {/* Invalid icon */}
      {isInvalid && (
        <InfoCircle
          className={cx(
            "pointer-events-none absolute size-4 text-fg-error-secondary",
            sizes[inputSize].iconTrailing,
            context?.tooltipClassName,
            tooltipClassName
          )}
        />
      )}

      {/* Shortcut */}
      {shortcut && (
        <div
          className={cx(
            "pointer-events-none absolute inset-y-0.5 right-0.5 z-10 flex items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-bg-ws-base-white to-40% pl-8",
            sizes[inputSize].shortcut
          )}
        >
          <span
            className={cx(
              "pointer-events-none rounded px-1 py-px text-xs font-medium text-quaternary ring-1 ring-secondary select-none ring-inset",
              isDisabled && "bg-transparent text-disabled"
            )}
            aria-hidden="true"
          >
            {typeof shortcut === "string" ? shortcut : "⌘K"}
          </span>
        </div>
      )}
    </AriaGroup>
  );
};

InputBase.displayName = "InputBase";

interface BaseProps {
  /** Label text for the input */
  label?: string;
  /** Helper text displayed below the input */
  hint?: ReactNode;
}

interface TextFieldProps
  extends
    BaseProps,
    AriaTextFieldProps,
    Pick<
      InputBaseProps,
      "size" | "wrapperClassName" | "inputClassName" | "iconClassName" | "tooltipClassName"
    > {
  ref?: Ref<HTMLDivElement>;
}

const TextFieldContext = createContext<TextFieldProps>({});

export const TextField = ({ className, ...props }: TextFieldProps) => {
  return (
    <TextFieldContext.Provider value={props}>
      <AriaTextField
        {...props}
        data-input-wrapper
        className={state =>
          cx(
            "group flex h-max w-full flex-col items-start justify-start gap-1.5",
            typeof className === "function" ? className(state) : className
          )
        }
      />
    </TextFieldContext.Provider>
  );
};

TextField.displayName = "TextField";

interface InputProps extends InputBaseProps, BaseProps {
  /** Whether to hide required indicator from label */
  hideRequiredIndicator?: boolean;
}

export const Input = ({
  size = "sm",
  placeholder,
  icon: Icon,
  label,
  hint,
  shortcut,
  prefix,
  hideRequiredIndicator,
  className,
  ref,
  groupRef,
  tooltip,
  iconClassName,
  inputClassName,
  wrapperClassName,
  tooltipClassName,
  ...props
}: InputProps) => {
  return (
    <TextField aria-label={!label ? placeholder : undefined} {...props} className={className}>
      {({ isRequired, isInvalid }) => (
        <>
          {label && (
            <Label isRequired={hideRequiredIndicator ? !hideRequiredIndicator : isRequired}>
              {label}
            </Label>
          )}

          <InputBase
            {...{
              ref,
              groupRef,
              size,
              placeholder,
              prefix,
              icon: Icon,
              shortcut,
              iconClassName,
              inputClassName,
              wrapperClassName,
              tooltipClassName,
              tooltip,
            }}
          />

          {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
        </>
      )}
    </TextField>
  );
};

Input.displayName = "Input";
