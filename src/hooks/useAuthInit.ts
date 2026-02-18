import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeAuth } from "@/store/slices/authSlice";
import { selectAuthInitAttempted } from "@/store/selectors/authSelectors";

/**
 * Initializes auth state on app load: loads tokens from localStorage,
 * validates via /auth/me, refreshes if expired, syncs user state.
 * Call once at app root (e.g. in App.tsx).
 */
export function useAuthInit(): { isAuthReady: boolean } {
  const dispatch = useAppDispatch();
  const authInitAttempted = useAppSelector(selectAuthInitAttempted);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return { isAuthReady: authInitAttempted };
}
