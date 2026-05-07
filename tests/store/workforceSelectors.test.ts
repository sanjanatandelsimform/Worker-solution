/**
 * Workforce Redux Selector Tests
 *
 * Unit tests for workforceSelectors typed selector functions.
 * TDD: written before implementation (Red state expected initially).
 */

import { describe, it, expect } from "vitest";
import {
  selectWorkforceData,
  selectWorkforceLoading,
  selectWorkforceError,
  selectWorkforceIsLoaded,
  selectWorkforceLastFetched,
  selectWorkforceSection,
  selectParticipationSection,
  selectDemographicsSection,
  selectCompensationSection,
} from "@/store/selectors/workforceSelectors";
import type { RootState } from "@/store/store";
import type { WorkforceApiResponse } from "@/types/workforceTypes";

const mockWorkforceData: WorkforceApiResponse = {
  assessmentType: "finch",
  workforce: {
    dataStatus: "available",
    workforce: {
      totalWorkforce: 3120,
      enrolledBenefits: 2450,
      avgEmployeeCost: 2254,
      employerCostPerEmployee: 44000,
    },
    participation: {
      totalWorkforce: 3120,
      enrolledBenefits: 2450,
      retirementEnrollment: "64%",
      healthcareEnrollment: "78%",
      benefits: [
        { name: "FSA", enrollment: "31%" },
        { name: "Wellness", enrollment: "N/A" },
        { name: "EAP", enrollment: "N/A" },
      ],
      retirement: [{ name: "401k", enrollment: "64%" }],
      insurance: [
        { name: "Health", enrollment: "78%" },
        { name: "Dental", enrollment: "65%" },
        { name: "Vision", enrollment: "60%" },
        { name: "Life", enrollment: "45%" },
      ],
    },
    demographics: {
      employmentType: [{ department: "all", fullTime: "80%", partTime: "20%", other: "5%" }],
      gender: { men: "55%", women: "40%" },
      employmentBreakdownByAge: [],
    },
    compensation: {
      salaryBreakdown: { medianSalary: 60000, avgSalary: 65000, avgHourlyRate: 30 },
      workforceBreakdown: { departments: [] },
      benefitsCost: { employeeContribution: 468, employerCost: 11000, graph: [], table: [] },
    },
  },
};

const makeState = (
  overrides: Partial<RootState["workforce"]> = {}
): Pick<RootState, "workforce"> => ({
  workforce: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
    isLoaded: false,
    ...overrides,
  },
});

describe("workforceSelectors", () => {
  describe("selectWorkforceData", () => {
    it("returns null when no data loaded", () => {
      expect(selectWorkforceData(makeState() as RootState)).toBeNull();
    });
    it("returns data when loaded", () => {
      expect(selectWorkforceData(makeState({ data: mockWorkforceData }) as RootState)).toEqual(
        mockWorkforceData
      );
    });
  });

  describe("selectWorkforceLoading", () => {
    it("returns false by default", () => {
      expect(selectWorkforceLoading(makeState() as RootState)).toBe(false);
    });
    it("returns true when loading", () => {
      expect(selectWorkforceLoading(makeState({ loading: true }) as RootState)).toBe(true);
    });
  });

  describe("selectWorkforceError", () => {
    it("returns null when no error", () => {
      expect(selectWorkforceError(makeState() as RootState)).toBeNull();
    });
    it("returns error string when error present", () => {
      expect(selectWorkforceError(makeState({ error: "Something went wrong" }) as RootState)).toBe(
        "Something went wrong"
      );
    });
  });

  describe("selectWorkforceIsLoaded", () => {
    it("returns false by default", () => {
      expect(selectWorkforceIsLoaded(makeState() as RootState)).toBe(false);
    });
    it("returns true when isLoaded", () => {
      expect(selectWorkforceIsLoaded(makeState({ isLoaded: true }) as RootState)).toBe(true);
    });
  });

  describe("selectWorkforceLastFetched", () => {
    it("returns null when not fetched", () => {
      expect(selectWorkforceLastFetched(makeState() as RootState)).toBeNull();
    });
    it("returns timestamp when fetched", () => {
      expect(selectWorkforceLastFetched(makeState({ lastFetched: 12345 }) as RootState)).toBe(
        12345
      );
    });
  });

  describe("section selectors — null data", () => {
    it("selectWorkforceSection returns null when data is null", () => {
      expect(selectWorkforceSection(makeState() as RootState)).toBeNull();
    });
    it("selectParticipationSection returns null when data is null", () => {
      expect(selectParticipationSection(makeState() as RootState)).toBeNull();
    });
    it("selectDemographicsSection returns null when data is null", () => {
      expect(selectDemographicsSection(makeState() as RootState)).toBeNull();
    });
    it("selectCompensationSection returns null when data is null", () => {
      expect(selectCompensationSection(makeState() as RootState)).toBeNull();
    });
  });

  describe("section selectors — with data", () => {
    const stateWithData = makeState({ data: mockWorkforceData }) as RootState;

    it("selectWorkforceSection returns workforce sub-object", () => {
      expect(selectWorkforceSection(stateWithData)).toEqual(mockWorkforceData.workforce.workforce);
    });
    it("selectParticipationSection returns participation sub-object", () => {
      expect(selectParticipationSection(stateWithData)).toEqual(
        mockWorkforceData.workforce.participation
      );
    });
    it("selectDemographicsSection returns demographics sub-object", () => {
      expect(selectDemographicsSection(stateWithData)).toEqual(
        mockWorkforceData.workforce.demographics
      );
    });
    it("selectCompensationSection returns compensation sub-object", () => {
      expect(selectCompensationSection(stateWithData)).toEqual(
        mockWorkforceData.workforce.compensation
      );
    });
  });
});
