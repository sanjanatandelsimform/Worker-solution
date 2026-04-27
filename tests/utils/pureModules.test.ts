/**
 * Pure module tests: goalsData, userSelector, routeConfig, store
 */
import { describe, it, expect, vi } from "vitest";

// ── goalsData ───────────────────────────────────────────────────────────
describe("goalsData", () => {
  it("exports an array of goal categories", async () => {
    const { goalsData } = await import("@/data/goalsData");
    expect(Array.isArray(goalsData)).toBe(true);
    expect(goalsData.length).toBeGreaterThan(0);
  });

  it("each category has goals with id and label", async () => {
    const { goalsData } = await import("@/data/goalsData");
    for (const cat of goalsData) {
      expect(cat.category).toBeTruthy();
      expect(Array.isArray(cat.goals)).toBe(true);
      for (const g of cat.goals) {
        expect(g.id).toBeTruthy();
        expect(g.label).toBeTruthy();
      }
    }
  });

  it("contains expected categories", async () => {
    const { goalsData } = await import("@/data/goalsData");
    const names = goalsData.map((c: { category: string }) => c.category);
    expect(names).toContain("Financial health");
    expect(names).toContain("Healthcare");
    expect(names).toContain("Performance");
  });
});

// ── userSelector ────────────────────────────────────────────────────────
describe("userSelector", () => {
  it("selectUser returns user data from state", async () => {
    const { selectUser, selectUserLoading, selectUserError, selectEmailVerifyStatus } =
      await import("@/store/selectors/userSelector");
    const state = {
      user: { data: { id: "1", emailVerify: true }, loading: false, error: null },
    } as any;
    expect(selectUser(state)).toEqual({ id: "1", emailVerify: true });
    expect(selectUserLoading(state)).toBe(false);
    expect(selectUserError(state)).toBe(null);
    expect(selectEmailVerifyStatus(state)).toBe(true);
  });

  it("selectUser returns null for empty state", async () => {
    const { selectUser, selectEmailVerifyStatus } = await import("@/store/selectors/userSelector");
    const state = { user: { data: null, loading: false, error: null } } as any;
    expect(selectUser(state)).toBeNull();
    expect(selectEmailVerifyStatus(state)).toBe(false);
  });
});

// ── routeConfig ─────────────────────────────────────────────────────────
describe("routeConfig", () => {
  // Need to mock all page imports since routeConfig imports them eagerly
  vi.mock("@/pages/auth/RegisterPage", () => ({ RegisterPage: () => null }));
  vi.mock("@/pages/auth/SignInPage", () => ({ SignInPage: () => null }));
  vi.mock("@/pages/auth/VerifyEmailPage", () => ({ VerifyEmailPage: () => null }));
  vi.mock("@/pages/dashboard/DashboardPage", () => ({ DashboardPage: () => null }));
  vi.mock("@/pages/settings/SettingsPage", () => ({ SettingsPage: () => null }));
  vi.mock("@/pages/successPage/SuccessPage", () => ({ SuccessPage: () => null }));
  vi.mock("@/pages/termsPolicy/PrivacyPage", () => ({ default: () => null }));
  vi.mock("@/pages/termsPolicy/TermsPage", () => ({ default: () => null }));
  vi.mock("@/components/auth/ForgotPasswordForm", () => ({ default: () => null }));
  vi.mock("@/components/auth/ResetPasswordForm", () => ({ default: () => null }));
  vi.mock("@/pages/assessmentWorkforce/AssessmentWorkforce", () => ({ default: () => null }));
  vi.mock("@/pages/getMore/GetMore", () => ({ default: () => null }));
  vi.mock("@/pages/additionalQuestions/AdditionalQuestions", () => ({ default: () => null }));
  vi.mock("@/pages/aboutUs/AboutUs", () => ({ default: () => null }));

  it("exports a routes array", async () => {
    const { routes } = await import("@/routes/routeConfig");
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it("each route has a path", async () => {
    const { routes } = await import("@/routes/routeConfig");
    for (const r of routes) {
      expect(r.path).toBeTruthy();
    }
  });
});

// ── store ───────────────────────────────────────────────────────────────
describe("store", () => {
  it("exports a configured redux store", async () => {
    const { store } = await import("@/store/store");
    expect(store).toBeDefined();
    expect(store.getState()).toBeDefined();
    expect(store.dispatch).toBeInstanceOf(Function);
  });

  it("store state has expected slices", async () => {
    const { store } = await import("@/store/store");
    const state = store.getState();
    expect(state).toHaveProperty("auth");
    expect(state).toHaveProperty("profile");
    expect(state).toHaveProperty("dashboard");
    expect(state).toHaveProperty("industry");
  });
});
