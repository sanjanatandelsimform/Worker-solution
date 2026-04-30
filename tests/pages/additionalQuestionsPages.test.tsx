import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import WorkforceSection from "../../src/pages/additionalQuestions/WorkforceSection";
import CompensationSection from "../../src/pages/additionalQuestions/CompensationSection";
import BenefitsRetirementSection from "../../src/pages/additionalQuestions/BenefitsRetirementSection";

// Mock common components
vi.mock("@/components/common/QuestionCheckboxGroup", () => ({
  QuestionCheckboxGroup: ({ question, displayIndex, selectedValues, onToggle, error }: any) => (
    <div data-testid={`checkbox-group-${question.id}`}>
      <label>
        {displayIndex}. {question.question}
      </label>
      {error && <span data-testid={`error-${question.id}`}>{error}</span>}
      {question.options.map((opt: any) => (
        <label key={opt.id}>
          <input
            type="checkbox"
            checked={selectedValues.includes(opt.id)}
            onChange={() => onToggle(question.id, opt.id)}
            data-testid={`checkbox-${opt.id}`}
          />
          {opt.label}
        </label>
      ))}
    </div>
  ),
}));

vi.mock("@/components/common/QuestionRadioGroup", () => ({
  QuestionRadioGroup: ({ question, displayIndex, value, onChange, error }: any) => (
    <div data-testid={`radio-group-${question.id}`}>
      <label>
        {displayIndex}. {question.question}
      </label>
      {error && <span data-testid={`error-${question.id}`}>{error}</span>}
      {question.options.map((opt: any) => (
        <label key={opt.id}>
          <input
            type="radio"
            value={opt.id}
            checked={value === opt.id}
            onChange={() => onChange(question.id, opt.id)}
            data-testid={`radio-${opt.id}`}
          />
          {opt.label}
        </label>
      ))}
    </div>
  ),
}));

vi.mock("@/components/base/input/label", () => ({
  Label: ({ children, isRequired, className }: any) => (
    <label className={className}>
      {children}
      {isRequired && <span>*</span>}
    </label>
  ),
}));

vi.mock("@/components/base/input/input", () => ({
  Input: ({ value, onChange, placeholder, type, hint, ...props }: any) => (
    <>
      <input
        value={value || ""}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        type={type || "text"}
        data-testid="input"
      />
      {hint && <span data-testid="input-hint">{hint}</span>}
    </>
  ),
  InputBase: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/base/radio-buttons/radio-buttons", () => ({
  RadioButton: ({ value }: any) => <input type="radio" value={value} data-testid={`radio-btn-${value}`} />,
  RadioGroup: ({ children, onChange, value, ...props }: any) => (
    <div data-testid="benefits-radio-group" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/base/select/select", () => ({
  Select: ({ children, onSelectionChange, selectedKey, placeholder, items, ...props }: any) => (
    <div data-testid="select-wrapper">
      <select
        value={selectedKey || ""}
        onChange={e => onSelectionChange && onSelectionChange(e.target.value)}
        data-testid="select"
        {...props}
      >
        <option value="">{placeholder}</option>
        {items?.map((item: any) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      {typeof children === "function" ? null : children}
    </div>
  ),
}));

vi.mock("@/components/base/select/select-item", () => ({
  SelectItem: ({ children, id, label }: any) => <option value={id}>{label || children}</option>,
}));

vi.mock("@/components/common/FieldError", () => ({
  FieldError: ({ message }: any) =>
    message ? <span data-testid="field-error">{message}</span> : null,
}));

vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children, title }: any) => (
    <div data-tooltip={title}>{children}</div>
  ),
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@untitledui/icons", () => ({
  InfoCircle: () => <span data-testid="info-circle" />,
  HelpCircle: () => <span />,
}));

vi.mock("@/data/monthOptions", () => ({
  monthOptions: [
    { id: "january", label: "January" },
    { id: "february", label: "February" },
  ],
}));

describe("WorkforceSection", () => {
  const defaultProps = {
    answers: {},
    fieldErrors: {},
    onAnswerChange: vi.fn(),
    onMultiSelectToggle: vi.fn(),
  };

  it("renders the section heading", () => {
    render(<WorkforceSection {...defaultProps} />);
    expect(screen.getByText("Workforce")).toBeTruthy();
  });

  it("renders checkbox groups for multi-select questions", () => {
    render(<WorkforceSection {...defaultProps} />);
    expect(screen.getByTestId("checkbox-group-benefits-updates")).toBeTruthy();
    expect(screen.getByTestId("checkbox-group-commute-methods")).toBeTruthy();
  });

  it("renders radio groups for single-select questions", () => {
    render(<WorkforceSection {...defaultProps} />);
    expect(screen.getByTestId("radio-group-deskless-employees")).toBeTruthy();
    expect(screen.getByTestId("radio-group-commute-duration")).toBeTruthy();
  });

  it("passes answers to question components", () => {
    render(
      <WorkforceSection
        {...defaultProps}
        answers={{ "deskless-employees": "yes-deskless", "benefits-updates": ["work_email"] }}
      />
    );
    const radioYes = screen.getByTestId("radio-yes-deskless");
    expect((radioYes as HTMLInputElement).checked).toBe(true);
  });

  it("passes field errors to question components", () => {
    render(
      <WorkforceSection
        {...defaultProps}
        fieldErrors={{ "benefits-updates": "This field is required" }}
      />
    );
    expect(screen.getByTestId("error-benefits-updates")).toBeTruthy();
    expect(screen.getByText("This field is required")).toBeTruthy();
  });

  it("calls onMultiSelectToggle when checkbox changed", () => {
    const onMultiSelectToggle = vi.fn();
    render(<WorkforceSection {...defaultProps} onMultiSelectToggle={onMultiSelectToggle} />);
    fireEvent.click(screen.getByTestId("checkbox-work_email"));
    expect(onMultiSelectToggle).toHaveBeenCalledWith("benefits-updates", "work_email");
  });

  it("calls onAnswerChange when radio changed", () => {
    const onAnswerChange = vi.fn();
    render(<WorkforceSection {...defaultProps} onAnswerChange={onAnswerChange} />);
    fireEvent.click(screen.getByTestId("radio-yes-deskless"));
    expect(onAnswerChange).toHaveBeenCalledWith("deskless-employees", "yes-deskless");
  });
});

describe("CompensationSection", () => {
  const defaultProps = {
    answers: {},
    fieldErrors: {},
    annualRaiseMonth: "",
    payrollProvider: "",
    onAnswerChange: vi.fn(),
    onMultiSelectToggle: vi.fn(),
    onAnnualRaiseMonthChange: vi.fn(),
    onPayrollProviderChange: vi.fn(),
    onClearFieldError: vi.fn(),
  };

  it("renders the section heading", () => {
    render(<CompensationSection {...defaultProps} />);
    expect(screen.getByText("Compensation")).toBeTruthy();
  });

  it("renders radio groups for compensation questions", () => {
    render(<CompensationSection {...defaultProps} />);
    expect(screen.getByTestId("radio-group-annual-raises")).toBeTruthy();
  });

  it("renders a select for payroll provider", () => {
    render(<CompensationSection {...defaultProps} />);
    // Payroll provider select is present
    const selects = screen.getAllByTestId("select");
    expect(selects.length).toBeGreaterThan(0);
  });

  it("passes field errors to components", () => {
    render(
      <CompensationSection {...defaultProps} fieldErrors={{ "annual-raises": "Required" }} />
    );
    expect(screen.getByTestId("error-annual-raises")).toBeTruthy();
  });

  it("shows annual raise month select when raises are yes", () => {
    render(
      <CompensationSection
        {...defaultProps}
        answers={{ "annual-raises": "yes-raises" }}
        annualRaiseMonth="january"
      />
    );
    // Should show month dropdown
    const selects = screen.getAllByTestId("select");
    expect(selects.length).toBeGreaterThan(1);
  });

  it("calls onAnswerChange when radio changed", () => {
    const onAnswerChange = vi.fn();
    render(<CompensationSection {...defaultProps} onAnswerChange={onAnswerChange} />);
    fireEvent.click(screen.getByTestId("radio-yes-raises"));
    expect(onAnswerChange).toHaveBeenCalledWith("annual-raises", "yes-raises");
  });

  it("calls onMultiSelectToggle for checkbox questions", () => {
    const onMultiSelectToggle = vi.fn();
    render(<CompensationSection {...defaultProps} onMultiSelectToggle={onMultiSelectToggle} />);
    // short-term-incentives is a checkbox group
    fireEvent.click(screen.getByTestId("checkbox-cash_bonuses"));
    expect(onMultiSelectToggle).toHaveBeenCalledWith("short-term-incentives", "cash_bonuses");
  });

  it("calls onPayrollProviderChange when select changes", () => {
    const onPayrollProviderChange = vi.fn();
    render(
      <CompensationSection {...defaultProps} onPayrollProviderChange={onPayrollProviderChange} />
    );
    const selects = screen.getAllByTestId("select");
    // Find the payroll select (likely first)
    fireEvent.change(selects[0], { target: { value: "ADP" } });
    expect(onPayrollProviderChange).toHaveBeenCalledWith("ADP");
  });

  it("calls onClearFieldError when select changes", () => {
    const onClearFieldError = vi.fn();
    render(<CompensationSection {...defaultProps} onClearFieldError={onClearFieldError} />);
    const selects = screen.getAllByTestId("select");
    fireEvent.change(selects[0], { target: { value: "Gusto" } });
    expect(onClearFieldError).toHaveBeenCalled();
  });
});

describe("BenefitsRetirementSection", () => {
  const defaultProps = {
    answers: {},
    fieldErrors: {},
    benefitsEnrollmentMonth: "",
    retirementMatchPercentage: "",
    healthPremiumMonthly: "",
    onAnswerChange: vi.fn(),
    onBenefitsEnrollmentMonthChange: vi.fn(),
    onRetirementMatchPercentageChange: vi.fn(),
    onHealthPremiumMonthlyChange: vi.fn(),
    onClearFieldError: vi.fn(),
  };

  it("renders the Benefits heading", () => {
    render(<BenefitsRetirementSection {...defaultProps} />);
    expect(screen.getByText(/Benefits/)).toBeTruthy();
  });

  it("renders the Retirement heading", () => {
    render(<BenefitsRetirementSection {...defaultProps} />);
    expect(screen.getByText("Retirement")).toBeTruthy();
  });

  it("renders a numeric input for health plan premium", () => {
    render(<BenefitsRetirementSection {...defaultProps} />);
    expect(screen.getByTestId("input")).toBeTruthy();
  });

  it("renders retirement questions using QuestionRadioGroup", () => {
    render(<BenefitsRetirementSection {...defaultProps} />);
    expect(screen.getByTestId("radio-group-retirement-vesting-period")).toBeTruthy();
    expect(screen.getByTestId("radio-group-retirement-employer-match")).toBeTruthy();
  });

  it("passes field errors to FieldError component", () => {
    render(
      <BenefitsRetirementSection
        {...defaultProps}
        fieldErrors={{ "benefits-enrollment-period": "Required" }}
      />
    );
    expect(screen.getByTestId("field-error")).toBeTruthy();
  });

  it("shows conditional retirement match percentage input when yes-match selected", () => {
    render(
      <BenefitsRetirementSection
        {...defaultProps}
        answers={{ "retirement-employer-match": "yes-match" }}
        retirementMatchPercentage="5"
      />
    );
    // Two inputs: health premium + match percentage
    const inputs = screen.getAllByTestId("input");
    expect(inputs.length).toBeGreaterThan(1);
  });

  it("calls onAnswerChange when retirement radio changed", () => {
    const onAnswerChange = vi.fn();
    render(<BenefitsRetirementSection {...defaultProps} onAnswerChange={onAnswerChange} />);
    fireEvent.click(screen.getByTestId("radio-6mo_or_less"));
    expect(onAnswerChange).toHaveBeenCalledWith("retirement-vesting-period", "6mo_or_less");
  });

  it("calls onBenefitsEnrollmentMonthChange when enrollment month changes", () => {
    const onBenefitsEnrollmentMonthChange = vi.fn();
    render(
      <BenefitsRetirementSection
        {...defaultProps}
        onBenefitsEnrollmentMonthChange={onBenefitsEnrollmentMonthChange}
      />
    );
    const select = screen.getByTestId("select");
    fireEvent.change(select, { target: { value: "january" } });
    expect(onBenefitsEnrollmentMonthChange).toHaveBeenCalledWith("january");
  });

  it("calls onHealthPremiumMonthlyChange when input changes", () => {
    const onHealthPremiumMonthlyChange = vi.fn();
    render(
      <BenefitsRetirementSection
        {...defaultProps}
        onHealthPremiumMonthlyChange={onHealthPremiumMonthlyChange}
      />
    );
    fireEvent.change(screen.getByTestId("input"), { target: { value: "250" } });
    expect(onHealthPremiumMonthlyChange).toHaveBeenCalledWith("250");
  });

  it("calls onClearFieldError when enrollment month changes", () => {
    const onClearFieldError = vi.fn();
    render(<BenefitsRetirementSection {...defaultProps} onClearFieldError={onClearFieldError} />);
    const select = screen.getByTestId("select");
    fireEvent.change(select, { target: { value: "february" } });
    expect(onClearFieldError).toHaveBeenCalled();
  });
});
