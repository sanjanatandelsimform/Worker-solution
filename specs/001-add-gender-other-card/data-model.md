# Data Model: Add "Other" Gender Card with Tooltip

**Feature**: `001-add-gender-other-card`  
**Date**: 2026-05-07

---

## Entities

### GenderBreakdown (modified)

Represents the gender distribution percentages returned by the backend in the Workforce API response under `workforce.demographics.gender`.

**Location**: `src/types/workforceTypes.ts`

#### Current shape

```typescript
export interface GenderBreakdown {
  /** e.g. "55%" */
  men: string;
  /** e.g. "40%" */
  women: string;
}
```

#### New shape (after this feature)

```typescript
export interface GenderBreakdown {
  /** e.g. "55%" */
  men: string;
  /** e.g. "40%" */
  women: string;
  /** e.g. "5%" — individuals who do not identify as man or woman, or choose not to identify */
  other?: string;
}
```

**Change**: Add `other?: string` as an optional field. The field is optional for backwards compatibility with backend API versions that do not yet return it.

**Validation rules**:

- When present, value is a percentage string (e.g. `"5%"`) matching the same format as `men` and `women`.
- When absent or undefined, UI displays `"--"` fallback.

---

### DemographicsCardConfig (conceptual — internal to hook, not exported)

The configuration record produced by `useWorkforceDemographicsConfig` for each gender card.

**Location**: `src/hooks/useWorkforceDemographicsConfig.ts` (inline, not a named type)

#### Shape (unchanged — existing fields)

```typescript
{
  id: string;               // unique card identifier
  title: string;            // displayed card heading
  count: string;            // percentage from backend, or "--" fallback
  tooltipText?: string;     // tooltip body text (only on "other" card)
  getCountClass: () => string; // returns tailwind class string for the count value
}
```

#### Cards emitted (after this feature)

| id        | title     | source field   | tooltipText                                                                                    |
| --------- | --------- | -------------- | ---------------------------------------------------------------------------------------------- |
| `"women"` | `"Women"` | `gender.women` | —                                                                                              |
| `"men"`   | `"Men"`   | `gender.men`   | —                                                                                              |
| `"other"` | `"Other"` | `gender.other` | `"Other includes individuals that choose not to identify or do not identify as man or woman."` |

---

## State Transitions

No new state introduced. The `gender.other` field flows from:

```
Backend API response
  → Redux store (workforceSlice.data.workforce.demographics.gender.other)
  → selectDemographicsSection selector
  → useWorkforceDemographicsConfig hook (demographicsCardsConfig[2])
  → WorkforceDemographics component (demographicsCardsConfig prop)
  → StaticCard render (count + tooltipText)
```

All transitions are read-only / one-directional.
