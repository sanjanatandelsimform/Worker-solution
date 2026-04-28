import { describe, it, expect, vi } from "vitest";

vi.mock("@/services/api/authApi", () => ({
  default: { get: vi.fn() },
}));

import apiClient from "@/services/api/authApi";
import { getUserById } from "@/services/api/userApi";

describe("userApi", () => {
  it("getUserById returns user on success", async () => {
    const user = { id: "1", firstName: "Jane" };
    (apiClient.get as any).mockResolvedValue({ data: { data: { user } } });
    const result = await getUserById("1", "token");
    expect(result).toEqual(user);
  });

  it("getUserById throws on failure", async () => {
    (apiClient.get as any).mockRejectedValue(new Error("Network"));
    await expect(getUserById("1", "token")).rejects.toThrow("Failed to fetch user data");
  });
});
