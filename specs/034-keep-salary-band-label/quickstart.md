# Quickstart: Keep Salary Band Label When No Data

**Branch**: `034-keep-salary-band-label`  
**Date**: 2026-05-07

## Overview

One source file and one test file change. No new files. No type changes. No new imports.

## Implementation Guide

### Step 1 — Modify `src/pages/workforce/SalaryChart.tsx`

Inside `drawBars()`, the current flow skips everything (including the label) when any numeric field is `null`. The fix: move `x` before the null guard and render the label inside the guard before the early return.

**Find this block** (lines ~85–100 in current file):

```typescript
      const drawBars = () => {
        data.forEach((item, index) => {
          // Skip items with any null numeric field — no box, whisker, or label drawn
          if (
            item.min == null ||
            item.max == null ||
            item.boxStart == null ||
            item.boxEnd == null
          ) {
            return;
          }

          const x = chartLeft + columnSpacing * (index + 0.75);
```

**Replace with**:

```typescript
      const drawBars = () => {
        data.forEach((item, index) => {
          const x = chartLeft + columnSpacing * (index + 0.75);

          // Skip items with any null numeric field — no box, whisker, or value labels drawn
          if (
            item.min == null ||
            item.max == null ||
            item.boxStart == null ||
            item.boxEnd == null
          ) {
            // Always render the salary band label even when data is null
            ctx.fillStyle = "#111827";
            ctx.textAlign = "center";
            ctx.font = "14px Inter Regular, sans-serif";
            ctx.fillText(item.label, x, 420);
            return;
          }
```

> No other changes to the source file are needed.

### Step 2 — Update `tests/pages/SalaryChart.test.tsx`

Add two new `it()` blocks inside the existing `"null data suppression"` describe block (after the last existing `it()`):

```typescript
    it("renders the salary band label for an all-null item", () => {
      const data = [{ label: "X", boxStart: null, boxEnd: null, max: null, min: null }];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("X");
    });

    it("renders all labels in a mixed null/valid dataset", () => {
      const data = [
        { label: "Null", boxStart: null, boxEnd: null, max: null, min: null },
        { label: "IT", boxStart: 80, boxEnd: 120, max: 150, min: 60 },
        { label: "HR", boxStart: 70, boxEnd: 110, max: 140, min: 50 },
      ];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("Null");
      expect(allTexts).toContain("IT");
      expect(allTexts).toContain("HR");
    });
```

### Step 3 — Run Tests

```bash
pnpm run test
```

All tests must pass (0 failures expected). The two new tests cover the new behavior; all existing tests are unaffected.

## Verification Checklist

- [ ] `src/pages/workforce/SalaryChart.tsx`: `x` computed before null guard
- [ ] `src/pages/workforce/SalaryChart.tsx`: label rendered inside null guard before `return`
- [ ] `src/pages/workforce/SalaryChart.tsx`: comment updated ("value labels" not "label")
- [ ] `tests/pages/SalaryChart.test.tsx`: 2 new tests added
- [ ] `pnpm run test` passes with 0 failures
- [ ] `pnpm run type-check` passes with 0 errors

## Files Changed

| File                                  | Change                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `src/pages/workforce/SalaryChart.tsx` | Move `x` before null guard; add label render in guard body; update comment |
| `tests/pages/SalaryChart.test.tsx`    | Add 2 new `it()` blocks in `"null data suppression"` describe              |
