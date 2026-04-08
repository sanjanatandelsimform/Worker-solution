# Quickstart: Finch Status API Integration

**Feature**: 006-finch-status
**Date**: 2026-04-02

This guide walks a developer through the TDD implementation of the Finch status polling feature, following the Red-Green-Refactor workflow required by the constitution.

---

## Prerequisites

- Branch `006-finch-status` checked out
- `pnpm install` up to date (no new packages required for this feature)

---

## Step 1 — Add TypeScript Types

Create `src/types/finchStatusTypes.ts` with the interfaces from `specs/006-finch-status/data-model.md`.

**Verify**: `pnpm run type-check` passes with the new file.

---

## Step 2 — Add `getFinchStatus` to the API Service

Add to `src/services/api/finchApi.ts`:

```typescript
// ── Import types at the top of the file ─────────────────────────────────
import type { FinchStatusApiResponse, FinchStatusData } from "@/types/finchStatusTypes";

// ── Service function ─────────────────────────────────────────────────────
export const getFinchStatus = async (): Promise<FinchStatusData> => {
  const response = await apiClient.get<FinchStatusApiResponse>("/finch/status");
  if (!response.data.status) {
    throw new Error("Failed to fetch Finch status");
  }
  return response.data.data;
};
```

**Write the test first** (`tests/services/finchApi.test.ts`):

```typescript
describe("getFinchStatus", () => {
  it("returns connection and latestSyncJob on success", async () => {
    axiosMock.onGet("/finch/status").reply(200, {
      status: true,
      data: { connection: mockConnection, latestSyncJob: mockSyncJob },
    });
    const result = await getFinchStatus();
    expect(result.connection).toEqual(mockConnection);
    expect(result.latestSyncJob).toEqual(mockSyncJob);
  });

  it("throws when status is false", async () => {
    axiosMock.onGet("/finch/status").reply(200, { status: false });
    await expect(getFinchStatus()).rejects.toThrow("Failed to fetch Finch status");
  });

  it("throws on network error", async () => {
    axiosMock.onGet("/finch/status").networkError();
    await expect(getFinchStatus()).rejects.toThrow();
  });
});
```

---

## Step 3 — Create `finchStatusSlice`

Create `src/store/slices/finchStatusSlice.ts`:

```typescript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFinchStatus } from "@/services/api/finchApi";
import type { FinchStatusState } from "@/types/finchStatusTypes";

const initialState: FinchStatusState = {
  connection: null,
  latestSyncJob: null,
  loading: false,
  error: null,
};

export const fetchFinchStatus = createAsyncThunk<
  { connection: FinchConnection | null; latestSyncJob: FinchSyncJob | null },
  void,
  { rejectValue: string }
>("finchStatus/fetchFinchStatus", async (_, { rejectWithValue }) => {
  try {
    return await getFinchStatus();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch Finch status";
    return rejectWithValue(errorMessage);
  }
});

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
```

**Write the test first** (`tests/store/finchStatusSlice.test.ts`):

```typescript
describe("finchStatusSlice", () => {
  it("sets loading true on pending", () => {
    const state = reducer(initialState, fetchFinchStatus.pending("", undefined));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("stores connection and syncJob on fulfilled", () => {
    const payload = { connection: mockConnection, latestSyncJob: mockSyncJob };
    const state = reducer(initialState, fetchFinchStatus.fulfilled(payload, "", undefined));
    expect(state.connection).toEqual(mockConnection);
    expect(state.latestSyncJob).toEqual(mockSyncJob);
    expect(state.loading).toBe(false);
  });

  it("stores error on rejected", () => {
    const state = reducer(initialState, fetchFinchStatus.rejected(null, "", undefined, "fail"));
    expect(state.error).toBe("fail");
    expect(state.loading).toBe(false);
  });

  it("resets on auth/logout", () => {
    const populated = { ...initialState, connection: mockConnection };
    const state = reducer(populated, { type: "auth/logout" });
    expect(state).toEqual(initialState);
  });
});
```

---

## Step 4 — Register in Store

In `src/store/store.ts`, add the `finchStatus` reducer:

```typescript
// Add import
import finchStatusReducer from "./slices/finchStatusSlice";
import type { FinchStatusState } from "@/types/finchStatusTypes";

// Add to rootReducer
const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  registrationForm: registrationFormReducer,
  user: userReducer,
  dashboard: dashboardReducer,
  finchStatus: finchStatusReducer, // ← NEW
});
```

---

## Step 5 — Create Selector File

Create `src/store/selectors/finchStatusSelectors.ts`:

```typescript
import type { RootState } from "@/store/store";
import type { FinchConnection, FinchSyncJob } from "@/types/finchStatusTypes";

export const selectFinchConnection = (state: RootState): FinchConnection | null =>
  state.finchStatus.connection;

export const selectFinchLatestSyncJob = (state: RootState): FinchSyncJob | null =>
  state.finchStatus.latestSyncJob;

export const selectFinchStatusLoading = (state: RootState): boolean => state.finchStatus.loading;

export const selectFinchStatusError = (state: RootState): string | null => state.finchStatus.error;
```

---

## Step 6 — Create `useFinchStatus` Hook

Create `src/hooks/useFinchStatus.ts`:

```typescript
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFinchStatus } from "@/store/slices/finchStatusSlice";
import {
  selectFinchConnection,
  selectFinchLatestSyncJob,
  selectFinchStatusLoading,
  selectFinchStatusError,
} from "@/store/selectors/finchStatusSelectors";
import type { FinchConnectionStatus, FinchSyncJobStatus } from "@/types/finchStatusTypes";

const POLL_INTERVAL_MS = 15_000;

export interface UseFinchStatusReturn {
  connectionStatus: FinchConnectionStatus | null;
  syncJobStatus: FinchSyncJobStatus | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useFinchStatus(): UseFinchStatusReturn {
  const dispatch = useAppDispatch();
  const connection = useAppSelector(selectFinchConnection);
  const latestSyncJob = useAppSelector(selectFinchLatestSyncJob);
  const isLoading = useAppSelector(selectFinchStatusLoading);
  const error = useAppSelector(selectFinchStatusError);

  useEffect(() => {
    dispatch(fetchFinchStatus());
    const intervalId = setInterval(() => {
      dispatch(fetchFinchStatus());
    }, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  return {
    connectionStatus: connection?.status ?? null,
    syncJobStatus: latestSyncJob?.status ?? null,
    isConnected: connection?.status === "connected",
    isLoading,
    error,
  };
}
```

**Write the test first** (`tests/hooks/useFinchStatus.test.ts`):

```typescript
describe("useFinchStatus", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("dispatches fetchFinchStatus on mount", () => {
    renderWithStore(<TestConsumer />);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "finchStatus/fetchFinchStatus/pending" }));
  });

  it("polls every 15 seconds", () => {
    renderWithStore(<TestConsumer />);
    vi.advanceTimersByTime(15_000);
    expect(dispatchSpy).toHaveBeenCalledTimes(2); // mount + 1 poll
    vi.advanceTimersByTime(15_000);
    expect(dispatchSpy).toHaveBeenCalledTimes(3); // + 1 more poll
  });

  it("clears interval on unmount", () => {
    const { unmount } = renderWithStore(<TestConsumer />);
    unmount();
    vi.advanceTimersByTime(30_000);
    // dispatch count stays at 1 (initial fetch only)
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it("isConnected true when connection.status is connected", () => {
    const store = createTestStore({ finchStatus: { connection: { status: "connected" }, ... } });
    const { result } = renderHookWithStore(() => useFinchStatus(), store);
    expect(result.current.isConnected).toBe(true);
  });

  it("isConnected false for disconnected/reauth_required/null", () => {
    ["disconnected", "reauth_required", null].forEach(status => {
      const store = createTestStore({ finchStatus: { connection: status ? { status } : null, ... } });
      const { result } = renderHookWithStore(() => useFinchStatus(), store);
      expect(result.current.isConnected).toBe(false);
    });
  });
});
```

---

## Step 7 — Update `DashboardPage.tsx`

Two changes in `DashboardPage.tsx`:

### 7a — Consume `useFinchStatus`

```typescript
// Add import
import { useFinchStatus } from "@/hooks/useFinchStatus";

// In the component body (alongside existing hooks)
const { isConnected } = useFinchStatus();
```

### 7b — Update visibility conditions

```tsx
{/* Choice cards: only show when email verified, assessment not complete, AND not connected */}
{emailVerify && assessmentData?.status !== "completed" && !isConnected && (
  <div className="flex items-center justify-between gap-4 mt-6">
    {/* Basic Plan card */}
    {/* Connect with Finch card (with existing "Start with Finch" button) */}
  </div>
)}

{/* Assessment card: only show when email verified, assessment not complete, AND not connected */}
{emailVerify && assessmentData?.status !== "completed" && !isConnected && (
  <DashboardCard ... />  {/* Take the Assessment */}
)}

{/* Connect to Finch banner: only show when assessment complete AND not connected */}
{emailVerify && assessmentData?.status === "completed" && !isConnected && (
  <DashboardCard
    ...
    onClick={() => void connectWithFinch()}   {/* ← NEWLY WIRED */}
    buttonIsDisabled={isFinchLoading}         {/* ← NEWLY ADDED */}
  />
)}

{/* Tabs: unchanged — still requires isDashboardReady */}
{emailVerify && assessmentData?.status === "completed" && isDashboardReady && (
  <div className="mt-10">
    <Tabs>...</Tabs>
  </div>
)}
```

**Write the test additions first** (`tests/pages/DashboardPage.test.tsx`):

```typescript
describe("DashboardPage — Finch status visibility", () => {
  it("hides choice cards when isConnected is true", () => {
    renderWithFinchStatus({ connection: { status: "connected" } });
    expect(screen.queryByText("Basic Plan")).not.toBeInTheDocument();
    expect(screen.queryByText("Connect with")).not.toBeInTheDocument(); // Finch choice card
  });

  it("hides Connect to Finch banner when isConnected is true", () => {
    renderWithAssessmentComplete({ connection: { status: "connected" } });
    expect(screen.queryByText("Connect to Finch")).not.toBeInTheDocument();
  });

  it("shows existing cards when isConnected is false", () => {
    renderWithFinchStatus({ connection: { status: "disconnected" } });
    expect(screen.getByText("Basic Plan")).toBeInTheDocument();
  });

  it("Connect button calls connectWithFinch", async () => {
    renderWithAssessmentComplete({ connection: null });
    await userEvent.click(screen.getByRole("button", { name: /connect/i }));
    expect(mockConnectWithFinch).toHaveBeenCalledTimes(1);
  });

  it("Connect button is disabled when Finch operation in progress", () => {
    renderWithAssessmentComplete({ connection: null, isFinchLoading: true });
    expect(screen.getByRole("button", { name: /connect/i })).toBeDisabled();
  });
});
```

---

## Step 8 — Quality Gate

Run the full quality gate before raising a PR:

```bash
pnpm run type-check    # Must pass — no TypeScript errors
pnpm lint:fix          # ESLint auto-fix
pnpm format            # Prettier
pnpm test              # All tests pass (new + existing)
```

Smoke test routes after `pnpm dev`:

- `/auth/login` — unaffected
- `/dashboard` (non-connected user) — existing onboarding cards present
- `/dashboard` (stub connected state) — cards hidden, tabs visible
