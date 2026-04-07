/**
 * finchStatusSelectors Tests
 *
 * Unit tests for finchStatusSelectors — each selector returns the correct slice field.
 */

import { describe, it, expect } from "vitest";
import {
  selectFinchConnection,
  selectFinchLatestSyncJob,
  selectFinchStatusLoading,
  selectFinchStatusError,
} from "@/store/selectors/finchStatusSelectors";
import type { RootState } from "@/store/store";

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

const buildState = (finchStatus: Partial<RootState["finchStatus"]> = {}): RootState =>
  ({
    finchStatus: {
      connection: null,
      latestSyncJob: null,
      loading: false,
      error: null,
      ...finchStatus,
    },
  }) as unknown as RootState;

describe("finchStatusSelectors", () => {
  describe("selectFinchConnection", () => {
    it("returns null when connection is null", () => {
      expect(selectFinchConnection(buildState())).toBeNull();
    });

    it("returns the connection object when set", () => {
      expect(selectFinchConnection(buildState({ connection: mockConnection }))).toEqual(
        mockConnection
      );
    });
  });

  describe("selectFinchLatestSyncJob", () => {
    it("returns null when latestSyncJob is null", () => {
      expect(selectFinchLatestSyncJob(buildState())).toBeNull();
    });

    it("returns the sync job object when set", () => {
      expect(selectFinchLatestSyncJob(buildState({ latestSyncJob: mockSyncJob }))).toEqual(
        mockSyncJob
      );
    });
  });

  describe("selectFinchStatusLoading", () => {
    it("returns false when not loading", () => {
      expect(selectFinchStatusLoading(buildState({ loading: false }))).toBe(false);
    });

    it("returns true when loading", () => {
      expect(selectFinchStatusLoading(buildState({ loading: true }))).toBe(true);
    });
  });

  describe("selectFinchStatusError", () => {
    it("returns null when no error", () => {
      expect(selectFinchStatusError(buildState({ error: null }))).toBeNull();
    });

    it("returns the error string when set", () => {
      expect(selectFinchStatusError(buildState({ error: "Failed to fetch Finch status" }))).toBe(
        "Failed to fetch Finch status"
      );
    });
  });
});
