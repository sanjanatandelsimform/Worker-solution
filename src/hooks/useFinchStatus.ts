import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFinchStatus } from "@/store/slices/finchStatusSlice";
import {
  selectFinchConnection,
  selectFinchLatestSyncJob,
  selectFinchStatusLoading,
  selectFinchStatusError,
} from "@/store/selectors/finchStatusSelectors";
import type { FinchConnectionStatus, FinchSyncJobStatus } from "@/types/finchStatusTypes";

const POLL_INTERVAL_MS = 15_000;

export interface UseFinchStatusReturn {
  connectionStatus: FinchConnectionStatus | null;
  syncJobStatus: FinchSyncJobStatus | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useFinchStatus(): UseFinchStatusReturn {
  const dispatch = useAppDispatch();
  const connection = useAppSelector(selectFinchConnection);
  const latestSyncJob = useAppSelector(selectFinchLatestSyncJob);
  const isLoading = useAppSelector(selectFinchStatusLoading);
  const error = useAppSelector(selectFinchStatusError);

  useEffect(() => {
    dispatch(fetchFinchStatus());
    const intervalId = setInterval(() => {
      dispatch(fetchFinchStatus());
    }, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  return {
    connectionStatus: connection?.status ?? null,
    syncJobStatus: latestSyncJob?.status ?? null,
    isConnected: connection?.status === "connected",
    isLoading,
    error,
  };
}
