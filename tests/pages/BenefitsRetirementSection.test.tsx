import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import BenefitsRetirementSection from "@/pages/additionalQuestions/BenefitsRetirementSection";
import type { QuestionAnswer } from "@/types/additionalQuestionsTypes";

describe("BenefitsRetirementSection - number input wheel behavior", () => {
  const createProps = (overrides?: Partial<Parameters<typeof BenefitsRetirementSection>[0]>) => ({
    answers: {
      "benefits-broker": "yes-broker",
      "benefits-enrollment-period": "january",
      "retirement-employer-match": "yes-match",
    } as QuestionAnswer,
    fieldErrors: {},
    benefitsEnrollmentMonth: "january",
    retirementMatchPercentage: "5",
    healthPremiumMonthly: "300",
    onAnswerChange: vi.fn(),
    onBenefitsEnrollmentMonthChange: vi.fn(),
    onRetirementMatchPercentageChange: vi.fn(),
    onHealthPremiumMonthlyChange: vi.fn(),
    onClearFieldError: vi.fn(),
    ...overrides,
  });

  it("blurs health premium input on mouse wheel", () => {
    render(<BenefitsRetirementSection {...createProps()} />);

    const healthPremiumInput = screen.getByPlaceholderText("Enter amount") as HTMLInputElement;

    healthPremiumInput.focus();
    expect(document.activeElement).toBe(healthPremiumInput);

    fireEvent.wheel(healthPremiumInput);

    expect(document.activeElement).not.toBe(healthPremiumInput);
  });

  it("blurs retirement match percentage input on mouse wheel", () => {
    render(<BenefitsRetirementSection {...createProps()} />);

    const retirementMatchInput = screen.getByPlaceholderText("e.g. 3") as HTMLInputElement;

    retirementMatchInput.focus();
    expect(document.activeElement).toBe(retirementMatchInput);

    fireEvent.wheel(retirementMatchInput);

    expect(document.activeElement).not.toBe(retirementMatchInput);
  });
});
