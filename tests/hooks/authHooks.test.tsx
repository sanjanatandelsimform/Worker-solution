/**
 * Hook tests: useAuthInit, useGoogleSSO
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import profileReducer from "@/store/slices/profileSlice";
import registrationFormReducer from "@/store/slices/registrationFormSlice";
import userReducer from "@/store/slices/userSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import finchStatusReducer from "@/store/slices/finchStatusSlice";
import workforceReducer from "@/store/slices/workforceSlice";
import industryReducer from "@/store/slices/industrySlice";
import recommendationsReducer from "@/store/slices/recommendationsSlice";
import React from "react";

const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
      registrationForm: registrationFormReducer,
      user: userReducer,
      dashboard: dashboardReducer,
      finchStatus: finchStatusReducer,
      workforce: workforceReducer,
      industry: industryReducer,
      recommendations: recommendationsReducer,
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={createStore()}>{children}</Provider>
);

// ── useAuthInit ─────────────────────────────────────────────────────────
describe("useAuthInit", () => {
  it("returns isAuthReady boolean", async () => {
    const { useAuthInit } = await import("@/hooks/useAuthInit");
    const { result } = renderHook(() => useAuthInit(), { wrapper });
    expect(typeof result.current.isAuthReady).toBe("boolean");
  });
});

// ── useGoogleSSO ────────────────────────────────────────────────────────
describe("useGoogleSSO", () => {
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("sessionStorage", sessionStorageMock);
    vi.stubGlobal("location", {
      origin: "http://localhost:3000",
      href: "",
    });
    // Mock crypto.getRandomValues to be deterministic
    vi.stubGlobal("crypto", {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = i;
        return arr;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns initiateGoogleSignIn function", async () => {
    const { useGoogleSSO } = await import("@/hooks/useGoogleSSO");
    const { result } = renderHook(() => useGoogleSSO());
    expect(typeof result.current.initiateGoogleSignIn).toBe("function");
  });

  it("initiateGoogleSignIn stores state in sessionStorage and sets location.href", async () => {
    const { useGoogleSSO } = await import("@/hooks/useGoogleSSO");
    const { result } = renderHook(() => useGoogleSSO());

    result.current.initiateGoogleSignIn();

    // Verify sessionStorage.setItem was called with google_oauth_state
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      "google_oauth_state",
      expect.any(String)
    );
    // Verify location.href was set to a Google OAuth URL
    expect((window.location as any).href).toContain("accounts.google.com");
  });

  it("initiateGoogleSignIn generates valid hex state string", async () => {
    const { useGoogleSSO } = await import("@/hooks/useGoogleSSO");
    const { result } = renderHook(() => useGoogleSSO());

    result.current.initiateGoogleSignIn();

    const callArgs = sessionStorageMock.setItem.mock.calls[0];
    const state = callArgs[1];
    // State should be 32 hex chars (16 bytes * 2)
    expect(state).toMatch(/^[0-9a-f]+$/);
    expect(state.length).toBe(32);
  });

  it("initiateGoogleSignIn URL includes required OAuth params", async () => {
    const { useGoogleSSO } = await import("@/hooks/useGoogleSSO");
    const { result } = renderHook(() => useGoogleSSO());

    result.current.initiateGoogleSignIn();

    const href = (window.location as any).href as string;
    expect(href).toContain("response_type=code");
    expect(href).toContain("scope=");
    expect(href).toContain("redirect_uri=");
  });
});
