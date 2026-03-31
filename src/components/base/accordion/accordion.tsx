import React, { useState, ReactElement } from "react";
import { cx } from "@/utils/cx";

interface AccordionItemProps {
  value: string;
  isOpen?: boolean;
  onToggle?: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
}

function AccordionItem({ value, isOpen = false, onToggle = () => {}, header, children }: AccordionItemProps) {
  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        className={cx(
          "flex w-full items-start gap-2 rounded-lg px-4 py-4 text-left transition-all",
          isOpen && "rounded-b-none",
          "hover:bg-gray-50"
        )}
        data-node-id={`accordion-item-${value}`}
      >
        {header}
      </button>

      {isOpen && (
        <>
          <div className="h-px bg-gray-200" data-node-id={`accordion-divider-${value}`} />
          <div className="space-y-4 px-4 py-4" data-node-id={`accordion-body-${value}`}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

interface AccordionProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Accordion({ children, defaultValue, value, onChange }: AccordionProps) {
  const [openValue, setOpenValue] = useState<string | null>(defaultValue || null);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : openValue;

  const handleToggle = (toggleValue: string) => {
    if (!isControlled) {
      const newValue = openValue === toggleValue ? null : toggleValue;
      setOpenValue(newValue);
      onChange?.(newValue || "");
    } else {
      onChange?.(toggleValue);
    }
  };

  return (
    <div className="space-y-0 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      {React.Children.map(children, (child) => {
        if (React.isValidElement<AccordionItemProps>(child)) {
          const typedChild = child as ReactElement<AccordionItemProps>;
          return React.cloneElement(typedChild, {
            isOpen: currentValue === typedChild.props.value,
            onToggle: () => handleToggle(typedChild.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

export { AccordionItem };
