# API Contract: GET /dashboard/recommendation (Updated)

**Endpoint**: `GET /dashboard/recommendation`  
**Auth**: Bearer token (header: `Authorization: Bearer <token>`)  
**Timeout**: 600 000 ms  
**Feature**: `035-company-overview-recomm-api` — adds `companyOverview` to `recommendation` object

> **Extends**: `specs/014-fix-workforce-rec-api/contracts/recommendation-get.md`  
> **Change**: Added optional `companyOverview` object inside `recommendation`.

## Request

```http
GET /dashboard/recommendation
Authorization: Bearer <accessToken>
```

No query parameters. No request body.

## Response — 200 OK (non-Finch / manual assessment)

The `companyOverview` field is present when `assessmentType !== "finch"` (manual assessment).

```json
{
  "assessmentType": "manual",
  "recommendation": {
    "companyOverview": {
      "totalWorkforce": 150,
      "avgHourlyRate": 19.75,
      "avgSalary": 55000
    },
    "strategicRecommendations": [
      {
        "order": 1,
        "title": "Emergency Savings",
        "category": "General",
        "matchScore": 1.83,
        "description": "A financial safety net that helps frontline workers manage everyday expenses.",
        "keyFeatures": ["Reduces turnover", "Reduces absenteeism"],
        "matchedGoals": ["Retain Talent", "Reduce 401k Withdrawals"],
        "providerName": "Sunny Day Fund",
        "workerRanking": 1,
        "priorityLevelUsed": 1
      }
    ],
    "autoEnroll": "yellow",
    "nonElectiveMatch": "green",
    "healthcareAffordability": "yellow",
    "dataStatus": "available"
  }
}
```

## Response — 200 OK (Finch-connected assessment)

The `companyOverview` field is **absent** for Finch-connected users. Company overview data for these users comes from the Workforce API instead.

```json
{
  "assessmentType": "finch",
  "recommendation": {
    "strategicRecommendations": [
      {
        "order": 1,
        "title": "Emergency Savings",
        "category": "General",
        "matchScore": 1.83,
        "description": "A financial safety net that helps frontline workers manage everyday expenses.",
        "keyFeatures": ["Reduces turnover", "Reduces absenteeism"],
        "matchedGoals": ["Retain Talent", "Reduce 401k Withdrawals"],
        "providerName": "Sunny Day Fund",
        "workerRanking": 1,
        "priorityLevelUsed": 1
      }
    ],
    "autoEnroll": "green",
    "nonElectiveMatch": "hidden",
    "healthcareAffordability": "green",
    "dataStatus": "available"
  }
}
```

## Response — 401 Unauthorized

```json
{ "message": "Unauthorized" }
```

## Field Descriptions

### `recommendation.companyOverview` (optional)

| Field            | Type     | Description                                |
| ---------------- | -------- | ------------------------------------------ |
| `totalWorkforce` | `number` | Total employee headcount                   |
| `avgHourlyRate`  | `number` | Average hourly wage across the workforce   |
| `avgSalary`      | `number` | Average annual salary across the workforce |

> **Note**: This field is optional. The frontend handles its absence gracefully by falling back to `null` for each sub-field, resulting in skeleton/empty display states.
