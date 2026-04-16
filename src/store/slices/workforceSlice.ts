/**
 * Workforce Redux Slice
 *
 * Manages workforce data state including loading, error, and cached response.
 * Follows patterns from dashboardSlice.ts.
 *
 * Based on: specs/009-workforce-tab-api/plan.md
 *
 * STATIC DATA MODE:
 * The fetchWorkforce thunk currently returns STATIC_WORKFORCE_DATA because the
 * backend endpoint is not yet deployed. The real API call is present but
 * commented out directly below the return statement.
 *
 * TO MIGRATE TO LIVE API:
 * 1. Remove the STATIC_WORKFORCE_DATA constant and the `return STATIC_WORKFORCE_DATA;` line
 * 2. Uncomment the `// const response = await getWorkforce();` and `// return response.data ?? response;` lines
 * 3. Uncomment the import of getWorkforce at the top of this file
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// TODO: Uncomment when backend is live:
// import { getWorkforce } from "@/services/api/workforceApi";
import type { WorkforceState, WorkforceResponse } from "@/types/workforceTypes";

// Initial state
const initialState: WorkforceState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
  isLoaded: false,
};

// TODO: Remove STATIC_WORKFORCE_DATA block when backend is live
const STATIC_WORKFORCE_DATA: WorkforceResponse = {
  workforce: {
    totalWorkforce: 3120,
    enrolledBenefits: 2450,
    avgEmployeeCost: 2254,
    employerCostPerEmployee: 44000,
  },
  participation: {
    totalWorkforce: 5345,
    enrolledBenefits: 2450,
    retirementEnrollment: "64%",
    healthcareEnrollment: "78%",
    benefits: {
      FSA: "31%",
      wellness: "10%",
      EAP: "90%",
    },
    retirement: {
      "401k": "64%",
    },
    insurance: {
      health: "78%",
      dental: "65%",
      vision: "60%",
      life: "45%",
    },
  },
  demographics: {
    employementType: [
      { department: "all", fullTime: "80%", partTime: "20%", seasonal: "5%" },
      { department: "engineering", fullTime: "90%", partTime: "10%", seasonal: "0%" },
      { department: "sales", fullTime: "70%", partTime: "30%", seasonal: "10%" },
      { department: "hr", fullTime: "85%", partTime: "15%", seasonal: "0%" },
    ],
    gender: {
      men: "55%",
      women: "45%",
    },
    employmentBreakdownByAge: [
      { ageGroup: "> 30", fullTime: 10, partTime: 20, seasonal: 5 },
      { ageGroup: "30 - 40", fullTime: 30, partTime: 35, seasonal: 10 },
      { ageGroup: "40 - 50", fullTime: 45, partTime: 25, seasonal: 15 },
      { ageGroup: "50 - 60", fullTime: 10, partTime: 15, seasonal: 8 },
      { ageGroup: "60+", fullTime: 5, partTime: 5, seasonal: 2 },
    ],
  },
  compensation: {
    salaryBreakdown: {
      medianSalary: 60000,
      avgSalary: 65000,
      avgHourlyRate: 30,
    },
    workforceBreakdown: {
      departments: [
        {
          id: "design",
          label: "Design",
          empNumber: 8,
          partTime: 2,
          fullTime: 6,
          salaryRange: "$79,000-120,000",
          jobTitles: [
            {
              jobTitle: "Product Designer",
              totalInRole: 8,
              partTime: 2,
              fullTime: 6,
              salaryRange: "$79,000-120,000",
            },
            {
              jobTitle: "Junior Designer",
              totalInRole: 15,
              partTime: 4,
              fullTime: 11,
              salaryRange: "$110,000-140,000",
            },
            {
              jobTitle: "Design Manager",
              totalInRole: 7,
              partTime: 6,
              fullTime: 1,
              salaryRange: "$150,000-150,000",
            },
            {
              jobTitle: "Senior Designer",
              totalInRole: 9,
              partTime: 8,
              fullTime: 1,
              salaryRange: "$180,000-200,000",
            },
            {
              jobTitle: "Lead Designer",
              totalInRole: 3,
              partTime: 0,
              fullTime: 3,
              salaryRange: "$180,000-220,000",
            },
          ],
        },
        {
          id: "engineering",
          label: "Engineering",
          empNumber: 15,
          partTime: 4,
          fullTime: 11,
          salaryRange: "$110,000-140,000",
          jobTitles: [
            {
              jobTitle: "Junior Developer",
              totalInRole: 15,
              partTime: 4,
              fullTime: 11,
              salaryRange: "$110,000-140,000",
            },
            {
              jobTitle: "Software Engineer",
              totalInRole: 8,
              partTime: 2,
              fullTime: 6,
              salaryRange: "$120,000-150,000",
            },
            {
              jobTitle: "Senior Engineer",
              totalInRole: 9,
              partTime: 0,
              fullTime: 9,
              salaryRange: "$140,000-170,000",
            },
            {
              jobTitle: "Engineering Manager",
              totalInRole: 5,
              partTime: 0,
              fullTime: 5,
              salaryRange: "$150,000-180,000",
            },
            {
              jobTitle: "Lead Engineer",
              totalInRole: 3,
              partTime: 0,
              fullTime: 3,
              salaryRange: "$160,000-200,000",
            },
          ],
        },
        {
          id: "humanResources",
          label: "Human Resources",
          empNumber: 7,
          partTime: 6,
          fullTime: 1,
          salaryRange: "$150,000-150,000",
          jobTitles: [
            {
              jobTitle: "HR Coordinator",
              totalInRole: 7,
              partTime: 6,
              fullTime: 1,
              salaryRange: "$40,000-60,000",
            },
            {
              jobTitle: "HR Specialist",
              totalInRole: 5,
              partTime: 3,
              fullTime: 2,
              salaryRange: "$55,000-75,000",
            },
            {
              jobTitle: "Recruiter",
              totalInRole: 4,
              partTime: 2,
              fullTime: 2,
              salaryRange: "$60,000-80,000",
            },
            {
              jobTitle: "HR Manager",
              totalInRole: 3,
              partTime: 1,
              fullTime: 2,
              salaryRange: "$80,000-100,000",
            },
            {
              jobTitle: "HR Director",
              totalInRole: 1,
              partTime: 0,
              fullTime: 1,
              salaryRange: "$110,000-140,000",
            },
          ],
        },
        {
          id: "product",
          label: "Product",
          empNumber: 9,
          partTime: 8,
          fullTime: 1,
          salaryRange: "$180,000-200,000",
          jobTitles: [
            {
              jobTitle: "Associate PM",
              totalInRole: 9,
              partTime: 8,
              fullTime: 1,
              salaryRange: "$80,000-100,000",
            },
            {
              jobTitle: "Product Analyst",
              totalInRole: 6,
              partTime: 4,
              fullTime: 2,
              salaryRange: "$90,000-110,000",
            },
            {
              jobTitle: "Product Manager",
              totalInRole: 5,
              partTime: 2,
              fullTime: 3,
              salaryRange: "$110,000-140,000",
            },
            {
              jobTitle: "Senior PM",
              totalInRole: 3,
              partTime: 0,
              fullTime: 3,
              salaryRange: "$140,000-170,000",
            },
            {
              jobTitle: "VP Product",
              totalInRole: 1,
              partTime: 0,
              fullTime: 1,
              salaryRange: "$180,000-220,000",
            },
          ],
        },
        {
          id: "sales",
          label: "Sales",
          empNumber: 3,
          partTime: 0,
          fullTime: 3,
          salaryRange: "$180,000-220,000",
          jobTitles: [
            {
              jobTitle: "Sales Representative",
              totalInRole: 3,
              partTime: 0,
              fullTime: 3,
              salaryRange: "$50,000-80,000",
            },
            {
              jobTitle: "Account Executive",
              totalInRole: 4,
              partTime: 1,
              fullTime: 3,
              salaryRange: "$70,000-100,000",
            },
            {
              jobTitle: "Senior Sales",
              totalInRole: 3,
              partTime: 0,
              fullTime: 3,
              salaryRange: "$90,000-120,000",
            },
            {
              jobTitle: "Sales Manager",
              totalInRole: 2,
              partTime: 0,
              fullTime: 2,
              salaryRange: "$110,000-140,000",
            },
            {
              jobTitle: "Sales Director",
              totalInRole: 1,
              partTime: 0,
              fullTime: 1,
              salaryRange: "$150,000-200,000",
            },
          ],
        },
      ],
    },
    benefitsCost: {
      employeeContribution: 468,
      employerCost: "$11000/yr",
      graph: [
        { salaryRange: "30k-50k", min: 32, max: 350 },
        { salaryRange: "50k-70k", min: 152, max: 284 },
        { salaryRange: "70k-90k", min: 82, max: 301 },
        { salaryRange: "90k-110k", min: 82, max: 321 },
        { salaryRange: "110k+", min: 67, max: 301 },
      ],
      table: [
        {
          salaryRange: "30k-50k",
          avgEmployeeCostPerPaycheck: 120.22,
          avgEmployeeCostPercentage: 30,
          employerCostPerPaycheck: 34.13,
        },
        {
          salaryRange: "50k-70k",
          avgEmployeeCostPerPaycheck: 220.22,
          avgEmployeeCostPercentage: 60,
          employerCostPerPaycheck: 32.1,
        },
        {
          salaryRange: "70k-90k",
          avgEmployeeCostPerPaycheck: 330.22,
          avgEmployeeCostPercentage: 23,
          employerCostPerPaycheck: 53.8,
        },
        {
          salaryRange: "90k-110k",
          avgEmployeeCostPerPaycheck: 440.22,
          avgEmployeeCostPercentage: 40,
          employerCostPerPaycheck: 123.5,
        },
        {
          salaryRange: "110k+",
          avgEmployeeCostPerPaycheck: 600.22,
          avgEmployeeCostPercentage: 60,
          employerCostPerPaycheck: 65.2,
        },
      ],
    },
  },
};

/**
 * Async thunk to fetch workforce data
 *
 * Currently returns static data while the backend endpoint is not yet deployed.
 * See migration instructions at the top of this file.
 */
export const fetchWorkforce = createAsyncThunk<WorkforceResponse, void, { rejectValue: string }>(
  "workforce/fetchWorkforce",
  async (_, { rejectWithValue }) => {
    try {
      // Static data — remove this block when backend is live:
      return STATIC_WORKFORCE_DATA;

      // TODO: Uncomment when backend is live (and remove static block above):
      // const response = await getWorkforce();
      // return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch workforce data";
      return rejectWithValue(errorMessage);
    }
  }
);

const workforceSlice = createSlice({
  name: "workforce",
  initialState,
  reducers: {
    clearWorkforce: state => {
      state.data = null;
      state.error = null;
      state.lastFetched = null;
      state.isLoaded = false;
    },
    clearWorkforceError: state => {
      state.error = null;
    },
    resetWorkforce: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchWorkforce.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkforce.fulfilled, (state, action: PayloadAction<WorkforceResponse>) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
        state.isLoaded = true;
      })
      .addCase(fetchWorkforce.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An unexpected error occurred";
        state.isLoaded = false;
      })
      .addMatcher(
        action => action.type === "auth/logout/fulfilled" || action.type === "auth/logout",
        () => initialState
      );
  },
});

// Export actions
export const { clearWorkforce, clearWorkforceError, resetWorkforce } = workforceSlice.actions;

// Export reducer
export default workforceSlice.reducer;
