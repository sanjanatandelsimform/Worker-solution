import type { RootState } from "@/store/store";
import type { User } from "@/types/userTypes";

export const selectUser = (state: RootState): User | null => state.user.data;

export const selectUserLoading = (state: RootState): boolean => state.user.loading;

export const selectUserError = (state: RootState): string | null => state.user.error;

export const selectEmailVerifyStatus = (state: RootState): boolean =>
  state.user.data?.emailVerify || false;
