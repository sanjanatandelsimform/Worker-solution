/**
 * Tests for Redux store selectors
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/services/api/authApi", () => ({
  default: { get: vi.fn(), post: vi.fn() },
  refreshAccessToken: vi.fn(),
  signout: vi.fn(),
}));
vi.mock("@/services/api/dashboardApi", () => ({ getDashboard: vi.fn() }));
vi.mock("@/services/api/industryApi", () => ({ getIndustry: vi.fn() }));
vi.mock("@/services/api/workforceApi", () => ({ getWorkforce: vi.fn() }));
vi.mock("@/services/api/recommendationsApi", () => ({ getRecommendations: vi.fn() }));
vi.mock("@/services/api/finchApi", () => ({ getFinchStatus: vi.fn() }));
vi.mock("@/services/api/profileApi", () => ({
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
  deleteAccount: vi.fn(),
  resendEmailVerification: vi.fn(),
  retakeAssessment: vi.fn(),
}));
vi.mock("@/services/api/userApi", () => ({ getUserById: vi.fn() }));

// authSelectors
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthInitAttempted,
  selectAccessToken,
  selectRefreshToken,
  selectUserFullName,
} from "@/store/selectors/authSelectors";

// profileSelectors
import {
  selectProfileLoading,
  selectProfileError,
  selectPasswordAttempts,
  selectIsAccountLocked,
  selectLockoutExpiry,
  selectProfileState,
} from "@/store/selectors/profileSelectors";

// userSelector
import {
  selectUser as selectUserData,
  selectUserLoading,
  selectUserError,
  selectEmailVerifyStatus,
} from "@/store/selectors/userSelector";

// dashboardSelectors
import {
  selectDashboardState,
  selectDashboardData,
  selectZipCodes,
  selectDashboardLoading,
  selectDashboardError,
  selectCompanyAtGlance,
  selectStrategicRecommendations,
  selectIndustryOverview,
  selectTurnoverMetrics,
  selectSeparationMetrics,
  selectPrimaryAreaMedianWage,
  selectPrimaryHousingCost,
  selectDashboardIsLoaded,
  selectDashboardHasError,
  selectBurdenedOwnersPercentage,
  selectBurdenedRentersPercentage,
  selectWorkingClassHousingCostBurden,
  selectWorkingClassHousingGraph,
  selectAreaMedianWageChartData,
  makeSelectAreaMedianByZip,
  makeSelectHousingCostByZip,
  selectIndustry,
} from "@/store/selectors/dashboardSelectors";

// workforceSelectors
import {
  selectWorkforceState,
  selectWorkforceData,
  selectWorkforceLoading,
  selectWorkforceError,
  selectWorkforceLastFetched,
  selectWorkforceIsLoaded,
  selectWorkforceSection,
  selectParticipationSection,
  selectDemographicsSection,
  selectCompensationSection,
} from "@/store/selectors/workforceSelectors";

// recommendationsSelectors
import {
  selectRecommendationsState,
  selectRecommendationsData,
  selectRecommendationsLoading,
  selectRecommendationsError,
  selectRecommendationsIsLoaded,
  selectRecommendationItem,
  selectRecommStrategicRecommendations,
  selectProvenStrategiesFlags,
} from "@/store/selectors/recommendationsSelectors";

// finchStatusSelectors
import {
  selectFinchConnection,
  selectFinchLatestSyncJob,
  selectFinchStatusLoading,
  selectFinchStatusError,
  selectFinchIndustryStatus,
} from "@/store/selectors/finchStatusSelectors";

// industrySelectors
import {
  selectIndustryData,
  selectIndustryLoading,
  selectIndustryError,
  selectIndustryIsLoaded,
  selectIndustryFullData,
  selectIndustryOverviewData,
  selectIndustryTurnover,
  selectIndustryTurnOverRate,
  selectIndustrySeparationRate,
  selectIndustryAreaMedianWage,
  selectIndustryHousingData,
  selectIndustryZipCodes,
} from "@/store/selectors/industrySelectors";

// registrationFormSelectors
import { selectRegistrationFormData } from "@/store/selectors/registrationFormSelectors";

// -----------------------------------------------
// Build a fake root state for tests
// -----------------------------------------------
const mockUser = {
  id: "1",
  firstName: "Alice",
  lastName: "Smith",
  businessEmail: "a@b.com",
  emailVerify: true,
} as any;
const mockTokens = { accessToken: "at", refreshToken: "rt" };

const buildState = (overrides: Partial<any> = {}): any => ({
  auth: {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    authInitAttempted: true,
    tokens: mockTokens,
    ...overrides.auth,
  },
  profile: {
    loading: false,
    error: null,
    passwordAttempts: 0,
    isAccountLocked: false,
    lockoutExpiry: null,
    ...overrides.profile,
  },
  user: {
    data: mockUser,
    loading: false,
    error: null,
    ...overrides.user,
  },
  dashboard: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
    isLoaded: false,
    ...overrides.dashboard,
  },
  workforce: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
    isLoaded: false,
    ...overrides.workforce,
  },
  recommendations: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
    isLoaded: false,
    ...overrides.recommendations,
  },
  finchStatus: {
    connection: null,
    latestSyncJob: null,
    loading: false,
    error: null,
    ...overrides.finchStatus,
  },
  industry: {
    data: null,
    loading: false,
    error: null,
    isLoaded: false,
    ...overrides.industry,
  },
  registrationForm: {
    formData: {},
    ...overrides.registrationForm,
  },
});

// -------------------------------------------------------------------
// authSelectors
// -------------------------------------------------------------------
describe("authSelectors", () => {
  it("selectAuth returns auth slice", () => {
    const s = buildState();
    expect(selectAuth(s)).toEqual(s.auth);
  });

  it("selectUser returns user", () => {
    const s = buildState();
    expect(selectUser(s)).toEqual(mockUser);
  });

  it("selectIsAuthenticated returns true", () => {
    expect(selectIsAuthenticated(buildState())).toBe(true);
    expect(selectIsAuthenticated(buildState({ auth: { isAuthenticated: false } }))).toBe(false);
  });

  it("selectIsLoading returns false", () => {
    expect(selectIsLoading(buildState())).toBe(false);
  });

  it("selectAuthInitAttempted returns true", () => {
    expect(selectAuthInitAttempted(buildState())).toBe(true);
  });

  it("selectAuthInitAttempted defaults to false", () => {
    expect(selectAuthInitAttempted(buildState({ auth: { authInitAttempted: undefined } }))).toBe(
      false
    );
  });

  it("selectAccessToken returns token", () => {
    expect(selectAccessToken(buildState())).toBe("at");
  });

  it("selectRefreshToken returns token", () => {
    expect(selectRefreshToken(buildState())).toBe("rt");
  });

  it("selectUserFullName returns full name", () => {
    expect(selectUserFullName(buildState())).toBe("Alice Smith");
  });

  it("selectUserFullName returns empty string when no user", () => {
    expect(selectUserFullName(buildState({ auth: { user: null } }))).toBe("");
  });
});

// -------------------------------------------------------------------
// profileSelectors
// -------------------------------------------------------------------
describe("profileSelectors", () => {
  it("selectProfileLoading returns false", () => {
    expect(selectProfileLoading(buildState())).toBe(false);
  });

  it("selectProfileLoading uses fallback when profile is undefined", () => {
    const s = { ...buildState(), profile: undefined };
    expect(selectProfileLoading(s)).toBe(false);
  });

  it("selectProfileError returns null", () => {
    expect(selectProfileError(buildState())).toBeNull();
  });

  it("selectPasswordAttempts returns count", () => {
    expect(selectPasswordAttempts(buildState({ profile: { passwordAttempts: 3 } }))).toBe(3);
  });

  it("selectIsAccountLocked returns false", () => {
    expect(selectIsAccountLocked(buildState())).toBe(false);
  });

  it("selectLockoutExpiry returns null", () => {
    expect(selectLockoutExpiry(buildState())).toBeNull();
  });

  it("selectProfileState returns profile slice", () => {
    const s = buildState();
    expect(selectProfileState(s)).toEqual(s.profile);
  });
});

// -------------------------------------------------------------------
// userSelector
// -------------------------------------------------------------------
describe("userSelector", () => {
  it("selectUserData returns user", () => {
    expect(selectUserData(buildState())).toEqual(mockUser);
  });

  it("selectUserLoading returns false", () => {
    expect(selectUserLoading(buildState())).toBe(false);
  });

  it("selectUserError returns null", () => {
    expect(selectUserError(buildState())).toBeNull();
  });

  it("selectEmailVerifyStatus returns true", () => {
    expect(selectEmailVerifyStatus(buildState())).toBe(true);
  });

  it("selectEmailVerifyStatus returns false when no user data", () => {
    expect(selectEmailVerifyStatus(buildState({ user: { data: null } }))).toBe(false);
  });
});

// -------------------------------------------------------------------
// dashboardSelectors
// -------------------------------------------------------------------
const mockDashboardData: any = {
  industry: { code: "c1", name: "Tech" },
  zipCodes: ["12345"],
  companyAtGlance: { employees: 100 },
  strategicRecommendations: [
    { order: 2, title: "B" },
    { order: 1, title: "A" },
  ],
  industryOverview: { industryName: "Tech" },
  turnoverVoluntaryVsInvoluntary: { voluntary: 5, involuntary: 2 },
  rateOfSeparation: { rate: 10 },
  areaMedianWage: [
    {
      zipcode: "12345",
      graph: {
        stateAverage: { salary: 50000, hourly: 20 },
        yourCompany: { salary: 60000, hourly: 25 },
        nationalAverage: { salary: 55000, hourly: 22 },
      },
    },
  ],
  housingCost: [
    {
      zipcode: "12345",
      housingCostBurdenedOwners: [{ burdened: 20, severelyBurdened: 10 }],
      housingCostBurdenedRenters: [{ burdened: 30, severelyBurdened: 15 }],
      workingClassHousingCostBurden: {
        homeOwnershipRate: 50,
        medianHomeValue: 200000,
        medianRent: 1200,
      },
      workingClassHousingGraph: { owners: {}, renters: {} },
    },
  ],
};

describe("dashboardSelectors", () => {
  const loadedState = buildState({
    dashboard: {
      data: mockDashboardData,
      loading: false,
      error: null,
      lastFetched: 123,
      isLoaded: true,
    },
  });
  const emptyState = buildState();

  it("selectDashboardState returns dashboard slice", () => {
    expect(selectDashboardState(loadedState)).toEqual(loadedState.dashboard);
  });

  it("selectDashboardData returns data", () => {
    expect(selectDashboardData(loadedState)).toEqual(mockDashboardData);
    expect(selectDashboardData(emptyState)).toBeNull();
  });

  it("selectZipCodes returns array", () => {
    expect(selectZipCodes(loadedState)).toEqual(["12345"]);
    expect(selectZipCodes(emptyState)).toEqual([]);
  });

  it("selectDashboardLoading returns false", () => {
    expect(selectDashboardLoading(loadedState)).toBe(false);
  });

  it("selectDashboardError returns null", () => {
    expect(selectDashboardError(loadedState)).toBeNull();
  });

  it("selectCompanyAtGlance returns data", () => {
    expect(selectCompanyAtGlance(loadedState)?.employees).toBe(100);
    expect(selectCompanyAtGlance(emptyState)).toBeNull();
  });

  it("selectStrategicRecommendations sorts by order", () => {
    const recs = selectStrategicRecommendations(loadedState);
    expect(recs[0].title).toBe("A");
    expect(recs[1].title).toBe("B");
    expect(selectStrategicRecommendations(emptyState)).toEqual([]);
  });

  it("selectIndustryOverview returns data", () => {
    expect(selectIndustryOverview(loadedState)?.industryName).toBe("Tech");
    expect(selectIndustryOverview(emptyState)).toBeNull();
  });

  it("selectTurnoverMetrics returns data", () => {
    expect(selectTurnoverMetrics(loadedState)?.voluntary).toBe(5);
    expect(selectTurnoverMetrics(emptyState)).toBeNull();
  });

  it("selectSeparationMetrics returns data", () => {
    expect(selectSeparationMetrics(loadedState)?.rate).toBe(10);
    expect(selectSeparationMetrics(emptyState)).toBeNull();
  });

  it("selectPrimaryAreaMedianWage returns first entry", () => {
    expect(selectPrimaryAreaMedianWage(loadedState)?.zipcode).toBe("12345");
    expect(selectPrimaryAreaMedianWage(emptyState)).toBeNull();
  });

  it("selectPrimaryHousingCost returns first entry", () => {
    expect(selectPrimaryHousingCost(loadedState)?.zipcode).toBe("12345");
    expect(selectPrimaryHousingCost(emptyState)).toBeNull();
  });

  it("selectDashboardIsLoaded returns true", () => {
    expect(selectDashboardIsLoaded(loadedState)).toBe(true);
    expect(selectDashboardIsLoaded(emptyState)).toBe(false);
  });

  it("selectDashboardHasError returns false when no error", () => {
    expect(selectDashboardHasError(loadedState)).toBe(false);
    expect(selectDashboardHasError(buildState({ dashboard: { error: "err" } }))).toBe(true);
  });

  it("selectBurdenedOwnersPercentage returns data", () => {
    const result = selectBurdenedOwnersPercentage(loadedState);
    expect(result?.burdened).toBe(20);
    expect(result?.severelyBurdened).toBe(10);
    expect(selectBurdenedOwnersPercentage(emptyState)).toBeNull();
  });

  it("selectBurdenedRentersPercentage returns data", () => {
    const result = selectBurdenedRentersPercentage(loadedState);
    expect(result?.burdened).toBe(30);
    expect(selectBurdenedRentersPercentage(emptyState)).toBeNull();
  });

  it("selectWorkingClassHousingCostBurden returns data", () => {
    expect(selectWorkingClassHousingCostBurden(loadedState)?.homeOwnershipRate).toBe(50);
    expect(selectWorkingClassHousingCostBurden(emptyState)).toBeNull();
  });

  it("selectWorkingClassHousingGraph returns data", () => {
    expect(selectWorkingClassHousingGraph(loadedState)).toBeTruthy();
    expect(selectWorkingClassHousingGraph(emptyState)).toBeNull();
  });

  it("selectAreaMedianWageChartData returns chart data", () => {
    const data = selectAreaMedianWageChartData(loadedState);
    expect(data).toHaveLength(2);
    expect(data![0].name).toBe("Salary");
    expect(data![1].name).toBe("Hourly");
    expect(selectAreaMedianWageChartData(emptyState)).toBeNull();
  });

  it("makeSelectAreaMedianByZip returns correct entry", () => {
    const sel = makeSelectAreaMedianByZip("12345");
    expect(sel(loadedState)?.zipcode).toBe("12345");
    expect(sel(loadedState)).toBeTruthy();
  });

  it("makeSelectAreaMedianByZip returns null for missing zip", () => {
    const sel = makeSelectAreaMedianByZip("99999");
    expect(sel(loadedState)).toBeNull();
  });

  it("makeSelectAreaMedianByZip returns null when no zipcode provided", () => {
    const sel = makeSelectAreaMedianByZip(undefined);
    expect(sel(loadedState)).toBeNull();
  });

  it("makeSelectHousingCostByZip returns correct entry", () => {
    const sel = makeSelectHousingCostByZip("12345");
    expect(sel(loadedState)?.zipcode).toBe("12345");
  });

  it("makeSelectHousingCostByZip returns null for missing zip", () => {
    const sel = makeSelectHousingCostByZip("00000");
    expect(sel(loadedState)).toBeNull();
  });

  it("selectIndustry returns industry data", () => {
    expect(selectIndustry(loadedState)?.name).toBe("Tech");
    expect(selectIndustry(emptyState)).toBeNull();
  });
});

// -------------------------------------------------------------------
// workforceSelectors
// -------------------------------------------------------------------
const mockWorkforceData: any = {
  workforce: {
    workforce: { totalWorkforce: 50 },
    participation: { enrollmentRate: 0.8 },
    demographics: { employmentType: [] },
    compensation: { salaryBreakdown: [] },
  },
};

describe("workforceSelectors", () => {
  const loadedState = buildState({
    workforce: {
      data: mockWorkforceData,
      loading: false,
      error: null,
      lastFetched: 100,
      isLoaded: true,
    },
  });
  const emptyState = buildState();

  it("selectWorkforceState returns slice", () => {
    expect(selectWorkforceState(loadedState)).toEqual(loadedState.workforce);
  });

  it("selectWorkforceData returns data", () => {
    expect(selectWorkforceData(loadedState)).toEqual(mockWorkforceData);
    expect(selectWorkforceData(emptyState)).toBeNull();
  });

  it("selectWorkforceLoading returns false", () => {
    expect(selectWorkforceLoading(loadedState)).toBe(false);
  });

  it("selectWorkforceError returns null", () => {
    expect(selectWorkforceError(loadedState)).toBeNull();
  });

  it("selectWorkforceLastFetched returns timestamp", () => {
    expect(selectWorkforceLastFetched(loadedState)).toBe(100);
  });

  it("selectWorkforceIsLoaded returns true", () => {
    expect(selectWorkforceIsLoaded(loadedState)).toBe(true);
  });

  it("selectWorkforceSection returns workforce section", () => {
    expect(selectWorkforceSection(loadedState)?.totalWorkforce).toBe(50);
    expect(selectWorkforceSection(emptyState)).toBeNull();
  });

  it("selectParticipationSection returns data", () => {
    expect(selectParticipationSection(loadedState)?.enrollmentRate).toBe(0.8);
    expect(selectParticipationSection(emptyState)).toBeNull();
  });

  it("selectDemographicsSection returns data", () => {
    expect(selectDemographicsSection(loadedState)).toBeTruthy();
    expect(selectDemographicsSection(emptyState)).toBeNull();
  });

  it("selectCompensationSection returns data", () => {
    expect(selectCompensationSection(loadedState)).toBeTruthy();
    expect(selectCompensationSection(emptyState)).toBeNull();
  });
});

// -------------------------------------------------------------------
// recommendationsSelectors
// -------------------------------------------------------------------
const mockRecommendationsData: any = {
  recommendation: {
    nonElectiveMatch: "green",
    autoEnroll: "hidden",
    healthcareAffordability: "green",
    strategicRecommendations: [
      { order: 3, title: "C" },
      { order: 1, title: "A" },
    ],
  },
};

describe("recommendationsSelectors", () => {
  const loadedState = buildState({
    recommendations: {
      data: mockRecommendationsData,
      loading: false,
      error: null,
      lastFetched: 100,
      isLoaded: true,
    },
  });
  const emptyState = buildState();

  it("selectRecommendationsState returns slice", () => {
    expect(selectRecommendationsState(loadedState)).toEqual(loadedState.recommendations);
  });

  it("selectRecommendationsData returns data", () => {
    expect(selectRecommendationsData(loadedState)).toEqual(mockRecommendationsData);
  });

  it("selectRecommendationsLoading returns false", () => {
    expect(selectRecommendationsLoading(loadedState)).toBe(false);
  });

  it("selectRecommendationsError returns null", () => {
    expect(selectRecommendationsError(loadedState)).toBeNull();
  });

  it("selectRecommendationsIsLoaded returns true", () => {
    expect(selectRecommendationsIsLoaded(loadedState)).toBe(true);
  });

  it("selectRecommendationItem returns inner recommendation", () => {
    expect(selectRecommendationItem(loadedState)).toEqual(mockRecommendationsData.recommendation);
    expect(selectRecommendationItem(emptyState)).toBeNull();
  });

  it("selectRecommStrategicRecommendations sorts by order", () => {
    const recs = selectRecommStrategicRecommendations(loadedState);
    expect(recs[0].title).toBe("A");
    expect(recs[1].title).toBe("C");
    expect(selectRecommStrategicRecommendations(emptyState)).toEqual([]);
  });

  it("selectProvenStrategiesFlags returns flags", () => {
    const flags = selectProvenStrategiesFlags(loadedState);
    expect(flags.nonElectiveMatch).toBe("green");
    expect(flags.autoEnroll).toBe("hidden");
    expect(flags.healthcareAffordability).toBe("green");
  });

  it("selectProvenStrategiesFlags defaults to 'hidden'", () => {
    const flags = selectProvenStrategiesFlags(emptyState);
    expect(flags.nonElectiveMatch).toBe("hidden");
    expect(flags.autoEnroll).toBe("hidden");
  });
});

// -------------------------------------------------------------------
// finchStatusSelectors
// -------------------------------------------------------------------
const mockFinchConnection: any = {
  connectionId: "c1",
  connectionStatus: "connected",
  products: [],
  payFrequency: null,
  industry: "fetch",
};

describe("finchStatusSelectors", () => {
  const loadedState = buildState({
    finchStatus: {
      connection: mockFinchConnection,
      latestSyncJob: null,
      loading: false,
      error: null,
    },
  });
  const emptyState = buildState();

  it("selectFinchConnection returns connection", () => {
    expect(selectFinchConnection(loadedState)).toEqual(mockFinchConnection);
    expect(selectFinchConnection(emptyState)).toBeNull();
  });

  it("selectFinchLatestSyncJob returns null", () => {
    expect(selectFinchLatestSyncJob(loadedState)).toBeNull();
  });

  it("selectFinchStatusLoading returns false", () => {
    expect(selectFinchStatusLoading(loadedState)).toBe(false);
  });

  it("selectFinchStatusError returns null", () => {
    expect(selectFinchStatusError(loadedState)).toBeNull();
  });

  it("selectFinchIndustryStatus returns fetch", () => {
    expect(selectFinchIndustryStatus(loadedState)).toBe("fetch");
    expect(selectFinchIndustryStatus(emptyState)).toBeNull();
  });
});

// -------------------------------------------------------------------
// industrySelectors
// -------------------------------------------------------------------
describe("industrySelectors", () => {
  const mockIndustryFullData = {
    industry: { code: "tech", name: "Technology" },
    industryOverview: { industryName: "Tech" },
    industryTurnover: { rate: 5 },
    turnoverVoluntaryVsInvoluntary: { voluntary: 3 },
    rateOfSeparation: { rate: 2 },
    areaMedianWage: [{ zipcode: "12345" }],
    housingCost: [{ zipcode: "12345" }],
  };
  const loadedState = buildState({
    industry: { data: mockIndustryFullData, loading: false, error: null, isLoaded: true },
  });
  const emptyState = buildState();

  it("selectIndustryData returns industry sub-object", () => {
    expect(selectIndustryData(loadedState)).toEqual({ code: "tech", name: "Technology" });
    expect(selectIndustryData(emptyState)).toBeNull();
  });

  it("selectIndustryFullData returns full data", () => {
    expect(selectIndustryFullData(loadedState)).toEqual(mockIndustryFullData);
    expect(selectIndustryFullData(emptyState)).toBeNull();
  });

  it("selectIndustryOverviewData returns industryOverview", () => {
    expect(selectIndustryOverviewData(loadedState)?.industryName).toBe("Tech");
    expect(selectIndustryOverviewData(emptyState)).toBeNull();
  });

  it("selectIndustryTurnover returns turnover data", () => {
    expect(selectIndustryTurnover(loadedState)).toBeTruthy();
    expect(selectIndustryTurnover(emptyState)).toBeNull();
  });

  it("selectIndustryTurnOverRate returns turnover rate", () => {
    expect(selectIndustryTurnOverRate(loadedState)).toBeTruthy();
    expect(selectIndustryTurnOverRate(emptyState)).toBeNull();
  });

  it("selectIndustrySeparationRate returns separation rate", () => {
    expect(selectIndustrySeparationRate(loadedState)).toBeTruthy();
    expect(selectIndustrySeparationRate(emptyState)).toBeNull();
  });

  it("selectIndustryAreaMedianWage returns array", () => {
    expect(selectIndustryAreaMedianWage(loadedState)).toHaveLength(1);
    expect(selectIndustryAreaMedianWage(emptyState)).toEqual([]);
  });

  it("selectIndustryHousingData returns array", () => {
    expect(selectIndustryHousingData(loadedState)).toHaveLength(1);
    expect(selectIndustryHousingData(emptyState)).toEqual([]);
  });

  it("selectIndustryZipCodes returns zip codes", () => {
    expect(selectIndustryZipCodes(loadedState)).toEqual(["12345"]);
    expect(selectIndustryZipCodes(emptyState)).toEqual([]);
  });

  it("selectIndustryLoading returns false", () => {
    expect(selectIndustryLoading(loadedState)).toBe(false);
  });

  it("selectIndustryError returns null", () => {
    expect(selectIndustryError(loadedState)).toBeNull();
  });

  it("selectIndustryIsLoaded returns true", () => {
    expect(selectIndustryIsLoaded(loadedState)).toBe(true);
    expect(selectIndustryIsLoaded(emptyState)).toBe(false);
  });
});

// -------------------------------------------------------------------
// registrationFormSelectors
// -------------------------------------------------------------------
describe("registrationFormSelectors", () => {
  it("selectRegistrationFormData returns form data", () => {
    const s = buildState({ registrationForm: { formData: { firstName: "Alice" } } });
    expect(selectRegistrationFormData(s).firstName).toBe("Alice");
  });

  it("selectRegistrationFormData returns empty when no data", () => {
    const s = buildState();
    expect(selectRegistrationFormData(s)).toEqual({});
  });
});
