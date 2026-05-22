# Quickstart: Rename Seasonal → Other in Workforce Demographics

**Feature**: `034-rename-seasonal-to-other`  
**Branch**: `034-rename-seasonal-to-other`  
**Date**: 2026-05-07

## What you're doing

Renaming the third employment type option from `"seasonal"` / `"Seasonal"` to `"other"` / `"Other"` across 6 files to match the backend API key. No new files, no new components — pure rename.

## Files to modify (in recommended order)

| #   | File                                                 | What changes                                             |
| --- | ---------------------------------------------------- | -------------------------------------------------------- |
| 1   | `src/types/workforceTypes.ts`                        | Rename `seasonal` field on two interfaces + update JSDoc |
| 2   | `src/hooks/useWorkforceDemographicsConfig.ts`        | Rename param type + donut config entry                   |
| 3   | `src/pages/workforce/WorkforcePage.tsx`              | Rename `useState` type                                   |
| 4   | `src/pages/workforce/WorkforceDemographics.tsx`      | Rename dropdown item + `EmploymentType` type + cast      |
| 5   | `tests/hooks/useWorkforceDemographicsConfig.test.ts` | Update fixtures, assertions, descriptions                |
| 6   | `tests/store/workforceSelectors.test.ts`             | Update one fixture field                                 |

---

## Step-by-step changes

### 1. `src/types/workforceTypes.ts`

**Location**: Lines ~77–101

**Change A** — JSDoc comment above `EmploymentTypeEntry`:

```diff
-/** Full-time / part-time / seasonal percentages for a given department */
+/** Full-time / part-time / other percentages for a given department */
```

**Change B** — `EmploymentTypeEntry` interface:

```diff
 export interface EmploymentTypeEntry {
   department: string;
   fullTime: string;
   partTime: string;
-  seasonal: string;
+  other: string;
 }
```

**Change C** — `AgeBreakdownEntry` interface:

```diff
 export interface AgeBreakdownEntry {
   ageGroup: string;
   fullTime: number;
   partTime: number;
-  seasonal: number;
+  other: number;
 }
```

---

### 2. `src/hooks/useWorkforceDemographicsConfig.ts`

**Change A** — parameter type (line ~10):

```diff
-  selectedEmploymentType: "fullTime" | "partTime" | "seasonal"
+  selectedEmploymentType: "fullTime" | "partTime" | "other"
```

**Change B** — third donut chart config object (lines ~66–70):

```diff
-      {
-        id: "seasonal",
-        label: "Seasonal",
-        percentage: parsePercentage(selectedDeptData.seasonal),
+      {
+        id: "other",
+        label: "Other",
+        percentage: parsePercentage(selectedDeptData.other),
         progressColor: "color-ws-progress-turnery",
         backgroundColor: "bg-ws-progress-turnery",
       },
```

---

### 3. `src/pages/workforce/WorkforcePage.tsx`

**Change** — `useState` type (line ~33):

```diff
-  const [selectedEmploymentType, setSelectedEmploymentType] = useState<
-    "fullTime" | "partTime" | "seasonal"
-  >("fullTime");
+  const [selectedEmploymentType, setSelectedEmploymentType] = useState<
+    "fullTime" | "partTime" | "other"
+  >("fullTime");
```

---

### 4. `src/pages/workforce/WorkforceDemographics.tsx`

**Change A** — dropdown items array (line ~16):

```diff
 const employmentTypeItems = [
   { id: "fullTime", label: "Full Time" },
   { id: "partTime", label: "Part Time" },
-  { id: "seasonal", label: "Seasonal" },
+  { id: "other", label: "Other" },
 ];
```

**Change B** — `EmploymentType` union (line ~47):

```diff
-type EmploymentType = "fullTime" | "partTime" | "seasonal";
+type EmploymentType = "fullTime" | "partTime" | "other";
```

**Change C** — cast in `onSelectionChange` (line ~181):

```diff
-                  setSelectedEmploymentType(key as "fullTime" | "partTime" | "seasonal");
+                  setSelectedEmploymentType(key as "fullTime" | "partTime" | "other");
```

---

### 5. `tests/hooks/useWorkforceDemographicsConfig.test.ts`

**Change A** — `sampleDemographics.employmentType` fixture (3 entries, lines ~46–48):

```diff
   employmentType: [
-    { department: "all", fullTime: "80%", partTime: "15%", seasonal: "5%" },
-    { department: "engineering", fullTime: "90%", partTime: "8%", seasonal: "2%" },
-    { department: "sales", fullTime: "70%", partTime: "25%", seasonal: "5%" },
+    { department: "all", fullTime: "80%", partTime: "15%", other: "5%" },
+    { department: "engineering", fullTime: "90%", partTime: "8%", other: "2%" },
+    { department: "sales", fullTime: "70%", partTime: "25%", other: "5%" },
   ],
```

**Change B** — `sampleDemographics.employmentBreakdownByAge` fixture (lines ~52–57):

```diff
   employmentBreakdownByAge: [
-    { ageGroup: "> 30", fullTime: 100, partTime: 20, seasonal: 5 },
-    { ageGroup: "30 - 40", fullTime: 80, partTime: 15, seasonal: 3 },
-    { ageGroup: "40 - 50", fullTime: 60, partTime: 10, seasonal: 2 },
-    { ageGroup: "50 - 60", fullTime: 40, partTime: 8, seasonal: 1 },
-    { ageGroup: "60+", fullTime: 20, partTime: 4, seasonal: 0 },
-    { ageGroup: "70+", fullTime: 10, partTime: 2, seasonal: 0 },
+    { ageGroup: "> 30", fullTime: 100, partTime: 20, other: 5 },
+    { ageGroup: "30 - 40", fullTime: 80, partTime: 15, other: 3 },
+    { ageGroup: "40 - 50", fullTime: 60, partTime: 10, other: 2 },
+    { ageGroup: "50 - 60", fullTime: 40, partTime: 8, other: 1 },
+    { ageGroup: "60+", fullTime: 20, partTime: 4, other: 0 },
+    { ageGroup: "70+", fullTime: 10, partTime: 2, other: 0 },
   ],
```

**Change C** — test description referencing chart entries (line ~143):

```diff
-  it("donutChartsConfig has 3 entries (full-time, part-time, seasonal) for selected dept", () => {
+  it("donutChartsConfig has 3 entries (full-time, part-time, other) for selected dept", () => {
```

**Change D** — assertions that destructure `seasonal` from donut config (lines ~150–159):

```diff
-    const [ft, pt, seasonal] = result.current.donutChartsConfig;
+    const [ft, pt, other] = result.current.donutChartsConfig;
     expect(ft.id).toBe("full-time");
     expect(ft.percentage).toBe(80);
     expect(pt.id).toBe("part-time");
     expect(pt.percentage).toBe(15);
-    expect(seasonal.id).toBe("seasonal");
-    expect(seasonal.percentage).toBe(5);
+    expect(other.id).toBe("other");
+    expect(other.percentage).toBe(5);
```

**Change E** — color/label assertions (lines ~170–177):

```diff
-    const [ft, pt, seasonal] = result.current.donutChartsConfig;
+    const [ft, pt, other] = result.current.donutChartsConfig;
     expect(ft.label).toBe("Full Time");
     expect(ft.progressColor).toBe("color-ws-progress-primary");
     expect(pt.label).toBe("Part Time");
     expect(pt.progressColor).toBe("color-ws-progress-secondary");
-    expect(seasonal.label).toBe("Seasonal");
-    expect(seasonal.progressColor).toBe("color-ws-progress-turnery");
+    expect(other.label).toBe("Other");
+    expect(other.progressColor).toBe("color-ws-progress-turnery");
```

**Change F** — age breakdown test using `"seasonal"` as employment type arg (line ~213):

```diff
-  it("ageBreakdownConfig uses seasonal values when selectedEmploymentType='seasonal'", () => {
+  it("ageBreakdownConfig uses other values when selectedEmploymentType='other'", () => {
     mockStoreState = buildStoreState(sampleDemographics);
     const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "seasonal"));
+    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "other"));
```

> **Note**: Also change the `renderHook` call argument from `"seasonal"` to `"other"` in that test.

---

### 6. `tests/store/workforceSelectors.test.ts`

**Change** — one fixture field in `mockWorkforceData` (line ~52):

```diff
       demographics: {
-        employmentType: [{ department: "all", fullTime: "80%", partTime: "20%", seasonal: "5%" }],
+        employmentType: [{ department: "all", fullTime: "80%", partTime: "20%", other: "5%" }],
         gender: { men: "55%", women: "40%" },
         employmentBreakdownByAge: [],
       },
```

---

## Verification

After making all changes:

```bash
# Type check
pnpm run type-check

# Run all tests
pnpm run test

# Quick lint
pnpm lint:fix
```

Expected results:

- `type-check`: 0 errors
- `test`: 0 failing tests
- No remaining `"seasonal"` string as an employment-type key in `src/` or `tests/`

## What NOT to change

- `src/services/validation/assessmentSchemas.ts` — `contractorsSeasonalEmployees` is unrelated
- Any file in `src/pages/workforce/WorkforceCompensation*`
- Any file in `src/hooks/useWorkforceCompensationConfig.ts`
- `CompensationTab.tsx`
