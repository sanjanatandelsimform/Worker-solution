# API Contract: GET /api/v1/dashboard/workforce — Participation Update

**Feature**: `012-participation-dynamic-items`  
**Endpoint**: `GET /api/v1/dashboard/workforce`  
**Change scope**: `participation.benefits`, `participation.retirement`, `participation.insurance` fields only

---

## Change Summary

The `benefits`, `retirement`, and `insurance` fields within the `participation` object change from **fixed-key objects** to **arrays of `EnrollmentItem`**.

---

## Updated Response Schema (TypeScript)

```typescript
interface EnrollmentItem {
  name: string; // Display label, e.g. "FSA", "401k", "Health"
  enrollment: string; // Enrollment rate, e.g. "64%" or "N/A"
}

interface Participation {
  totalWorkforce: number;
  enrolledBenefits: number;
  retirementEnrollment: string; // Top-level summary — UNCHANGED
  healthcareEnrollment: string; // Top-level summary — UNCHANGED
  benefits: EnrollmentItem[]; // CHANGED: was { FSA, wellness, EAP }
  retirement: EnrollmentItem[]; // CHANGED: was { "401k" }
  insurance: EnrollmentItem[]; // CHANGED: was { health, dental, vision, life }
}
```

---

## Response Example

### Before (old contract)

```json
{
  "participation": {
    "totalWorkforce": 3120,
    "enrolledBenefits": 2450,
    "retirementEnrollment": "64%",
    "healthcareEnrollment": "78%",
    "benefits": {
      "FSA": "64%",
      "wellness": "78%",
      "EAP": "65%"
    },
    "retirement": {
      "401k": "64%"
    },
    "insurance": {
      "health": "78%",
      "dental": "65%",
      "vision": "60%",
      "life": "45%"
    }
  }
}
```

### After (new contract)

```json
{
  "participation": {
    "totalWorkforce": 3120,
    "enrolledBenefits": 2450,
    "retirementEnrollment": "64%",
    "healthcareEnrollment": "78%",
    "benefits": [
      { "name": "FSA", "enrollment": "64%" },
      { "name": "Wellness", "enrollment": "78%" },
      { "name": "EAP", "enrollment": "65%" }
    ],
    "retirement": [{ "name": "401k", "enrollment": "64%" }],
    "insurance": [
      { "name": "Health", "enrollment": "78%" },
      { "name": "Dental", "enrollment": "65%" },
      { "name": "Vision", "enrollment": "60%" },
      { "name": "Life", "enrollment": "45%" }
    ]
  }
}
```

---

## Field Contracts

### `EnrollmentItem.name`

- **Type**: `string`
- **Required**: true
- **Constraints**: Any non-empty string. Frontend renders as-is — no validation against a fixed list.
- **Examples**: `"FSA"`, `"Wellness"`, `"EAP"`, `"401k"`, `"Health"`, `"Dental"`, `"Vision"`, `"Life"`, `"Pet Insurance"`, `"COBRA"`

### `EnrollmentItem.enrollment`

- **Type**: `string`
- **Required**: true
- **Constraints**: Either a percentage string `"XX%"` or the literal `"N/A"`.
- **Frontend handling**: Processed by `parsePercentage()` — `"N/A"` and invalid values resolve to `0` (renders as empty progress bar, not an error).
- **Examples**: `"64%"`, `"100%"`, `"N/A"`

### Array ordering

- Items render in the order returned by the API.
- No frontend sorting is applied.

### Empty array

- An empty `[]` for any category is valid and renders zero items for that section.

---

## Unchanged Fields

The following `participation` fields are **not affected** by this change:

| Field                  | Type     | Notes                                    |
| ---------------------- | -------- | ---------------------------------------- |
| `totalWorkforce`       | `number` | Unchanged                                |
| `enrolledBenefits`     | `number` | Unchanged                                |
| `retirementEnrollment` | `string` | Unchanged — top-level summary percentage |
| `healthcareEnrollment` | `string` | Unchanged — top-level summary percentage |

All other top-level response fields (`workforce`, `demographics`, `compensation`) are **not affected**.

---

## Breaking Change Notice

This is a **breaking change** to the API response shape. The frontend must be updated to consume the new array format before or simultaneously with the backend deploying the new response. The frontend is currently in static-data mode (`STATIC_WORKFORCE_DATA` in `workforceSlice.ts`) — the static data will be updated to the new format as part of this feature.
