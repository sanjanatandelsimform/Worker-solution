import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { AuthState } from "../slices/authSlice";

export const selectAuth = (state: RootState) => state.auth;

export const selectUser = createSelector([selectAuth], auth => auth.user);

export const selectIsAuthenticated = createSelector([selectAuth], auth => auth.isAuthenticated);

export const selectIsLoading = createSelector([selectAuth], auth => auth.isLoading);

export const selectAuthInitAttempted = createSelector(
  [selectAuth],
  (auth: AuthState) => auth.authInitAttempted ?? false
);

export const selectAccessToken = createSelector([selectAuth], auth => auth.tokens?.accessToken);

export const selectRefreshToken = createSelector([selectAuth], auth => auth.tokens?.refreshToken);

export const selectUserFullName = createSelector([selectUser], user =>
  user ? `${user.firstName} ${user.lastName}` : ""
);
