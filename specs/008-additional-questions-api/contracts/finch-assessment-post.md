# API Contract: POST /api/v1/assessment/finch

**Branch**: `008-additional-questions-api` | **Date**: 2026-04-13

---

## Endpoint

```
POST /api/v1/assessment/finch
```

**Base URL**: `VITE_API_BASE_URL` (default: `https://dev-api.benestats.com/api/v1`)  
**Full URL**: `https://dev-api.benestats.com/api/v1/assessment/finch`

---

## Authentication

Requires a valid Bearer token. Supplied automatically by `apiClient` from `src/services/api/authApi.ts`.

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## Request Body

```json
{
  "workforce": {
    "communicationMethods": ["work_email", "personal_email", "office_signs"],
    "hasDesklessEmployees": true,
    "commuteMethods": ["car", "train", "bus", "bike", "walking", "group_transportation"],
    "commuteTime": "15-30min"
  },
  "compensation": {
    "offersAnnualRaises": true,
    "annualRaiseMonth": "March",
    "payrollProvider": "ADP",
    "shiftDifferentials": false,
    "shortTermIncentives": ["cash_bonuses", "commissions"],
    "longTermIncentives": ["stock_options"]
  },
  "benefits": {
    "workWithBenefitsBroker": "Yes",
    "benefitEnrollmentMonth": "November",
    "retirementVestingPeriod": "2yr_4yr",
    "retirementAutoEnroll": true,
    "retirementHardshipWithdrawals": false
  },
  "goals": {
    "workforceGoals": [
      "Attract Talent",
      "Retain Talent",
      "Reduce Absenteeism",
      "Improve Benefits Participation"
    ],
    "workforceGoalsRanking": ["Retain Talent", "Attract Talent", "Reduce Absenteeism"]
  }
}
```

---

## Field Reference

### `workforce`

| Field                  | Type       | Required | Allowed Values                                                               |
| ---------------------- | ---------- | -------- | ---------------------------------------------------------------------------- |
| `communicationMethods` | `string[]` | No       | `"work_email"`, `"personal_email"`, `"office_signs"`                         |
| `hasDesklessEmployees` | `boolean`  | Yes      | `true`, `false`                                                              |
| `commuteMethods`       | `string[]` | No       | `"car"`, `"train"`, `"bus"`, `"bike"`, `"walking"`, `"group_transportation"` |
| `commuteTime`          | `string`   | No       | `"<15min"`, `"15-30min"`, `"30-1hr"`, `"1hr+"`                               |

### `compensation`

| Field                 | Type             | Required    | Allowed Values / Notes                                                               |
| --------------------- | ---------------- | ----------- | ------------------------------------------------------------------------------------ |
| `offersAnnualRaises`  | `boolean`        | Yes         | `true`, `false`                                                                      |
| `annualRaiseMonth`    | `string`         | Conditional | Full month name (e.g., `"March"`); required when `offersAnnualRaises === true`       |
| `payrollProvider`     | `string \| null` | No          | Provider label string (e.g., `"ADP"`, `"Gusto"`) or `null`                           |
| `shiftDifferentials`  | `boolean`        | No          | `true`, `false`                                                                      |
| `shortTermIncentives` | `string[]`       | No          | `"cash_bonuses"`, `"profit_sharing"`, `"commissions"`                                |
| `longTermIncentives`  | `string[]`       | No          | `"stock_options"`, `"rsus"`, `"espps"`, `"deferred_compensation"`, `"pension_plans"` |

### `benefits`

| Field                           | Type                                | Required | Allowed Values                                          |
| ------------------------------- | ----------------------------------- | -------- | ------------------------------------------------------- |
| `workWithBenefitsBroker`        | `"Yes" \| "No" \| "Unsure" \| null` | No       | `"Yes"`, `"No"`, `"Unsure"`                             |
| `benefitEnrollmentMonth`        | `string \| null`                    | No       | Full month name (e.g., `"November"`) or `null`          |
| `retirementVestingPeriod`       | `string`                            | Yes      | `"<6m"`, `"6m_1yr"`, `"1yr_2yr"`, `"2yr_4yr"`, `">4yr"` |
| `retirementAutoEnroll`          | `boolean`                           | Yes      | `true`, `false`                                         |
| `retirementHardshipWithdrawals` | `boolean`                           | Yes      | `true`, `false`                                         |

### `goals`

| Field                   | Type       | Required | Notes                                                                                   |
| ----------------------- | ---------- | -------- | --------------------------------------------------------------------------------------- |
| `workforceGoals`        | `string[]` | No       | API value strings sent directly (e.g., `"Attract Talent"`, `"Reduce 401k Withdrawals"`) |
| `workforceGoalsRanking` | `string[]` | Yes      | Static: `["Retain Talent", "Attract Talent", "Reduce Absenteeism"]`                     |

---

## Response

### Success — HTTP 200/201

```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "data": {}
}
```

### Validation Error — HTTP 422

```json
{
  "success": false,
  "error": "Validation failed",
  "fieldErrors": {
    "compensation.annualRaiseMonth": "Required when offersAnnualRaises is true"
  }
}
```

### Unauthenticated — HTTP 401

Standard 401 — `apiClient` will attempt token refresh automatically and retry once.

### Server Error — HTTP 500

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Frontend Error Handling

| HTTP Status                 | User-Visible Behaviour                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 2xx                         | Show `ErrorMessage` banner `errorType="success"`, then navigate to `/dashboard`                            |
| 401 (after refresh failure) | Show `ErrorMessage` banner `errorType="danger"` with message "Session expired. Please log in again."       |
| 422                         | Show `ErrorMessage` banner `errorType="danger"` with API `error` message                                   |
| 4xx other                   | Show `ErrorMessage` banner `errorType="danger"` with generic "Submission failed. Please try again."        |
| 5xx                         | Show `ErrorMessage` banner `errorType="danger"` with "Something went wrong. Please try again."             |
| Network timeout             | Show `ErrorMessage` banner `errorType="danger"` with "Connection timed out. Please check your connection." |

---

## TypeScript Service Function Signature

```typescript
// src/services/api/assessmentApi.ts

export const submitFinchAssessment = async (
  payload: FinchAssessmentPayload
): Promise<ApiResponse<FinchAssessmentResponse>> => {
  try {
    const response = await apiClient.post<FinchAssessmentResponse>("/assessment/finch", payload);
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};
```
