# Research: Add "Other" Gender Card with Tooltip

**Feature**: `001-add-gender-other-card`  
**Date**: 2026-05-07  
**Status**: Complete — no NEEDS CLARIFICATION markers remain

---

## Research Tasks & Findings

### 1. StaticCard tooltip support

**Question**: Does the existing `StaticCard` component support a tooltip natively, or does it need modification?

**Finding**: `StaticCard` already accepts `tooltipText?: string` and `infoIcon?: boolean` props. When `infoIcon={true}` and `tooltipText` is set, it renders the tooltip icon and activates the tooltip on hover/focus. No component changes required.

**Evidence**: `src/pages/recommendations/StaticCard.tsx` lines 17, 32, 56.

**Decision**: Pass `infoIcon={true}` and `tooltipText="Other includes individuals that choose not to identify or do not identify as man or woman."` for the "Other" card in `demographicsCardsConfig`. Women and Men cards continue without tooltip props.

---

### 2. GenderBreakdown type — current shape and backward compatibility

**Question**: What is the current `GenderBreakdown` interface? Is the `other` field absent?

**Finding**:

```typescript
// src/types/workforceTypes.ts (current)
export interface GenderBreakdown {
  men: string; // e.g. "55%"
  women: string; // e.g. "40%"
}
```

The `other` field does not exist yet. Backend may or may not include it depending on API version.

**Decision**: Add `other?: string` (optional) so existing API responses that omit the field continue to deserialize correctly. The hook uses `??  "--"` nullish coalescing, which handles `undefined` identically to `null`.

---

### 3. Affected test files

**Question**: Which test files reference `GenderBreakdown`, `sampleDemographics`, or `demographicsCardsConfig` directly (i.e., not via full mock)?

**Finding**:
| File | Impact |
|------|--------|
| `tests/hooks/useWorkforceDemographicsConfig.test.ts` | **Direct** — contains `sampleDemographics` fixture with `gender: { men, women }`. Must add `other` field. Tests that destructure `[women, men]` must be updated to account for 3 cards. |
| `tests/pages/WorkforceTab.test.tsx` | **Mock** — mocks the hook entirely, returns `demographicsCardsConfig: []`. No change needed. |
| `tests/pages/WorkforcePage.test.tsx` | **Mock** — mocks the hook entirely with `vi.fn()`. No change needed. |
| `tests/pages/WorkforceDemographics.test.tsx` | **Prop-based** — receives `demographicsCards` array as prop. Array shape unchanged (existing cards still have same fields). No change needed unless test checks count. |

**Decision**: Update only `tests/hooks/useWorkforceDemographicsConfig.test.ts`.

---

### 4. Grid layout with 3 cards

**Question**: Does adding a third card break the existing two-column CSS grid for gender cards?

**Finding**: The gender cards render inside:

```html
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"></div>
```

On desktop (≥lg) this is a 2-column grid. A third item naturally wraps to a second row, filling the left column. This is standard CSS Grid behavior and produces a visually acceptable layout without any CSS changes.

**Decision**: No layout changes required. Third card wraps naturally.

---

### 5. Null-state behavior

**Question**: When `demographicsSection` is null, does the null-state test expect exactly 2 cards?

**Finding**: The existing null-state test (`it("returns empty arrays when demographicsSection is null", ...)`) asserts:

```typescript
expect(result.current.demographicsCardsConfig).toHaveLength(2);
```

After adding the "Other" card, the length will be 3 regardless of data availability (all three cards are always emitted, using `??  "--"` fallback).

**Decision**: Update the null-state assertion from `toHaveLength(2)` to `toHaveLength(3)`.

---

## Decisions Summary

| Decision                          | Rationale                                                   |
| --------------------------------- | ----------------------------------------------------------- |
| `other?: string` (optional field) | Backwards-compatible with APIs that omit the field          |
| Tooltip on "Other" card only      | Women/Men cards have no product requirement for tooltips    |
| `?? "--"` fallback in hook        | Consistent with existing `women` and `men` fallback pattern |
| Update only hook test file        | Other test files use complete mocks and are unaffected      |
| No layout changes                 | CSS Grid wrapping is acceptable for a third card            |
