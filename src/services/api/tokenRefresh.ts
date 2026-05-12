/**
 * Shared token-refresh lock.
 *
 * Both authApi and assessmentApi create their own Axios instances, each with a
 * 401 response interceptor.  Without a shared lock, parallel requests that all
 * receive 401 can each trigger an independent /auth/refresh-token call.
 *
 * This module exports a single isRefreshing flag and failedQueue that both
 * interceptors read/write, ensuring only one refresh call is ever in-flight
 * at a time and that any queued requests are retried with the single new token.
 */

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://dev-api.benestats.com/api/v1";
const API_TIMEOUT = 10_000;

// ── Shared refresh state ─────────────────────────────────────────────────────

/** True while a /auth/refresh-token request is in-flight. */
export let isRefreshing = false;

/**
 * Flipped to `true` the first time a token refresh fails.
 * Once set, every subsequent 401 interceptor skips the refresh attempt entirely
 * and redirects to `/sign-in` immediately, preventing retry loops.
 * Reset automatically on full-page navigation (sign-in is a hard redirect).
 */
export let refreshFailed = false;

/** Requests that arrived during a refresh — resolved/rejected when refresh ends. */
export let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/** Update the shared isRefreshing flag. */
export const setIsRefreshing = (val: boolean): void => {
  isRefreshing = val;
};

/** Mark that a refresh attempt has permanently failed in this session. */
export const setRefreshFailed = (val: boolean): void => {
  refreshFailed = val;
};

/** Read the current refreshFailed state (function so it works through mocked modules). */
export const isRefreshFailed = (): boolean => refreshFailed;

/**
 * Drain the failed-request queue.
 * Pass error=null and a token string on success; pass an Error on failure.
 */
export const processQueue = (error: Error | null, token: string | null = null): void => {
  const items = failedQueue.slice();
  failedQueue = [];
  items.forEach(p => (error ? p.reject(error) : p.resolve(token!)));
};

// ── Session helpers ──────────────────────────────────────────────────────────

/**
 * Dispatch logout to Redux and redirect to /sign-in.
 * The caller is responsible for clearing localStorage before calling this.
 * Safe to call when window.store may not exist (e.g. in tests).
 *
 * Uses `window.location.replace` for immediate, non-cancellable navigation
 * and returns a never-resolving promise so that callers awaiting the interceptor
 * do not continue executing (showing toasts, etc.) after the redirect.
 */
export const dispatchLogoutAndRedirect = (): Promise<never> => {
  if (typeof window !== "undefined") {
    if ((window as { store?: { dispatch: (a: unknown) => void } }).store) {
      import("@/store/slices/authSlice")
        .then(({ logout: logoutAction }) => {
          (window as { store: { dispatch: (a: unknown) => void } }).store.dispatch(logoutAction());
        })
        .catch(() => {});
    }
    window.location.replace("/sign-in");
  }
  // Return a promise that never resolves — the page is navigating away,
  // so we don't want any downstream .catch() handlers to fire.
  return new Promise<never>(() => {});
};

// ── HTTP refresh call ────────────────────────────────────────────────────────

/**
 * Call POST /auth/refresh-token using a plain Axios instance that has NO
 * response interceptors.  This prevents the refresh call from re-entering
 * either interceptor and potentially causing a deadlock or a second refresh.
 *
 * The plain client is created fresh inside this function (lazily) so that
 * test mocks of axios.create capture it at call-time, not at module-load time.
 *
 * @returns The new { accessToken, refreshToken } pair.
 * @throws  When the server returns an invalid or missing token payload.
 */
export const doRefreshToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Create a bare client — intentionally no interceptors attached.
  const plainClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: { "Content-Type": "application/json" },
  });

  const resp = await plainClient.post<{
    status: boolean;
    message: string;
    data: {
      tokens: { accessToken: string; refreshToken: string };
    };
  }>("/auth/refresh-token", { refreshToken });

  const tokens = resp.data?.data?.tokens;

  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new Error("Invalid refresh token response: tokens missing");
  }

  return tokens;
};
