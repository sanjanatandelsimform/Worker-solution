import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  ProfileState,
  ProfileUpdatePayload,
  EmailUpdatePayload,
  PasswordChangePayload,
  ProfileApiResponse,
} from "@/types/profileTypes";
import * as profileService from "@/services/api/profileApi";
import { getAssessment } from "@/services/api/assessmentApi";
import { updateAssessmentCache } from "@/hooks/assessmentCache";
import { fetchUserById } from "./userSlice";

// Initial state - NO user data stored here
const initialState: ProfileState = {
  loading: false,
  error: null,
  passwordAttempts: 0,
  isAccountLocked: false,
  lockoutExpiry: null,
};

// Async thunks
export const updateProfileData = createAsyncThunk<
  ProfileApiResponse,
  ProfileUpdatePayload,
  { rejectValue: string }
>("profile/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    const user = await profileService.updateProfile(payload);
    return { success: true, data: { user } } as ProfileApiResponse;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to update profile");
  }
});

export const updateEmailAddress = createAsyncThunk<
  ProfileApiResponse, // Return the response
  EmailUpdatePayload,
  { rejectValue: string }
>("profile/updateEmail", async (payload, { rejectWithValue }) => {
  try {
    return await profileService.updateEmail(payload);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to update email");
  }
});

export const changePassword = createAsyncThunk<
  void,
  PasswordChangePayload,
  { rejectValue: { message: string; attemptsRemaining?: number; lockoutDuration?: number } }
>("profile/changePassword", async (payload, { rejectWithValue }) => {
  try {
    await profileService.updatePassword(payload);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "attemptsRemaining" in error) {
      return rejectWithValue(
        error as {
          message: string;
          attemptsRemaining?: number;
          lockoutDuration?: number;
        }
      );
    }
    return rejectWithValue({
      message: error instanceof Error ? error.message : "Failed to change password",
    });
  }
});

export const deleteUserAccount = createAsyncThunk<void, string, { rejectValue: string }>(
  "profile/deleteAccount",
  async (userId, { rejectWithValue }) => {
    try {
      await profileService.deleteAccount(userId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to delete account");
    }
  }
);

export const resendVerificationEmail = createAsyncThunk<void, void, { rejectValue: string }>(
  "profile/resendVerificationEmail",
  async (_, { rejectWithValue }) => {
    try {
      await profileService.resendEmailVerification();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to resend verification email"
      );
    }
  }
);

export const retakeAssessmentAction = createAsyncThunk<void, void, { rejectValue: string }>(
  "profile/retakeAssessment",
  async (_, { rejectWithValue }) => {
    try {
      // Step 1: Delete the existing assessment
      await profileService.retakeAssessment();
      
      // Step 2: Fetch fresh assessment data after deletion
      const assessmentResponse = await getAssessment();
      
      // Check if the GET request was successful
      if (!assessmentResponse.success) {
        return rejectWithValue(
          assessmentResponse.error || "Failed to fetch fresh assessment data"
        );
      }
      
      // Step 3: Update the assessment cache with fresh data so useAssessmentStatus hook picks it up
      if (assessmentResponse.data) {
        updateAssessmentCache(() => assessmentResponse.data ?? null);
      }
      
      // Successfully deleted and fetched fresh data
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to retake assessment"
      );
    }
  }
);

// Slice
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: state => {
      state.error = null;
    },
    resetPasswordAttempts: state => {
      state.passwordAttempts = 0;
      state.isAccountLocked = false;
      state.lockoutExpiry = null;
    },
    clearProfileData: state => {
      state.loading = false;
      state.error = null;
      state.passwordAttempts = 0;
      state.isAccountLocked = false;
      state.lockoutExpiry = null;
    },
  },
  extraReducers: builder => {
    // Update Profile
    builder
      .addCase(updateProfileData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileData.fulfilled, (state, _action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateProfileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update profile";
      });

    // Update Email
    builder
      .addCase(updateEmailAddress.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmailAddress.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateEmailAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update email";
      });

    // Change Password
    builder
      .addCase(changePassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, state => {
        state.loading = false;
        state.error = null;
        state.passwordAttempts = 0;
        state.isAccountLocked = false;
        state.lockoutExpiry = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to change password";

        if (action.payload?.attemptsRemaining !== undefined) {
          state.passwordAttempts = 5 - action.payload.attemptsRemaining;
        }

        if (action.payload?.lockoutDuration) {
          state.isAccountLocked = true;
          state.lockoutExpiry = Date.now() + action.payload.lockoutDuration * 1000;
        }
      });

    // Delete Account
    builder
      .addCase(deleteUserAccount.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAccount.fulfilled, state => {
        state.loading = false;
        state.error = null;
        state.passwordAttempts = 0;
        state.isAccountLocked = false;
        state.lockoutExpiry = null;
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete account";
      });

    // Resend Verification Email
    builder
      .addCase(resendVerificationEmail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to resend verification email";
      });

    // Retake Assessment
    builder
      .addCase(retakeAssessmentAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retakeAssessmentAction.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(retakeAssessmentAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to retake assessment";
      });

    // Sync emailVerify when user data is fetched
    builder.addCase(fetchUserById.fulfilled, () => {
      // No state updates needed - user data is in userSlice
    });
  },
});

export const { clearProfileError, resetPasswordAttempts, clearProfileData } = profileSlice.actions;

export default profileSlice.reducer;
