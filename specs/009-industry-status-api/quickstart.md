# Quickstart: 009-industry-status-api

## Prerequisites

- Node.js 18+
- pnpm installed
- Backend running with `/finch/status` (extended) and `/industry` endpoints available

## Setup

```bash
git checkout 009-industry-status-api
pnpm install
pnpm dev
```

## Verify the Feature

### Happy Path (industry === "fetch")

1. Log in with a user who has:
   - Completed assessment
   - `/finch/status` returning `connection.industry: "fetch"`
2. Navigate to Dashboard
3. Click the **Industry** tab
4. Observe: skeleton loaders appear immediately
5. Observe: skeleton loaders replaced with industry data (overview cards, turnover charts, wage comparisons, housing burden)
6. Switch to another tab, then back to **Industry**
7. Observe: data shown instantly (no skeleton, no new API call)

### Finch Industry Tab

1. Same user as above, with a completed Finch connection (`isFinchCompleted === true`)
2. Click the **Finch Industry** tab
3. Same behavior: skeleton → data → cached on re-visit

### No-Fetch Path (industry === null)

1. Log in with a user whose `/finch/status` returns `connection.industry: null`
2. Click the **Industry** tab
3. Observe: no skeleton loader, no API call (verify in Network tab)

## Run Tests

```bash
pnpm run type-check
pnpm vitest run tests/store/slices/industrySlice.test.ts
pnpm vitest run tests/store/selectors/industrySelectors.test.ts
pnpm vitest run tests/hooks/useIndustry.test.ts
pnpm vitest run tests/services/industryApi.test.ts
```

## Key Files

| File | Purpose |
|------|---------|
| `src/types/industryTypes.ts` | TypeScript interfaces for industry data + slice state |
| `src/types/finchStatusTypes.ts` | Extended with `industry` field on `FinchConnection` |
| `src/services/api/industryApi.ts` | `getIndustry()` service function |
| `src/store/slices/industrySlice.ts` | Redux slice + `fetchIndustry` async thunk |
| `src/store/selectors/industrySelectors.ts` | Typed selectors for industry state |
| `src/store/store.ts` | Registers `industryReducer` |
| `src/hooks/useIndustry.ts` | Hook: conditional fetch + loading/data/error |
| `src/store/selectors/finchStatusSelectors.ts` | New selector: `selectFinchIndustryStatus` |
| `src/pages/benchmark/BenchmarkPage.tsx` | Uses `useIndustry` for skeleton/data toggle |
| `src/pages/benchmark/BenchmarkFinchPage.tsx` | Uses `useIndustry` for skeleton/data toggle |

## Architecture Flow

```
/finch/status (polled every 15s)
     │
     ▼
finchStatusSlice → state.finchStatus.connection.industry
     │
     ▼ (read by useIndustry hook)
useIndustry hook
     │ (if industry === "fetch" && !isLoaded)
     ▼
industryApi.getIndustry() → GET /industry
     │
     ▼
industrySlice → state.industry.data
     │
     ▼ (selectors)
BenchmarkPage / BenchmarkFinchPage
     │
     ▼ (loading ? skeleton : data)
UI Render
```
