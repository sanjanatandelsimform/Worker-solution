# API Contract: GET /dashboard/workforce (updated)

**Feature**: 001-proven-strategy-flags  
**Date**: 2026-05-05  
**Endpoint**: `GET /dashboard/workforce`  
**Auth**: Bearer token required

## Change Summary

A new field `healthcareAffordability` is added to the `workforce` envelope body. This field is populated **only in the Finch flow** (`assessmentType === "finch"`). In the manual flow the field may be absent (treated as `"hidden"` by the frontend).

All other fields remain unchanged.

---

## Request

```http
GET /dashboard/workforce
Authorization: Bearer <token>
```

No request body. No query parameters.

---

## Response — 200 OK (Finch flow with new field)

```json
{
  "assessmentType": "finch",
  "workforce": {
    "dataStatus": "available",
    "healthcareAffordability": "green",
    "workforce": {
      "totalWorkforce": 120,
      "enrolledBenefits": 98,
      "avgEmployeeCost": 52000,
      "employerCostPerEmployee": 8400
    },
    "participation": {
      "totalWorkforce": 120,
      "enrolledBenefits": 98,
      "retirementEnrollment": "64%",
      "healthcareEnrollment": "78%",
      "benefits": [],
      "retirement": [],
      "insurance": []
    },
    "demographics": { "...": "unchanged" },
    "compensation": { "...": "unchanged" }
  }
}
```

---

## TypeScript Interface Mapping

| JSON path                            | TypeScript type                 | Values                                          |
| ------------------------------------ | ------------------------------- | ----------------------------------------------- |
| Root                                 | `WorkforceApiResponse`          | —                                               |
| `.assessmentType`                    | `string`                        | `"finch"` \| `"manual"`                         |
| `.workforce`                         | `WorkforceEnvelope`             | —                                               |
| `.workforce.dataStatus`              | `string`                        | unchanged                                       |
| `.workforce.healthcareAffordability` | `StrategyFlagStatus` (optional) | `"green"` \| `"yellow"` \| `"hidden"` \| absent |
| `.workforce.workforce`               | `WorkforceOverview`             | unchanged                                       |
| `.workforce.participation`           | `Participation`                 | unchanged                                       |
| `.workforce.demographics`            | `Demographics`                  | unchanged                                       |
| `.workforce.compensation`            | `Compensation`                  | unchanged                                       |

---

## Frontend Fallback Behaviour

When `healthcareAffordability` is absent or is an unrecognised value, the `selectWorkforceHealthcareAffordabilityFlag` selector normalises it to `"hidden"`. This ensures the Healthcare Affordability card is not shown rather than crashing or displaying incorrect data.

---

## Changelog from previous contract (014-fix-workforce-rec-api)

- `workforce.healthcareAffordability?: StrategyFlagStatus` — **NEW** optional field on `WorkforceEnvelope`
- All other fields unchanged.

---

## Response — 401 Unauthorized

```json
{ "message": "Unauthorized" }
```
