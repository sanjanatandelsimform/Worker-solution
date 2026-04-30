/**
 * Tests for dashboard, workforce, recommendations, finch, user APIs and apiUtils
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// -------------------------------------------------------------------
// Mocks for apiClient (authApi default export)
// -------------------------------------------------------------------
const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock("@/services/api/authApi", () => ({
  default: {
    get: mockGet,
    post: mockPost,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  },
}));

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  return {
    ...actual,
    default: {
      ...(actual as any).default,
      create: vi.fn(() => ({
        get: mockGet,
        post: mockPost,
        interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
        defaults: { headers: { common: {} } },
      })),
      isAxiosError: (actual as any).default.isAxiosError,
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockReset();
  mockPost.mockReset();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() =>
      JSON.stringify({
        auth: { tokens: { accessToken: "test-token" } },
      })
    ),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

// -------------------------------------------------------------------
// apiUtils
// -------------------------------------------------------------------
import { getAuthToken, getErrorMessage } from "@/services/api/apiUtils";
import axios from "axios";

describe("apiUtils - getAuthToken", () => {
  it("returns access token from localStorage", () => {
    const token = getAuthToken();
    expect(token).toBe("test-token");
  });

  it("returns null when localStorage is empty", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    expect(getAuthToken()).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue("bad-json");
    expect(getAuthToken()).toBeNull();
  });

  it("returns null when accessToken is missing", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify({ auth: { tokens: {} } })
    );
    expect(getAuthToken()).toBeNull();
  });
});

describe("apiUtils - getErrorMessage", () => {
  it("returns api message from Axios error with data", () => {
    const err = new axios.AxiosError("Bad Request", "400", undefined, undefined, {
      status: 400,
      data: { message: "Custom API error" },
    } as any);
    expect(getErrorMessage(err)).toBe("Custom API error");
  });

  it("returns timeout message for ECONNABORTED", () => {
    const err = new axios.AxiosError("Timeout");
    (err as any).code = "ECONNABORTED";
    expect(getErrorMessage(err)).toBe("Request timed out. Please try again.");
  });

  it("returns error.message for axios error without data", () => {
    const err = new axios.AxiosError("Request failed");
    expect(getErrorMessage(err)).toBe("Request failed");
  });

  it("returns default message for non-Axios error", () => {
    expect(getErrorMessage("random error")).toContain("unexpected error");
    expect(getErrorMessage(new Error("plain error"))).toBe(
      "An unexpected error occurred. Please try again."
    );
  });
});

// -------------------------------------------------------------------
// dashboardApi
// -------------------------------------------------------------------
import { getDashboard } from "@/services/api/dashboardApi";

describe("dashboardApi - getDashboard", () => {
  it("returns data on success", async () => {
    const mockData = { industry: { code: "c1", name: "Tech" } };
    mockGet.mockResolvedValueOnce({ data: mockData });
    const result = await getDashboard();
    expect(result).toEqual(mockData);
    expect(mockGet).toHaveBeenCalledWith("/dashboard", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
    }));
  });

  it("throws authentication error when no token", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    await expect(getDashboard()).rejects.toThrow("Authentication required");
  });

  it("rethrows authentication error", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    await expect(getDashboard()).rejects.toThrow("Authentication required. Please log in again.");
  });

  it("throws error message on API failure", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));
    await expect(getDashboard()).rejects.toThrow();
  });
});

// -------------------------------------------------------------------
// workforceApi
// -------------------------------------------------------------------
import { getWorkforce } from "@/services/api/workforceApi";

describe("workforceApi - getWorkforce", () => {
  it("returns data on success", async () => {
    const mockData = { workforce: {} };
    mockGet.mockResolvedValueOnce({ data: mockData });
    const result = await getWorkforce();
    expect(result).toEqual(mockData);
  });

  it("throws when no token", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    await expect(getWorkforce()).rejects.toThrow("Authentication required");
  });

  it("rethrows auth error", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    await expect(getWorkforce()).rejects.toThrow("Authentication required. Please log in again.");
  });

  it("wraps non-auth errors", async () => {
    mockGet.mockRejectedValueOnce(new Error("Server error"));
    await expect(getWorkforce()).rejects.toThrow();
  });
});

// -------------------------------------------------------------------
// recommendationsApi
// -------------------------------------------------------------------
import { getRecommendations } from "@/services/api/recommendationsApi";

describe("recommendationsApi - getRecommendations", () => {
  it("returns data on success", async () => {
    const mockData = { recommendation: { strategicRecommendations: [] } };
    mockGet.mockResolvedValueOnce({ data: mockData });
    const result = await getRecommendations();
    expect(result).toEqual(mockData);
  });

  it("throws when no token", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    await expect(getRecommendations()).rejects.toThrow("Authentication required");
  });

  it("rethrows auth error", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    await expect(getRecommendations()).rejects.toThrow("Authentication required. Please log in again.");
  });

  it("wraps API errors", async () => {
    mockGet.mockRejectedValueOnce(new Error("Failed"));
    await expect(getRecommendations()).rejects.toThrow();
  });
});

// -------------------------------------------------------------------
// finchApi
// -------------------------------------------------------------------
import { getFinchSessionId, exchangeFinchCode, getFinchStatus } from "@/services/api/finchApi";

describe("finchApi", () => {
  it("getFinchSessionId returns session on success", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        status: true,
        data: { sessionId: "s1", connectUrl: "https://connect.finch.com/s1" },
      },
    });
    const result = await getFinchSessionId();
    expect(result.sessionId).toBe("s1");
    expect(result.connectUrl).toBe("https://connect.finch.com/s1");
  });

  it("getFinchSessionId throws when status false", async () => {
    mockPost.mockResolvedValueOnce({
      data: { status: false, message: "Session failed" },
    });
    await expect(getFinchSessionId()).rejects.toThrow("Session failed");
  });

  it("getFinchSessionId throws default when no message", async () => {
    mockPost.mockResolvedValueOnce({
      data: { status: false },
    });
    await expect(getFinchSessionId()).rejects.toThrow("Failed to start Finch Connect");
  });

  it("getFinchSessionId throws when no sessionId", async () => {
    mockPost.mockResolvedValueOnce({
      data: { status: true, data: {} },
    });
    await expect(getFinchSessionId()).rejects.toThrow();
  });

  it("exchangeFinchCode returns data on success", async () => {
    const mockData = {
      connectionId: "c1",
      connectionStatus: "connected",
      providerId: "p1",
      syncJobId: "j1",
      syncJobStatus: "pending",
    };
    mockPost.mockResolvedValueOnce({
      data: { status: true, message: "Connected", data: mockData },
    });
    const result = await exchangeFinchCode("auth-code-123");
    expect(result.connectionId).toBe("c1");
  });

  it("exchangeFinchCode throws when status false", async () => {
    mockPost.mockResolvedValueOnce({
      data: { status: false, message: "Exchange failed" },
    });
    await expect(exchangeFinchCode("bad-code")).rejects.toThrow("Exchange failed");
  });

  it("exchangeFinchCode throws default message", async () => {
    mockPost.mockResolvedValueOnce({
      data: { status: false },
    });
    await expect(exchangeFinchCode("bad-code")).rejects.toThrow("Failed to complete Finch connection");
  });

  it("getFinchStatus returns data on success", async () => {
    const mockData = { connection: { connectionId: "c1" }, latestSyncJob: null };
    mockGet.mockResolvedValueOnce({
      data: { status: true, data: mockData },
    });
    const result = await getFinchStatus();
    expect(result).toEqual(mockData);
  });

  it("getFinchStatus throws when status false", async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: false },
    });
    await expect(getFinchStatus()).rejects.toThrow("Failed to fetch Finch status");
  });
});

// -------------------------------------------------------------------
// userApi
// -------------------------------------------------------------------
import { getUserById } from "@/services/api/userApi";

describe("userApi - getUserById", () => {
  it("returns user data on success", async () => {
    const mockUser = { id: "u1", firstName: "Alice", lastName: "Smith", businessEmail: "a@b.com", emailVerify: true };
    mockGet.mockResolvedValueOnce({ data: { data: { user: mockUser } } });
    const result = await getUserById("u1", "test-token");
    expect(result).toEqual(mockUser);
    expect(mockGet).toHaveBeenCalledWith("/users/u1", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
    }));
  });

  it("throws error on API failure", async () => {
    mockGet.mockRejectedValueOnce(new Error("Not found"));
    await expect(getUserById("u1", "token")).rejects.toThrow("Failed to fetch user data");
  });
});

// -------------------------------------------------------------------
// industryApi
// -------------------------------------------------------------------
import { getIndustry } from "@/services/api/industryApi";

describe("industryApi - getIndustry", () => {
  it("returns industry.industry on success", async () => {
    const mockIndustry = { code: "c1", name: "Tech" };
    mockGet.mockResolvedValueOnce({ status: 200, data: { industry: mockIndustry } });
    const result = await getIndustry();
    expect(result).toEqual(mockIndustry);
  });

  it("throws when no token", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    await expect(getIndustry()).rejects.toThrow("Authentication required");
  });

  it("wraps API errors", async () => {
    mockGet.mockRejectedValueOnce(new Error("API failure"));
    await expect(getIndustry()).rejects.toThrow();
  });

  it("throws Failed to fetch industry data when response.status is falsy", async () => {
    mockGet.mockResolvedValueOnce({ status: 0, data: {} });
    await expect(getIndustry()).rejects.toThrow("Failed to fetch industry data");
  });
});
