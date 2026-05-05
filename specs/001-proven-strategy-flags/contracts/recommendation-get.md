# API Contract: GET /dashboard/recommendation (updated)

**Feature**: 001-proven-strategy-flags  
**Date**: 2026-05-05  
**Endpoint**: `GET /dashboard/recommendation`  
**Auth**: Bearer token required

## Change Summary

The three proven-strategy flag fields (`autoEnroll`, `nonElectiveMatch`, `healthcareAffordability`) change from `boolean` to a tri-state string literal: `"green" | "yellow" | "hidden"`.

All other fields remain unchanged.

---

## Request

```http
GET /dashboard/recommendation
Authorization: Bearer <token>
```

No request body. No query parameters.

---

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
        "matchScore": 0.92,
        "description": "...",
        "keyFeatures": ["..."],
        "matchedGoals": ["..."],
        "providerName": "Sunny Day Fund",
        "workerRanking": 1,
        "priorityLevelUsed": 1
      }
    ],
    "autoEnroll": "green",
    "nonElectiveMatch": "hidden",
    "healthcareAffordability": "yellow",
    "dataStatus": "available"
  }
}
```

---

## TypeScript Interface Mapping

| JSON path                                  | TypeScript type              | Values                                                               |
| ------------------------------------------ | ---------------------------- | -------------------------------------------------------------------- |
| Root                                       | `RecommendationsApiResponse` | —                                                                    |
| `.assessmentType`                          | `string`                     | `"finch"` \| `"manual"`                                              |
| `.recommendation`                          | `RecommendationData`         | —                                                                    |
| `.recommendation.strategicRecommendations` | `StrategicRecommendation[]`  | unchanged                                                            |
| `.recommendation.autoEnroll`               | `StrategyFlagStatus`         | `"green"` \| `"yellow"` \| `"hidden"`                                |
| `.recommendation.nonElectiveMatch`         | `StrategyFlagStatus`         | `"green"` \| `"yellow"` \| `"hidden"`                                |
| `.recommendation.healthcareAffordability`  | `StrategyFlagStatus`         | `"green"` \| `"yellow"` \| `"hidden"` — **only used in manual flow** |
| `.recommendation.dataStatus`               | `string`                     | unchanged                                                            |

---

## Changelog from previous contract (014-fix-workforce-rec-api)

- `autoEnroll`: `boolean` → `"green" | "yellow" | "hidden"`
- `nonElectiveMatch`: `boolean` → `"green" | "yellow" | "hidden"`
- `healthcareAffordability`: `boolean` → `"green" | "yellow" | "hidden"` _(Finch flow: frontend reads this from Workforce API instead — see workforce-get.md)_
- All other fields unchanged.

---

## Response — 401 Unauthorized

```json
{ "message": "Unauthorized" }
```
