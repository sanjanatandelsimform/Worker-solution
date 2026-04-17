/**
 * Industry API Service
 *
 * API service for retrieving industry data from GET /industry endpoint.
 * Follows existing patterns from dashboardApi.ts.
 *
 * Based on: specs/009-industry-status-api/research.md
 * Contract: specs/009-industry-status-api/contracts/industry-api.yaml
 */

import axios from "axios";
// import type { IndustryData, IndustryApiResponse } from "@/types/industryTypes";
import type { IndustryData } from "@/types/industryTypes";

const STORAGE_KEY = "userDetail";

/**
 * Get authentication token from localStorage
 * @returns Bearer token or null if not found
 */
const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.auth?.tokens?.accessToken || null;
  } catch {
    return null;
  }
};

/**
 * Extract error message from API error response
 * @param error - Error object from axios
 * @returns User-friendly error message
 */
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as { message?: string } | undefined;
    if (apiError?.message) {
      return apiError.message;
    }
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    if (error.message) {
      return error.message;
    }
  }
  return "An unexpected error occurred. Please try again.";
};

/**
 * Fetch industry data from GET /industry endpoint
 *
 * @returns Promise resolving to IndustryData
 * @throws Error with user-friendly message on failure
 */
export const getIndustry = async (): Promise<IndustryData> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    // const response = await apiClient.get<IndustryApiResponse>("/dashboard/industry", {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    //   timeout: 600000,
    // });

    // if (!response.data.status) {
    //   throw new Error("Failed to fetch industry data");
    // }

    // return response.data.data;
 
const response =
{
  "industryOverview": {
    "turnoverRate": {
      "rate": "$4.46M",
      "month": "Dec",
      "year": 2024
    },
    "avgTurnover": {
      "rate": 5.32,
      "sinceYear": 2020
    },
    "industryWideCostOfTurnover": {
      "amount": 1714381066.6667,
      "formatted": "$1.7B",
      "year": 2024
    },
    "rates": {
      "hire": 31,
      "seperation": 40
    }
  },
  "industry": {
    "code": "81",
    "name": "Other Services (except Public Administration)"
  },
  "industryTurnover": {
    "turnOverRate": {
      "industryAvg": {
        "involuntary": 39,
        "voluntary": 60,
        "quarter": "Q4",
        "year": 2024
      },
      "company": {
        "industry": 2,
        "company": 5,
        "year": 2024
      }
    },
    "seperationRate": {
      "industryAvg": {
        "seperation": 7.7,
        "hiring": 11.1,
        "quarter": "Q4",
        "year": 2024
      },
      "company": {
        "seperation": 2.7,
        "hiring": 8.1
      }
    }
  },
  "areaMedianWage": [
    {
      "zipcode": "10012",
      "state": "New York",
      "medianHourlyWages": 28.16,
      "medianLivingWage": 29.89,
      "nationalAverage": 44587,
      "graph": {
        "stateAverage": {
          "salary": 58560,
          "hourly": 28.16
        },
        "yourCompany": {
          "salary": 87500,
          "hourly": 17.5
        },
        "nationalAverage": {
          "salary": 44710,
          "hourly": 21.5
        }
      },
      "year": 2023
    },
    {
      "zipcode": "12207",
      "state": "New York",
      "medianHourlyWages": 10.16,
      "medianLivingWage": 12.89,
      "nationalAverage": 5000,
      "graph": {
        "stateAverage": {
          "salary": 48560,
          "hourly": 18.16
        },
        "yourCompany": {
          "salary": 57500,
          "hourly": 27.5
        },
        "nationalAverage": {
          "salary": 24710,
          "hourly": 11.5
        }
      },
      "year": 2026
    },
    {
      "zipcode": "12205",
      "state": "New York",
      "medianHourlyWages": 28.16,
      "medianLivingWage": 29.89,
      "nationalAverage": 44587,
      "graph": {
        "stateAverage": {
          "salary": 58560,
          "hourly": 28.16
        },
        "yourCompany": {
          "salary": 87500,
          "hourly": 17.5
        },
        "nationalAverage": {
          "salary": 44710,
          "hourly": 21.5
        }
      },
      "year": 2023
    }
  ],
  "housingCost": [
    {
      "zipcode": "10012",
      "housingCostBurdenedOwners": [
        {
          "year": 2025,
          "burdened": 42.4782,
          "severelyBurdened": 26.0105
        }
      ],
      "housingCostBurdenedRenters": [
        {
          "year": 2024,
          "burdened": 39.6756,
          "severelyBurdened": 19.2329
        }
      ],
      "workingClassHousingCostBurden": {
        "homeOwnershipRate": 22.5,
        "medianHomeValue": "1602800",
        "medianRent": "2895"
      },
      "workingClassHousingGraph": {
        "renters": {
          "lowIncome": {
            "burdened": 68.1284,
            "severelyBurdened": 2.8931
          },
          "moderateIncome": {
            "burdened": 64.8235,
            "severelyBurdened": 3.9549
          },
          "medianIncome": {
            "burdened": 64.4531,
            "severelyBurdened": 2.2971
          },
          "upperIncome": {
            "burdened": 22.4214,
            "severelyBurdened": 1.4086
          }
        },
        "owners": {
          "lowIncome": {
            "burdened": 3.939,
            "severelyBurdened": 3.7519
          },
          "moderateIncome": {
            "burdened": 6.25,
            "severelyBurdened": 4.3413
          },
          "medianIncome": {
            "burdened": 2.1707,
            "severelyBurdened": 0.8608
          },
          "upperIncome": {
            "burdened": 8.8885,
            "severelyBurdened": 2.9005
          }
        }
      }
    },
    {
      "zipcode": "12207",
      "housingCostBurdenedOwners": [
        {
          "year": 2024,
          "burdened": 1.8182,
          "severelyBurdened": 0
        }
      ],
      "housingCostBurdenedRenters": [
        {
          "year": 2024,
          "burdened": 47.8952,
          "severelyBurdened": 13.7462
        }
      ],
      "workingClassHousingCostBurden": {
        "homeOwnershipRate": 4,
        "medianHomeValue": "232000",
        "medianRent": "1331"
      },
      "workingClassHousingGraph": {
        "renters": {
          "lowIncome": {
            "burdened": 64.6132,
            "severelyBurdened": 3.4366
          },
          "moderateIncome": {
            "burdened": 49.5177,
            "severelyBurdened": 0
          },
          "medianIncome": {
            "burdened": 12.1359,
            "severelyBurdened": 0
          },
          "upperIncome": {
            "burdened": 0,
            "severelyBurdened": 0
          }
        },
        "owners": {
          "lowIncome": {
            "burdened": 0,
            "severelyBurdened": 0
          },
          "moderateIncome": {
            "burdened": 1.8182,
            "severelyBurdened": 0
          },
          "medianIncome": {
            "burdened": 0,
            "severelyBurdened": 0
          },
          "upperIncome": {
            "burdened": 0,
            "severelyBurdened": 0
          }
        }
      }
    },
    {
      "zipcode": "12205",
      "housingCostBurdenedOwners": [
        {
          "year": 2024,
          "burdened": 17.6449,
          "severelyBurdened": 7.5127
        }
      ],
      "housingCostBurdenedRenters": [
        {
          "year": 2024,
          "burdened": 45.6878,
          "severelyBurdened": 16.0218
        }
      ],
      "workingClassHousingCostBurden": {
        "homeOwnershipRate": 71.4,
        "medianHomeValue": "276600",
        "medianRent": "1446"
      },
      "workingClassHousingGraph": {
        "renters": {
          "lowIncome": {
            "burdened": 82.1678,
            "severelyBurdened": 3.9223
          },
          "moderateIncome": {
            "burdened": 54.7748,
            "severelyBurdened": 0.3325
          },
          "medianIncome": {
            "burdened": 21.519,
            "severelyBurdened": 0
          },
          "upperIncome": {
            "burdened": 1.2658,
            "severelyBurdened": 0
          }
        },
        "owners": {
          "lowIncome": {
            "burdened": 2.5375,
            "severelyBurdened": 1.5213
          },
          "moderateIncome": {
            "burdened": 3.2543,
            "severelyBurdened": 1.0283
          },
          "medianIncome": {
            "burdened": 2.4195,
            "severelyBurdened": 0.242
          },
          "upperIncome": {
            "burdened": 0.8529,
            "severelyBurdened": 0.0787
          }
        }
      }
    }
  ]
} 
    return response
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      throw error;
    }
    if (error instanceof Error && error.message === "Failed to fetch industry data") {
      throw error;
    }
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Industry API service object (for consistency with other API services)
 */
export const industryApi = {
  getIndustry,
};
