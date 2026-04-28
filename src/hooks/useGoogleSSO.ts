import { useCallback } from "react";

/**
 * Custom hook for Google SSO authentication
 * Generates OAuth URL and initiates sign-in flow
 */
export const useGoogleSSO = () => {
  /**
   * Generate a random state parameter for OAuth security
   */
  const generateState = (): string => {
    return Math.random().toString(36).substring(2, 15);
  };

  /**
   * Initiate Google sign-in by redirecting to Google OAuth URL
   */
  const initiateGoogleSignIn = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const state = generateState();

    // Store state in sessionStorage for verification
    sessionStorage.setItem("google_oauth_state", state);

    // Build Google OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: state,
      access_type: "offline",
      prompt: "select_account",
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Redirect to Google OAuth
    window.location.href = googleAuthUrl;
  }, []);

  return {
    initiateGoogleSignIn,
  };
};
