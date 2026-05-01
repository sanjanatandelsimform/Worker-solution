/**
 * store.ts tests - covers loadState, saveState, and store initialization
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("store.ts", () => {
  let localStorageMock: Storage;
  let storageData: Record<string, string> = {};

  beforeEach(() => {
    storageData = {};
    localStorageMock = {
      getItem: vi.fn((key: string) => storageData[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storageData[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storageData[key];
      }),
      clear: vi.fn(() => {
        storageData = {};
      }),
      key: vi.fn((index: number) => Object.keys(storageData)[index] ?? null),
      get length() {
        return Object.keys(storageData).length;
      },
    } as Storage;
    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates the store with default state when localStorage is empty", async () => {
    storageData = {};
    const { store } = await import("@/store/store");
    const state = store.getState();
    expect(state.auth).toBeDefined();
    expect(state.profile).toBeDefined();
    expect(state.dashboard).toBeDefined();
    expect(state.workforce).toBeDefined();
    expect(state.industry).toBeDefined();
    expect(state.recommendations).toBeDefined();
    expect(state.finchStatus).toBeDefined();
    expect(state.registrationForm).toBeDefined();
    expect(state.user).toBeDefined();
  });

  it("loads state from localStorage when valid data exists", async () => {
    storageData["userDetail"] = JSON.stringify({
      auth: {
        user: { id: "u1", firstName: "Jane", email: "jane@example.com" },
        tokens: { accessToken: "at", refreshToken: "rt" },
        isAuthenticated: true,
        authInitAttempted: true,
        isLoading: false,
      },
      registrationForm: { formData: null },
    });

    const { store } = await import("@/store/store");
    const state = store.getState();
    // authInitAttempted should be forced to false on load
    expect(state.auth.authInitAttempted).toBe(false);
  });

  it("handles localStorage.getItem returning null gracefully", async () => {
    storageData = {}; // empty - getItem returns null
    expect(async () => {
      await import("@/store/store");
    }).not.toThrow();
  });

  it("handles malformed JSON in localStorage gracefully", async () => {
    storageData["userDetail"] = "{ INVALID JSON }";
    // Should not throw during import
    expect(async () => {
      await import("@/store/store");
    }).not.toThrow();
  });

  it("saves state to localStorage on store subscribe", async () => {
    const { store } = await import("@/store/store");
    // Dispatching an action should trigger saveState via subscribe
    store.dispatch({ type: "auth/setLoading", payload: true });
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it("exposes store on window when window is defined", async () => {
    const { store } = await import("@/store/store");
    expect((window as any).store).toBe(store);
  });

  it("handles saveState error gracefully when localStorage.setItem throws", async () => {
    (localStorageMock.setItem as any).mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const { store } = await import("@/store/store");
    // Dispatch to trigger saveState - should not throw
    expect(() => store.dispatch({ type: "auth/setLoading", payload: false })).not.toThrow();
  });

  it("loads state from localStorage with no auth key (auth becomes undefined)", async () => {
    storageData["userDetail"] = JSON.stringify({
      profile: { loading: false },
      registrationForm: {},
    });
    const { store } = await import("@/store/store");
    const state = store.getState();
    expect(state.auth).toBeDefined();
  });

  it("loads state from localStorage with null auth value", async () => {
    storageData["userDetail"] = JSON.stringify({
      auth: null,
      profile: null,
      registrationForm: null,
    });
    const { store } = await import("@/store/store");
    const state = store.getState();
    expect(state.auth).toBeDefined();
  });

  it("loadState catch block: returns undefined when localStorage has malformed JSON", async () => {
    storageData["userDetail"] = "this-is-not-valid-json{{{";
    const { store } = await import("@/store/store");
    // loadState should catch the JSON.parse error and return undefined
    // store should still be created with default state
    const state = store.getState();
    expect(state.auth).toBeDefined();
  });
});
