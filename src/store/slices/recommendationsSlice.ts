/**
 * Recommendations Redux Slice
 *
 * Manages recommendations data state including loading, error, and cached response.
 * Follows patterns from workforceSlice.ts.
 *
 * Based on: specs/011-recommendations-api/plan.md
 * Updated: specs/014-fix-workforce-rec-api/plan.md
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getRecommendations } from "@/services/api/recommendationsApi";
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

/**
 * Async thunk to fetch recommendations data from GET /dashboard/recommendation
 */
export const fetchRecommendations = createAsyncThunk<
  RecommendationsApiResponse,
  void,
  { rejectValue: string }
>("recommendations/fetchRecommendations", async (_, { rejectWithValue }) => {
  try {
    const response = await getRecommendations();
    return response;
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
