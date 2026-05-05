# Quickstart: Dynamic Proven Strategy Flags

**Branch**: `001-proven-strategy-flags` | **Date**: 2026-05-05  
**Spec**: [spec.md](./spec.md) | **Data Model**: [data-model.md](./data-model.md)

This guide shows the exact code changes in dependency order. Implement in this sequence to avoid type errors between steps.

---

## Step 1 — New file: `src/types/strategyFlagTypes.ts`

```typescript
/**
 * Tri-state flag returned by the API for proven strategy cards.
 *
 * - "green"  → strategy is implemented; show green card + green icon
 * - "yellow" → strategy is recommended but not implemented; show yellow card + yellow icon
 * - "hidden" → strategy not applicable or insufficient data; card is NOT rendered
 */
export type StrategyFlagStatus = "green" | "yellow" | "hidden";
```

---

## Step 2 — New file: `src/utils/strategyFlagUtils.ts`

```typescript
import type { StrategyFlagStatus } from "@/types/strategyFlagTypes";

const VALID_FLAGS: ReadonlySet<string> = new Set(["green", "yellow", "hidden"]);

/**
 * Normalise an unknown API value to a valid StrategyFlagStatus.
 * Any unrecognised or absent value defaults to "hidden".
 */
export function normaliseFlag(raw: unknown): StrategyFlagStatus {
  return typeof raw === "string" && VALID_FLAGS.has(raw) ? (raw as StrategyFlagStatus) : "hidden";
}
```

---

## Step 3 — Update `src/types/recommendationsTypes.ts`

Change the three flag fields from `boolean` to `StrategyFlagStatus`:

```typescript
import type { StrategyFlagStatus } from "./strategyFlagTypes";

// ...

export interface RecommendationData {
  strategicRecommendations: StrategicRecommendation[];
  /** Whether the employer has auto-enrollment enabled */
  autoEnroll: StrategyFlagStatus;
  /** Whether the employer uses non-elective match contributions */
  nonElectiveMatch: StrategyFlagStatus;
  /** Whether the employer has healthcare affordability measures in place */
  healthcareAffordability: StrategyFlagStatus;
  dataStatus: string;
}
```

---

## Step 4 — Update `src/types/workforceTypes.ts`

Add the new optional field to `WorkforceEnvelope`:

```typescript
import type { StrategyFlagStatus } from "./strategyFlagTypes";

// ...

export interface WorkforceEnvelope {
  dataStatus: string;
  workforce: WorkforceOverview;
  participation: Participation;
  demographics: Demographics;
  compensation: Compensation;
  /** Finch flow only: healthcare affordability strategy flag from backend scoring. */
  healthcareAffordability?: StrategyFlagStatus;
}
```

---

## Step 5 — Update `src/store/selectors/recommendationsSelectors.ts`

```typescript
import { normaliseFlag } from "@/utils/strategyFlagUtils";
import type { StrategyFlagStatus } from "@/types/strategyFlagTypes";

// Remove old return type annotation; replace with new shape:

/**
 * Select the three proven strategy implementation flags from the Recommendations API.
 * Returns StrategyFlagStatus values; unknown/absent values default to "hidden".
 * Note: In the Finch flow, healthcareAffordability is overridden by the Workforce API
 * (done in RecommendationsFinchPage, not in this selector).
 */
export const selectProvenStrategiesFlags = createSelector(
  [selectRecommendationItem],
  (
    item
  ): {
    nonElectiveMatch: StrategyFlagStatus;
    autoEnroll: StrategyFlagStatus;
    healthcareAffordability: StrategyFlagStatus;
  } => ({
    nonElectiveMatch: normaliseFlag(item?.nonElectiveMatch),
    autoEnroll: normaliseFlag(item?.autoEnroll),
    healthcareAffordability: normaliseFlag(item?.healthcareAffordability),
  })
);
```

---

## Step 6 — Update `src/store/selectors/workforceSelectors.ts`

Add new selector at the bottom of the file:

```typescript
import { normaliseFlag } from "@/utils/strategyFlagUtils";
import type { StrategyFlagStatus } from "@/types/strategyFlagTypes";

// ... existing selectors ...

/**
 * Select the healthcare affordability strategy flag from the Workforce API.
 * Used in the Finch flow to override the Recommendations API value.
 * Defaults to "hidden" when data is absent or unrecognised.
 */
export const selectWorkforceHealthcareAffordabilityFlag = (state: RootState): StrategyFlagStatus =>
  normaliseFlag(state.workforce.data?.workforce.healthcareAffordability);
```

---

## Step 7 — Update `src/pages/recommendations/CoreBenefitsEnhancement.tsx`

### 7a — Update types and props

```typescript
import type { StrategyFlagStatus } from "@/types/strategyFlagTypes";

// Replace the ProvenStrategyFlags interface:
export interface ProvenStrategyFlags {
  nonElectiveMatch: StrategyFlagStatus;
  autoEnroll: StrategyFlagStatus;
  healthcareAffordability: StrategyFlagStatus;
}

// Update CoreBenefitsEnhancementProps — add visibleFlagsTotal:
interface CoreBenefitsEnhancementProps {
  readonly isLoading: boolean;
  readonly provenStrategiesCount: number;
  readonly provenStrategiesPercent: number;
  readonly provenStrategyFlags: ProvenStrategyFlags;
  readonly visibleFlagsTotal: number;
}
```

### 7b — Update the strategies counter text

```tsx
// BEFORE:
<h4 className="text-lg font-medium text-ws-text-primary">
  Strategies Implemented: {provenStrategiesCount}/3
</h4>
<p className="my-4 text-base text-ws-text-primary">
  You're already leveraging {provenStrategiesCount} of 3 benefits best practices ...
</p>

// AFTER:
<h4 className="text-lg font-medium text-ws-text-primary">
  Strategies Implemented: {provenStrategiesCount}/{visibleFlagsTotal}
</h4>
<p className="my-4 text-base text-ws-text-primary">
  You're already leveraging {provenStrategiesCount} of {visibleFlagsTotal} benefits best practices ...
</p>
```

### 7c — Update card rendering loop

```tsx
// BEFORE (boolean check):
{
  provenStrategiesCardsConfig.map(card => {
    const flag = provenStrategyFlags[card.id as keyof typeof provenStrategyFlags];
    return (
      <ProvenStrategiesCard
        key={card.id}
        title={card.title}
        titleIcon={flag ? <LikeIcon /> : <UserGroupIcon />}
        descriptionText={
          flag && card.descriptionTextFlagTrue ? card.descriptionTextFlagTrue : card.descriptionText
        }
        className={flag ? "bg-ws-success-25" : "bg-ws-warning-50"}
      />
    );
  });
}

// AFTER (tri-state check):
{
  provenStrategiesCardsConfig.map(card => {
    const flag = provenStrategyFlags[card.id as keyof ProvenStrategyFlags];
    if (flag === "hidden") return null;

    const isGreen = flag === "green";
    return (
      <ProvenStrategiesCard
        key={card.id}
        title={card.title}
        titleIcon={
          isGreen ? (
            <span className="text-ws-success-600">
              <LikeIcon />
            </span>
          ) : (
            <span className="text-ws-warning-500">
              <UserGroupIcon />
            </span>
          )
        }
        descriptionText={
          isGreen && card.descriptionTextFlagTrue
            ? card.descriptionTextFlagTrue
            : card.descriptionText
        }
        className={isGreen ? "bg-ws-success-25" : "bg-ws-warning-50"}
      />
    );
  });
}
```

### 7d — Guard when all flags hidden

In the skeleton section, also update the skeleton count to use `visibleFlagsTotal`:

```tsx
// BEFORE:
{isLoading ? (
  <>
    <ProvenStrategiesCardsSkeleton />
    <ProvenStrategiesCardsSkeleton />
    <ProvenStrategiesCardsSkeleton />
  </>
) : ( ...cards... )}

// AFTER:
{isLoading ? (
  Array.from({ length: visibleFlagsTotal || 3 }).map((_, i) => (
    <ProvenStrategiesCardsSkeleton key={i} />
  ))
) : ( ...cards... )}
```

---

## Step 8 — Update `src/pages/recommendations/RecommendationsFinchPage.tsx`

```tsx
import { selectWorkforceHealthcareAffordabilityFlag } from "@/store/selectors/workforceSelectors";
import type { ProvenStrategyFlags } from "./CoreBenefitsEnhancement";

// Inside component:
const { isFinchAssessmentIncomplete, isConnected } = useAssessmentStatus();

// From selectors (Recommendations API flags):
const recommProvenFlags = useAppSelector(selectProvenStrategiesFlags);

// From Workforce API (Finch flow only):
const workforceHealthcareFlag = useAppSelector(selectWorkforceHealthcareAffordabilityFlag);

// Compose final flags based on flow:
const provenStrategyFlags: ProvenStrategyFlags = {
  autoEnroll: recommProvenFlags.autoEnroll,
  nonElectiveMatch: recommProvenFlags.nonElectiveMatch,
  healthcareAffordability: isConnected
    ? workforceHealthcareFlag
    : recommProvenFlags.healthcareAffordability,
};

// Updated count computation:
const flagValues = Object.values(provenStrategyFlags);
const provenStrategiesCount = flagValues.filter(f => f === "green").length;
const visibleFlagsTotal = flagValues.filter(f => f !== "hidden").length;
const provenStrategiesPercent =
  visibleFlagsTotal > 0 ? Math.round((provenStrategiesCount / visibleFlagsTotal) * 100) : 0;
```

Pass the new `visibleFlagsTotal` prop to `CoreBenefitsEnhancement`:

```tsx
<CoreBenefitsEnhancement
  isLoading={isLoading}
  provenStrategiesCount={provenStrategiesCount}
  provenStrategiesPercent={provenStrategiesPercent}
  provenStrategyFlags={provenStrategyFlags}
  visibleFlagsTotal={visibleFlagsTotal}
/>
```

---

## Step 9 — Update tests: `tests/pages/CoreBenefitsEnhancement.test.tsx`

### Update default props fixture

```typescript
const defaultProps = {
  isLoading: false,
  provenStrategiesCount: 0,
  provenStrategiesPercent: 0,
  visibleFlagsTotal: 3,
  provenStrategyFlags: {
    nonElectiveMatch: "yellow" as const,
    autoEnroll: "yellow" as const,
    healthcareAffordability: "yellow" as const,
  },
};
```

### Add new tests for tri-state behavior

```typescript
describe("CoreBenefitsEnhancement — hidden flag hides card", () => {
  it("renders 3 cards when no flag is hidden", () => {
    render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ nonElectiveMatch: "yellow", autoEnroll: "yellow", healthcareAffordability: "yellow" }}
        visibleFlagsTotal={3}
      />
    );
    expect(screen.getByText("Non-elective match")).toBeInTheDocument();
    expect(screen.getByText("Auto Enrollment")).toBeInTheDocument();
    expect(screen.getByText("Healthcare affordability")).toBeInTheDocument();
  });

  it("hides the card for a 'hidden' flag — healthcareAffordability", () => {
    render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ nonElectiveMatch: "yellow", autoEnroll: "yellow", healthcareAffordability: "hidden" }}
        visibleFlagsTotal={2}
      />
    );
    expect(screen.queryByText("Healthcare affordability")).not.toBeInTheDocument();
    expect(screen.getByText("Non-elective match")).toBeInTheDocument();
  });

  it("shows denominator from visibleFlagsTotal prop, not hardcoded 3", () => {
    render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategiesCount={1}
        visibleFlagsTotal={2}
        provenStrategyFlags={{ nonElectiveMatch: "green", autoEnroll: "yellow", healthcareAffordability: "hidden" }}
      />
    );
    expect(screen.getByText(/1\/2/)).toBeInTheDocument();
  });
});

describe("CoreBenefitsEnhancement — green vs yellow styling", () => {
  it("applies green class for 'green' flag", () => {
    const { container } = render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ nonElectiveMatch: "green", autoEnroll: "yellow", healthcareAffordability: "yellow" }}
      />
    );
    const cards = container.querySelectorAll(".bg-ws-success-25");
    expect(cards).toHaveLength(1);
  });

  it("applies yellow class for 'yellow' flag", () => {
    const { container } = render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ nonElectiveMatch: "yellow", autoEnroll: "yellow", healthcareAffordability: "yellow" }}
      />
    );
    const cards = container.querySelectorAll(".bg-ws-warning-50");
    expect(cards).toHaveLength(3);
  });
});
```

### Update existing boolean tests to use string values

Replace all `nonElectiveMatch: true` → `nonElectiveMatch: "green"`, `nonElectiveMatch: false` → `nonElectiveMatch: "yellow"` (and same pattern for other flags) in existing tests.

---

## Step 10 — Update `tests/store/selectors/recommendationsSelectors.test.ts`

```typescript
// BEFORE:
expect(result.nonElectiveMatch).toBe(false);
expect(result.autoEnroll).toBe(false);
expect(result.healthcareAffordability).toBe(false);

// AFTER:
expect(result.nonElectiveMatch).toBe("hidden");
expect(result.autoEnroll).toBe("hidden");
expect(result.healthcareAffordability).toBe("hidden");

// Add normalisation test:
it("normalises unknown flag value to 'hidden'", () => {
  const state = buildMockState({ nonElectiveMatch: true }); // legacy boolean
  const result = selectProvenStrategiesFlags(state);
  expect(result.nonElectiveMatch).toBe("hidden");
});
```

---

## Quality Gate

After all changes, run:

```bash
pnpm run type-check   # must pass with 0 errors
pnpm lint:fix         # auto-fix lint issues
pnpm test             # all tests must pass
```

TypeScript will catch any component or selector callsites that still pass `boolean` — fix those before declaring the feature complete.
