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

    // const response = await axios.get<DashboardResponse>(`${API_BASE_URL}/dashboard`, {
    //   timeout: 30000, // 30-second timeout per spec clarification #1
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //     "Content-Type": "application/json",
    //   },
    // });

    // console.log("response====>>>>", response);

    // return response.data;
    const response1 = {
      zipCodes: ["94043", "94105", "95113"], //To be used for drop-down only
      companyAtGlance: {
        totalWorkforce: "100-500",
        averageHourlyWage: "$26+",
        averageSalary: "$30,000 - $50,000",
        // workingClassPopulation: {
        //   count: 89,
        //   percentage: 38,
        // },
        industryAverageWage: 61964,
      },
      industryOverview: {
        turnoverRate: {
          rate: 31,
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
        percentage: {
          voluntary: 18,
          involuntary: 13,
        },
      },
      rateOfSeparation: {
        quarter: 2,
        year: 2024,
        percentage: {
          hiringRate: 28,
          separationRate: 31,
        },
      },
      areaMedianWage: [
        {
          zipcode: "94043",
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
        {
          zipcode: "94105",
          medianHourlyWages: 17.03,
          medianLivingWage: 50.03,
          nationalAverage: 5565,
          graph: {
            stateAverage: {
              salary: 50000,
              hourly: 22.63,
            },
            yourCompany: {
              salary: 80000,
              hourly: 27.0,
            },
            nationalAverage: {
              salary: 90245,
              hourly: 30.76,
            },
          },
        },
        {
          zipcode: "95113",
          medianHourlyWages: 20.03,
          medianLivingWage: 70.03,
          nationalAverage: 83245,
          graph: {
            stateAverage: {
              salary: 6000,
              hourly: 72.63,
            },
            yourCompany: {
              salary: 90000,
              hourly: 66.0,
            },
            nationalAverage: {
              salary: 80245,
              hourly: 20.76,
            },
          },
        },
      ],
      housingCost: [
        {
          zipcode: "94043",
          housingCostBurdenedOwners: [
            {
              quarter: 4,
              year: 2023,
              percentage: {
                burdened: 51.8,
                severelyBurdened: 39.8,
              },
            },
          ],
          housingCostBurdenedRenters: [
            {
              quarter: 2,
              year: 2023,
              percentage: {
                burdened: 11.1,
                severelyBurdened: 7.7,
              },
            },
          ],
          workingClassHousingCostBurden: {
            homeOwnershipRate: 50,
            medianHomeValue: 200,
            medianRent: 23,
          },
          workingClassHousingGraph: [
            {
              incomeCategory: "lowIncome",
              label: "Low income",
              range: "$50,000 or less",
              burdened: 74,
              severelyBurdened: 44,
            },
            {
              incomeCategory: "moderateIncome",
              label: "Moderate income",
              range: "$50,000 - $74,999",
              burdened: 40,
              severelyBurdened: 4,
            },
            {
              incomeCategory: "medianIncome",
              label: "Median income",
              range: "$75,000 - $99,999",
              burdened: 10,
              severelyBurdened: 1,
            },
            {
              incomeCategory: "upperIncome",
              label: "Upper income",
              range: "$100,000 or more",
              burdened: 1,
              severelyBurdened: 0,
            },
          ],
        },
        {
          zipcode: "94105",
          housingCostBurdenedOwners: [
            {
              quarter: 4,
              year: 2024,
              percentage: {
                burdened: 57.8,
                severelyBurdened: 39.8,
              },
            },
          ],
          housingCostBurdenedRenters: [
            {
              quarter: 2,
              year: 2024,
              percentage: {
                burdened: 15.1,
                severelyBurdened: 7.7,
              },
            },
          ],
          workingClassHousingCostBurden: {
            homeOwnershipRate: 72,
            medianHomeValue: 367200,
            medianRent: 1423,
          },
          workingClassHousingGraph: [
            {
              incomeCategory: "lowIncome",
              label: "Low income",
              range: "$50,000 or less",
              burdened: 80,
              severelyBurdened: 44,
            },
            {
              incomeCategory: "moderateIncome",
              label: "Moderate income",
              range: "$50,000 - $74,999",
              burdened: 100,
              severelyBurdened: 4,
            },
            {
              incomeCategory: "medianIncome",
              label: "Median income",
              range: "$75,000 - $99,999",
              burdened: 20,
              severelyBurdened: 1,
            },
            {
              incomeCategory: "upperIncome",
              label: "Upper income",
              range: "$100,000 or more",
              burdened: 80,
              severelyBurdened: 0,
            },
          ],
        },
      ],
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
