/**
 * Finch API Service
 *
 * Real API calls for Finch Connect flow.
 * See specs/005-finch-integration/contracts/ for full API contracts.
 * See specs/006-finch-status/contracts/ for the status poll contract.
 *
 * POST /api/v1/finch/connect-session → getFinchSessionId()
 * POST /api/v1/finch/callback        → exchangeFinchCode()
 * GET  /api/v1/finch/status          → getFinchStatus()
 */

import apiClient from "@/services/api/authApi";
import type { FinchStatusApiResponse, FinchStatusData } from "@/types/finchStatusTypes";

const SESSION_ERROR_MSG = "Failed to start Finch Connect. Please try again.";
const CALLBACK_ERROR_MSG = "Failed to complete Finch connection. Please try again.";

// ── Envelope types (raw HTTP response shapes) ──────────────────────────────

interface FinchSessionApiResponse {
  status: boolean;
  message?: string;
  data: {
    sessionId: string;
    connectUrl: string;
  };
}

interface FinchCallbackApiResponse {
  status: boolean;
  message: string;
  data: {
    connectionId: string;
    connectionStatus: string;
    providerId: string;
    syncJobId: string;
    syncJobStatus: string;
  };
}

// ── Hook-visible return types ──────────────────────────────────────────────

export interface FinchSessionResponse {
  sessionId: string;
  connectUrl: string;
}

export interface FinchConnectResponse {
  connectionId: string;
  connectionStatus: string;
  providerId: string;
  syncJobId: string;
  syncJobStatus: string;
}

// ── Service functions ──────────────────────────────────────────────────────

export const getFinchSessionId = async (): Promise<FinchSessionResponse> => {
  const response = await apiClient.post<FinchSessionApiResponse>("/finch/connect-session");
  if (!response.data.status || !response.data.data?.sessionId) {
    throw new Error(response.data.message || SESSION_ERROR_MSG);
  }
  return response.data.data;
};

export const exchangeFinchCode = async (code: string): Promise<FinchConnectResponse> => {
  const response = await apiClient.post<FinchCallbackApiResponse>("/finch/callback", { code });
  if (!response.data.status) {
    throw new Error(response.data.message || CALLBACK_ERROR_MSG);
  }
  return response.data.data;
};

// ── Finch Status ──────────────────────────────────────────────────────────

export const getFinchStatus = async (): Promise<FinchStatusData> => {
  const response = await apiClient.get<FinchStatusApiResponse>("/finch/status");
  if (!response.data.status) {
    throw new Error("Failed to fetch Finch status");
  }
  return response.data.data;
};
