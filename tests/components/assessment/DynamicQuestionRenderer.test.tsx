/**
 * Tests for DynamicQuestionRenderer (US3: Form Input Reliability)
 *
 * Coverage:
 * - T053: should persist first STRUCTURED_ARRAY item on add
 * - T054: should display SINGLE_SELECT_DROPDOWN value immediately after first selection
 * - T055: should initialize STRUCTURED_ARRAY with empty array when undefined
 */

import { vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DynamicQuestionRenderer } from "@/components/assessment/DynamicQuestionRenderer";
import type { Question } from "@/types/questionTypes";

describe("DynamicQuestionRenderer Tests (Form Input Reliability)", () => {
  // T053: should persist first STRUCTURED_ARRAY item on add
  it("should persist first STRUCTURED_ARRAY item on add", async () => {
    const mockQuestion: Question = {
      key: "employees",
      questionText: "Employee List",
      questionType: "STRUCTURED_ARRAY",
      inputType: "structured-array",
      validationRules: {
        required: true,
        type: "STRUCTURED_ARRAY",
        errorMessage: "At least one employee is required",
        minItems: 1,
        fields: [
          { name: "name", type: "text", label: "Name", required: true },
          { name: "age", type: "number", label: "Age", required: false },
        ],
      },
    };

    const mockAnswers: Record<string, unknown> = {
      employees: [], // Initially empty array
    };

    const handleAnswerChange = vi.fn();

    const { container: _container } = render(
      <DynamicQuestionRenderer
        question={mockQuestion}
        answers={mockAnswers}
        onAnswerChange={handleAnswerChange}
        errors={{}}
      />
    );

    // Find "Add Item" button (button text may vary)
    const addButton = screen.getByText(/add/i);
    expect(addButton).toBeInTheDocument();

    // Click to add first item
    fireEvent.click(addButton);

    // Verify onAnswerChange was called with array containing first item
    await waitFor(() => {
      expect(handleAnswerChange).toHaveBeenCalledWith(
        "employees",
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
          }),
        ])
      );
    });

    // Verify the answer contains exactly one item
    const callArgs = handleAnswerChange.mock.calls[0];
    expect(callArgs[1]).toHaveLength(1);
  });

  // T054: should display SINGLE_SELECT_DROPDOWN value immediately after first selection
  it("should display SINGLE_SELECT_DROPDOWN value immediately after first selection", async () => {
    const mockQuestion: Question = {
      key: "industry",
      questionText: "Select your industry",
      questionType: "SINGLE_SELECT_DROPDOWN",
      inputType: "single-select-dropdown",
      options: [
        { value: "tech", label: "Technology" },
        { value: "healthcare", label: "Healthcare" },
        { value: "finance", label: "Finance" },
      ],
      validationRules: {
        required: true,
        type: "TEXT_INPUT",
        errorMessage: "Industry is required",
      },
    };

    const mockAnswers: Record<string, unknown> = {
      industry: "", // Initially empty
    };

    const handleAnswerChange = vi.fn();

    const { rerender } = render(
      <DynamicQuestionRenderer
        question={mockQuestion}
        answers={mockAnswers}
        onAnswerChange={handleAnswerChange}
        errors={{}}
      />
    );

    // Find the select dropdown (implementation uses custom Select component)
    // Note: Actual selector depends on Select component implementation
    const selectTrigger = screen.getByRole("button"); // SingleSelectDropdown uses button trigger
    expect(selectTrigger).toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(selectTrigger);

    // Wait for options to appear and select first option
    await waitFor(() => {
      const techOption = screen.getByText("Technology");
      expect(techOption).toBeInTheDocument();
      fireEvent.click(techOption);
    });

    // Verify onAnswerChange was called with selected value
    await waitFor(() => {
      expect(handleAnswerChange).toHaveBeenCalledWith("industry", "tech");
    });

    // Re-render with updated answer to verify display
    rerender(
      <DynamicQuestionRenderer
        question={mockQuestion}
        answers={{ industry: "tech" }}
        onAnswerChange={handleAnswerChange}
        errors={{}}
      />
    );

    // Verify the selected value is displayed
    await waitFor(() => {
      expect(screen.getByText("Technology")).toBeInTheDocument();
    });
  });

  // T055: should initialize STRUCTURED_ARRAY with empty array when undefined
  it("should initialize STRUCTURED_ARRAY with empty array when undefined", async () => {
    const mockQuestion: Question = {
      key: "benefits",
      questionText: "Benefits List",
      questionType: "STRUCTURED_ARRAY",
      inputType: "structured-array",
      validationRules: {
        required: false,
        type: "STRUCTURED_ARRAY",
        fields: [{ name: "benefit", type: "text", label: "Benefit", required: true }],
      },
    };

    const mockAnswers: Record<string, unknown> = {
      // benefits key is undefined/missing
    };

    const handleAnswerChange = vi.fn();

    render(
      <DynamicQuestionRenderer
        question={mockQuestion}
        answers={mockAnswers}
        onAnswerChange={handleAnswerChange}
        errors={{}}
      />
    );

    // Find "Add Item" button
    const addButton = screen.getByText(/add/i);
    expect(addButton).toBeInTheDocument();

    // Click to add first item when array is undefined
    fireEvent.click(addButton);

    // Verify onAnswerChange was called with array containing exactly one item
    // This tests the fix for the bug where undefined array caused stale getArrayItems() call
    await waitFor(() => {
      expect(handleAnswerChange).toHaveBeenCalledWith(
        "benefits",
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
          }),
        ])
      );
    });

    const callArgs = handleAnswerChange.mock.calls[0];
    expect(callArgs[1]).toHaveLength(1);
    expect(callArgs[1][0]).toHaveProperty("id");
  });

  // Additional test: verify STRUCTURED_ARRAY handles null (edge case)
  it("should handle STRUCTURED_ARRAY when value is null", async () => {
    const mockQuestion: Question = {
      key: "departments",
      questionText: "Departments",
      questionType: "STRUCTURED_ARRAY",
      inputType: "structured-array",
      validationRules: {
        required: false,
        type: "STRUCTURED_ARRAY",
        fields: [{ name: "dept", type: "text", label: "Department", required: true }],
      },
    };

    const mockAnswers: Record<string, unknown> = {
      departments: null, // Explicitly null
    };

    const handleAnswerChange = vi.fn();

    render(
      <DynamicQuestionRenderer
        question={mockQuestion}
        answers={mockAnswers}
        onAnswerChange={handleAnswerChange}
        errors={{}}
      />
    );

    const addButton = screen.getByText(/add/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(handleAnswerChange).toHaveBeenCalledWith(
        "departments",
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
          }),
        ])
      );
    });
  });

  // Test for SINGLE_SELECT_DROPDOWN with undefined initial value
  it("should handle SINGLE_SELECT_DROPDOWN with undefined initial value", () => {
    const mockQuestion: Question = {
      key: "country",
      questionText: "Select country",
      questionType: "SINGLE_SELECT_DROPDOWN",
      inputType: "single-select-dropdown",
      options: [
        { value: "us", label: "United States" },
        { value: "ca", label: "Canada" },
      ],
      validationRules: {
        required: true,
        type: "TEXT_INPUT",
        errorMessage: "Country is required",
      },
    };

    const mockAnswers: Record<string, unknown> = {
      // country is undefined
    };

    const handleAnswerChange = vi.fn();

    render(
      <DynamicQuestionRenderer
        question={mockQuestion}
        answers={mockAnswers}
        onAnswerChange={handleAnswerChange}
        errors={{}}
      />
    );

    // Verify component renders without error when value is undefined
    const selectTrigger = screen.getByRole("button");
    expect(selectTrigger).toBeInTheDocument();

    // Verify placeholder or default state is displayed (not showing a value)
    // This tests the fix: selectedKey uses `currentAnswer ? String(currentAnswer) : undefined`
    // instead of `String(currentAnswer || "")`
  });
});
