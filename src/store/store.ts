import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import registrationFormReducer from "./slices/registrationFormSlice";
import userReducer from "./slices/userSlice";
import dashboardReducer from "./slices/dashboardSlice";
import finchStatusReducer from "./slices/finchStatusSlice";
import type { AuthState } from "./slices/authSlice";
import type { ProfileState } from "@/types/profileTypes";
import type { UserState } from "@/types/userTypes";
import type { RegistrationFormState } from "./slices/registrationFormSlice";
import type { DashboardState } from "@/types/dashboardTypes";
import type { FinchStatusState } from "@/types/finchStatusTypes";

// Use consistent localStorage key
const STORAGE_KEY = "userDetail";

// Load persisted state
const loadState = ():
  | {
      auth: AuthState;
      profile?: ProfileState;
      registrationForm?: RegistrationFormState;
    }
  | undefined => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    const parsed = JSON.parse(serializedState);

    // Return only auth and registrationForm (no user slice). Force authInitAttempted false so init runs on load.
    const auth = parsed.auth ? { ...parsed.auth, authInitAttempted: false } : undefined;
    return {
      auth,
      profile: parsed.profile,
      registrationForm: parsed.registrationForm,
    };
  } catch (err) {
    console.error("Error loading state from localStorage:", err);
    return undefined;
  }
};

const persistedState = loadState();

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  registrationForm: registrationFormReducer,
  user: userReducer,
  dashboard: dashboardReducer,
  finchStatus: finchStatusReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "auth/setUser",
          "auth/setTokens",
          "auth/initializeAuth/fulfilled",
          "auth/syncUserState/fulfilled",
        ],
      },
    }),
});

// Save state to localStorage
const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify({
      auth: state.auth,
      // profile: state.profile,
      registrationForm: state.registrationForm, // NEW: persist form data
    });
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error("Error saving state to localStorage:", err);
  }
};

// Subscribe to store changes and save to localStorage
store.subscribe(() => {
  saveState(store.getState());
});

// Type exports
export type RootState = {
  auth: AuthState;
  profile: ProfileState;
  registrationForm: RegistrationFormState;
  user: UserState;
  dashboard: DashboardState;
  finchStatus: FinchStatusState;
};
export type AppDispatch = typeof store.dispatch;

// Extend Window interface for TypeScript
declare global {
  interface Window {
    store: typeof store;
  }
}

// Expose store globally for interceptor access
if (typeof window !== "undefined") {
  window.store = store;
}
