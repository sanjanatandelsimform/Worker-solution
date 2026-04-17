import type { RootState } from "@/store/store";
import type { FinchConnection, FinchSyncJob } from "@/types/finchStatusTypes";

export const selectFinchConnection = (state: RootState): FinchConnection | null =>
  state.finchStatus.connection;

export const selectFinchLatestSyncJob = (state: RootState): FinchSyncJob | null =>
  state.finchStatus.latestSyncJob;

export const selectFinchStatusLoading = (state: RootState): boolean => state.finchStatus.loading;

export const selectFinchStatusError = (state: RootState): string | null => state.finchStatus.error;

export const selectFinchIndustryStatus = (state: RootState): "fetch" | null =>
  state.finchStatus.connection?.industry ?? null;
