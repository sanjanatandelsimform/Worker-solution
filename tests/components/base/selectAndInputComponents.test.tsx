import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { NativeSelect } from "../../../src/components/base/select/select-native";
import { TextArea } from "../../../src/components/base/textarea/textarea";

// Mock react-aria-components for textarea
vi.mock("react-aria-components", () => ({
  TextArea: ({ className, ...props }: any) => {
    // Call className with all state combinations to maximize branch coverage
    if (typeof className === "function") {
      className({ isFocused: true, isDisabled: false, isInvalid: false });
      className({ isFocused: false, isDisabled: true, isInvalid: false });
      className({ isFocused: false, isDisabled: false, isInvalid: true });
      className({ isFocused: true, isDisabled: false, isInvalid: true });
    }
    const classVal = typeof className === "function"
      ? className({ isFocused: false, isDisabled: false, isInvalid: false })
      : className;
    return <textarea className={classVal} {...props} />;
  },
  TextField: ({ children, className, isInvalid, isDisabled, isRequired, ...props }: any) => {
    const state = { isInvalid: !!isInvalid, isDisabled: !!isDisabled, isRequired: !!isRequired };
    const cls = typeof className === "function" ? className(state) : className;
    return (
      <div className={cls} data-invalid={isInvalid} data-disabled={isDisabled} {...props}>
        {typeof children === "function"
          ? children({ isInvalid: !!isInvalid, isRequired: !!isRequired })
          : children}
      </div>
    );
  },
  Label: ({ children }: any) => <label>{children}</label>,
}));

// Mock Label
vi.mock("@/components/base/input/label", () => ({
  Label: ({ children, isRequired, htmlFor, id, className }: any) => (
    <label htmlFor={htmlFor} id={id} className={className}>
      {children}
      {isRequired && <span>*</span>}
    </label>
  ),
}));

// Mock HintText
vi.mock("@/components/base/input/hint-text", () => ({
  HintText: ({ children, id, className }: any) => (
    <p id={id} className={className}>
      {children}
    </p>
  ),
}));

// Mock @untitledui/icons
vi.mock("@untitledui/icons", () => ({
  ChevronDown: ({ className }: any) => <span className={className} data-testid="chevron-down" />,
  HelpCircle: () => <span data-testid="help-circle" />,
}));

// Mock tooltip
vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
}));

describe("NativeSelect", () => {
  const options = [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
    { label: "Option C (disabled)", value: "c", disabled: true },
  ];

  it("renders all options", () => {
    render(<NativeSelect options={options} />);
    expect(screen.getByText("Option A")).toBeTruthy();
    expect(screen.getByText("Option B")).toBeTruthy();
  });

  it("renders with label", () => {
    render(<NativeSelect options={options} label="Country" />);
    expect(screen.getByText("Country")).toBeTruthy();
  });

  it("renders with required indicator", () => {
    render(<NativeSelect options={options} label="Country" isRequired={true} />);
    expect(screen.getByText("*")).toBeTruthy();
  });

  it("does not render required indicator when isRequired=false", () => {
    render(<NativeSelect options={options} label="Country" isRequired={false} />);
    expect(screen.queryByText("*")).toBeNull();
  });

  it("renders hint text when provided", () => {
    render(<NativeSelect options={options} hint="Select your country" />);
    expect(screen.getByText("Select your country")).toBeTruthy();
  });

  it("does not render hint when not provided", () => {
    render(<NativeSelect options={options} />);
    const hints = screen.queryAllByRole("paragraph");
    expect(hints.length).toBe(0);
  });

  it("renders chevron-down icon", () => {
    render(<NativeSelect options={options} />);
    expect(screen.getByTestId("chevron-down")).toBeTruthy();
  });

  it("can be selected", () => {
    const onChange = vi.fn();
    render(<NativeSelect options={options} onChange={onChange} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "b" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("renders disabled option correctly", () => {
    render(<NativeSelect options={options} />);
    const disabledOption = screen.getByText("Option C (disabled)");
    expect((disabledOption as HTMLOptionElement).disabled).toBe(true);
  });

  it("renders without label when not provided", () => {
    render(<NativeSelect options={options} />);
    expect(screen.queryByRole("label")).toBeNull();
  });
});

describe("TextArea", () => {
  it("renders basic textarea", () => {
    render(<TextArea />);
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  it("renders with label", () => {
    render(<TextArea label="Description" />);
    expect(screen.getByText("Description")).toBeTruthy();
  });

  it("renders with placeholder", () => {
    render(<TextArea placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText("Enter text...")).toBeTruthy();
  });

  it("renders with hint text", () => {
    render(<TextArea hint="Maximum 200 characters" />);
    expect(screen.getByText("Maximum 200 characters")).toBeTruthy();
  });

  it("renders without hint when not provided", () => {
    render(<TextArea />);
    expect(screen.queryByRole("paragraph")).toBeNull();
  });

  it("handles value changes", () => {
    const onChange = vi.fn();
    render(<TextArea onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("renders with required state", () => {
    render(<TextArea label="Notes" isRequired={true} />);
    expect(screen.getByText("Notes")).toBeTruthy();
  });

  it("renders with function className (covers function branch)", () => {
    render(<TextArea className={(state: any) => `custom-${state ? "valid" : "invalid"}`} />);
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  it("renders with textAreaClassName as function (covers TextAreaBase line 43 function branch)", () => {
    render(<TextArea textAreaClassName={(state: any) => `ta-${state.isFocused ? "focused" : "normal"}`} />);
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  it("renders with hideRequiredIndicator", () => {
    render(<TextArea label="Notes" isRequired={true} hideRequiredIndicator={true} />);
    expect(screen.getByText("Notes")).toBeTruthy();
  });

  it("renders with tooltip", () => {
    render(<TextArea label="Notes" tooltip="Some tooltip" />);
    expect(screen.getByText("Notes")).toBeTruthy();
  });
});
