# API Contract: GET /api/v1/dashboard/recommendations

**Feature**: 011-recommendations-api  
**Method**: `GET`  
**Endpoint**: `/api/v1/dashboard/recommendations`  
**Auth**: Bearer token (same as all other `/api/v1/dashboard/*` endpoints)  
**Status**: Stub (backend not yet deployed; see `recommendationsSlice.ts` for static data)

---

## Request

### Headers

| Header          | Value                | Required |
| --------------- | -------------------- | -------- |
| `Authorization` | `Bearer <jwt_token>` | Yes      |
| `Content-Type`  | `application/json`   | No       |

### Query Parameters

None.

### Request Body

None.

---

## Response

### HTTP 200 — Success

```json
{
  "recommendation": {
    "strategicRecommendations": [
      {
        "order": 1,
        "title": "Emergency Savings",
        "category": "General",
        "matchScore": 1.83,
        "description": "A financial safety net that helps frontline workers manage everyday expenses and unexpected costs.",
        "keyFeatures": ["Reduces turnover", "Reduces absenteeism"],
        "matchedGoals": ["Reduce Absenteeism", "Retain Talent", "Attract Talent"],
        "providerName": "Sunny Day Fund",
        "workerRanking": 1,
        "priorityLevelUsed": 1
      },
      {
        "order": 2,
        "title": "Medical Financing",
        "category": "General",
        "matchScore": 1.33,
        "description": "On-demand access to funds for high-cost medical expenses.",
        "keyFeatures": ["Reduces financial strain", "Helps employees stay focused at work"],
        "matchedGoals": ["Reduce Absenteeism", "Retain Talent"],
        "providerName": "medZERO",
        "workerRanking": 3,
        "priorityLevelUsed": 1
      },
      {
        "order": 3,
        "title": "Financial Coaching",
        "category": "General",
        "matchScore": 1.33,
        "description": "Financial coaching that lowers employee stress.",
        "keyFeatures": ["Improves productivity", "Supports a more resilient workforce"],
        "matchedGoals": ["Reduce Absenteeism", "Retain Talent"],
        "providerName": "TrustPlus",
        "workerRanking": 4,
        "priorityLevelUsed": 1
      }
    ],
    "autoEnroll": true,
    "nonElectiveMatch": false,
    "healthcareAffordability": false,
    "dataStatus": "available",
    "companyAtGlance": {
      "totalWorkforce": null,
      "averageHourlyWage": null,
      "averageSalary": null
    }
  }
}
```

### HTTP 401 — Unauthorized

```json
{ "message": "Authentication required. Please log in again." }
```

### HTTP 500 — Server Error

```json
{ "message": "Internal server error" }
```

---

## OpenAPI Schema

```yaml
openapi: 3.0.3
info:
  title: WorkSolutions Dashboard API
  version: 1.0.0
paths:
  /api/v1/dashboard/recommendations:
    get:
      summary: Get tailored benefit recommendations for the employer
      security:
        - BearerAuth: []
      responses:
        "200":
          description: Successful response
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/RecommendationsApiResponse"
        "401":
          description: Unauthorized

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    RecommendationsApiResponse:
      type: object
      required: [recommendation]
      properties:
        recommendation:
          $ref: "#/components/schemas/RecommendationData"

    RecommendationData:
      type: object
      required:
        - strategicRecommendations
        - autoEnroll
        - nonElectiveMatch
        - healthcareAffordability
        - dataStatus
        - companyAtGlance
      properties:
        strategicRecommendations:
          type: array
          items:
            $ref: "#/components/schemas/StrategicRecommendation"
        autoEnroll:
          type: boolean
        nonElectiveMatch:
          type: boolean
        healthcareAffordability:
          type: boolean
        dataStatus:
          type: string
          example: available
        companyAtGlance:
          $ref: "#/components/schemas/RecommendationCompanyAtGlance"

    StrategicRecommendation:
      type: object
      required:
        - order
        - title
        - category
        - matchScore
        - description
        - keyFeatures
        - matchedGoals
        - providerName
        - workerRanking
        - priorityLevelUsed
      properties:
        order:
          type: integer
          minimum: 1
        title:
          type: string
        category:
          type: string
        matchScore:
          type: number
          format: float
        description:
          type: string
        keyFeatures:
          type: array
          items:
            type: string
        matchedGoals:
          type: array
          items:
            type: string
        providerName:
          type: string
        workerRanking:
          type: integer
        priorityLevelUsed:
          type: integer

    RecommendationCompanyAtGlance:
      type: object
      properties:
        totalWorkforce:
          type: integer
          nullable: true
        averageHourlyWage:
          type: number
          nullable: true
        averageSalary:
          type: number
          nullable: true
```

---

## Client-Side Implementation Notes

- **Service file**: `src/services/api/recommendationsApi.ts`
- **Timeout**: `600000` ms (matching `workforceApi.ts` pattern)
- **Error handling**: Re-throw auth errors; wrap all others via `getErrorMessage(error)`
- **Auth**: Use `getAuthToken()` from `apiUtils.ts`; throw if token is missing
- **Stub mode**: While the endpoint is not live, `recommendationsSlice.ts` returns `STATIC_RECOMMENDATIONS_DATA` without making a network call. The actual `getRecommendations()` call is present but commented out.
