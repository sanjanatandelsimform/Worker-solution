import { describe, it, expect, vi } from "vitest";

vi.mock("@/services/api/authApi", () => ({
  default: { get: vi.fn() },
}));
vi.mock("@/services/api/apiUtils", () => ({
  getAuthToken: vi.fn(() => "token"),
  getErrorMessage: vi.fn(() => "API error"),
}));

import apiClient from "@/services/api/authApi";
import { getAuthToken } from "@/services/api/apiUtils";
import { getRecommendations } from "@/services/api/recommendationsApi";

describe("recommendationsApi", () => {
  it("returns data on success", async () => {
    const data = { recommendations: [] };
    (apiClient.get as any).mockResolvedValue({ data });
    const result = await getRecommendations();
    expect(result).toEqual(data);
  });

  it("throws when no auth token", async () => {
    (getAuthToken as any).mockReturnValue(null);
    await expect(getRecommendations()).rejects.toThrow("Authentication required");
  });

  it("throws with error message on API failure", async () => {
    (getAuthToken as any).mockReturnValue("token");
    (apiClient.get as any).mockRejectedValue(new Error("Server down"));
    await expect(getRecommendations()).rejects.toThrow("API error");
  });
});
