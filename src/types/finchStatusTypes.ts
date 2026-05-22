// ── Status union types ─────────────────────────────────────────────────────

export type FinchConnectionStatus = "connected" | "reauth_required" | "disconnected";

export type FinchSyncJobStatus = "pending" | "processing" | "completed" | "failed";

// ── Domain entities ────────────────────────────────────────────────────────

export interface FinchConnection {
  id: string;
  status: FinchConnectionStatus;
  providerId: string;
  lastSyncedAt: string | null;
  createdAt: string;
  industry: "fetch" | null;
}

export interface FinchSyncJob {
  id: string;
  status: FinchSyncJobStatus;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// ── API envelope ───────────────────────────────────────────────────────────

export interface FinchStatusApiResponse {
  status: boolean;
  data: {
    connection: FinchConnection | null;
    latestSyncJob: FinchSyncJob | null;
  };
}

export interface FinchStatusData {
  connection: FinchConnection | null;
  latestSyncJob: FinchSyncJob | null;
}

// ── Redux slice state ──────────────────────────────────────────────────────

export interface FinchStatusState {
  connection: FinchConnection | null;
  latestSyncJob: FinchSyncJob | null;
  loading: boolean;
  error: string | null;
}
