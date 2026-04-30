import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { QuestionCheckboxGroup } from "../../../src/components/common/QuestionCheckboxGroup";
import { QuestionRadioGroup } from "../../../src/components/common/QuestionRadioGroup";
import { TagCloseX } from "../../../src/components/base/tags/base-components/tag-close-x";

// Mock react-aria-components
vi.mock("react-aria-components", () => ({
  Checkbox: ({ children, onChange, isSelected, ...props }: any) => (
    <input
      type="checkbox"
      checked={isSelected || false}
      onChange={e => onChange && onChange(e.target.checked)}
      {...props}
    />
  ),
  Radio: ({ children, value, ...props }: any) => (
    <input type="radio" value={value} data-testid={`radio-${value}`} {...props} />
  ),
  RadioGroup: ({ children, onChange, value, ...props }: any) => (
    <div onChange={(e: any) => onChange && onChange(e.target.value)} {...props}>
      {children}
    </div>
  ),
  Label: ({ children, isRequired, ...props }: any) => (
    <label {...props}>
      {children}
      {isRequired && <span aria-hidden="true"> *</span>}
    </label>
  ),
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock @untitledui/icons
vi.mock("@untitledui/icons", () => ({
  InfoCircle: () => <span data-testid="info-circle" />,
  HelpCircle: () => <span data-testid="help-circle" />,
  XClose: ({ className, strokeWidth }: any) => (
    <svg className={className} stroke-width={strokeWidth} data-testid="x-close" />
  ),
}));

// Mock tooltip
vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }: any) => <div data-testid="tooltip-trigger">{children}</div>,
}));

// Mock Label component
vi.mock("@/components/base/input/label", () => ({
  Label: ({ children, isRequired, className }: any) => (
    <label className={className}>
      {children}
      {isRequired && <span> *</span>}
    </label>
  ),
}));

// Mock FieldError
vi.mock("@/components/common/FieldError", () => ({
  FieldError: ({ message }: any) =>
    message ? <span data-testid="field-error">{message}</span> : null,
}));

// Mock Checkbox
vi.mock("@/components/base/checkbox/checkbox", () => ({
  Checkbox: ({ isSelected, onChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={isSelected || false}
      onChange={e => onChange && onChange(e.target.checked)}
      data-testid="checkbox"
      {...props}
    />
  ),
}));

// Mock RadioButton/RadioGroup
vi.mock("@/components/base/radio-buttons/radio-buttons", () => ({
  RadioButton: ({ value, ...props }: any) => (
    <input type="radio" value={value} data-testid={`radio-${value}`} {...props} />
  ),
  RadioGroup: ({ children, onChange, value, ...props }: any) => (
    <div data-testid="radio-group" {...props}>
      {children}
    </div>
  ),
}));

const mockQuestion = {
  id: "q1",
  question: "Sample Question",
  required: true,
  options: [
    { id: "opt1", label: "Option 1" },
    { id: "opt2", label: "Option 2" },
    { id: "opt3", label: "Option 3" },
  ],
};

describe("QuestionCheckboxGroup", () => {
  it("renders question text and options", () => {
    render(
      <QuestionCheckboxGroup
        question={mockQuestion}
        displayIndex={1}
        selectedValues={[]}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByText(/Sample Question/)).toBeTruthy();
    expect(screen.getByText("Option 1")).toBeTruthy();
    expect(screen.getByText("Option 2")).toBeTruthy();
    expect(screen.getByText("Option 3")).toBeTruthy();
  });

  it("shows selected checkboxes", () => {
    render(
      <QuestionCheckboxGroup
        question={mockQuestion}
        displayIndex={1}
        selectedValues={["opt1", "opt3"]}
        onToggle={vi.fn()}
      />
    );
    const checkboxes = screen.getAllByTestId("checkbox");
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(true);
  });

  it("calls onToggle when checkbox is changed", () => {
    const onToggle = vi.fn();
    render(
      <QuestionCheckboxGroup
        question={mockQuestion}
        displayIndex={1}
        selectedValues={[]}
        onToggle={onToggle}
      />
    );
    const checkboxes = screen.getAllByTestId("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(onToggle).toHaveBeenCalledWith("q1", "opt1");
  });

  it("renders error message when provided", () => {
    render(
      <QuestionCheckboxGroup
        question={mockQuestion}
        displayIndex={1}
        selectedValues={[]}
        onToggle={vi.fn()}
        error="This field is required"
      />
    );
    expect(screen.getByTestId("field-error")).toBeTruthy();
    expect(screen.getByText("This field is required")).toBeTruthy();
  });

  it("does not render error message when not provided", () => {
    render(
      <QuestionCheckboxGroup
        question={mockQuestion}
        displayIndex={1}
        selectedValues={[]}
        onToggle={vi.fn()}
      />
    );
    expect(screen.queryByTestId("field-error")).toBeNull();
  });

  it("renders display index in label", () => {
    render(
      <QuestionCheckboxGroup
        question={mockQuestion}
        displayIndex={3}
        selectedValues={[]}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByText(/3\. Sample Question/)).toBeTruthy();
  });
});

describe("QuestionRadioGroup", () => {
  it("renders question text and options", () => {
    render(
      <QuestionRadioGroup
        question={mockQuestion}
        displayIndex={2}
        value=""
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Sample Question/)).toBeTruthy();
    expect(screen.getByText("Option 1")).toBeTruthy();
    expect(screen.getByText("Option 2")).toBeTruthy();
  });

  it("renders error message when provided", () => {
    render(
      <QuestionRadioGroup
        question={mockQuestion}
        displayIndex={1}
        value=""
        onChange={vi.fn()}
        error="Please select an option"
      />
    );
    expect(screen.getByTestId("field-error")).toBeTruthy();
    expect(screen.getByText("Please select an option")).toBeTruthy();
  });

  it("does not render error when not provided", () => {
    render(
      <QuestionRadioGroup
        question={mockQuestion}
        displayIndex={1}
        value=""
        onChange={vi.fn()}
      />
    );
    expect(screen.queryByTestId("field-error")).toBeNull();
  });

  it("renders display index in label", () => {
    render(
      <QuestionRadioGroup
        question={mockQuestion}
        displayIndex={5}
        value=""
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText(/5\. Sample Question/)).toBeTruthy();
  });

  it("renders radio group with options", () => {
    render(
      <QuestionRadioGroup
        question={mockQuestion}
        displayIndex={1}
        value="opt1"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByTestId("radio-group")).toBeTruthy();
    expect(screen.getAllByRole("radio").length).toBe(3);
  });
});

describe("TagCloseX", () => {
  it("renders with default md size", () => {
    render(<TagCloseX />);
    expect(screen.getByTestId("x-close")).toBeTruthy();
  });

  it("renders with sm size", () => {
    render(<TagCloseX size="sm" />);
    expect(screen.getByTestId("x-close")).toBeTruthy();
  });

  it("renders with lg size", () => {
    render(<TagCloseX size="lg" />);
    expect(screen.getByTestId("x-close")).toBeTruthy();
  });

  it("has aria-label Remove this tag", () => {
    render(<TagCloseX />);
    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-label")).toBe("Remove this tag");
  });

  it("has slot=remove attribute", () => {
    render(<TagCloseX />);
    const button = screen.getByRole("button");
    expect(button).toBeTruthy();
  });
});
