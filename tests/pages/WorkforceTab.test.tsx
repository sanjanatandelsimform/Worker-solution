/**
 * WorkforceTab integration tests for states API injection
 *
 * Strategy: Mock DynamicTab to capture the `questions` prop and verify
 * that WorkforceTab correctly clones questions and injects API-sourced
 * state options before passing them downstream.
 *
 * T008 [US1]: Verifies state option injection into topWorkLocations and
 *             employeeLivingZipCodes questions.
 * T013 [US2]: Verifies single-fetch constraint under re-renders.
 * T015-T017 [US3]: Verifies error/loading/empty-state handling.
 *
 * TDD: Written BEFORE WorkforceTab implementation changes (Red phase).
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import WorkforceTab from "@/pages/assessmentWorkforce/WorkforceTab";
import { getStates } from "@/services/api/assessmentApi";
import type { Question } from "@/types/questionTypes";

// Capture the questions prop passed to DynamicTab
let capturedQuestions: Question[] = [];

// Mock DynamicTab to avoid heavy rendering (819 lines + react-aria-components)
// This makes the test fast and focused on WorkforceTab's data transformation
vi.mock("@/components/assessment/DynamicTab", () => ({
  DynamicTab: (props: { questions: Question[]; section: string }) => {
    capturedQuestions = props.questions;
    return <div data-testid="dynamic-tab">{props.section}</div>;
  },
}));

// Mock the API module
vi.mock("@/services/api/assessmentApi", () => ({
  getStates: vi.fn(),
  getAssessment: vi.fn(),
  submitWorkforce: vi.fn(),
  submitCompensation: vi.fn(),
  submitBenefits: vi.fn(),
  submitGoals: vi.fn(),
}));

const mockGetStates = vi.mocked(getStates);

/** Small set of test states — NOT the full 50 hardcoded states */
const mockStatesResponse = {
  data: {
    states: [
      { stateAbbreviation: "NY", stateName: "New York" },
      { stateAbbreviation: "CA", stateName: "California" },
      { stateAbbreviation: "TX", stateName: "Texas" },
    ],
  },
};

const expectedTransformedOptions = [
  { id: "NY", label: "New York" },
  { id: "CA", label: "California" },
  { id: "TX", label: "Texas" },
];

function renderWorkforceTab() {
  return render(
    <BrowserRouter>
      <WorkforceTab onNext={vi.fn()} onSuccess={vi.fn()} />
    </BrowserRouter>
  );
}

/** Helper: find a question by key in the captured questions array */
function findQuestion(key: string): Question | undefined {
  return capturedQuestions.find(q => (q as Record<string, unknown>).key === key);
}

/** Helper: get options from topWorkLocations question's first field */
function getTopWorkLocationsOptions() {
  const q = findQuestion("topWorkLocations") as Record<string, unknown> | undefined;
  if (!q) return undefined;
  const rules = q.validationRules as Record<string, unknown> | undefined;
  const fields = rules?.fields as Array<Record<string, unknown>> | undefined;
  return fields?.[0]?.options;
}

/** Helper: get options from employeeLivingZipCodes conditional question's first field */
function getConditionalStateOptions() {
  const q = findQuestion("employeesResideInSameZipCodes") as Record<string, unknown> | undefined;
  if (!q) return undefined;
  const conditional = q.conditionalQuestion as Record<string, unknown> | undefined;
  const innerQ = conditional?.question as Record<string, unknown> | undefined;
  const rules = innerQ?.validationRules as Record<string, unknown> | undefined;
  const fields = rules?.fields as Array<Record<string, unknown>> | undefined;
  return fields?.[0]?.options;
}

// --- T008 [US1]: State option injection ---

describe("WorkforceTab — state option injection (US1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedQuestions = [];
    mockGetStates.mockResolvedValue(mockStatesResponse);
  });

  it("should call getStates on mount", async () => {
    renderWorkforceTab();

    await waitFor(() => {
      expect(mockGetStates).toHaveBeenCalledTimes(1);
    });
  });

  it("should inject API-sourced options into topWorkLocations state field", async () => {
    renderWorkforceTab();

    await waitFor(() => {
      const options = getTopWorkLocationsOptions();
      expect(options).toEqual(expectedTransformedOptions);
    });
  });

  it("should inject API-sourced options into employeeLivingZipCodes conditional state field", async () => {
    renderWorkforceTab();

    await waitFor(() => {
      const options = getConditionalStateOptions();
      expect(options).toEqual(expectedTransformedOptions);
    });
  });

  it("should not modify other questions' options", async () => {
    renderWorkforceTab();

    await waitFor(() => {
      // educationLevel question should exist and not have its options tampered with
      const eduQ = findQuestion("educationLevel") as Record<string, unknown> | undefined;
      expect(eduQ).toBeDefined();

      // Verify topWorkLocations has API options (confirming injection happened)
      const topOpts = getTopWorkLocationsOptions();
      expect(topOpts).toEqual(expectedTransformedOptions);

      // educationLevel has its own options — they should remain unchanged (not set to API states)
      const eduRules = eduQ?.validationRules as Record<string, unknown> | undefined;
      const eduFields = eduRules?.fields as Array<Record<string, unknown>> | undefined;
      if (eduFields?.[0]?.options) {
        expect(eduFields[0].options).not.toEqual(expectedTransformedOptions);
      }
    });
  });

  it("should pass all workforce questions to DynamicTab", async () => {
    renderWorkforceTab();

    await waitFor(() => {
      // Workforce section has multiple questions — all should be passed through
      expect(capturedQuestions.length).toBeGreaterThan(0);
    });
  });
});

// --- T013 [US2]: Single-fetch constraint ---

describe("WorkforceTab — single-fetch constraint (US2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedQuestions = [];
    mockGetStates.mockResolvedValue(mockStatesResponse);
  });

  it("should call getStates exactly once even after re-renders", async () => {
    const { rerender } = render(
      <BrowserRouter>
        <WorkforceTab onNext={vi.fn()} onSuccess={vi.fn()} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockGetStates).toHaveBeenCalledTimes(1);
    });

    // Trigger multiple re-renders
    rerender(
      <BrowserRouter>
        <WorkforceTab onNext={vi.fn()} onSuccess={vi.fn()} />
      </BrowserRouter>
    );
    rerender(
      <BrowserRouter>
        <WorkforceTab onNext={vi.fn()} onSuccess={vi.fn()} />
      </BrowserRouter>
    );

    expect(mockGetStates).toHaveBeenCalledTimes(1);
  });
});

// --- T015-T017 [US3]: Error/empty state handling ---

describe("WorkforceTab — error state handling (US3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedQuestions = [];
  });

  // T015: API rejects — state selects show error indication
  it("should set empty options on state fields when getStates rejects", async () => {
    mockGetStates.mockRejectedValue(new Error("Network error"));

    renderWorkforceTab();

    await waitFor(() => {
      const topOpts = getTopWorkLocationsOptions();
      // When error, options should be empty array (not the hardcoded 50 states)
      expect(topOpts).toEqual([]);
    });
  });

  // T016: API rejects — other questions still render
  it("should still pass all questions to DynamicTab when getStates rejects", async () => {
    mockGetStates.mockRejectedValue(new Error("Network error"));

    renderWorkforceTab();

    await waitFor(() => {
      // All workforce questions should still be passed through
      expect(capturedQuestions.length).toBeGreaterThan(0);
      // educationLevel should exist
      const eduQ = findQuestion("educationLevel");
      expect(eduQ).toBeDefined();
    });
  });

  // T017: Empty states array — same as error
  it("should set empty options on state fields when getStates returns empty array", async () => {
    mockGetStates.mockResolvedValue({ data: { states: [] } });

    renderWorkforceTab();

    await waitFor(() => {
      const topOpts = getTopWorkLocationsOptions();
      expect(topOpts).toEqual([]);
    });
  });

  it("should set empty options on conditional state field when getStates rejects", async () => {
    mockGetStates.mockRejectedValue(new Error("Network error"));

    renderWorkforceTab();

    await waitFor(() => {
      const condOpts = getConditionalStateOptions();
      expect(condOpts).toEqual([]);
    });
  });
});
