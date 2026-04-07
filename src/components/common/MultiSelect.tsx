import * as React from "react";
import { CheckIcon } from "@/assets/icons/CheckIcon";
import { SelectArrow } from "@/assets/icons/SelectArrow";

type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select options",
}) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="bg-ws-base-white flex w-full h-11 items-center justify-between rounded-md border border-gray-300 px-4 py-2 text-left gap-2 focus-within:border-ws-black focus-within:border-2"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map(option => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1 py-1 text-sm text-primary"
              >
                {option.label}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    removeOption(option.value);
                  }}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors hover:cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary"
                  >
                    <path
                      d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-700">{placeholder}</span>
          )}
        </div>
        <SelectArrow className="h-full flex items-center justify-center" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-200 bg-ws-base-white shadow-lg">
          <ul className="max-h-72 overflow-auto py-2">
            {options.map(option => {
              const checked = value.includes(option.value);

              return (
                <li
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50"
                  onClick={() => toggleOption(option.value)}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md border relative ${checked ? "border-primary bg-primary text-ws-white" : "border-gray-300"}`}
                  >
                    {checked && <CheckIcon className="right-1 bottom-1" />}
                  </div>
                  <span className="text-gray-700">{option.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
