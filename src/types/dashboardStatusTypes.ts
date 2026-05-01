export type StatusValue = "pending" | "completed" | "not_applicable";

export type ProviderType = "assisted" | "automated" | null;

export interface StatusSection {
  status: StatusValue;
  updatedAt: string | null;
}

export interface DashboardStatusResponse {
  recommendation: StatusSection;
  workforce: StatusSection;
  industry: StatusSection;
  allSettled: boolean;
  suggestPollMs: number;
  updatedAt: string;
  createdAt: string;
  source: string;
  providerType: ProviderType;
}

export interface UseDashboardStatusPollingOptions {
  enabled?: boolean;
}

export interface UseDashboardStatusPollingReturn {
  status: DashboardStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  isRecommendationTabReady: boolean;
  isWorkforceTabReady: boolean;
  isIndustryTabReady: boolean;
  hasExceededProcessingWindow: boolean;
}
