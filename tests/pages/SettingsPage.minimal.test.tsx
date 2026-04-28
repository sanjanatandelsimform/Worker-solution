/**
 * Minimal test to identify what blocks SettingsPage import
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/settings" }),
}));

vi.mock("@/services/api/authApi", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
  refreshAccessToken: vi.fn(),
  signout: vi.fn(),
}));
vi.mock("@/services/api/profileApi", () => ({
  retakeAssessment: vi.fn(),
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
  deleteAccount: vi.fn(),
  resendEmailVerification: vi.fn(),
  default: { post: vi.fn() },
}));
vi.mock("@/services/api/dashboardApi", () => ({ getDashboard: vi.fn() }));
vi.mock("@/services/api/userApi", () => ({ getUserById: vi.fn() }));
vi.mock("@/services/api/assessmentApi", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
  getAssessment: vi.fn(),
}));
vi.mock("@/components/dashboard/DashboardSidebar", () => ({ default: () => null }));
vi.mock("@/components/modals/ChangePasswordModal", () => ({ ChangePasswordModal: () => null }));
vi.mock("@/components/modals/UpdateYourEmailModal", () => ({ UpdateYourEmailModal: () => null }));
vi.mock("@/components/modals/SessionExpiredModal", () => ({ default: () => null }));
vi.mock("@/components/common/ErrorMessage", () => ({ default: () => null }));
vi.mock("@/components/modals/BaseModalWithIcon", () => ({ BaseModalWithIcon: () => null }));
vi.mock("@/components/base/buttons/button", () => ({ Button: () => null }));
vi.mock("@/components/base/input/input", () => ({ Input: () => null }));
vi.mock("@/assets/success-check.svg", () => ({ default: "" }));
vi.mock("@/assets/alert-icon.svg", () => ({ default: "" }));

// Test individual imports to find which one hangs
describe("minimal SettingsPage import", () => {
  it("should import profileSlice", async () => {
    const mod = await import("@/store/slices/profileSlice");
    expect(mod.default).toBeDefined();
  }, 10000);

  it("should import authSlice", async () => {
    const mod = await import("@/store/slices/authSlice");
    expect(mod.default).toBeDefined();
  }, 10000);

  it("should import useModalConfig", async () => {
    const mod = await import("@/hooks/useModalConfig");
    expect(mod.useModalConfig).toBeDefined();
  }, 10000);
});
