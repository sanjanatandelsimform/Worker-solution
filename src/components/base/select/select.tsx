import type { FC, ReactNode, Ref, RefAttributes } from "react";
import { isValidElement, useRef } from "react";
import { ChevronDown } from "@untitledui/icons";
import type { SelectProps as AriaSelectProps } from "react-aria-components";
import {
  Button as AriaButton,
  ListBox as AriaListBox,
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
} from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { cx } from "@/utils/cx";
import { isReactComponent } from "@/utils/is-react-component";
import { ComboBox } from "./combobox";
import { Popover } from "./popover";
import { SelectItem } from "./select-item";

export type SelectItemType = {
  id: string;
  label?: string;
  avatarUrl?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  supportingText?: string;
  icon?: FC | ReactNode;
};

export interface CommonProps {
  hint?: string;
  label?: string;
  tooltip?: string;
  size?: "sm" | "md";
  placeholder?: string;
}

interface SelectProps
  extends
    Omit<AriaSelectProps<SelectItemType>, "children" | "items">,
    RefAttributes<HTMLDivElement>,
    CommonProps {
  items?: SelectItemType[];
  popoverClassName?: string;
  placeholderIcon?: FC | ReactNode;
  children: ReactNode | ((item: SelectItemType) => ReactNode);
}

interface SelectValueProps {
  isOpen: boolean;
  size: "sm" | "md";
  isFocused: boolean;
  isDisabled: boolean;
  isInvalid: boolean;
  placeholder?: string;
  ref?: Ref<HTMLButtonElement>;
  placeholderIcon?: FC | ReactNode;
}

import { sizes } from "./select-styles";

const SelectValue = ({
  isOpen,
  isFocused,
  isDisabled,
  isInvalid,
  size,
  placeholder,
  placeholderIcon,
  ref,
}: SelectValueProps) => {
  return (
    <AriaButton
      ref={ref}
      type="button"
      className={cx(
        "relative flex w-full cursor-pointer items-center rounded-lg bg-ws-base-white shadow-xs ring-1 ring-ws-border-primary outline-hidden transition duration-100 ease-linear ring-inset text-ws-text-primary",
        (isFocused || isOpen) && "ring-2 ring-ws-light-teal-850 font-normal",
        isDisabled && "cursor-not-allowed bg-disabled_subtle text-disabled",
        isInvalid && "ring-1 ring-ws-error-600",
      )}
    >
      <AriaSelectValue<SelectItemType>
        className={cx(
          "flex h-max w-full items-center justify-start gap-2 truncate text-left align-middle",

          // Icon styles
          "*:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:text-ws-gray-400 in-disabled:*:data-icon:text-ws-gray-400",

          sizes[size].root
        )}
      >
        {state => {
          const Icon = state.selectedItem?.icon || placeholderIcon;
          return (
            <>
              {state.selectedItem?.avatarUrl ? (
                <Avatar
                  size="xs"
                  src={state.selectedItem.avatarUrl}
                  alt={state.selectedItem.label}
                />
              ) : isReactComponent(Icon) ? (
                <Icon data-icon aria-hidden="true" />
              ) : isValidElement(Icon) ? (
                Icon
              ) : null}

              {state.selectedItem ? (
                <section className="flex w-full gap-2 truncate">
                  <p className="truncate text-md font-medium text-ws-base-black question-text">
                    {state.selectedItem?.label}
                  </p>
                  {state.selectedItem?.supportingText && (
                    <p className="text-md text-ws-text-tertiary">
                      {state.selectedItem?.supportingText}
                    </p>
                  )}
                </section>
              ) : (
                <p
                  className={cx(
                    "text-md text-ws-text-tertiary question-text",
                    isDisabled && "text-disabled"
                  )}
                >
                  <span className="text-ws-gray-500">{placeholder}</span>
                </p>
              )}

              <ChevronDown
                aria-hidden="true"
                className={cx(
                  "ml-auto shrink-0 text-ws-gray-400",
                  size === "sm" ? "size-4 stroke-[2.5px]" : "size-5"
                )}
              />
            </>
          );
        }}
      </AriaSelectValue>
    </AriaButton>
  );
};

import { SelectContext } from "./select-context";

const Select = ({
  placeholder = "Select",
  placeholderIcon,
  size = "sm",
  children,
  items,
  label,
  hint,
  tooltip,
  className,
  ...rest
}: SelectProps) => {
  // Create a stable ref for the trigger button to prevent popover positioning issues
  // during re-renders (e.g., when react-hook-form triggers validation)
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <SelectContext.Provider value={{ size }}>
      <AriaSelect
        {...rest}
        className={state =>
          cx(
            "flex flex-col gap-1.5 question-text",
            typeof className === "function" ? className(state) : className
          )
        }
      >
        {state => (
          <>
            {label && (
              <Label isRequired={state.isRequired} tooltip={tooltip}>
                {label}
              </Label>
            )}

            <SelectValue
              {...state}
              {...{ size, placeholder }}
              placeholderIcon={placeholderIcon}
              ref={triggerRef}
            />

            <Popover size={size} triggerRef={triggerRef} className={rest.popoverClassName}>
              <AriaListBox items={items} className="size-full outline-hidden">
                {children}
              </AriaListBox>
            </Popover>

            {hint && <HintText isInvalid={state.isInvalid}>{hint}</HintText>}
          </>
        )}
      </AriaSelect>
    </SelectContext.Provider>
  );
};

// Move constants or functions to a separate file to comply with the react-refresh/only-export-components rule.

const _Select = Select as typeof Select & {
  ComboBox: typeof ComboBox;
  Item: typeof SelectItem;
};
_Select.ComboBox = ComboBox;
_Select.Item = SelectItem;

export { _Select as Select };

// Re-export context and constants for backwards compatibility
export { SelectContext } from "./select-context";
// eslint-disable-next-line react-refresh/only-export-components
export { sizes } from "./select-styles";
