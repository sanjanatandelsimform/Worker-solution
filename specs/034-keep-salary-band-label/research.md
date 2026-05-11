# Research: Keep Salary Band Label When No Data

**Branch**: `034-keep-salary-band-label`  
**Date**: 2026-05-07

## Research Question 1: Where in `drawBars()` should label rendering be extracted?

### Decision

Move the `const x = …` calculation **before** the null guard early-return, then emit the salary band label (`ctx.fillText(item.label, x, 420)`) inside the null guard block just before `return`. This is the smallest targeted diff—no restructuring of the rest of the function is required.

### Rationale

The current `drawBars()` flow is:

1. Null guard → `return` (skips everything)
2. Compute `x`
3. Draw whiskers, box, border, median line
4. Draw `$boxEnd` label (top), `$boxStart` label (bottom)
5. Draw `item.label` at y=420

The label at step 5 uses only `x` (which is computed from `index`—never from the null fields) and `item.label` (always a string). Therefore it is safe to compute `x` before the guard and emit the label inside the guard before the early return, with zero risk of a canvas context error.

### Alternatives Considered

| Alternative                                                                    | Rejected Because                                                                              |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Refactor forEach into two loops (one for labels, one for bars)                 | Over-engineered; adds complexity and changes call ordering which could affect test assertions |
| Always draw label at the very end via a second `.forEach` pass                 | Two passes over the same array; unnecessary for a single-field extraction                     |
| Move entire label block after the null check (restructure with `hasData` flag) | Larger diff; changes indentation of 6+ lines unnecessarily                                    |

### Alternatives Considered for Test Strategy

**Decision**: Keep all existing null-data suppression tests unchanged; add two new test cases inside the `"null data suppression"` describe block:

1. `"renders the salary band label for an all-null item"` — asserts `fillText` was called with `"X"` (the label value)
2. `"renders all labels in a mixed null/valid dataset"` — asserts all three labels ("Null", "IT", "HR") appear in fillText calls regardless of null-ness

**Rationale**: Existing tests are still correct after the change (they don't assert that `fillText` is never called for null items — only that `fillRect`/`strokeRect` are not called and that the text "null" doesn't appear). No existing tests break.

## Research Question 2: Does the inline comment need updating?

### Decision

Yes. The comment `// Skip items with any null numeric field — no box, whisker, or label drawn` must be updated to `// Skip items with any null numeric field — no box, whisker, or value labels drawn`.

### Rationale

After the change the salary band label IS drawn for null items, so the comment would be misleading if not corrected.

## Summary of Technical Approach

| Aspect                 | Detail                                                                |
| ---------------------- | --------------------------------------------------------------------- |
| File modified (source) | `src/pages/workforce/SalaryChart.tsx`                                 |
| File modified (tests)  | `tests/pages/SalaryChart.test.tsx`                                    |
| Change type            | Extract 3-line label draw outside null guard; move `x` before guard   |
| Tests added            | 2 new assertions in existing `"null data suppression"` describe block |
| Tests changed          | 0 existing tests need modification                                    |
| Breaking changes       | None                                                                  |
| Type changes           | None                                                                  |
