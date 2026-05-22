# Quickstart: Add "Other" Gender Card with Tooltip

**Branch**: `001-add-gender-other-card`  
**Date**: 2026-05-07  
**Estimated effort**: ~20 lines of code across 3 files

This guide is the authoritative step-by-step implementation reference. Follow the steps in order; run the quality gates at the end.

---

## Prerequisites

- You are on branch `001-add-gender-other-card`
- `pnpm install` has been run
- `pnpm run test` passes on the base branch before you start

---

## Step 1 — Extend `GenderBreakdown` type

**File**: `src/types/workforceTypes.ts`

Find the `GenderBreakdown` interface and add the `other` optional field:

```typescript
// BEFORE
export interface GenderBreakdown {
  /** e.g. "55%" */
  men: string;
  /** e.g. "40%" */
  women: string;
}

// AFTER
export interface GenderBreakdown {
  /** e.g. "55%" */
  men: string;
  /** e.g. "40%" */
  women: string;
  /** e.g. "5%" — individuals who do not identify as man or woman, or choose not to identify */
  other?: string;
}
```

**Verification**: `pnpm run type-check` must still pass after this change.

---

## Step 2 — Add "Other" card to the hook

**File**: `src/hooks/useWorkforceDemographicsConfig.ts`

Inside `demographicsCardsConfig` `useMemo`, add a third entry after the "men" entry:

```typescript
// BEFORE — demographicsCardsConfig useMemo returns:
[
  {
    id: "women",
    title: "Women",
    count: demographicsSection?.gender.women ?? "--",
    getCountClass: () => COUNT_CLASS,
  },
  {
    id: "men",
    title: "Men",
    count: demographicsSection?.gender.men ?? "--",
    getCountClass: () => COUNT_CLASS,
  },
]

// AFTER — add the "other" entry:
[
  {
    id: "women",
    title: "Women",
    count: demographicsSection?.gender.women ?? "--",
    getCountClass: () => COUNT_CLASS,
  },
  {
    id: "men",
    title: "Men",
    count: demographicsSection?.gender.men ?? "--",
    getCountClass: () => COUNT_CLASS,
  },
  {
    id: "other",
    title: "Other",
    count: demographicsSection?.gender.other ?? "--",
    tooltipText:
      "Other includes individuals that choose not to identify or do not identify as man or woman.",
    getCountClass: () => COUNT_CLASS,
  },
]
```

No other changes to the hook are required.

---

## Step 3 — Update the hook test file

**File**: `tests/hooks/useWorkforceDemographicsConfig.test.ts`

### 3a — Add `other` to `sampleDemographics` fixture

Find `sampleDemographics` and update the `gender` field:

```typescript
// BEFORE
gender: { men: "55%", women: "40%" },

// AFTER
gender: { men: "55%", women: "40%", other: "5%" },
```

### 3b — Update null-state card count assertion

Find the null-state test and update the length assertion from `2` to `3`:

```typescript
// BEFORE
expect(result.current.demographicsCardsConfig).toHaveLength(2);

// AFTER
expect(result.current.demographicsCardsConfig).toHaveLength(3);
```

### 3c — Update "correct ids and titles" test

The test currently destructures `[women, men]`. Update it to also cover the "other" card:

```typescript
// BEFORE
it("demographicsCardsConfig has correct ids and titles", () => {
  mockStoreState = buildStoreState(sampleDemographics);
  const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
  const [women, men] = result.current.demographicsCardsConfig;
  expect(women.id).toBe("women");
  expect(women.title).toBe("Women");
  expect(men.id).toBe("men");
  expect(men.title).toBe("Men");
});

// AFTER
it("demographicsCardsConfig has correct ids and titles", () => {
  mockStoreState = buildStoreState(sampleDemographics);
  const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
  const [women, men, other] = result.current.demographicsCardsConfig;
  expect(women.id).toBe("women");
  expect(women.title).toBe("Women");
  expect(men.id).toBe("men");
  expect(men.title).toBe("Men");
  expect(other.id).toBe("other");
  expect(other.title).toBe("Other");
});
```

### 3d — Update "shows gender percentages" test

```typescript
// BEFORE
it("demographicsCardsConfig shows gender percentages from data", () => {
  mockStoreState = buildStoreState(sampleDemographics);
  const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
  const [women, men] = result.current.demographicsCardsConfig;
  expect(women.count).toBe("40%");
  expect(men.count).toBe("55%");
});

// AFTER
it("demographicsCardsConfig shows gender percentages from data", () => {
  mockStoreState = buildStoreState(sampleDemographics);
  const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
  const [women, men, other] = result.current.demographicsCardsConfig;
  expect(women.count).toBe("40%");
  expect(men.count).toBe("55%");
  expect(other.count).toBe("5%");
});
```

### 3e — Add new tests for the "Other" card

Add these new `it` blocks inside the `// ── demographicsCardsConfig ────` section, after the existing tests:

```typescript
it("other card has correct tooltip text", () => {
  mockStoreState = buildStoreState(sampleDemographics);
  const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
  const [, , other] = result.current.demographicsCardsConfig;
  expect(other.tooltipText).toBe(
    "Other includes individuals that choose not to identify or do not identify as man or woman."
  );
});

it("other card shows '--' fallback when gender.other is absent", () => {
  const demographicsWithoutOther: Demographics = {
    ...sampleDemographics,
    gender: { men: "55%", women: "40%" }, // no 'other' field
  };
  mockStoreState = buildStoreState(demographicsWithoutOther);
  const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
  const [, , other] = result.current.demographicsCardsConfig;
  expect(other.count).toBe("--");
});

it("women and men cards have no tooltipText", () => {
  mockStoreState = buildStoreState(sampleDemographics);
  const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
  const [women, men] = result.current.demographicsCardsConfig;
  expect(women.tooltipText).toBeUndefined();
  expect(men.tooltipText).toBeUndefined();
});
```

---

## Quality Gates

Run in order. All must pass before opening a PR.

```bash
# 1. Type-check
pnpm run type-check

# 2. Lint (auto-fix)
pnpm lint:fix

# 3. Format
pnpm format

# 4. All tests
pnpm run test
```

Expected: zero errors, zero type violations, all tests green.

---

## What NOT to change

- `src/pages/workforce/WorkforceDemographics.tsx` — already renders all `demographicsCardsConfig` cards dynamically via `.map()`; no changes needed.
- `src/pages/recommendations/StaticCard.tsx` — already supports `tooltipText` and `infoIcon`; no changes needed.
- `tests/pages/WorkforceTab.test.tsx` — uses a complete mock of the hook; unaffected.
- `tests/pages/WorkforcePage.test.tsx` — uses a complete mock of the hook; unaffected.
- `tests/pages/WorkforceDemographics.test.tsx` — passes `demographicsCards` as a prop; unaffected by the third card unless it asserts card count (check and update if needed).
- Redux store, selectors, services — no changes required.
