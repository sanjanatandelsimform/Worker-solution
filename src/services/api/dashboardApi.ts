/**
 * Dashboard API Service
 *
 * API service for retrieving dashboard data from GET /dashboard endpoint.
 * Follows existing patterns from authApi.ts and profileApi.ts.
 *
 * Based on: specs/001-dashboard-api-integration/research.md
 * Contract: specs/001-dashboard-api-integration/contracts/dashboard-api.yaml
 */

import axios from "axios";
import type { DashboardResponse } from "@/types/dashboardTypes";

// API base URL from environment variables
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://dev-api.benestats.com/api/v1";

// Storage key for user authentication details
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
 * Fetch dashboard data from GET /dashboard endpoint
 *
 * @returns Promise resolving to DashboardResponse
 * @throws Error with user-friendly message on failure
 *
 * @example
 * ```typescript
 * try {
 *   const data = await getDashboard();
 *   console.log(data.companyAtGlance);
 * } catch (error) {
 *   console.error('Dashboard fetch failed:', error.message);
 * }
 * ```
 */
export const getDashboard = async (): Promise<DashboardResponse> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }
    const response1 = {
      zipCodes: ["94043", "94105", "95113"],
      companyAtGlance: {
        totalWorkforce: "100-500",
        averageHourlyWage: "$26+",
        averageSalary: "$30,000 - $50,000",
        industryAverageWage: 61964,
      },
      industryOverview: {
        turnoverRate: {
          rate: 31,
          month: "m12",
          year: 2024,
        },
        avgTurnover: {
          rate: 40,
          sinceYear: 2020,
        },
        avgCostOfTurnover: {
          amount: 4149000000,
          formatted: "$4,149M",
          year: 2024,
        },
      },
      turnoverVoluntaryVsInvoluntary: {
        quarter: 2,
        year: 2024,
        voluntary: 18,
        involuntary: 13,
      },
      rateOfSeparation: {
        quarter: 2,
        year: 2024,
        hiringRate: 28,
        separationRate: 31,
      },
      areaMedianWage: [
        {
          zipcode: "94105",
          state: "Oklahoma",
          medianHourlyWages: 14.03,
          medianLivingWage: 24.03,
          nationalAverage: 83245,
          graph: {
            stateAverage: {
              salary: 45000,
              hourly: 21.63,
            },
            yourCompany: {
              salary: 40000,
              hourly: 26.0,
            },
            nationalAverage: {
              salary: 83245,
              hourly: 29.76,
            },
          },
        },
      ],
      housingCost: [
        {
          zipcode: "94105",
          housingCostBurdenedOwners: {
            year: 2023,
            burdened: 51.8,
            severelyBurdened: 39.8,
          },
          housingCostBurdenedRenters: {
            year: 2023,
            burdened: 11.1,
            severelyBurdened: 7.7,
          },
          workingClassHousingCostBurden: {
            homeOwnershipRate: 72,
            medianHomeValue: 367200,
            medianRent: 1423,
          },
          workingClassHousingGraph: {
            renters: {
              lowIncome: {
                burdened: 1175,
                severelyBurdened: 45,
              },
              moderateIncome: {
                burdened: 551,
                severelyBurdened: 22,
              },
              medianIncome: {
                burdened: 495,
                severelyBurdened: 11,
              },
              upperIncome: {
                burdened: 1326,
                severelyBurdened: 19,
              },
            },
            owners: {
              lowIncome: {
                burdened: 1175,
                severelyBurdened: 45,
              },
              moderateIncome: {
                burdened: 551,
                severelyBurdened: 22,
              },
              medianIncome: {
                burdened: 495,
                severelyBurdened: 11,
              },
              upperIncome: {
                burdened: 1326,
                severelyBurdened: 19,
              },
            },
          },
        },
      ],
      industry: {
        code: "42",
        name: "Wholesale Trade",
      },
      strategicRecommendations: [
        {
          category: "Healthcare",
          title: "Healthcare Alternatives",
          description:
            "Allows employees to pay for healthcare costs interest-free and over time, like a healthcare BNPL.",
          keyFeatures: [
            "All employees pre-approved",
            "Access to financial education and self-guided tools",
          ],
          order: 1,
        },
        {
          category: "Financial",
          title: "Financial Planning",
          description:
            "Financial wellness platform offering no-cost rainy day funds and financial therapy.",
          keyFeatures: [
            "All employees pre-approved",
            "Access to financial education and self-guided tools",
          ],
          order: 2,
        },
        {
          category: "Financial",
          title: "Emergency Savings",
          description:
            "Encourages workers to save for emergencies with employer-matched savings accounts.",
          keyFeatures: [
            "All employees pre-approved",
            "Access to financial education and self-guided tools",
          ],
          order: 3,
        },
      ],
    };

    return response1;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Authentication required. Please log in again."
    ) {
      throw error;
    }
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Dashboard API service object (for consistency with other API services)
 */
export const dashboardApi = {
  getDashboard,
};
