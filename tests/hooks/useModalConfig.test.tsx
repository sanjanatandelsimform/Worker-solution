import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { useModalConfig } from "../../src/hooks/useModalConfig";

// Mock icons/assets
vi.mock("@untitledui/icons", () => ({
  CheckCircle: ({ className }: any) => <span className={className} />,
  AlertOctagon: ({ className }: any) => <span className={className} />,
}));
vi.mock("@/assets/icons/TrashIcon", () => ({
  TrashIcon: ({ className }: any) => <span className={className} />,
}));
vi.mock("@/assets/icons/LoadingProgress", () => ({
  LandingProgress: () => <span />,
}));
vi.mock("@/assets/alert-icon.svg", () => ({ default: "alert-icon.svg" }));

describe("useModalConfig", () => {
  const baseConfig = {
    isOpen: true,
    onClose: vi.fn(),
  };

  it("returns updateComplete config", () => {
    const { result } = renderHook(() => useModalConfig("updateComplete", baseConfig));
    expect(result.current.title).toBe("Update Complete");
    expect(result.current.backgroundPattern).toBe("success");
    expect(result.current.buttons).toHaveLength(1);
    expect(result.current.buttons[0].text).toBe("Back to settings");
  });

  it("returns updateInfoSuccess config", () => {
    const { result } = renderHook(() => useModalConfig("updateInfoSuccess", baseConfig));
    expect(result.current.title).toBe("Your information has been updated.");
    expect(result.current.backgroundPattern).toBe("success");
  });

  it("returns emailUpdated config", () => {
    const { result } = renderHook(() => useModalConfig("emailUpdated", baseConfig));
    expect(result.current.title).toBe("Your information has been updated");
    expect(result.current.backgroundPattern).toBe("success");
  });

  it("returns emailUpdateSuccess config", () => {
    const { result } = renderHook(() => useModalConfig("emailUpdateSuccess", baseConfig));
    expect(result.current.title).toBe("Your email has been updated");
    expect(result.current.buttons).toHaveLength(0);
  });

  it("returns retakeAssessment config", () => {
    const { result } = renderHook(() => useModalConfig("retakeAssessment", baseConfig));
    expect(result.current.title).toBe("Are you sure?");
    expect(result.current.backgroundPattern).toBe("unsuccess");
    expect(result.current.buttons).toHaveLength(2);
    expect(result.current.buttons[1].text).toBe("Yes, retake assessment");
  });

  it("returns retakeAssessment with loading state", () => {
    const { result } = renderHook(() =>
      useModalConfig("retakeAssessment", {
        ...baseConfig,
        additionalData: { loading: true },
      })
    );
    expect(result.current.buttons[0].isDisabled).toBe(true);
    expect(result.current.buttons[1].text).toBe("Retaking...");
  });

  it("returns accountDelete config", () => {
    const { result } = renderHook(() => useModalConfig("accountDelete", baseConfig));
    expect(result.current.title).toBe("Confirm account deletion");
    expect(result.current.backgroundPattern).toBe("unsuccess");
    expect(result.current.buttons[1].text).toBe("Yes, delete my account");
  });

  it("returns resendSuccess config with email", () => {
    const { result } = renderHook(() =>
      useModalConfig("resendSuccess", {
        ...baseConfig,
        additionalData: { email: "test@example.com" },
      })
    );
    expect(result.current.title).toBe("Email sent");
    expect(result.current.subtitle).toContain("test@example.com");
  });

  it("returns cooldown config with countdown", () => {
    const { result } = renderHook(() =>
      useModalConfig("cooldown", {
        ...baseConfig,
        additionalData: { cooldown: 30 },
      })
    );
    expect(result.current.title).toBe("Please wait");
    expect(result.current.subtitle).toContain("30");
  });

  it("returns logoutConfirmation config", () => {
    const { result } = renderHook(() => useModalConfig("logoutConfirmation", baseConfig));
    expect(result.current.title).toBe("Are you sure you want to log out?");
    expect(result.current.buttons[1].text).toBe("Yes");
  });

  it("returns logoutConfirmation with disabled button", () => {
    const { result } = renderHook(() =>
      useModalConfig("logoutConfirmation", {
        ...baseConfig,
        additionalData: { isDisabled: true },
      })
    );
    expect(result.current.buttons[1].isDisabled).toBe(true);
  });

  it("returns goalsComplete config", () => {
    const { result } = renderHook(() => useModalConfig("goalsComplete", baseConfig));
    expect(result.current.title).toBe("You're done!");
  });

  it("returns goalsEmptyWarning config", () => {
    const { result } = renderHook(() => useModalConfig("goalsEmptyWarning", baseConfig));
    expect(result.current.title).toBeTruthy();
  });

  it("returns goalsApiError config", () => {
    const { result } = renderHook(() => useModalConfig("goalsApiError", baseConfig));
    expect(result.current.title).toMatch(/error|failed|something/i);
  });

  it("returns emailVerified config", () => {
    const { result } = renderHook(() => useModalConfig("emailVerified", baseConfig));
    expect(result.current.title).toBeTruthy();
  });

  it("returns updateDeclarationTerms config", () => {
    const { result } = renderHook(() => useModalConfig("updateDeclarationTerms", baseConfig));
    expect(result.current.title).toBeTruthy();
  });

  it("returns updateDeclarationPrivacy config", () => {
    const { result } = renderHook(() => useModalConfig("updateDeclarationPrivacy", baseConfig));
    expect(result.current.title).toBeTruthy();
  });

  it("returns loadingProgressModal config", () => {
    const { result } = renderHook(() => useModalConfig("loadingProgressModal", baseConfig));
    expect(result.current.title).toBeTruthy();
  });

  it("uses onConfirm when onClose is not provided for secondary action", () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() =>
      useModalConfig("emailUpdated", { isOpen: true, onClose: vi.fn(), onConfirm })
    );
    // The button's onClick uses onConfirm || onClose
    result.current.buttons[0].onClick();
    expect(onConfirm).toHaveBeenCalled();
  });
});
