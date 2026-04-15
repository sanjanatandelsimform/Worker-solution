# Quickstart: Dashboard Workforce Tab API Integration

**Branch**: `009-workforce-tab-api` | **Date**: 2026-04-14

Follow these steps in order. Each phase has a gate — do not proceed until the gate passes.

---

## Phase A — Types + TDD Scaffolding

### A1 — Create `src/types/workforceTypes.ts`

Copy the full interfaces from [data-model.md](./data-model.md). No logic here — pure TypeScript types only.

**Verify**: `pnpm run type-check` passes with zero errors.

---

### A2 — Create `tests/store/workforceSlice.test.ts`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import workforceReducer, { fetchWorkforce } from "@/store/slices/workforceSlice";
import type { WorkforceState } from "@/types/workforceTypes";

const makeStore = () => configureStore({ reducer: { workforce: workforceReducer } });

describe("workforceSlice", () => {
  it("has correct initial state", () => {
    const store = makeStore();
    const state = store.getState().workforce as WorkforceState;
    expect(state.data).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.isLoaded).toBe(false);
  });

  it("sets loading true when fetchWorkforce is pending", () => {
    const store = makeStore();
    store.dispatch(fetchWorkforce.pending("", undefined));
    const state = store.getState().workforce as WorkforceState;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("sets data and isLoaded on fetchWorkforce fulfilled", async () => {
    const store = makeStore();
    await store.dispatch(fetchWorkforce());
    const state = store.getState().workforce as WorkforceState;
    expect(state.loading).toBe(false);
    expect(state.data).not.toBeNull();
    expect(state.isLoaded).toBe(true);
  });

  it("sets error on fetchWorkforce rejected", () => {
    const store = makeStore();
    store.dispatch(fetchWorkforce.rejected(null, "", undefined, "API Error"));
    const state = store.getState().workforce as WorkforceState;
    expect(state.loading).toBe(false);
    expect(state.error).toBe("API Error");
    expect(state.isLoaded).toBe(false);
  });

  it("resets state on clearWorkforce", async () => {
    const store = makeStore();
    await store.dispatch(fetchWorkforce());
    const { clearWorkforce } = await import("@/store/slices/workforceSlice");
    store.dispatch(clearWorkforce());
    const state = store.getState().workforce as WorkforceState;
    expect(state.data).toBeNull();
    expect(state.isLoaded).toBe(false);
  });

  it("resets to initialState on auth logout", () => {
    const store = makeStore();
    store.dispatch({ type: "auth/logout/fulfilled" });
    const state = store.getState().workforce as WorkforceState;
    expect(state.data).toBeNull();
  });
});
```

---

### A3 — Create `tests/store/workforceSelectors.test.ts`

```typescript
import {
  selectWorkforceData,
  selectWorkforceLoading,
  selectWorkforceError,
  selectWorkforceSection,
  selectParticipationSection,
  selectDemographicsSection,
  selectCompensationSection,
} from "@/store/selectors/workforceSelectors";
import type { RootState } from "@/store/store";

const makeState = (overrides = {}): Pick<RootState, "workforce"> => ({
  workforce: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
    isLoaded: false,
    ...overrides,
  },
});

describe("workforceSelectors", () => {
  it("selectWorkforceData returns null when not loaded", () => {
    expect(selectWorkforceData(makeState() as RootState)).toBeNull();
  });
  it("selectWorkforceLoading returns loading flag", () => {
    expect(selectWorkforceLoading(makeState({ loading: true }) as RootState)).toBe(true);
  });
  it("selectWorkforceError returns error string", () => {
    expect(selectWorkforceError(makeState({ error: "err" }) as RootState)).toBe("err");
  });
  it("selectWorkforceSection returns null when data is null", () => {
    expect(selectWorkforceSection(makeState() as RootState)).toBeNull();
  });
  it("selectParticipationSection returns null when data is null", () => {
    expect(selectParticipationSection(makeState() as RootState)).toBeNull();
  });
  it("selectDemographicsSection returns null when data is null", () => {
    expect(selectDemographicsSection(makeState() as RootState)).toBeNull();
  });
});
```

---

### A4 — Create `tests/services/workforceApi.test.ts`

```typescript
import axios from "axios";
import { getWorkforce } from "@/services/api/workforceApi";

vi.mock("@/services/api/authApi", () => ({
  default: { get: vi.fn() },
}));

import apiClient from "@/services/api/authApi";

beforeEach(() => {
  localStorage.setItem(
    "userDetail",
    JSON.stringify({ auth: { tokens: { accessToken: "test-token" } } })
  );
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("workforceApi", () => {
  it("calls GET /api/v1/dashboard/workforce with Bearer token", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { workforce: {} } });
    await getWorkforce();
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/dashboard/workforce",
      expect.objectContaining({ headers: { Authorization: "Bearer test-token" } })
    );
  });

  it("returns response data on success", async () => {
    const mockData = { workforce: { totalWorkforce: 100 } };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });
    const result = await getWorkforce();
    expect(result).toEqual(mockData);
  });

  it("throws when no access token found", async () => {
    localStorage.clear();
    await expect(getWorkforce()).rejects.toThrow("Authentication required");
  });

  it("throws normalised error message on axios error", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      Object.assign(new Error("Network Error"), { isAxiosError: true, response: undefined })
    );
    await expect(getWorkforce()).rejects.toThrow();
  });
});
```

**Gate A**: `pnpm run type-check` passes. All test files exist and **fail** (Red state expected — implementations don't exist yet).

---

## Phase B — Service + Slice + Selectors + Store

### B1 — Create `src/services/api/workforceApi.ts`

Model exactly after `dashboardApi.ts`. Key differences:

- Endpoint: `/api/v1/dashboard/workforce`
- Return type: `WorkforceResponse`

```typescript
import axios from "axios";
import type { WorkforceResponse } from "@/types/workforceTypes";
import apiClient from "@/services/api/authApi";

const STORAGE_KEY = "userDetail";

const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.auth?.tokens?.accessToken || null;
  } catch {
    return null;
  }
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as { message?: string } | undefined;
    if (apiError?.message) return apiError.message;
    if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
    if (error.message) return error.message;
  }
  return "An unexpected error occurred. Please try again.";
};

export const getWorkforce = async (): Promise<WorkforceResponse> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required. Please log in again.");
    const response = await apiClient.get<WorkforceResponse>("/api/v1/dashboard/workforce", {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 600000,
    });
    return response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Authentication required. Please log in again."
    ) {
      throw error;
    }
    throw new Error(getErrorMessage(error));
  }
};
```

---

### B2 — Create `src/store/slices/workforceSlice.ts`

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { getWorkforce } from "@/services/api/workforceApi"; // uncomment when BE is live
import type { WorkforceState, WorkforceResponse } from "@/types/workforceTypes";

const initialState: WorkforceState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
  isLoaded: false,
};

// TODO: Remove STATIC_WORKFORCE_DATA block and uncomment getWorkforce() call when BE is live
const STATIC_WORKFORCE_DATA: WorkforceResponse = {
  workforce: {
    totalWorkforce: 3120,
    enrolledBenefits: 2450,
    avgEmployeeCost: 2254,
    employerCostPerEmployee: 44000,
  },
  participation: {
    totalWorkforce: 3120,
    enrolledBenefits: 2450,
    retirementEnrollment: "64%",
    healthcareEnrollment: "78%",
    benefits: { FSA: "31%", wellness: "N/A", EAP: "N/A" },
    retirement: { "401k": "64%" },
    insurance: { health: "78%", dental: "65%", vision: "60%", life: "45%" },
  },
  demographics: {
    employementType: [
      { department: "all", fullTime: "80%", partTime: "20%", seasonal: "5%" },
      { department: "engineering", fullTime: "90%", partTime: "10%", seasonal: "0%" },
      { department: "sales", fullTime: "70%", partTime: "30%", seasonal: "10%" },
      { department: "hr", fullTime: "85%", partTime: "15%", seasonal: "0%" },
    ],
    gender: { men: "55%", women: "40%" },
    employmentBreakdownByAge: [
      { ageGroup: "> 30", fullTime: 10, partTime: 20, seasonal: 5 },
      { ageGroup: "30 - 40", fullTime: 30, partTime: 35, seasonal: 10 },
      { ageGroup: "40 - 50", fullTime: 45, partTime: 25, seasonal: 15 },
      { ageGroup: "50 - 60", fullTime: 10, partTime: 15, seasonal: 8 },
      { ageGroup: "60+", fullTime: 5, partTime: 5, seasonal: 2 },
    ],
  },
  compensation: {
    salaryBreakdown: { medianSalary: 60000, avgSalary: 65000, avgHourlyRate: 30 },
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
          employerCostPerPaycheck: null,
        },
        {
          salaryRange: "50k-70k",
          avgEmployeeCostPerPaycheck: 220.22,
          avgEmployeeCostPercentage: 60,
          employerCostPerPaycheck: null,
        },
        {
          salaryRange: "70k-90k",
          avgEmployeeCostPerPaycheck: 330.22,
          avgEmployeeCostPercentage: 23,
          employerCostPerPaycheck: null,
        },
        {
          salaryRange: "90k-110k",
          avgEmployeeCostPerPaycheck: 440.22,
          avgEmployeeCostPercentage: 40,
          employerCostPerPaycheck: null,
        },
        {
          salaryRange: "110k+",
          avgEmployeeCostPerPaycheck: 600.22,
          avgEmployeeCostPercentage: 60,
          employerCostPerPaycheck: null,
        },
      ],
    },
  },
};

export const fetchWorkforce = createAsyncThunk<WorkforceResponse, void, { rejectValue: string }>(
  "workforce/fetchWorkforce",
  async (_, { rejectWithValue }) => {
    try {
      // Static data — remove this block when backend is live:
      return STATIC_WORKFORCE_DATA;

      // Live API call — uncomment when backend is live:
      // const response = await getWorkforce();
      // return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch workforce data"
      );
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

export const { clearWorkforce, clearWorkforceError, resetWorkforce } = workforceSlice.actions;
export default workforceSlice.reducer;
```

---

### B3 — Create `src/store/selectors/workforceSelectors.ts`

```typescript
import type { RootState } from "@/store/store";
import type {
  WorkforceResponse,
  WorkforceOverview,
  Participation,
  Demographics,
  Compensation,
} from "@/types/workforceTypes";

export const selectWorkforceState = (state: RootState) => state.workforce;
export const selectWorkforceData = (state: RootState): WorkforceResponse | null =>
  state.workforce.data;
export const selectWorkforceLoading = (state: RootState): boolean => state.workforce.loading;
export const selectWorkforceError = (state: RootState): string | null => state.workforce.error;
export const selectWorkforceLastFetched = (state: RootState): number | null =>
  state.workforce.lastFetched;
export const selectWorkforceIsLoaded = (state: RootState): boolean => state.workforce.isLoaded;

export const selectWorkforceSection = (state: RootState): WorkforceOverview | null =>
  state.workforce.data?.workforce ?? null;

export const selectParticipationSection = (state: RootState): Participation | null =>
  state.workforce.data?.participation ?? null;

export const selectDemographicsSection = (state: RootState): Demographics | null =>
  state.workforce.data?.demographics ?? null;

export const selectCompensationSection = (state: RootState): Compensation | null =>
  state.workforce.data?.compensation ?? null;
```

---

### B4 — Edit `src/store/store.ts`

Add 3 lines:

```typescript
// Imports (add):
import workforceReducer from "./slices/workforceSlice";
import type { WorkforceState } from "@/types/workforceTypes";

// rootReducer (add):
workforce: workforceReducer,

// RootState type (add):
workforce: WorkforceState;
```

**Gate B**: `pnpm test` — all Phase A test files pass (Green). `pnpm run type-check` passes.

---

## Phase C — DashboardPage Integration

### C1 — Edit `src/pages/dashboard/DashboardPage.tsx`

Add one import at top:

```typescript
import { fetchWorkforce } from "@/store/slices/workforceSlice";
```

Inside the `fetchWithModal` async function (around line 179), after `dispatch(fetchDashboard())`, add:

```typescript
// Fire-and-forget — workforce errors surface inside WorkforcePage, not here
dispatch(fetchWorkforce());
```

Also add the same line in `handleFetchDashboardWithModals` (around line 238) for the retry path:

```typescript
dispatch(fetchWorkforce());
```

**Gate C**: `pnpm run type-check` passes. In `pnpm dev`, opening `/dashboard` with Redux DevTools shows `fetchWorkforce/pending` and `fetchWorkforce/fulfilled` actions firing.

---

## Phase D — WorkforcePage Refactor

### D1 — Edit `src/pages/workforce/SalaryChart.tsx`

Change the signature from `const SalaryRangeChart: React.FC` to:

```typescript
interface SalaryRangeChartProps {
  data: ChartItem[];
}
const SalaryRangeChart: React.FC<SalaryRangeChartProps> = ({ data }) => { ... }
```

Remove `const data: ChartItem[] = [...]` (the internal hardcoded array).

---

### D2–D18 — Refactor `src/pages/workforce/WorkforcePage.tsx`

**Step-by-step in order:**

**D2** — Add imports, remove old imports:

```typescript
// ADD:
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectWorkforceLoading,
  selectWorkforceError,
  selectWorkforceSection,
  selectParticipationSection,
  selectDemographicsSection,
  selectCompensationSection,
} from "@/store/selectors/workforceSelectors";
import ErrorMessage from "@/components/common/ErrorMessage";
// REMOVE: selectIndustryOverview, selectZipCodes, selectDashboardData (if no longer needed)
```

**D3** — Replace `isLoadingCards` state:

```typescript
// REMOVE:
const [isLoadingCards, setIsLoadingCards] = useState(true);
useEffect(() => {
  const timer = setTimeout(() => setIsLoadingCards(false), 5000);
  return () => clearTimeout(timer);
}, []);

// REPLACE WITH:
const isLoadingCards = useAppSelector(selectWorkforceLoading);
const workforceError = useAppSelector(selectWorkforceError);
```

**D4** — Add section selectors:

```typescript
const workforceSection = useAppSelector(selectWorkforceSection);
const participationSection = useAppSelector(selectParticipationSection);
const demographicsSection = useAppSelector(selectDemographicsSection);
const compensationSection = useAppSelector(selectCompensationSection);
```

**D5** — Add `parsePercentage` helper (top of component, before hooks):

```typescript
const parsePercentage = (value: string): number => {
  const num = parseFloat(value.replace("%", ""));
  return isNaN(num) ? 0 : num;
};
```

**D6** — Update `overviewCardsConfig` counts:

```typescript
count: workforceSection?.totalWorkforce?.toLocaleString() ?? "--",  // "Total Workforce"
count: workforceSection?.enrolledBenefits?.toLocaleString() ?? "--",  // "Enrolled in Benefits"
count: workforceSection ? `$${workforceSection.avgEmployeeCost.toLocaleString()}` : "--",  // "Avg. Employee Cost"
```

**D7** — Update `employeeCardsConfig` counts:

```typescript
count: workforceSection ? `$${workforceSection.employerCostPerEmployee.toLocaleString()}/yr` : "--",  // "Employer Cost Per Employee"
count: "--",  // "Avg. PTO Taken" — not in API response
count: "--",  // "Avg. Sick Days Taken" — not in API response
```

**D8** — Update `participationCardsConfig` counts:

```typescript
count: participationSection?.totalWorkforce?.toLocaleString() ?? "--",   // "Eligible Employees"
count: participationSection?.enrolledBenefits?.toLocaleString() ?? "--",  // "Enrolled Employees"
count: participationSection?.retirementEnrollment ?? "--",                // "Enrolled in retirement"
count: participationSection?.healthcareEnrollment ?? "--",                // "Enrolled in healthcare"
```

**D9** — Update Benefits / Retirement / Insurance ProgressCard sections:

```typescript
// Benefits:
items: [
  {
    label: "FSA",
    percentage: parsePercentage(participationSection?.benefits.FSA ?? "0"),
    progressColor: "bg-ws-navy-300",
  },
  {
    label: "Wellness",
    percentage: parsePercentage(participationSection?.benefits.wellness ?? "0"),
    progressColor: "bg-ws-navy-300",
  },
  {
    label: "Employee Assist",
    percentage: parsePercentage(participationSection?.benefits.EAP ?? "0"),
    progressColor: "bg-ws-navy-300",
  },
];
// Retirement:
items: [
  {
    label: "401k",
    percentage: parsePercentage(participationSection?.retirement["401k"] ?? "0"),
    progressColor: "bg-ws-light-teal-400",
  },
];
// Insurance:
items: [
  {
    label: "Health",
    percentage: parsePercentage(participationSection?.insurance.health ?? "0"),
    progressColor: "bg-ws-light-teal-300",
  },
  {
    label: "Dental",
    percentage: parsePercentage(participationSection?.insurance.dental ?? "0"),
    progressColor: "bg-ws-light-teal-300",
  },
  {
    label: "Vision",
    percentage: parsePercentage(participationSection?.insurance.vision ?? "0"),
    progressColor: "bg-ws-light-teal-300",
  },
  {
    label: "Life",
    percentage: parsePercentage(participationSection?.insurance.life ?? "0"),
    progressColor: "bg-ws-light-teal-300",
  },
];
```

**D10** — Update `demographicsCardsConfig` counts:

```typescript
count: demographicsSection?.gender.women ?? "--",  // "Women"
count: demographicsSection?.gender.men ?? "--",    // "Men"
```

**D11 & D12** — Replace department dropdown state and options:

```typescript
// State: change type from "owners" | "renters" to string
const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

// Items derived from API:
const departmentItems =
  demographicsSection?.employementType.map(entry => ({
    id: entry.department,
    label:
      entry.department === "all"
        ? "All"
        : entry.department.charAt(0).toUpperCase() + entry.department.slice(1),
  })) ?? [];
```

Update all three `<Select>` instances (Demographics section and Workforce Breakdown section) to use `departmentItems` and `selectedDepartment`.

**D13** — Replace `donutChartsConfig` (depends on selected department):

```typescript
const selectedDeptData =
  demographicsSection?.employementType.find(e => e.department === selectedDepartment) ??
  demographicsSection?.employementType[0];

const donutChartsConfig = selectedDeptData
  ? [
      {
        id: "full-time",
        label: "Full Time",
        percentage: parsePercentage(selectedDeptData.fullTime),
        progressColor: "color-ws-progress-primary",
        backgroundColor: "bg-ws-progress-primary",
      },
      {
        id: "part-time",
        label: "Part Time",
        percentage: parsePercentage(selectedDeptData.partTime),
        progressColor: "color-ws-progress-secondary",
        backgroundColor: "bg-ws-progress-secondary",
      },
      {
        id: "seasonal",
        label: "Seasonal",
        percentage: parsePercentage(selectedDeptData.seasonal),
        progressColor: "color-ws-progress-turnery",
        backgroundColor: "bg-ws-progress-turnery",
      },
    ]
  : [];
```

**D14** — Replace `ageBreakdownConfig`:

```typescript
const ageBreakdownConfig = (demographicsSection?.employmentBreakdownByAge ?? []).map(
  (entry, i) => ({
    id: `age-${i}`,
    label: `Age: ${entry.ageGroup}`,
    value: entry.fullTime,
    customColor:
      [
        "bg-ws-light-teal-400",
        "bg-ws-light-teal-700",
        "bg-ws-light-teal-100",
        "bg-ws-light-teal-300",
        "bg-ws-light-teal-950",
      ][i % 5] + " rounded-none",
  })
);
```

**D15** — Update `compensationCardsConfig` counts:

```typescript
count: compensationSection ? `$${compensationSection.salaryBreakdown.medianSalary.toLocaleString()}/yr` : "--",
count: compensationSection ? `$${compensationSection.salaryBreakdown.avgSalary.toLocaleString()}/yr` : "--",
count: compensationSection ? `$${compensationSection.salaryBreakdown.avgHourlyRate.toFixed(2)}` : "--",
```

**D16** — Update `salaryBreakdownCardsConfig` counts:

```typescript
count: compensationSection ? `$${compensationSection.benefitsCost.employeeContribution.toLocaleString()}` : "--",
count: compensationSection?.benefitsCost.employerCost ?? "--",
```

**D17** — Replace `users` array:

```typescript
const users = (compensationSection?.workforceBreakdown.departments ?? []).map(d => ({
  department: d.label,
  employeeNumber: String(d.empNumber),
  partTime: String(d.partTime),
  fullTime: String(d.fullTime),
  salaryRange: d.salaryRange,
}));
```

**D18** — Replace `salary` array:

```typescript
const salary = (compensationSection?.benefitsCost.table ?? []).map(row => ({
  salaryRange: row.salaryRange,
  avgEmployeeCostPerPaycheck: `${row.avgEmployeeCostPerPaycheck} (${row.avgEmployeeCostPercentage}%)`,
  employerCostPerPaycheck:
    row.employerCostPerPaycheck != null ? String(row.employerCostPerPaycheck) : "$xx.xx",
}));
```

**D19** — Pass data to SalaryChart:

```typescript
const salaryChartData = (compensationSection?.benefitsCost.graph ?? []).map(g => ({
  label: g.salaryRange,
  min: g.min,
  boxStart: g.min,
  boxEnd: g.max,
  max: g.max,
}));

// In JSX:
<SalaryChart data={salaryChartData} />
```

**D20** — Add error banner at top of page content:

```typescript
{workforceError && (
  <ErrorMessage
    message={workforceError}
    errorType="danger"
    onClose={() => {/* handled by slice */}}
  />
)}
```

**Gate D**: `pnpm run type-check` passes. `pnpm dev` smoke test — `/dashboard` Workforce tab shows static data in all sections, no console errors, loading skeletons appear on initial load.

---

## Phase E — Quality Gate

```bash
pnpm run type-check   # must be zero errors
pnpm lint:fix
pnpm format
pnpm test             # all tests pass including new workforce tests
```

Smoke test `pnpm dev`:

- Navigate to `/dashboard` → loading skeletons appear briefly in Workforce tab
- Static data renders in all sections (Overview, Participation, Demographics, Compensation)
- No hardcoded display values remain in `WorkforcePage.tsx`
- Switching department in dropdown updates donut chart percentages
- No console errors
