/**
 * Industry Redux Slice
 *
 * Manages industry data state including loading, error, and cached response.
 * Follows patterns from dashboardSlice.ts.
 *
 * Based on: specs/009-industry-status-api/research.md
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getIndustry } from "@/services/api/industryApi";
import type { IndustryState, IndustryData } from "@/types/industryTypes";

// Initial state
const initialState: IndustryState = {
  data: null,
  loading: false,
  error: null,
  isLoaded: false,
};

/**
 * Async thunk to fetch industry data from API
 *
 * @example
 * ```typescript
 * dispatch(fetchIndustry());
 * ```
 */
export const fetchIndustry = createAsyncThunk<IndustryData, void, { rejectValue: string }>(
  "industry/fetchIndustry",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getIndustry();
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch industry data";
      return rejectWithValue(errorMessage);
    }
  }
);

const industrySlice = createSlice({
  name: "industry",
  initialState,
  reducers: {
    clearIndustry: state => {
      state.data = null;
      state.error = null;
      state.isLoaded = false;
    },
    clearIndustryError: state => {
      state.error = null;
    },
    resetIndustry: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchIndustry.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndustry.fulfilled, (state, action: PayloadAction<IndustryData>) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
        state.isLoaded = true;
      })
      .addCase(fetchIndustry.rejected, (state, action) => {
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
export const { clearIndustry, clearIndustryError, resetIndustry } = industrySlice.actions;

// Export reducer
export default industrySlice.reducer;
