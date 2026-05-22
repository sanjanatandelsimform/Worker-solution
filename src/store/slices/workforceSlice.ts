/**
 * Workforce Redux Slice
 *
 * Manages workforce data state including loading, error, and cached response.
 * Follows patterns from dashboardSlice.ts.
 *
 * Based on: specs/009-workforce-tab-api/plan.md
 * Updated: specs/014-fix-workforce-rec-api/plan.md
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getWorkforce } from "@/services/api/workforceApi";
import type { WorkforceState, WorkforceApiResponse } from "@/types/workforceTypes";

// Initial state
const initialState: WorkforceState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
  isLoaded: false,
};

/**
 * Async thunk to fetch workforce data from GET /dashboard/workforce
 */
export const fetchWorkforce = createAsyncThunk<WorkforceApiResponse, void, { rejectValue: string }>(
  "workforce/fetchWorkforce",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getWorkforce();
      return response;
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
      .addCase(fetchWorkforce.fulfilled, (state, action: PayloadAction<WorkforceApiResponse>) => {
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
