# API Contract: GET /dashboard/recommendation

**Endpoint**: `GET /dashboard/recommendation`  
**Auth**: Bearer token (header: `Authorization: Bearer <token>`)  
**Timeout**: 600 000 ms  
**Feature**: `014-fix-workforce-rec-api`

## Request

```http
GET /dashboard/recommendation
Authorization: Bearer <accessToken>
```

No query parameters. No request body.

## Response — 200 OK

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
        "description": "A financial safety net that helps frontline workers manage everyday expenses and unexpected costs.",
        "keyFeatures": ["Reduces turnover", "Reduces absenteeism"],
        "matchedGoals": [
          "Retain Talent",
          "Reduce 401k Withdrawals",
          "Improve Benefits Participation"
        ],
        "providerName": "Sunny Day Fund",
        "workerRanking": 1,
        "priorityLevelUsed": 1
      },
      {
        "order": 2,
        "title": "Retirement Support",
        "category": "General",
        "matchScore": 1,
        "description": "Quick and easy 401(k) rollovers.",
        "keyFeatures": [
          "Increased retirement account savings",
          "Saves hours of administrative work"
        ],
        "matchedGoals": ["Improve Benefits Participation"],
        "providerName": "Manifest",
        "workerRanking": 5,
        "priorityLevelUsed": 1
      },
      {
        "order": 3,
        "title": "Medical Financing",
        "category": "General",
        "matchScore": 0.83,
        "description": "On-demand access to funds for high-cost medical expenses.",
        "keyFeatures": ["Reduces financial strain", "Helps employees stay focused at work"],
        "matchedGoals": ["Retain Talent", "Reduce 401k Withdrawals"],
        "providerName": "medZERO",
        "workerRanking": 3,
        "priorityLevelUsed": 2
      }
    ],
    "autoEnroll": true,
    "nonElectiveMatch": false,
    "healthcareAffordability": false,
    "dataStatus": "available"
  }
}
```

## Response — 401 Unauthorized

```json
{ "message": "Unauthorized" }
```

## TypeScript Interface Mapping

| JSON path                                  | TypeScript type              |
| ------------------------------------------ | ---------------------------- |
| Root                                       | `RecommendationsApiResponse` |
| `.assessmentType`                          | `string`                     |
| `.recommendation`                          | `RecommendationData`         |
| `.recommendation.strategicRecommendations` | `StrategicRecommendation[]`  |
| `.recommendation.autoEnroll`               | `boolean`                    |
| `.recommendation.nonElectiveMatch`         | `boolean`                    |
| `.recommendation.healthcareAffordability`  | `boolean`                    |
| `.recommendation.dataStatus`               | `string`                     |

## Changelog from previous contract (011-recommendations-api)

- Endpoint path changed: `/api/v1/dashboard/recommendations` → `/dashboard/recommendation`
- `assessmentType` field added at root level of response
- `companyAtGlance` field **removed** from `recommendation` object
- All other fields (`strategicRecommendations`, `autoEnroll`, `nonElectiveMatch`, `healthcareAffordability`, `dataStatus`) unchanged
