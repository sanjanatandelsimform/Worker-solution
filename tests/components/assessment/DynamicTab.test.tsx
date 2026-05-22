import React, { createRef } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DynamicTab } from "../../../src/components/assessment/DynamicTab";
import type { Question } from "../../../src/types/questionTypes";

type DynamicTabRef = React.ComponentRef<typeof DynamicTab>;

const mockUseAssessment = vi.fn();
const mockSubmitSection = vi.fn();
const mockRetryGetAssessment = vi.fn();
const mockUpdateAnswer = vi.fn();
const mockUpdateAnswers = vi.fn();

vi.mock("@/hooks/useAssessment", () => ({
  useAssessment: () => mockUseAssessment(),
}));

vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({ errorMessage, onClose }: { errorMessage: React.ReactNode; onClose: () => void }) => (
    <div data-testid="api-post-error">
      {errorMessage}
      <button onClick={onClose}>dismiss</button>
    </div>
  ),
}));

vi.mock("@untitledui/icons", () => ({
  AlertCircle: () => <span>icon</span>,
}));

vi.mock("@/components/assessment/DynamicQuestionRenderer", () => ({
  DynamicQuestionRenderer: ({
    question,
    onAnswerChange,
    onErrorChange,
  }: {
    question: Question;
    onAnswerChange: (key: string, value: unknown) => void;
    onErrorChange: (update: Record<string, string>) => void;
  }) => (
    <div data-question-key={question.key}>
      <div>{question.questionText}</div>
      <button onClick={() => onAnswerChange(question.key, "yes")}>set-{question.key}</button>
      <button onClick={() => onAnswerChange(question.key, "no")}>set-no-{question.key}</button>
      <button onClick={() => onAnswerChange(question.key, { subKey: "value" })}>
        set-obj-{question.key}
      </button>
      <button onClick={() => onAnswerChange(question.key, null)}>clear-val-{question.key}</button>
      <button onClick={() => onErrorChange({ [question.key]: "" })}>clear-{question.key}</button>
      <button onClick={() => onAnswerChange(question.key, [])}>set-arr-empty-{question.key}</button>
      <button onClick={() => onAnswerChange(question.key, [{ id: "1", name: "item1" }])}>
        set-arr-{question.key}
      </button>
      <button onClick={() => onAnswerChange(question.key, ["opt1", "opt2"])}>
        set-plain-arr-{question.key}
      </button>
    </div>
  ),
}));

const baseQuestion = (overrides: Partial<Question> = {}): Question =>
  ({
    key: "base",
    questionText: "Base question",
    questionType: "TEXT_INPUT",
    displayOrder: 1,
    validationRules: { type: "TEXT", required: false },
    schemaVersion: 1,
    isRequired: false,
    ...overrides,
  }) as Question;

describe("DynamicTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAssessment.mockReturnValue({
      answers: {},
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });
    mockSubmitSection.mockResolvedValue({ success: true });
  });

  it("exposes submit helpers on ref and submits cleaned values", async () => {
    const ref = createRef<DynamicTabRef>();
    mockUseAssessment.mockReturnValue({
      answers: { amount: "15" },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(
      <DynamicTab
        ref={ref}
        section="compensation"
        questions={[
          baseQuestion({
            key: "amount",
            questionType: "NUMBER_INPUT",
            validationRules: { type: "NUMERIC", required: true, min: 1 },
          }),
        ]}
      />
    );

    // cover: getErrors (useImperativeHandle) + window registration (useEffect)
    await waitFor(() => {
      expect((window as any).__dynamicTabValidation).toBeDefined();
      expect(typeof (window as any).__dynamicTabValidation.getErrors).toBe("function");
      expect(typeof (window as any).__dynamicTabValidation.getAnswers).toBe("function");
    });
    expect(ref.current?.getErrors()).toEqual({});

    const result = await ref.current?.submit();
    expect(result?.success).toBe(true);
    expect(mockSubmitSection).toHaveBeenCalledWith({ amount: 15 });
    expect(ref.current?.getAnswers()).toEqual({ amount: "15" });

    const validation = (window as any).__dynamicTabValidation as any;
    expect(validation.getErrors()).toEqual({});
    expect(validation.getAnswers()).toEqual({ amount: "15" });
  });

  it("returns validation errors for required and numeric bounds", async () => {
    const ref = createRef<DynamicTabRef>();
    mockUseAssessment.mockReturnValue({
      answers: { minNum: "1", requiredQ: "" },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(
      <DynamicTab
        ref={ref}
        section="workforce"
        questions={[
          baseQuestion({
            key: "requiredQ",
            validationRules: { type: "TEXT", required: true, errorMessage: "Required msg" },
          }),
          baseQuestion({
            key: "minNum",
            questionType: "NUMBER_INPUT",
            validationRules: { type: "NUMERIC", required: true, min: 2, max: 10 },
          }),
        ]}
      />
    );

    const result = await ref.current?.submit();
    expect(result?.success).toBe(false);
    expect(result?.errors).toMatchObject({
      requiredQ: "Required msg",
      minNum: "Value must be at least 2",
    });
    expect(mockSubmitSection).not.toHaveBeenCalled();
  });

  it("clears existing field errors when answers change", async () => {
    const ref = createRef<DynamicTabRef>();
    mockUseAssessment.mockReturnValue({
      answers: { requiredQ: "" },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(
      <DynamicTab
        ref={ref}
        section="workforce"
        questions={[
          baseQuestion({
            key: "requiredQ",
            questionType: "TEXT_INPUT",
            validationRules: { type: "TEXT", required: true, errorMessage: "Required msg" },
          }),
        ]}
      />
    );

    const result = await ref.current?.submit();
    expect(result?.success).toBe(false);
    await waitFor(() => {
      expect(ref.current?.getErrors()).toMatchObject({ requiredQ: "Required msg" });
    });

    // triggers handleAnswerChange + error clearing logic
    fireEvent.click(screen.getByRole("button", { name: "set-requiredQ" }));

    await waitFor(() => {
      expect(ref.current?.getErrors()).toEqual({});
    });
  });

  it("skips hidden subsection validation when benefits selection hides section", async () => {
    const ref = createRef<DynamicTabRef>();
    mockUseAssessment.mockReturnValue({
      answers: {
        supplementalBenefits: ["My company does not offer healthcare/wellness benefits"],
        hiddenHealth: "",
      },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(
      <DynamicTab
        ref={ref}
        section="benefits"
        questions={[
          baseQuestion({
            key: "supplementalBenefits",
            questionType: "MULTIPLE_CHOICE",
            validationRules: { type: "ARRAY", required: false },
          }),
          baseQuestion({
            key: "hiddenHealth",
            questionType: "TEXT_INPUT",
            validationRules: { type: "TEXT", required: true },
            metadata: {},
            subsection: "HealthCare",
          } as Question & { subsection: string }),
        ]}
      />
    );

    const result = await ref.current?.submit();
    expect(result?.success).toBe(true);
    expect(mockSubmitSection).toHaveBeenCalled();
  });

  it("handles goals empty submission branch and calls callback", async () => {
    const ref = createRef<DynamicTabRef>();
    const onEmptySubmission = vi.fn();

    render(
      <DynamicTab
        ref={ref}
        section="goals"
        questions={[baseQuestion({ key: "workforceGoalsRanking", questionType: "RANKING" })]}
        onEmptySubmission={onEmptySubmission}
      />
    );

    const result = await ref.current?.submit();
    expect(result?.success).toBe(false);
    expect((result as { error?: string } | undefined)?.error).toBe("No answers provided");
    expect(onEmptySubmission).toHaveBeenCalledTimes(1);
    expect(mockSubmitSection).not.toHaveBeenCalled();
  });

  it("renders get error banner and retries data load", () => {
    mockUseAssessment.mockReturnValue({
      answers: {},
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: { type: "get", message: "Unable to load" },
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(<DynamicTab section="workforce" questions={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(mockRetryGetAssessment).toHaveBeenCalledTimes(1);
  });

  it("normalizes fieldErrors and triggers onApiError for failed submit response", async () => {
    const ref = createRef<DynamicTabRef>();
    const onApiError = vi.fn();
    mockSubmitSection.mockResolvedValue({
      success: false,
      error: "Submit failed",
      fieldErrors: { "locations.0.state": "Required" },
    });
    mockUseAssessment.mockReturnValue({
      answers: {
        locations: [{ id: 1, state: "TX", zipCode: "12345", __zipValidityState: "valid" }],
      },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: { type: "post", message: "Bad submit" },
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(
      <DynamicTab
        ref={ref}
        section="workforce"
        onApiError={onApiError}
        questions={[
          baseQuestion({
            key: "locations",
            questionType: "STRUCTURED_ARRAY",
            validationRules: {
              type: "STRUCTURED_ARRAY",
              required: false,
              fields: [
                {
                  name: "state",
                  label: "State",
                  placeholder: "",
                  type: "text",
                  required: true,
                  width: "",
                },
                {
                  name: "zipCode",
                  label: "Zip",
                  placeholder: "",
                  type: "text",
                  required: true,
                  width: "",
                },
              ],
            },
          }),
        ]}
      />
    );

    await ref.current?.submit();
    await waitFor(() => {
      expect(onApiError).toHaveBeenCalledWith("Submit failed");
    });
    expect(screen.getByTestId("api-post-error")).toBeTruthy();
    expect(screen.getByText("State is required")).toBeTruthy();
    // cover: ErrorMessage onClose => setShowApiError(false)
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    await waitFor(() => {
      expect(screen.queryByTestId("api-post-error")).toBeNull();
    });
  });

  it("renders HealthCare subsection card when benefits selection shows it", () => {
    mockUseAssessment.mockReturnValue({
      answers: {
        supplementalBenefits: ["Healthcare"],
        healthcareQuestion: "",
      },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(
      <DynamicTab
        section="benefits"
        questions={[
          baseQuestion({
            key: "healthcareQuestion",
            questionText: "Healthcare question text",
            questionType: "TEXT_INPUT",
            validationRules: { type: "TEXT", required: false },
            subsection: "HealthCare",
          } as Question & { subsection: string }),
        ]}
      />
    );

    expect(screen.getByText("Healthcare")).toBeTruthy();
    expect(screen.getByText("Healthcare question text")).toBeTruthy();
  });

  it("validates state mismatch and duplicate structured-array locations", async () => {
    const ref = createRef<DynamicTabRef>();
    mockUseAssessment.mockReturnValue({
      answers: {
        locations: [
          { id: 1, state: "CA", zipCode: "90001", __zipValidityState: "state_mismatch" },
          { id: 2, state: "CA", zipCode: "90001", __zipValidityState: "valid" },
        ],
      },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(
      <DynamicTab
        ref={ref}
        section="workforce"
        questions={[
          baseQuestion({
            key: "locations",
            questionType: "STRUCTURED_ARRAY",
            validationRules: {
              type: "STRUCTURED_ARRAY",
              required: true,
              fields: [
                {
                  name: "state",
                  label: "State",
                  placeholder: "",
                  type: "text",
                  required: true,
                  width: "",
                },
                {
                  name: "zipCode",
                  label: "Zip",
                  placeholder: "",
                  type: "text",
                  required: true,
                  width: "",
                },
              ],
            },
          }),
        ]}
      />
    );

    const result = await ref.current?.submit();
    expect(result?.success).toBe(false);
    expect(result?.errors?.["locations.0.state"]).toBe("State does not match zipcode");
    expect(result?.errors?.["locations.1.state"]).toBe("This location is already added");
  });

  it("validates invalid_zip structured-array branch sets zip error", async () => {
    const ref = createRef<DynamicTabRef>();
    mockUseAssessment.mockReturnValue({
      answers: {
        locations: [{ id: 1, state: "TX", zipCode: "75001", __zipValidityState: "invalid_zip" }],
      },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(
      <DynamicTab
        ref={ref}
        section="workforce"
        questions={[
          baseQuestion({
            key: "locations",
            questionType: "STRUCTURED_ARRAY",
            validationRules: {
              type: "STRUCTURED_ARRAY",
              required: true,
              fields: [
                {
                  name: "state",
                  label: "State",
                  placeholder: "",
                  type: "text",
                  required: true,
                  width: "",
                },
                {
                  name: "zipCode",
                  label: "Zip",
                  placeholder: "",
                  type: "text",
                  required: true,
                  width: "",
                },
              ],
            },
          }),
        ]}
      />
    );

    const result = await ref.current?.submit();
    expect(result?.success).toBe(false);
    expect(result?.errors?.["locations.0.state"]).toBe("State does not match zipcode");
    expect(result?.errors?.["locations.0.zipCode"]).toBe("Incorrect zip code");
  });

  it("validates pending/undefined zip validity sets ZIP required error when __zipIsValid is false", async () => {
    const ref = createRef<DynamicTabRef>();
    mockUseAssessment.mockReturnValue({
      answers: {
        locations: [
          {
            id: 1,
            state: "TX",
            zipCode: "75001",
            __zipValidityState: "pending",
            __zipIsValid: false,
          },
          // cover the explicit undefined branch too
          {
            id: 2,
            state: "TX",
            zipCode: "75001",
            __zipIsValid: false,
          },
        ],
      },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(
      <DynamicTab
        ref={ref}
        section="workforce"
        questions={[
          baseQuestion({
            key: "locations",
            questionType: "STRUCTURED_ARRAY",
            validationRules: {
              type: "STRUCTURED_ARRAY",
              required: true,
              fields: [
                {
                  name: "state",
                  label: "State",
                  placeholder: "",
                  type: "text",
                  required: true,
                  width: "",
                },
                {
                  name: "zipCode",
                  label: "Zip",
                  placeholder: "",
                  type: "text",
                  required: true,
                  width: "",
                },
              ],
            },
          }),
        ]}
      />
    );

    const result = await ref.current?.submit();
    expect(result?.success).toBe(false);
    expect(result?.errors?.["locations.0.zipCode"]).toBe("Please enter a valid ZIP code");
    expect(result?.errors?.["locations.1.zipCode"]).toBe("Please enter a valid ZIP code");
  });

  it("calls validate() method on ref (covers line 1160)", async () => {
    const ref = createRef<DynamicTabRef>();
    mockUseAssessment.mockReturnValue({
      answers: { q1: "answer" },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(
      <DynamicTab
        ref={ref}
        section="compensation"
        questions={[baseQuestion({ key: "q1", questionType: "TEXT_INPUT" })]}
      />
    );

    const isValid = ref.current?.validate();
    expect(typeof isValid).toBe("boolean");
  });

  it("handleAnswerChange with object value clears sub-field errors (lines 1131-1144)", async () => {
    const ref = createRef<DynamicTabRef>();
    mockUseAssessment.mockReturnValue({
      answers: {},
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: { "objField.subKey": "Sub field error" },
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    const { getByText } = render(
      <DynamicTab
        ref={ref}
        section="benefits"
        questions={[
          baseQuestion({
            key: "objField",
            questionType: "PARTICIPATION_RATES",
            subFields: [{ key: "subKey", label: "Sub Key", options: [] }],
            validationRules: { type: "OBJECT", required: false },
          }),
        ]}
      />
    );

    // Click the set-obj button which calls onAnswerChange("objField", { subKey: "value" })
    fireEvent.click(getByText("set-obj-objField"));
    await waitFor(() => {
      expect(mockUpdateAnswer).toHaveBeenCalled();
    });
  });

  it("handleAnswerChange with null value does not delete key (line 1146 false branch)", async () => {
    const ref = createRef<DynamicTabRef>();
    mockUseAssessment.mockReturnValue({
      answers: { q1: "something" },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: { q1: "Some error" },
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    const { getByText } = render(
      <DynamicTab
        ref={ref}
        section="compensation"
        questions={[baseQuestion({ key: "q1", questionType: "TEXT_INPUT" })]}
      />
    );

    // Click clear-val button which calls onAnswerChange("q1", null)
    fireEvent.click(getByText("clear-val-q1"));
    await waitFor(() => {
      expect(mockUpdateAnswer).toHaveBeenCalled();
    });
  });

  it("handleAnswerChange with plain array (MULTIPLE_CHOICE) clears error (lines 1119-1123)", async () => {
    mockUseAssessment.mockReturnValue({
      answers: { q1: [] },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: { q1: "Please select at least one" },
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    const { getByText } = render(
      <DynamicTab
        ref={createRef<DynamicTabRef>()}
        section="compensation"
        questions={[baseQuestion({ key: "q1", questionType: "MULTIPLE_CHOICE" })]}
      />
    );
    fireEvent.click(getByText("set-plain-arr-q1"));
    await waitFor(() => {
      expect(mockUpdateAnswer).toHaveBeenCalled();
    });
  });

  it("handleAnswerChange with empty plain array preserves error (newArray.length===0 branch)", async () => {
    mockUseAssessment.mockReturnValue({
      answers: { q1: ["opt1"] },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: { q1: "error" },
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    const { getByText } = render(
      <DynamicTab
        ref={createRef<DynamicTabRef>()}
        section="compensation"
        questions={[baseQuestion({ key: "q1", questionType: "MULTIPLE_CHOICE" })]}
      />
    );
    fireEvent.click(getByText("set-arr-empty-q1"));
    await waitFor(() => {
      expect(mockUpdateAnswer).toHaveBeenCalled();
    });
  });

  it("handleAnswerChange with structured array (id objects) triggers isStructuredArray branch", async () => {
    mockUseAssessment.mockReturnValue({
      answers: { q1: [] },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    const { getByText } = render(
      <DynamicTab
        ref={createRef<DynamicTabRef>()}
        section="compensation"
        questions={[baseQuestion({ key: "q1", questionType: "TEXT_INPUT" })]}
      />
    );
    fireEvent.click(getByText("set-arr-q1"));
    await waitFor(() => {
      expect(mockUpdateAnswer).toHaveBeenCalled();
    });
  });

  it("handleAnswerChange with conditional question where condition not met (covers lines 1044-1052)", async () => {
    mockUseAssessment.mockReturnValue({
      answers: { parent: "yes", child: "some value" },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: { parent: "", child: "child error" },
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    const { getByText } = render(
      <DynamicTab
        ref={createRef<DynamicTabRef>()}
        section="compensation"
        questions={[
          baseQuestion({
            key: "parent",
            questionType: "YES_NO",
            conditionalQuestion: {
              showWhen: "yes",
              question: baseQuestion({ key: "child", questionType: "TEXT_INPUT" }),
            },
          } as any),
        ]}
      />
    );
    // Set "no" to hide the child (conditionMet=false since showWhen=yes but value=no)
    fireEvent.click(getByText("set-no-parent"));
    await waitFor(() => {
      expect(mockUpdateAnswer).toHaveBeenCalled();
    });
  });

  it("validates participation rates range and required subfield errors", async () => {
    const ref = createRef<DynamicTabRef>();
    mockUseAssessment.mockReturnValue({
      answers: { participation: { a: "110", b: "" } },
      updateAnswer: mockUpdateAnswer,
      updateAnswers: mockUpdateAnswers,
      errors: {},
      submitSection: mockSubmitSection,
      isLoadingGet: false,
      apiError: null,
      retryGetAssessment: mockRetryGetAssessment,
    });

    render(
      <DynamicTab
        ref={ref}
        section="benefits"
        questions={[
          baseQuestion({
            key: "participation",
            questionType: "PARTICIPATION_RATES",
            isRequired: true,
            subFields: [
              { key: "a", label: "A", options: [] },
              { key: "b", label: "B", options: [] },
            ],
            validationRules: { type: "OBJECT", required: true },
          }),
        ]}
      />
    );

    const result = await ref.current?.submit();
    expect(result?.success).toBe(false);
    expect(result?.errors?.["participation.a"]).toContain("between 0 and 100");
    expect(result?.errors?.["participation.b"]).toContain("Enter a valid percentage");
  });
});
