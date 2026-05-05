# Data Model: Dynamic Proven Strategy Flags

**Branch**: `001-proven-strategy-flags` | **Date**: 2026-05-05

---

## 1. New Shared Type: `StrategyFlagStatus`

```typescript
// src/types/strategyFlagTypes.ts  (NEW FILE)
export type StrategyFlagStatus = "green" | "yellow" | "hidden";
```

This type is shared across both the Recommendations and Workforce type modules.

---

## 2. Updated: `RecommendationData` (in `recommendationsTypes.ts`)

The three flag fields change from `boolean` to `StrategyFlagStatus`.

```typescript
// BEFORE
export interface RecommendationData {
  strategicRecommendations: StrategicRecommendation[];
  autoEnroll: boolean;
  nonElectiveMatch: boolean;
  healthcareAffordability: boolean;
  dataStatus: string;
}

// AFTER
import { StrategyFlagStatus } from "./strategyFlagTypes";

export interface RecommendationData {
  strategicRecommendations: StrategicRecommendation[];
  autoEnroll: StrategyFlagStatus;
  nonElectiveMatch: StrategyFlagStatus;
  healthcareAffordability: StrategyFlagStatus;
  dataStatus: string;
}
```

---

## 3. Updated: `WorkforceEnvelope` (in `workforceTypes.ts`)

New optional field added at the envelope level.

```typescript
// BEFORE
export interface WorkforceEnvelope {
  dataStatus: string;
  workforce: WorkforceOverview;
  participation: Participation;
  demographics: Demographics;
  compensation: Compensation;
}

// AFTER
import { StrategyFlagStatus } from "./strategyFlagTypes";

export interface WorkforceEnvelope {
  dataStatus: string;
  workforce: WorkforceOverview;
  participation: Participation;
  demographics: Demographics;
  compensation: Compensation;
  /** Finch flow only: healthcare affordability strategy flag from backend scoring */
  healthcareAffordability?: StrategyFlagStatus;
}
```

---

## 4. Updated: `ProvenStrategyFlags` (in `CoreBenefitsEnhancement.tsx`)

```typescript
// BEFORE
interface ProvenStrategyFlags {
  nonElectiveMatch: boolean;
  autoEnroll: boolean;
  healthcareAffordability: boolean;
}

// AFTER  — (or imported from strategyFlagTypes.ts and exported)
export interface ProvenStrategyFlags {
  nonElectiveMatch: StrategyFlagStatus;
  autoEnroll: StrategyFlagStatus;
  healthcareAffordability: StrategyFlagStatus;
}
```

---

## 5. Updated: `selectProvenStrategiesFlags` selector (in `recommendationsSelectors.ts`)

Returns recommendation-sourced flags only. The `healthcareAffordability` field here is used for the **manual flow**. In the Finch flow the page overrides it from the Workforce selector.

```typescript
import { StrategyFlagStatus } from "@/types/strategyFlagTypes";
import { ProvenStrategyFlags } from "@/pages/recommendations/CoreBenefitsEnhancement";

const VALID_FLAGS: ReadonlySet<string> = new Set(["green", "yellow", "hidden"]);

function normaliseFlag(raw: unknown): StrategyFlagStatus {
  return typeof raw === "string" && VALID_FLAGS.has(raw) ? (raw as StrategyFlagStatus) : "hidden";
}

export const selectProvenStrategiesFlags = createSelector(
  [selectRecommendationItem],
  (item): ProvenStrategyFlags => ({
    nonElectiveMatch: normaliseFlag(item?.nonElectiveMatch),
    autoEnroll: normaliseFlag(item?.autoEnroll),
    healthcareAffordability: normaliseFlag(item?.healthcareAffordability),
  })
);
```

---

## 6. New: `selectWorkforceHealthcareAffordabilityFlag` selector (in `workforceSelectors.ts`)

```typescript
import { StrategyFlagStatus } from "@/types/strategyFlagTypes";

const VALID_FLAGS: ReadonlySet<string> = new Set(["green", "yellow", "hidden"]);

function normaliseFlag(raw: unknown): StrategyFlagStatus {
  return typeof raw === "string" && VALID_FLAGS.has(raw) ? (raw as StrategyFlagStatus) : "hidden";
}

export const selectWorkforceHealthcareAffordabilityFlag = (state: RootState): StrategyFlagStatus =>
  normaliseFlag(state.workforce.data?.workforce.healthcareAffordability);
```

> Note: `normaliseFlag` can be extracted to `src/utils/strategyFlagUtils.ts` to avoid duplication across the two selector files.

---

## 7. Computed Values in `RecommendationsFinchPage`

```typescript
// Proven Strategies computed values
const flags = Object.values(provenStrategyFlags) as StrategyFlagStatus[];
const provenStrategiesCount = flags.filter(f => f === "green").length;
const visibleFlagsTotal = flags.filter(f => f !== "hidden").length;
const provenStrategiesPercent =
  visibleFlagsTotal > 0 ? Math.round((provenStrategiesCount / visibleFlagsTotal) * 100) : 0;
```

---

## 8. `CoreBenefitsEnhancement` Card Rendering Logic

```typescript
// Card config type unchanged — rendering logic updates:
{provenStrategiesCardsConfig.map(card => {
  const flag = provenStrategyFlags[card.id as keyof ProvenStrategyFlags];
  if (flag === "hidden") return null;  // FR-007: fully absent from DOM

  const isGreen = flag === "green";
  return (
    <ProvenStrategiesCard
      key={card.id}
      title={card.title}
      titleIcon={
        isGreen
          ? <span className="text-ws-success-600"><LikeIcon /></span>
          : <span className="text-ws-warning-500"><UserGroupIcon /></span>
      }
      descriptionText={
        isGreen && card.descriptionTextFlagTrue
          ? card.descriptionTextFlagTrue
          : card.descriptionText
      }
      className={isGreen ? "bg-ws-success-25" : "bg-ws-warning-50"}
    />
  );
})}
```

---

## 9. State Transitions

```
API returns flag value
       │
       ▼
normaliseFlag()  ──(unknown/null/undefined)──▶  "hidden"
       │
       ├──"green"  ──▶ green card + LikeIcon (green)   ──▶ counted in provenStrategiesCount + visibleFlagsTotal
       ├──"yellow" ──▶ yellow card + UserGroupIcon (yellow) ──▶ counted in visibleFlagsTotal only
       └──"hidden" ──▶ card NOT rendered                ──▶ excluded from both counts
```

---

## 10. Data Flow: Finch vs Manual

```
useAssessmentStatus()
  │
  ├─ isConnected = true  (Finch)
  │     autoEnroll          ◄── selectProvenStrategiesFlags (Recommendations API)
  │     nonElectiveMatch    ◄── selectProvenStrategiesFlags (Recommendations API)
  │     healthcareAfford.   ◄── selectWorkforceHealthcareAffordabilityFlag (Workforce API)
  │
  └─ isConnected = false (Manual)
        autoEnroll          ◄── selectProvenStrategiesFlags (Recommendations API)
        nonElectiveMatch    ◄── selectProvenStrategiesFlags (Recommendations API)
        healthcareAfford.   ◄── selectProvenStrategiesFlags (Recommendations API)
```

---

## 11. Files Changed Summary

| File                                                     | Change                                                                                                   |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/types/strategyFlagTypes.ts`                         | **NEW** — exports `StrategyFlagStatus`                                                                   |
| `src/types/recommendationsTypes.ts`                      | Update `autoEnroll`, `nonElectiveMatch`, `healthcareAffordability` from `boolean` → `StrategyFlagStatus` |
| `src/types/workforceTypes.ts`                            | Add `healthcareAffordability?: StrategyFlagStatus` to `WorkforceEnvelope`                                |
| `src/utils/strategyFlagUtils.ts`                         | **NEW** — exports `normaliseFlag()` helper                                                               |
| `src/store/selectors/recommendationsSelectors.ts`        | Update `selectProvenStrategiesFlags` return type + normalise values                                      |
| `src/store/selectors/workforceSelectors.ts`              | Add `selectWorkforceHealthcareAffordabilityFlag` selector                                                |
| `src/pages/recommendations/RecommendationsFinchPage.tsx` | Read `isConnected`, compose `provenStrategyFlags` per flow, update count computation                     |
| `src/pages/recommendations/CoreBenefitsEnhancement.tsx`  | Update `ProvenStrategyFlags` type, card rendering (tri-state), denominator prop                          |
| `tests/pages/CoreBenefitsEnhancement.test.tsx`           | Update fixtures to `StrategyFlagStatus`, add hidden-card tests                                           |
| `tests/store/selectors/recommendationsSelectors.test.ts` | Update flag assertions to string values                                                                  |
