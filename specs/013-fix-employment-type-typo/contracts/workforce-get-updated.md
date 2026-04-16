# API Contract Update: GET /api/v1/dashboard/workforce (demographics field rename)

**Feature**: `013-fix-employment-type-typo`  
**Date**: 2026-04-16  
**Based on**: `specs/009-workforce-tab-api/contracts/workforce-get.md`  
**Change type**: Field rename — `demographics.employementType` → `demographics.employmentType`

---

## Changed Section: `demographics` object

Only the `demographics` portion of the response is shown. All other top-level keys (`workforce`, `participation`, `compensation`) are unchanged.

### Before (009 contract — misspelled)

```json
"demographics": {
  "employementType": [
    { "department": "all",         "fullTime": "80%", "partTime": "20%", "seasonal": "5%"  },
    { "department": "engineering", "fullTime": "90%", "partTime": "10%", "seasonal": "0%"  },
    { "department": "sales",       "fullTime": "70%", "partTime": "30%", "seasonal": "10%" },
    { "department": "hr",          "fullTime": "85%", "partTime": "15%", "seasonal": "0%"  }
  ],
  "gender": { "men": "55%", "women": "45%" },
  "employmentBreakdownByAge": [
    { "ageGroup": "> 30",    "fullTime": 10, "partTime": 20, "seasonal": 5  },
    { "ageGroup": "30 - 40", "fullTime": 30, "partTime": 35, "seasonal": 10 },
    { "ageGroup": "40 - 50", "fullTime": 45, "partTime": 25, "seasonal": 15 },
    { "ageGroup": "50 - 60", "fullTime": 10, "partTime": 15, "seasonal": 8  },
    { "ageGroup": "60+",     "fullTime": 5,  "partTime": 5,  "seasonal": 2  }
  ]
}
```

### After (013 contract — corrected)

```json
"demographics": {
  "employmentType": [
    { "department": "all",         "fullTime": "80%", "partTime": "20%", "seasonal": "5%"  },
    { "department": "engineering", "fullTime": "90%", "partTime": "10%", "seasonal": "0%"  },
    { "department": "sales",       "fullTime": "70%", "partTime": "30%", "seasonal": "10%" },
    { "department": "hr",          "fullTime": "85%", "partTime": "15%", "seasonal": "0%"  }
  ],
  "gender": { "men": "55%", "women": "45%" },
  "employmentBreakdownByAge": [
    { "ageGroup": "> 30",    "fullTime": 10, "partTime": 20, "seasonal": 5  },
    { "ageGroup": "30 - 40", "fullTime": 30, "partTime": 35, "seasonal": 10 },
    { "ageGroup": "40 - 50", "fullTime": 45, "partTime": 25, "seasonal": 15 },
    { "ageGroup": "50 - 60", "fullTime": 10, "partTime": 15, "seasonal": 8  },
    { "ageGroup": "60+",     "fullTime": 5,  "partTime": 5,  "seasonal": 2  }
  ]
}
```

---

## Change Summary

| Field path | Change |
|------------|--------|
| `demographics.employementType` | Renamed to `demographics.employmentType` |

No other fields, types, or constraints are modified.

---

## Frontend Mapping

| JSON key | TypeScript field | Interface |
|----------|-----------------|-----------|
| `demographics.employmentType` | `Demographics.employmentType` | `EmploymentTypeEntry[]` |

The `EmploymentTypeEntry` schema (fields: `department`, `fullTime`, `partTime`, `seasonal`) is unchanged.

---

## Notes

- This contract update takes effect when the backend deploys the corrected field name. Until then, `workforceSlice.ts` uses `STATIC_WORKFORCE_DATA` which is updated in this feature to use `employmentType`.
- Backend teams must coordinate deployment of this rename with the frontend PR merge to avoid a window where the live API returns `employementType` while the frontend expects `employmentType`.
