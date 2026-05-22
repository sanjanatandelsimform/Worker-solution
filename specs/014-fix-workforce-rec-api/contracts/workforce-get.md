# API Contract: GET /dashboard/workforce

**Endpoint**: `GET /dashboard/workforce`  
**Auth**: Bearer token (header: `Authorization: Bearer <token>`)  
**Timeout**: 600 000 ms  
**Feature**: `014-fix-workforce-rec-api`

## Request

```http
GET /dashboard/workforce
Authorization: Bearer <accessToken>
```

No query parameters. No request body.

## Response — 200 OK

```json
{
  "assessmentType": "finch",
  "workforce": {
    "dataStatus": "available",
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
      "benefits": [
        { "name": "FSA", "enrollment": "64%" },
        { "name": "wellness", "enrollment": "78%" },
        { "name": "EAP", "enrollment": "65%" }
      ],
      "retirement": [{ "name": "401k", "enrollment": "64%" }],
      "insurance": [
        { "name": "health", "enrollment": "78%" },
        { "name": "dental", "enrollment": "65%" },
        { "name": "vision", "enrollment": "60%" },
        { "name": "life", "enrollment": "45%" }
      ]
    },
    "demographics": {
      "employmentType": [
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
            "jobTitles": [
              {
                "jobTitle": "Product Designer",
                "totalInRole": 8,
                "partTime": 2,
                "fullTime": 6,
                "salaryRange": "$79,000-120,000"
              }
            ]
          }
        ]
      },
      "benefitsCost": {
        "employeeContribution": 468,
        "employerCost": "$11000/yr",
        "graph": [{ "salaryRange": "30k-50k", "min": 32, "max": 350 }],
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
}
```

## Response — 401 Unauthorized

Returned when no valid Bearer token is provided.

```json
{ "message": "Unauthorized" }
```

## TypeScript Interface Mapping

| JSON path                  | TypeScript type                                  |
| -------------------------- | ------------------------------------------------ |
| Root                       | `WorkforceApiResponse`                           |
| `.assessmentType`          | `string`                                         |
| `.workforce`               | `WorkforceEnvelope`                              |
| `.workforce.dataStatus`    | `string` — `"available"` \| `"pending"` \| other |
| `.workforce.workforce`     | `WorkforceOverview`                              |
| `.workforce.participation` | `Participation`                                  |
| `.workforce.demographics`  | `Demographics`                                   |
| `.workforce.compensation`  | `Compensation`                                   |

## Changelog from previous contract (009-workforce-tab-api)

- Endpoint path changed: `/api/v1/dashboard/workforce` → `/dashboard/workforce`
- Response envelope added: root now has `assessmentType` + `workforce` key
- `dataStatus` field added to the workforce envelope
- All sub-section field shapes remain unchanged
