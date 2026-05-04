import { useCallback, useRef, useState } from "react";
import { useFinchConnect as useFinchSDK } from "@tryfinch/react-connect";
import { useNavigate } from "react-router-dom";
import { getFinchSessionId, exchangeFinchCode } from "@/services/api/finchApi";
import { getDashboardStatus } from "@/services/api/dashboardApi";

type FinchConnectStatus = "idle" | "fetching-session" | "connecting" | "exchanging-code";

export interface UseFinchConnectReturn {
  connectWithFinch: () => Promise<void>;
  reconnectWithFinch: () => Promise<void>;
  isLoading: boolean;
  isPageLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useFinchConnect(): UseFinchConnectReturn {
  const navigate = useNavigate();
  const [status, setStatus] = useState<FinchConnectStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const isLoading = status !== "idle";
  const isPageLoading = status === "fetching-session" || status === "exchanging-code";
  const isReconnectRef = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  const onSuccess = useCallback(
    async ({ code }: { code: string; state?: string }) => {
      if (!code) {
        setError("Failed to complete Finch connection. Please try again.");
        setStatus("idle");
        return;
      }

      setStatus("exchanging-code");
      try {
        await exchangeFinchCode(code);
        await getDashboardStatus();
        if (!isReconnectRef.current) {
          navigate("/additional-questions");
        }
        // In case of reconnect flow, we want to reset the status to idle to allow users to connect again if they want to
        isReconnectRef.current = false;
        setStatus("idle");
      } catch (e) {
        isReconnectRef.current = false;
        const msg = e instanceof Error ? e.message : undefined;
        setError(msg || "Failed to complete Finch connection. Please try again.");
        setStatus("idle");
      }
    },
    [navigate]
  );

  const onError = useCallback(({ errorMessage }: { errorMessage: string }) => {
    setError(errorMessage || "Failed to complete Finch connection. Please try again.");
    setStatus("idle");
  }, []);

  const onClose = useCallback(() => {
    setStatus("idle");
  }, []);

  const { open } = useFinchSDK({ onSuccess, onError, onClose });

  const connectWithFinch = useCallback(async () => {
    if (isLoading) return;
    setError(null);
    setStatus("fetching-session");
    try {
      const { sessionId } = await getFinchSessionId();
      setStatus("connecting");
      open({ sessionId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : undefined;
      setError(msg || "Failed to start Finch Connect. Please try again.");
      setStatus("idle");
    }
  }, [isLoading, open]);

  const reconnectWithFinch = useCallback(async () => {
    isReconnectRef.current = true;
    return connectWithFinch();
  }, [connectWithFinch]);

  return { connectWithFinch, reconnectWithFinch, isLoading, isPageLoading, error, clearError };
}
