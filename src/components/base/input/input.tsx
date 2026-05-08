"use client";
import {
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  createContext,
  useContext,
  useState,
} from "react";
import { Eye, EyeOff, InfoCircle } from "@untitledui/icons";
import type {
  InputProps as AriaInputProps,
  TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import {
  Button as AriaButton,
  Group as AriaGroup,
  Input as AriaInput,
  TextField as AriaTextField,
} from "react-aria-components";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { cx, sortCx } from "@/utils/cx";

export interface InputBaseProps extends Omit<AriaInputProps, "size"> {
  /** Tooltip message on hover. */
  tooltip?: string;
  /** Default helper tooltip message when no validation error. */
  helperTooltip?: string;
  /** Prefix input */
  prefix?: string;
  /** Whether the input is invalid. */
  isInvalid?: boolean;
  /** Whether the input is disabled. */
  isDisabled?: boolean;
  /** Whether the input is required. */
  isRequired?: boolean;
  /**
   * Input size.
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
  /** Placeholder text. */
  placeholder?: string;
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
  showPasswordToggle?: boolean;
   isFocused: boolean;
  ref?: Ref<HTMLInputElement>;
  groupRef?: Ref<HTMLDivElement>;
  /** Icon component to display on the left side of the input. */
  icon?: ComponentType<HTMLAttributes<HTMLOrSVGElement>>;
}

export const InputBase = ({
  ref,
  tooltip,
  helperTooltip,
  shortcut,
  groupRef,
  size = "md",
  isInvalid,
  isDisabled,
  isRequired,
  icon: Icon,
  prefix,
  placeholder,
  wrapperClassName,
  tooltipClassName,
  inputClassName,
  iconClassName,
  showPasswordToggle = true,
  isFocused,
  type = "text",
  ...inputProps
}: InputBaseProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Check if the input has a leading icon or tooltip
  const hasTrailingIcon = tooltip || isInvalid;
  const hasLeadingIcon = Icon || prefix;

  // If the input is inside a `TextFieldContext`, use its context to simplify applying styles
  const context = useContext(TextFieldContext);

  const inputSize = context?.size || size;

  const sizes = sortCx({
    sm: {
      root: cx("px-3 py-2 text-sm", hasLeadingIcon && "pl-9", hasTrailingIcon && "pr-9"),
      iconLeading: "left-3 size-4 stroke-[2.25px]",
      iconTrailing: "right-3",
      shortcut: "pr-1.5",
    },
    md: {
      root: cx("px-3 py-2 text-md", hasLeadingIcon && "pl-10", hasTrailingIcon && "pr-9"),
      iconLeading: "left-3 size-5",
      iconTrailing: "right-3",
      shortcut: "pr-2",
    },
    lg: {
      root: cx("px-3.5 py-2.5 text-md", hasLeadingIcon && "pl-10.5", hasTrailingIcon && "pr-9.5"),
      iconLeading: "left-3.5 size-5",
      iconTrailing: "right-3.5",
      shortcut: "pr-2.5",
    },
  });

  return (
    <AriaGroup
      {...{ isDisabled, isInvalid }}
      ref={groupRef}
      className={({ isFocusWithin, isDisabled, isInvalid }) =>
        cx(
          "group/input relative flex w-full flex-row place-content-center place-items-center rounded-lg bg-ws-base-white shadow-xs ring-1 ring-ws-border-primary transition-shadow duration-100 ease-linear ring-inset",

          isFocusWithin && !isDisabled && "ring-2 ring-ws-light-teal-850",

          // Disabled state styles
          isDisabled && "cursor-not-allowed opacity-50",
          "group-disabled:cursor-not-allowed group-disabled:opacity-50",

          // Invalid state styles
          isInvalid && "ring-ws-error-300",
          "group-invalid:ring-ws-error-300",

          // Invalid state with focus-within styles
          isInvalid && isFocusWithin && "ring-2 ring-ws-error-600",
          isFocusWithin && "group-invalid:ring-2 group-invalid:ring-ws-error-600",

          isFocused && !isDisabled && "ring-2 ring-ws-light-teal-850",

          context?.wrapperClassName,
          wrapperClassName
        )
      }
    >
      {/* Leading icon and Payment icon */}
      {Icon && (
        <Icon
          className={cx(
            "pointer-events-none absolute text-ws-gray-300",
            sizes[inputSize].iconLeading,
            context?.iconClassName,
            iconClassName
          )}
        />
      )}

      {/* Prefix text */}
      {prefix && (
        <span
          className={cx(
            "absolute left-3 my-auto text-md text-ws-text-tertiary",
            isDisabled && "text-disabled"
          )}
        >
          {prefix}
        </span>
      )}

      {/* Input field */}
      <AriaInput
        {...(inputProps as AriaInputProps)}
        ref={ref}
        required={isRequired}
        type={type === "password" && isPasswordVisible ? "text" : type}
        placeholder={placeholder}
        className={cx(
          "m-0 w-full bg-transparent text-ws-text-primary ring-0 outline-hidden placeholder:text-ws-gray-500 autofill:rounded-lg autofill:text-ws-text-primary disabled:cursor-not-allowed",
          sizes[inputSize].root,
          context?.inputClassName,
          inputClassName
        )}
      />

      {/* Tooltip and help icon - always interactive */}
      {/* {type !== "password" && !isInvalid && (
        <Tooltip title={tooltip || helperTooltip || "More information"} placement="top" arrow>
          <TooltipTrigger
            className={cx(
              "absolute cursor-pointer transition-colors duration-100 ease-linear text-ws-gray-400 hover:text-ws-gray-500 focus:text-ws-gray-500",
              sizes[inputSize].iconTrailing,
              context?.tooltipClassName,
              tooltipClassName
            )}
          >
            <HelpCircle className={cx("size-4")} />
          </TooltipTrigger>
        </Tooltip>
      )} */}

      {/* Invalid icon */}
      {type !== "password" && isInvalid && (
        <InfoCircle
          className={cx(
            "pointer-events-none absolute size-4 text-ws-error-600",
            sizes[inputSize].iconTrailing
          )}
        />
      )}

      {/* Password visibility toggle */}
      {type === "password" && showPasswordToggle && (
        <AriaButton
          aria-label="Toggle password visibility"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className={cx(
            "absolute flex cursor-pointer items-center justify-center text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover focus:outline-hidden",
            sizes[inputSize].iconTrailing
          )}
        >
          {isPasswordVisible ? (
            <EyeOff className="size-4 text-ws-gray-400" />
          ) : (
            <Eye className="size-4 text-ws-gray-400" />
          )}
        </AriaButton>
      )}

      {/* Shortcut */}
      {shortcut && (
        <div
          className={cx(
            "pointer-events-none absolute inset-y-0.5 right-0.5 z-10 hidden items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-bg-primary to-40% pl-8 md:flex",
            sizes[inputSize].shortcut
          )}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none rounded px-1 py-px text-xs font-medium text-quaternary ring-1 ring-secondary select-none ring-inset"
          >
            {typeof shortcut === "string" ? shortcut : "⌘K"}
          </span>
        </div>
      )}
    </AriaGroup>
  );
};

InputBase.displayName = "InputBase";

type TextFieldContextProps = Partial<
  Pick<
    InputBaseProps,
    | "size"
    | "wrapperClassName"
    | "inputClassName"
    | "iconClassName"
    | "tooltipClassName"
    | "helperTooltip"
  >
>;

const TextFieldContext = createContext<TextFieldContextProps>({});

export interface TextFieldProps extends AriaTextFieldProps, TextFieldContextProps {}

export const TextField = ({
  className,
  size = "md",
  inputClassName,
  wrapperClassName,
  iconClassName,
  tooltipClassName,
  helperTooltip,
  ...props
}: TextFieldProps) => {
  return (
    <TextFieldContext.Provider
      value={{
        inputClassName,
        wrapperClassName,
        iconClassName,
        tooltipClassName,
        helperTooltip,
        size,
      }}
    >
      <AriaTextField
        {...props}
        data-input-wrapper
        data-input-size={size}
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

export interface InputProps
  extends
    AriaTextFieldProps,
    Pick<
      InputBaseProps,
      | "ref"
      | "placeholder"
      | "icon"
      | "shortcut"
      | "tooltip"
      | "helperTooltip"
      | "groupRef"
      | "size"
      | "wrapperClassName"
      | "inputClassName"
      | "iconClassName"
      | "tooltipClassName"
      | "prefix"
    > {
  /** Label text for the input */
  label?: string;
  /** Helper text displayed below the input */
  hint?: ReactNode;
  /** Whether to show the password visibility toggle */
  showPasswordToggle?: boolean;
  /** Whether to hide required indicator from label */
  hideRequiredIndicator?: boolean;
}

export const Input = ({
  size = "md",
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
  helperTooltip,
  iconClassName,
  inputClassName,
  wrapperClassName,
  tooltipClassName,
  showPasswordToggle = true,
  type = "text",
  ...props
}: InputProps) => {
  return (
    <TextField
      aria-label={!label ? placeholder : undefined}
      {...props}
      size={size}
      helperTooltip={helperTooltip}
      className={className}
    >
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
              isInvalid,
              iconClassName,
              inputClassName,
              wrapperClassName,
              tooltipClassName,
              tooltip,
              helperTooltip,
              showPasswordToggle,
              type,
            }}
          />

          {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
        </>
      )}
    </TextField>
  );
};

Input.displayName = "Input";
