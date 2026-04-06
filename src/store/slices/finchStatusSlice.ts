import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFinchStatus } from "@/services/api/finchApi";
import type { FinchStatusState, FinchStatusData } from "@/types/finchStatusTypes";

const initialState: FinchStatusState = {
  connection: null,
  latestSyncJob: null,
  loading: false,
  error: null,
};

export const fetchFinchStatus = createAsyncThunk<FinchStatusData, void, { rejectValue: string }>(
  "finchStatus/fetchFinchStatus",
  async (_, { rejectWithValue }) => {
    try {
      return await getFinchStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch Finch status";
      return rejectWithValue(errorMessage);
    }
  }
);

const finchStatusSlice = createSlice({
  name: "finchStatus",
  initialState,
  reducers: {
    resetFinchStatus: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFinchStatus.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinchStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.connection = action.payload.connection;
        state.latestSyncJob = action.payload.latestSyncJob;
        state.error = null;
      })
      .addCase(fetchFinchStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An unexpected error occurred";
      })
      .addMatcher(
        action => action.type === "auth/logout/fulfilled" || action.type === "auth/logout",
        () => initialState
      );
  },
});

export const { resetFinchStatus } = finchStatusSlice.actions;
export default finchStatusSlice.reducer;
