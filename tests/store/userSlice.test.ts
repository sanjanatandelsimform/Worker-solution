import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import userReducer, { fetchUserById } from "@/store/slices/userSlice";

vi.mock("@/services/api/userApi", () => ({
  getUserById: vi.fn(),
}));

import { getUserById } from "@/services/api/userApi";

const createStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
      auth: (
        state = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          authInitAttempted: true,
          tokens: { accessToken: "", refreshToken: "" },
        },
        action: any
      ) => {
        if (action.type === "auth/updateUser") {
          return { ...state, user: { ...state.user, ...action.payload } };
        }
        return state;
      },
    },
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
});

describe("userSlice", () => {
  it("has correct initial state", () => {
    const store = createStore();
    expect(store.getState().user).toEqual({ data: null, loading: false, error: null });
  });

  it("sets loading on fetchUserById.pending", () => {
    const store = createStore();
    store.dispatch({ type: fetchUserById.pending.type });
    expect(store.getState().user.loading).toBe(true);
    expect(store.getState().user.error).toBeNull();
  });

  it("sets data on fetchUserById.fulfilled", () => {
    const store = createStore();
    const user = { id: "1", firstName: "Jane", lastName: "Doe", emailVerify: true };
    store.dispatch({ type: fetchUserById.fulfilled.type, payload: user });
    expect(store.getState().user.data).toEqual(user);
    expect(store.getState().user.loading).toBe(false);
  });

  it("sets error on fetchUserById.rejected", () => {
    const store = createStore();
    store.dispatch({ type: fetchUserById.rejected.type, payload: "Failed" });
    expect(store.getState().user.error).toBe("Failed");
    expect(store.getState().user.loading).toBe(false);
  });

  it("sets default error message on rejected without payload", () => {
    const store = createStore();
    store.dispatch({ type: fetchUserById.rejected.type });
    expect(store.getState().user.error).toBe("Error fetching user data");
  });

  it("fetchUserById thunk dispatches fulfilled on success", async () => {
    const mockUser = {
      id: "1",
      firstName: "Jane",
      lastName: "Doe",
      businessEmail: "jane@test.com",
      emailVerify: true,
      updatedAt: "2024-01-01",
    };
    (getUserById as any).mockResolvedValue(mockUser);

    const store = createStore();
    await store.dispatch(fetchUserById({ userId: "1", token: "tok" }));
    expect(store.getState().user.data).toEqual(mockUser);
    expect(store.getState().user.loading).toBe(false);
  });

  it("fetchUserById thunk dispatches rejected on failure", async () => {
    (getUserById as any).mockRejectedValue(new Error("Network"));

    const store = createStore();
    await store.dispatch(fetchUserById({ userId: "1", token: "tok" }));
    expect(store.getState().user.error).toBe("Failed to fetch user data");
  });

  it("fetchUserById updates localStorage when userDetail exists", async () => {
    const existing = JSON.stringify({ auth: { user: { firstName: "Old" } } });
    (localStorage.getItem as any).mockReturnValue(existing);
    const mockUser = {
      id: "1",
      firstName: "Jane",
      lastName: "Doe",
      businessEmail: "jane@test.com",
      emailVerify: true,
      updatedAt: "2024-01-01",
    };
    (getUserById as any).mockResolvedValue(mockUser);

    const store = createStore();
    await store.dispatch(fetchUserById({ userId: "1", token: "tok" }));
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
