import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserById } from "@/services/api/userApi";
import { updateUser } from "./authSlice";
import type { UserState, User } from "@/types/userTypes";

const initialState: UserState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchUserById = createAsyncThunk<
  User,
  { userId: string; token: string },
  { rejectValue: string }
>("user/fetchUserById", async ({ userId, token }, { rejectWithValue, dispatch }) => {
  try {
    console.log("Fetching user by ID:", userId);
    const userData = await getUserById(userId, token);

    dispatch(
      updateUser({
        businessEmail: userData.businessEmail,
        firstName: userData.firstName,
        lastName: userData.lastName,
        emailVerify: userData.emailVerify,
      })
    );

    const userDetail = localStorage.getItem("userDetail");
    if (userDetail) {
      try {
        const parsedUserDetail = JSON.parse(userDetail);
        if (parsedUserDetail.auth?.user) {
          parsedUserDetail.auth.user.businessEmail = userData.businessEmail;
          parsedUserDetail.auth.user.firstName = userData.firstName;
          parsedUserDetail.auth.user.lastName = userData.lastName;
          parsedUserDetail.auth.user.emailVerify = userData.emailVerify;
          parsedUserDetail.auth.user.updatedAt = userData.updatedAt;
          localStorage.setItem("userDetail", JSON.stringify(parsedUserDetail));
        }
      } catch (error) {
        console.error("Failed to update localStorage:", error);
      }
    }

    return userData;
  } catch (_error) {
    return rejectWithValue("Failed to fetch user data");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUserById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching user data";
      });
  },
});

export default userSlice.reducer;
