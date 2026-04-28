/**
 * Hook tests: useAuthInit, useGoogleSSO
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
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
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it("returns initiateGoogleSignIn function", async () => {
    const { useGoogleSSO } = await import("@/hooks/useGoogleSSO");
    const { result } = renderHook(() => useGoogleSSO());
    expect(typeof result.current.initiateGoogleSignIn).toBe("function");
  });
});
