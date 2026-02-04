// Profile Selectors

import type { RootState } from "../store";

export const selectProfileLoading = (state: RootState) => state.profile?.loading || false;

export const selectProfileError = (state: RootState) => state.profile?.error;

export const selectPasswordAttempts = (state: RootState) => state.profile?.passwordAttempts || 0;

export const selectIsAccountLocked = (state: RootState) => state.profile?.isAccountLocked || false;

export const selectLockoutExpiry = (state: RootState) => state.profile?.lockoutExpiry;

export const selectProfileState = (state: RootState) => state.profile;
