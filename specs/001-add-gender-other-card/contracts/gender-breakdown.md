# Data Contract: GenderBreakdown — Add `other` Field

**Feature**: `001-add-gender-other-card`  
**Date**: 2026-05-07  
**Contract Type**: Backend → Frontend data shape  
**Scope**: Additive, backwards-compatible change

---

## Context

The `GenderBreakdown` object is nested inside the `GET /dashboard/workforce` API response at the path:

```
response.workforce.demographics.gender
```

This contract documents the updated shape after adding the `other` field.

---

## TypeScript Interface

```typescript
// src/types/workforceTypes.ts

export interface GenderBreakdown {
  /** Percentage of workforce identifying as men. e.g. "55%" */
  men: string;
  /** Percentage of workforce identifying as women. e.g. "40%" */
  women: string;
  /**
   * Percentage of workforce who do not identify as man or woman,
   * or who choose not to identify. e.g. "5%"
   *
   * Optional: backends that have not yet implemented this field
   * will omit it. The frontend displays "--" when absent.
   */
  other?: string;
}
```

---

## Example API Responses

### Response that includes `other` (new)

```json
{
  "assessmentType": "finch",
  "workforce": {
    "dataStatus": "complete",
    "demographics": {
      "gender": {
        "women": "40%",
        "men": "55%",
        "other": "5%"
      },
      "employmentType": [...],
      "employmentBreakdownByAge": [...]
    }
  }
}
```

### Response without `other` (backwards-compatible — existing behavior preserved)

```json
{
  "assessmentType": "finch",
  "workforce": {
    "dataStatus": "complete",
    "demographics": {
      "gender": {
        "women": "40%",
        "men": "55%"
      },
      ...
    }
  }
}
```

In the second case, `gender.other` is `undefined`. The frontend falls back to `"--"` via nullish coalescing (`??  "--"`).

---

## Backward Compatibility

| Scenario                                | Frontend Behavior                                  |
| --------------------------------------- | -------------------------------------------------- |
| `gender.other` present as `"5%"`        | "Other" card shows `"5%"`                          |
| `gender.other` present as `"0%"`        | "Other" card shows `"0%"` (not treated as missing) |
| `gender.other` absent / `undefined`     | "Other" card shows `"--"`                          |
| Entire `gender` object missing (legacy) | All three cards show `"--"`                        |

---

## No Breaking Changes

- `men` and `women` remain required fields — no change.
- Existing consumers of `GenderBreakdown` that access only `men` and `women` continue to compile without changes.
- The TypeScript `other?: string` definition is additive.
