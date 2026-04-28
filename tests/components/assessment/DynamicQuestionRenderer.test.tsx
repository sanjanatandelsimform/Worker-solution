/**
 * DynamicQuestionRenderer Tests
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { DynamicQuestionRenderer } from "@/components/assessment/DynamicQuestionRenderer";

vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));

describe("DynamicQuestionRenderer", () => {
  const baseProps = {
    answers: {} as Record<string, unknown>,
    errors: {} as Record<string, string>,
    onAnswerChange: vi.fn(),
    onErrorChange: vi.fn(),
  };

  it("should render a text input question", () => {
    const { container } = render(
      <DynamicQuestionRenderer
        {...baseProps}
        question={
          {
            key: "q1",
            label: "Test Question",
            questionType: "TEXT_INPUT",
            isRequired: false,
            displayOrder: 1,
          } as any
        }
      />
    );
    expect(container.querySelector('[data-question-key="q1"]')).toBeInTheDocument();
  });

  it("should render number input question", () => {
    const { container } = render(
      <DynamicQuestionRenderer
        {...baseProps}
        question={
          {
            key: "num1",
            label: "Number Q",
            questionType: "NUMBER_INPUT",
            isRequired: false,
            displayOrder: 1,
          } as any
        }
      />
    );
    expect(container.querySelector('[data-question-key="num1"]')).toBeInTheDocument();
  });

  it("should render multiple choice question", () => {
    const { container } = render(
      <DynamicQuestionRenderer
        {...baseProps}
        question={
          {
            key: "mc1",
            label: "Multi Choice",
            questionType: "MULTIPLE_CHOICE",
            isRequired: false,
            displayOrder: 1,
            options: [
              { label: "Option A", value: "a" },
              { label: "Option B", value: "b" },
            ],
          } as any
        }
      />
    );
    expect(container.querySelector('[data-question-key="mc1"]')).toBeInTheDocument();
  });
});
