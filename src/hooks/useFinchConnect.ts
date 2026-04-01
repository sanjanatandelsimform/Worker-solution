import { useCallback, useState } from "react";
import { useFinchConnect as useFinchSDK } from "@tryfinch/react-connect";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getFinchSessionId, exchangeFinchCode } from "@/services/api/finchApi";

type FinchConnectStatus = "idle" | "fetching-session" | "connecting" | "exchanging-code";

export interface UseFinchConnectReturn {
  connectWithFinch: () => Promise<void>;
  isLoading: boolean;
}

export function useFinchConnect(): UseFinchConnectReturn {
  const navigate = useNavigate();
  const [status, setStatus] = useState<FinchConnectStatus>("idle");
  const isLoading = status !== "idle";

  const onSuccess = useCallback(
    async ({ code }: { code: string; state?: string }) => {
      if (!code) {
        toast.error("Failed to complete Finch connection. Please try again.");
        setStatus("idle");
        return;
      }
      console.log(code, " authorization code received from Finch SDK");

      setStatus("exchanging-code");
      try {
        await exchangeFinchCode(code);
        navigate("/additional-questions");
      } catch (e) {
        const msg = e instanceof Error ? e.message : undefined;
        toast.error(msg || "Failed to complete Finch connection. Please try again.");
        setStatus("idle");
      }
    },
    [navigate]
  );

  const onError = useCallback(({ errorMessage }: { errorMessage: string }) => {
    toast.error(errorMessage || "Failed to complete Finch connection. Please try again.");
    setStatus("idle");
  }, []);

  const onClose = useCallback(() => {
    setStatus("idle");
  }, []);

  const { open } = useFinchSDK({ onSuccess, onError, onClose });

  const connectWithFinch = useCallback(async () => {
    if (isLoading) return;
    setStatus("fetching-session");
    try {
      const { sessionId } = await getFinchSessionId();
      setStatus("connecting");
      open({ sessionId });
    } catch (e) {
      console.log("Error in connectWithFinch:", e);
      const msg = e instanceof Error ? e.message : undefined;
      toast.error(msg || "Failed to start Finch Connect. Please try again.");
      setStatus("idle");
    }
  }, [isLoading, open]);

  return { connectWithFinch, isLoading };
}
