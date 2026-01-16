import { useState, useEffect, useCallback } from "react";
import type { UserAccount, AuthSession } from "../types/auth";
import * as authApi from "../services/api/authApi";

/**
 * Custom hook for managing authentication state
 * Fetches current user on mount and provides auth state management
 */
export const useAuth = () => {
  // Check if on auth page before initializing state
  const isAuthPage =
    window.location.pathname.startsWith("/register") ||
    window.location.pathname.startsWith("/sign-in") ||
    window.location.pathname.startsWith("/password-reset") ||
    window.location.pathname.startsWith("/email-verification");

  const [session, setSession] = useState<AuthSession>({
    user: null,
    isAuthenticated: false,
    isLoading: !isAuthPage, // Only show loading if not on auth page
  });

  // Fetch current user on mount
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isAuthPage =
      currentPath.startsWith("/register") ||
      currentPath.startsWith("/sign-in") ||
      currentPath.startsWith("/password-reset") ||
      currentPath.startsWith("/email-verification");

    // Skip fetching user on auth pages
    if (isAuthPage) {
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const user = await authApi.getCurrentUser();
        setSession({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      } catch (_error) {
        // Silently handle errors - user is just not authenticated
        // Don't log errors for expected 401/network failures
        setSession({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    fetchCurrentUser();
  }, []);

  // Set authenticated user
  const setUser = useCallback((user: UserAccount) => {
    setSession({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  // Clear user (logout)
  const clearUser = useCallback(() => {
    setSession({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // Sign out function
  const logout = useCallback(async () => {
    try {
      await authApi.signout();
      clearUser();
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear user anyway on client side
      clearUser();
    }
  }, [clearUser]);

  return {
    user: session.user,
    isAuthenticated: session.isAuthenticated,
    isLoading: session.isLoading,
    setUser,
    clearUser,
    logout,
  };
};
