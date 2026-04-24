import { vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DynamicQuestionRenderer } from "@/components/assessment/DynamicQuestionRenderer";
import type { Question } from "@/types/questionTypes";

describe("DynamicQuestionRenderer - exclusive supplementalBenefits behavior", () => {
  it("selecting exclusive option deselects others and disables them; unchecking restores", async () => {
    const mockQuestion: Question = {
      key: "supplementalBenefits",
      questionText: "Do you offer benefits?",
      questionType: "MULTIPLE_CHOICE",
      optionGroups: [
        {
          groupName: "Retirement and Savings",
          options: [
            { label: "401K", value: "401K" },
            { label: "IRA", value: "IRA" },
            {
              label: "My company does not offer retirement/savings benefits",
              value: "My company does not offer retirement/savings benefits",
            },
          ],
        },
      ],
      validationRules: { type: "ARRAY", required: false },
    };

    const handleAnswerChange = vi.fn();

    render(
      <DynamicQuestionRenderer
        question={mockQuestion}
        answers={{ supplementalBenefits: [] }}
        onAnswerChange={handleAnswerChange}
        errors={{}}
      />
    );

    // Select a normal option first
    const opt401 = screen.getByText("401K");
    fireEvent.click(opt401);

    await waitFor(() => {
      expect(handleAnswerChange).toHaveBeenCalledWith("supplementalBenefits", ["401K"]);
    });

    // Reset mock calls
    handleAnswerChange.mockClear();

    // Select the exclusive option
    const exclusive = screen.getByText("My company does not offer retirement/savings benefits");
    fireEvent.click(exclusive);

    await waitFor(() => {
      // Should have been called with only the exclusive option
      expect(handleAnswerChange).toHaveBeenCalledWith(
        "supplementalBenefits",
        expect.arrayContaining(["My company does not offer retirement/savings benefits"])
      );
    });

    // Reset mock
    handleAnswerChange.mockClear();

    // Try clicking a normal option while exclusive is selected — should not call handler because option is disabled
    fireEvent.click(opt401);
    await waitFor(() => {
      expect(handleAnswerChange).not.toHaveBeenCalled();
    });

    // Uncheck exclusive
    fireEvent.click(exclusive);
    await waitFor(() => {
      // Should remove the exclusive option (empty array or absent)
      expect(handleAnswerChange).toHaveBeenCalledWith("supplementalBenefits", []);
    });

    handleAnswerChange.mockClear();

    // Now selecting a normal option should work again
    fireEvent.click(opt401);
    await waitFor(() => {
      expect(handleAnswerChange).toHaveBeenCalledWith("supplementalBenefits", ["401K"]);
    });
  });
});
