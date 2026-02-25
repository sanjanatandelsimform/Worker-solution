/**
 * Dashboard Redux Slice
 *
 * Manages dashboard data state including loading, error, and cached response.
 * Follows patterns from authSlice.ts and profileSlice.ts.
 *
 * Based on: specs/001-dashboard-api-integration/research.md
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getDashboard } from "@/services/api/dashboardApi";
import type { DashboardState, DashboardResponse } from "@/types/dashboardTypes";

// Initial state
const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

/**
 * Async thunk to fetch dashboard data from API
 *
 * @example
 * ```typescript
 * dispatch(fetchDashboard());
 * ```
 */
export const fetchDashboard = createAsyncThunk<DashboardResponse, void, { rejectValue: string }>(
  "dashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDashboard();
      console.log("response-----", response);
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch dashboard data";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Dashboard slice with reducers and async thunk handling
 */
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    /**
     * Clear dashboard data and errors
     */
    clearDashboard: state => {
      state.data = null;
      state.error = null;
      state.lastFetched = null;
    },

    /**
     * Clear only error state (useful for retry flows)
     */
    clearDashboardError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Handle fetchDashboard pending state
      .addCase(fetchDashboard.pending, state => {
        state.loading = true;
        state.error = null;
      })
      // Handle fetchDashboard success
      .addCase(fetchDashboard.fulfilled, (state, action: PayloadAction<DashboardResponse>) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      // Handle fetchDashboard failure
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An unexpected error occurred";
      });
  },
});

// Export actions
export const { clearDashboard, clearDashboardError } = dashboardSlice.actions;

// Export reducer
export default dashboardSlice.reducer;
