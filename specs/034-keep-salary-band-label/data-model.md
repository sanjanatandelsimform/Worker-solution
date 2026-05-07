# Data Model: Keep Salary Band Label When No Data

**Branch**: `034-keep-salary-band-label`  
**Date**: 2026-05-07

## No Data Model Changes Required

This feature is a pure rendering-logic change inside a canvas drawing function. No types, interfaces, entities, or state shapes change.

### Existing Type (unchanged)

```typescript
// src/pages/workforce/SalaryChart.tsx
type ChartItem = {
  label: string; // salary band label — always a string, never null
  boxStart: number | null;
  boxEnd: number | null;
  max: number | null;
  min: number | null;
};
```

### Rendering State Transitions

| Data State                  | Bar / Whiskers | Value Labels ($boxStart, $boxEnd) | Salary Band Label  |
| --------------------------- | -------------- | --------------------------------- | ------------------ |
| All numeric fields present  | ✅ Drawn       | ✅ Drawn                          | ✅ Drawn           |
| Any numeric field is `null` | ❌ Not drawn   | ❌ Not drawn                      | ✅ Drawn ← **NEW** |

> **Before this feature**: the bottom row showed `❌ Not drawn` for the salary band label too.
