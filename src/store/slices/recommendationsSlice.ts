/**
 * Recommendations Redux Slice
 *
 * Manages recommendations data state including loading, error, and cached response.
 * Follows patterns from workforceSlice.ts.
 *
 * Based on: specs/011-recommendations-api/plan.md
 *
 * STATIC DATA MODE:
 * The fetchRecommendations thunk currently returns STATIC_RECOMMENDATIONS_DATA because the
 * backend endpoint is not yet deployed. The real API call is present but
 * commented out directly below the return statement.
 *
 * TO MIGRATE TO LIVE API:
 * 1. Remove the STATIC_RECOMMENDATIONS_DATA constant and the `return STATIC_RECOMMENDATIONS_DATA;` line
 * 2. Uncomment the `// const response = await getRecommendations();` and `// return response;` lines
 * 3. Uncomment the import of getRecommendations at the top of this file
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// TODO: Uncomment when backend is live:
// import { getRecommendations } from "@/services/api/recommendationsApi";
import type {
  RecommendationsState,
  RecommendationsApiResponse,
} from "@/types/recommendationsTypes";

// Initial state
const initialState: RecommendationsState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
  isLoaded: false,
};

// TODO: Remove STATIC_RECOMMENDATIONS_DATA block when backend is live
const STATIC_RECOMMENDATIONS_DATA: RecommendationsApiResponse = {
  recommendation: {
    strategicRecommendations: [],
    autoEnroll: true,
    nonElectiveMatch: false,
    healthcareAffordability: false,
    dataStatus: "available",
    companyAtGlance: {
      totalWorkforce: null,
      averageHourlyWage: null,
      averageSalary: null,
    },
  },
};

/**
 * Async thunk to fetch recommendations data
 *
 * Currently returns static data while the backend endpoint is not yet deployed.
 * See migration instructions at the top of this file.
 */
export const fetchRecommendations = createAsyncThunk<
  RecommendationsApiResponse,
  void,
  { rejectValue: string }
>("recommendations/fetchRecommendations", async (_, { rejectWithValue }) => {
  try {
    // Static data — remove this block when backend is live:
    return STATIC_RECOMMENDATIONS_DATA;

    // TODO: Uncomment when backend is live (and remove static block above):
    // const response = await getRecommendations();
    // return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch recommendations data";
    return rejectWithValue(errorMessage);
  }
});

const recommendationsSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    clearRecommendations: state => {
      state.data = null;
      state.error = null;
      state.lastFetched = null;
      state.isLoaded = false;
    },
    clearRecommendationsError: state => {
      state.error = null;
    },
    resetRecommendations: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRecommendations.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRecommendations.fulfilled,
        (state, action: PayloadAction<RecommendationsApiResponse>) => {
          state.loading = false;
          state.data = action.payload;
          state.error = null;
          state.lastFetched = Date.now();
          state.isLoaded = true;
        }
      )
      .addCase(fetchRecommendations.rejected, (state, action) => {
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
export const { clearRecommendations, clearRecommendationsError, resetRecommendations } =
  recommendationsSlice.actions;

// Export reducer
export default recommendationsSlice.reducer;
