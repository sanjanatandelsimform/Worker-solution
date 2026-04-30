/**
 * finchStatusSlice Tests
 *
 * Unit tests for finchStatusSlice reducer and fetchFinchStatus async thunk.
 * Tests state transitions for pending/fulfilled/rejected and auth/logout reset.
 */

import { describe, it, expect, vi } from "vitest";
import finchStatusReducer, {
  fetchFinchStatus,
  resetFinchStatus,
} from "@/store/slices/finchStatusSlice";
import type { FinchStatusState } from "@/types/finchStatusTypes";

vi.mock("@/services/api/finchApi");

const initialState: FinchStatusState = {
  connection: null,
  latestSyncJob: null,
  loading: false,
  error: null,
};

const mockConnection = {
  id: "conn-uuid",
  status: "connected" as const,
  providerId: "gusto",
  lastSyncedAt: null,
  createdAt: "2026-04-01T10:00:00Z",
};

const mockSyncJob = {
  id: "sync-uuid",
  status: "pending" as const,
  errorMessage: null,
  startedAt: null,
  completedAt: null,
  createdAt: "2026-04-01T10:00:00Z",
};

describe("finchStatusSlice", () => {
  it("returns initial state for unknown action", () => {
    expect(finchStatusReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  describe("fetchFinchStatus.pending", () => {
    it("sets loading to true and clears error", () => {
      const state = finchStatusReducer(
        { ...initialState, error: "previous error" },
        fetchFinchStatus.pending("", undefined)
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("preserves existing connection while loading", () => {
      const stateWithConnection = { ...initialState, connection: mockConnection };
      const state = finchStatusReducer(
        stateWithConnection,
        fetchFinchStatus.pending("", undefined)
      );
      expect(state.connection).toEqual(mockConnection);
    });
  });

  describe("fetchFinchStatus.fulfilled", () => {
    it("stores connection and latestSyncJob, sets loading to false", () => {
      const payload = { connection: mockConnection, latestSyncJob: mockSyncJob };
      const state = finchStatusReducer(
        { ...initialState, loading: true },
        fetchFinchStatus.fulfilled(payload, "", undefined)
      );
      expect(state.loading).toBe(false);
      expect(state.connection).toEqual(mockConnection);
      expect(state.latestSyncJob).toEqual(mockSyncJob);
      expect(state.error).toBeNull();
    });

    it("stores null connection and null latestSyncJob when both are null", () => {
      const payload = { connection: null, latestSyncJob: null };
      const state = finchStatusReducer(
        { ...initialState, loading: true, connection: mockConnection },
        fetchFinchStatus.fulfilled(payload, "", undefined)
      );
      expect(state.connection).toBeNull();
      expect(state.latestSyncJob).toBeNull();
    });
  });

  describe("fetchFinchStatus.rejected", () => {
    it("sets error string, sets loading to false, preserves connection", () => {
      const stateWithConnection = { ...initialState, loading: true, connection: mockConnection };
      const state = finchStatusReducer(
        stateWithConnection,
        fetchFinchStatus.rejected(null, "", undefined, "Failed to fetch Finch status")
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Failed to fetch Finch status");
      expect(state.connection).toEqual(mockConnection);
    });

    it("uses fallback error message when payload is undefined", () => {
      const state = finchStatusReducer(
        { ...initialState, loading: true },
        fetchFinchStatus.rejected(null, "", undefined, undefined)
      );
      expect(state.error).toBe("An unexpected error occurred");
    });
  });

  describe("resetFinchStatus", () => {
    it("resets state to initialState", () => {
      const populated: FinchStatusState = {
        connection: mockConnection,
        latestSyncJob: mockSyncJob,
        loading: false,
        error: "some error",
      };
      expect(finchStatusReducer(populated, resetFinchStatus())).toEqual(initialState);
    });
  });

  describe("auth/logout reset", () => {
    it("resets to initialState on auth/logout", () => {
      const populated: FinchStatusState = {
        connection: mockConnection,
        latestSyncJob: mockSyncJob,
        loading: false,
        error: null,
      };
      expect(finchStatusReducer(populated, { type: "auth/logout" })).toEqual(initialState);
    });

    it("resets to initialState on auth/logout/fulfilled", () => {
      const populated: FinchStatusState = {
        connection: mockConnection,
        latestSyncJob: null,
        loading: false,
        error: null,
      };
      expect(finchStatusReducer(populated, { type: "auth/logout/fulfilled" })).toEqual(
        initialState
      );
    });
  });

  describe("fetchFinchStatus thunk error branches", () => {
    it("uses fallback error when rejected payload is undefined", () => {
      const newState = finchStatusReducer(initialState, {
        type: fetchFinchStatus.rejected.type,
        payload: undefined,
      });
      expect(newState.error).toBe("An unexpected error occurred");
    });

    it("fetchFinchStatus thunk uses fallback error when non-Error is thrown", async () => {
      const finchApi = await import("@/services/api/finchApi");
      vi.mocked((finchApi as any).getFinchStatus).mockRejectedValueOnce("string error");
      const { configureStore } = await import("@reduxjs/toolkit");
      const store = configureStore({ reducer: { finchStatus: finchStatusReducer } });
      await store.dispatch(fetchFinchStatus());
      const state = store.getState().finchStatus;
      expect(state.error).toBeTruthy();
    });
  });
});
