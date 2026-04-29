import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/services/api/apiUtils";
import { getDashboardStatus } from "@/services/api/dashboardApi";
import type {
  DashboardStatusResponse,
  UseDashboardStatusPollingOptions,
  UseDashboardStatusPollingReturn,
} from "@/types/dashboardStatusTypes";

const MIN_POLL_INTERVAL_MS = 1000;
const NON_429_RETRY_DELAYS_MS = [1000, 2000, 4000];

type ErrorWithStatus = { response?: { status?: number } };

const getStatusCode = (error: unknown): number | null => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    (error as ErrorWithStatus).response?.status
  ) {
    return (error as ErrorWithStatus).response?.status ?? null;
  }

  return null;
};

const normalizeDelay = (delayMs: number): number => {
  if (!Number.isFinite(delayMs)) return MIN_POLL_INTERVAL_MS;
  return Math.max(MIN_POLL_INTERVAL_MS, Math.floor(delayMs));
};

export const useDashboardStatusPolling = ({
  enabled = false,
}: UseDashboardStatusPollingOptions = {}): UseDashboardStatusPollingReturn => {
  // Always set isMountedRef to true on mount to avoid stale value after remount
  const isMountedRef = useRef(true);
  // Manage isMountedRef lifecycle separately to avoid referencing stop before declaration
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const [status, setStatus] = useState<DashboardStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPollingRef = useRef(false);
  const retryCountRef = useRef(0);
  const statusRef = useRef<DashboardStatusResponse | null>(null);
  const pollStatusRef = useRef<() => Promise<void>>(async () => {});

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setStatusState = useCallback((nextStatus: DashboardStatusResponse | null) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }, []);

  const schedulePoll = useCallback(
    (delayMs: number, runPoll: () => Promise<void>) => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        void runPoll();
      }, delayMs);
    },
    [clearTimer]
  );

  const stop = useCallback(() => {
    isPollingRef.current = false;
    clearTimer();

    if (isMountedRef.current) {
      setIsPolling(false);
      setIsLoading(false);
    }
  }, [clearTimer]);

  const pollStatus = useCallback(async () => {
    if (!isPollingRef.current) return;

    if (isMountedRef.current) {
      setIsLoading(true);
    }

    try {
      const response = await getDashboardStatus();

      if (!isPollingRef.current) return;

      retryCountRef.current = 0;

      if (isMountedRef.current) {
        setError(null);
        setStatusState(response);
      }

      if (response.allSettled) {
        stop();
        return;
      }

      const nextDelay = normalizeDelay(response.suggestPollMs);

      if (isMountedRef.current) {
        setIsPolling(true);
        setIsLoading(false);
      }

      schedulePoll(nextDelay, () => pollStatusRef.current());
    } catch (err) {
      if (!isPollingRef.current) return;

      const statusCode = getStatusCode(err);

      if (statusCode === 429) {
        const currentDelay = normalizeDelay(
          statusRef.current?.suggestPollMs ?? MIN_POLL_INTERVAL_MS
        );

        if (isMountedRef.current) {
          setIsPolling(true);
          setIsLoading(false);
        }

        schedulePoll(currentDelay, () => pollStatusRef.current());
        return;
      }

      const nextRetryIndex = retryCountRef.current;
      if (nextRetryIndex < NON_429_RETRY_DELAYS_MS.length) {
        const retryDelay = NON_429_RETRY_DELAYS_MS[nextRetryIndex];
        retryCountRef.current += 1;

        if (isMountedRef.current) {
          setIsPolling(true);
          setIsLoading(false);
        }

        schedulePoll(retryDelay, () => pollStatusRef.current());
        return;
      }

      const message = err instanceof Error ? err.message : getErrorMessage(err);

      if (isMountedRef.current) {
        setError(message);
      }

      stop();
    }
  }, [schedulePoll, setStatusState, stop]);

  useEffect(() => {
    pollStatusRef.current = pollStatus;
  }, [pollStatus]);

  const start = useCallback(() => {
    if (isPollingRef.current) return;

    isPollingRef.current = true;
    retryCountRef.current = 0;

    if (isMountedRef.current) {
      setError(null);
      setIsPolling(true);
    }

    void pollStatusRef.current();
  }, []);

  const reset = useCallback(() => {
    stop();
    retryCountRef.current = 0;
    if (isMountedRef.current) {
      setError(null);
      setStatusState(null);
    } else {
      statusRef.current = null;
    }
  }, [setStatusState, stop]);

  useEffect(() => {
    if (enabled) {
      if (isPollingRef.current) {
        return;
      }

      isPollingRef.current = true;
      retryCountRef.current = 0;
      queueMicrotask(() => {
        if (!isMountedRef.current || !isPollingRef.current) {
          return;
        }
        setError(null);
        setIsPolling(true);
        void pollStatusRef.current();
      });
      return;
    }

    isPollingRef.current = false;
    clearTimer();

    queueMicrotask(() => {
      if (!isMountedRef.current) return;
      setIsPolling(false);
      setIsLoading(false);
    });
  }, [enabled, clearTimer]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    status,
    isLoading,
    error,
    isPolling,
    start,
    stop,
    reset,
  };
};
