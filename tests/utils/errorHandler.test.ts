import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { getErrorState, getSuccessState, getInfoState, ErrorState } from "@/utils/errorHandler";

vi.mock("axios");

describe("errorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getErrorState", () => {
    describe("Axios errors", () => {
      it("should handle server error (500)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 500,
            data: { message: "Internal Server Error" },
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result).toEqual({
          message: "Internal Server Error",
          type: "danger",
        });
      });

      it("should handle server error without custom message (500)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 500,
            data: {},
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result.type).toBe("danger");
        expect(result.message).toBe("Server error. Please try again later.");
      });

      it("should handle not found error (404)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 404,
            data: { message: "User not found" },
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result).toEqual({
          message: "User not found",
          type: "warning",
        });
      });

      it("should handle not found error without message (404)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 404,
            data: {},
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
        expect(result.message).toBe("Resource not found.");
      });

      it("should handle unauthorized error (401)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 401,
            data: { message: "Token expired" },
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result).toEqual({
          message: "Token expired",
          type: "warning",
        });
      });

      it("should handle unauthorized error without message (401)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 401,
            data: {},
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
        expect(result.message).toBe("Unauthorized access.");
      });

      it("should handle forbidden error (403)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 403,
            data: { message: "Access denied" },
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
      });

      it("should handle bad request error (400)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 400,
            data: { message: "Email is required" },
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result).toEqual({
          message: "Email is required",
          type: "warning",
        });
      });

      it("should handle bad request error without message (400)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 400,
            data: {},
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
        expect(result.message).toBe("Invalid request. Please check your input.");
      });

      it("should handle rate limit error (429)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 429,
            data: { message: "Too many login attempts" },
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result).toEqual({
          message: "Too many login attempts",
          type: "info",
        });
      });

      it("should handle rate limit error without message (429)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 429,
            data: {},
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result.type).toBe("info");
        expect(result.message).toBe("Too many requests. Please try again later.");
      });

      it("should handle other client error (400-499 but not listed)", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 418,
            data: { message: "I'm a teapot" },
          },
          message: "Error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
        expect(result.message).toBe("I'm a teapot");
      });

      it("should handle connection aborted error", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 500,
            data: {},
          },
          message: "Error",
          code: "ECONNABORTED",
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result.type).toBe("info");
        expect(result.message).toBe(
          "Network error. Please check your connection and try again."
        );
      });

      it("should handle network error", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 500,
            data: {},
          },
          message: "Error",
          code: "ERR_NETWORK",
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result.type).toBe("info");
        expect(result.message).toBe(
          "Network error. Please check your connection and try again."
        );
      });

      it("should handle timeout error", () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 500,
            data: {},
          },
          message: "Error",
          code: "ETIMEDOUT",
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result.type).toBe("info");
        expect(result.message).toBe("Request timed out. Please try again.");
      });

      it("should handle axios error without response", () => {
        const error = {
          isAxiosError: true,
          response: undefined,
          message: "Network error",
          code: undefined,
        };

        (axios.isAxiosError as any).mockReturnValue(true);

        const result = getErrorState(error);

        expect(result.message).toBe("Network error");
        expect(result.type).toBe("danger");
      });
    });

    describe("JavaScript Error objects", () => {
      it("should handle Error with 'not found' message", () => {
        const error = new Error("Resource not found");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result).toEqual({
          message: "Resource not found",
          type: "warning",
        });
      });

      it("should handle Error with 'does not exist' message", () => {
        const error = new Error("User does not exist");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
      });

      it("should handle Error with \"doesn't exist\" message", () => {
        const error = new Error("Item doesn't exist");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
      });

      it("should handle Error with network message", () => {
        const error = new Error("Network timeout");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("info");
      });

      it("should handle Error with connection message", () => {
        const error = new Error("Connection failed");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("info");
      });

      it("should handle Error with invalid message", () => {
        const error = new Error("Invalid email format");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
      });

      it("should handle Error with required message", () => {
        const error = new Error("Name is required");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
      });

      it("should handle Error with 'must be' message", () => {
        const error = new Error("Password must be at least 8 characters");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
      });

      it("should handle Error with unauthorized message", () => {
        const error = new Error("Unauthorized access");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
      });

      it("should handle Error with forbidden message", () => {
        const error = new Error("Forbidden");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
      });

      it("should handle Error with 'access denied' message", () => {
        const error = new Error("Access denied");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("warning");
      });

      it("should handle Error with server error message", () => {
        const error = new Error("Server error occurred");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("danger");
      });

      it("should handle Error with internal error message", () => {
        const error = new Error("Internal error");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.type).toBe("danger");
      });

      it("should handle generic Error message", () => {
        const error = new Error("Something went wrong");

        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(error);

        expect(result.message).toBe("Something went wrong");
        expect(result.type).toBe("danger");
      });
    });

    describe("Unknown error types", () => {
      it("should handle null error", () => {
        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(null);

        expect(result.type).toBe("danger");
        expect(result.message).toBe("An unexpected error occurred. Please try again.");
      });

      it("should handle undefined error", () => {
        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState(undefined);

        expect(result.type).toBe("danger");
        expect(result.message).toBe("An unexpected error occurred. Please try again.");
      });

      it("should handle string error", () => {
        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState("An error occurred");

        expect(result.type).toBe("danger");
        expect(result.message).toBe("An unexpected error occurred. Please try again.");
      });

      it("should handle object without message property", () => {
        (axios.isAxiosError as any).mockReturnValue(false);

        const result = getErrorState({ error: "something" });

        expect(result.type).toBe("danger");
        expect(result.message).toBe("An unexpected error occurred. Please try again.");
      });
    });
  });

  describe("getSuccessState", () => {
    it("should create success state with custom message", () => {
      const result = getSuccessState("Profile updated successfully");

      expect(result).toEqual({
        message: "Profile updated successfully",
        type: "success",
      });
    });

    it("should create success state with empty message", () => {
      const result = getSuccessState("");

      expect(result).toEqual({
        message: "",
        type: "success",
      });
    });

    it("should create success state with long message", () => {
      const longMessage =
        "Your account has been successfully created and you can now log in with your credentials";

      const result = getSuccessState(longMessage);

      expect(result).toEqual({
        message: longMessage,
        type: "success",
      });
    });
  });

  describe("getInfoState", () => {
    it("should create info state with custom message", () => {
      const result = getInfoState("Processing your request");

      expect(result).toEqual({
        message: "Processing your request",
        type: "info",
      });
    });

    it("should create info state with empty message", () => {
      const result = getInfoState("");

      expect(result).toEqual({
        message: "",
        type: "info",
      });
    });

    it("should create info state with long message", () => {
      const longMessage =
        "Your request is being processed. This may take a few moments.";

      const result = getInfoState(longMessage);

      expect(result).toEqual({
        message: longMessage,
        type: "info",
      });
    });
  });

  describe("ErrorState type coverage", () => {
    it("should return ErrorState with all valid types", () => {
      const types: Array<"success" | "warning" | "danger" | "info" | "neutral"> = [
        "success",
        "warning",
        "danger",
        "info",
        "neutral",
      ];

      types.forEach((type) => {
        const state: ErrorState = {
          message: "Test",
          type,
        };

        expect(state.type).toBe(type);
      });
    });
  });
});
