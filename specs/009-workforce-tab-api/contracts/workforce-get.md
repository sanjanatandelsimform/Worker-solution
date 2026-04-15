# API Contract: GET /api/v1/dashboard/workforce

**Feature**: `009-workforce-tab-api` | **Date**: 2026-04-14 | **Status**: Static (backend pending)

---

## Overview

| Property       | Value                                                                 |
| -------------- | --------------------------------------------------------------------- |
| Method         | GET                                                                   |
| Path           | `/api/v1/dashboard/workforce`                                         |
| Authentication | Bearer token (from `localStorage.userDetail.auth.tokens.accessToken`) |
| Content-Type   | `application/json`                                                    |
| Timeout        | 600 000 ms                                                            |

---

## Request

### Headers

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Query Parameters

None.

### Request Body

None (GET request).

---

## Response

### 200 OK

```json
{
  "workforce": {
    "totalWorkforce": 3120,
    "enrolledBenefits": 2450,
    "avgEmployeeCost": 2254,
    "employerCostPerEmployee": 44000
  },
  "participation": {
    "totalWorkforce": 3120,
    "enrolledBenefits": 2450,
    "retirementEnrollment": "64%",
    "healthcareEnrollment": "78%",
    "benefits": {
      "FSA": "31%",
      "wellness": "N/A",
      "EAP": "N/A"
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
  },
  "demographics": {
    "employementType": [
      { "department": "all", "fullTime": "80%", "partTime": "20%", "seasonal": "5%" },
      { "department": "engineering", "fullTime": "90%", "partTime": "10%", "seasonal": "0%" },
      { "department": "sales", "fullTime": "70%", "partTime": "30%", "seasonal": "10%" },
      { "department": "hr", "fullTime": "85%", "partTime": "15%", "seasonal": "0%" }
    ],
    "gender": {
      "men": "55%",
      "women": "40%"
    },
    "employmentBreakdownByAge": [
      { "ageGroup": "> 30", "fullTime": 10, "partTime": 20, "seasonal": 5 },
      { "ageGroup": "30 - 40", "fullTime": 30, "partTime": 35, "seasonal": 10 },
      { "ageGroup": "40 - 50", "fullTime": 45, "partTime": 25, "seasonal": 15 },
      { "ageGroup": "50 - 60", "fullTime": 10, "partTime": 15, "seasonal": 8 },
      { "ageGroup": "60+", "fullTime": 5, "partTime": 5, "seasonal": 2 }
    ]
  },
  "compensation": {
    "salaryBreakdown": {
      "medianSalary": 60000,
      "avgSalary": 65000,
      "avgHourlyRate": 30
    },
    "workforceBreakdown": {
      "departments": [
        {
          "id": "design",
          "label": "Design",
          "empNumber": 8,
          "partTime": 2,
          "fullTime": 6,
          "salaryRange": "$79,000-120,000",
          "jobTitles": [...]
        }
      ]
    },
    "benefitsCost": {
      "employeeContribution": 468,
      "employerCost": "$11000/yr",
      "graph": [
        { "salaryRange": "30k-50k", "min": 32, "max": 350 },
        { "salaryRange": "50k-70k", "min": 152, "max": 284 },
        { "salaryRange": "70k-90k", "min": 82, "max": 301 },
        { "salaryRange": "90k-110k", "min": 82, "max": 321 },
        { "salaryRange": "110k+", "min": 67, "max": 301 }
      ],
      "table": [
        {
          "salaryRange": "30k-50k",
          "avgEmployeeCostPerPaycheck": 120.22,
          "avgEmployeeCostPercentage": 30,
          "employerCostPerPaycheck": null
        }
      ]
    }
  }
}
```

### TypeScript Return Type

`WorkforceResponse` from `src/types/workforceTypes.ts`

---

## Error Responses

| Status                    | Condition                                                | Client Behaviour                                                         |
| ------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| 400 Bad Request           | Malformed request                                        | Show inline `ErrorMessage` (`errorType="danger"`) in `WorkforcePage`     |
| 401 Unauthorized          | Missing or expired token                                 | `rejectWithValue("Authentication required. Please log in again.")`       |
| 403 Forbidden             | Token valid but insufficient permissions                 | Show inline error                                                        |
| 404 Not Found             | Endpoint not yet deployed (expected during static phase) | Show inline error                                                        |
| 500 Internal Server Error | Backend error                                            | Show inline error                                                        |
| Network timeout           | Request exceeds 600 000 ms                               | Thrown as axios timeout error → `"Request timed out. Please try again."` |
| Network offline           | No connectivity                                          | Show inline error                                                        |

All non-401 errors surface as `rejectWithValue(errorMessage)` and are stored in `WorkforceState.error`. `WorkforcePage` renders an `ErrorMessage` component when `error` is non-null.

---

## Service Function Signature

```typescript
// src/services/api/workforceApi.ts
export const getWorkforce = async (): Promise<WorkforceResponse> => { ... };
```

---

## Notes

- The `employementType` key is intentionally misspelled in the backend schema. The TypeScript interface mirrors this spelling.
- `benefitsCost.employerCostPerPaycheck` is `null` in the current schema; UI displays `"$xx.xx"`.
- `benefitsCost.employerCost` is a pre-formatted string (`"$11000/yr"`); no numeric parsing required.
- `benefits.wellness` and `benefits.EAP` return `"N/A"`; `parsePercentage("N/A")` returns `0`.
- The `jobTitles` array inside each department is stored in Redux state but not rendered by `WorkforcePage` in this feature release.
