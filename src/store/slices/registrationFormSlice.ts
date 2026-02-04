import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface RegistrationFormData {
  firstName?: string;
  lastName?: string;
  legalBusinessName?: string;
  industry?: string;
  zipCode?: string;
  businessEmail?: string;
  businessPhone?: string;
  agreeToTerms?: boolean;
}

export interface RegistrationFormState {
  formData: RegistrationFormData;
}

const initialState: RegistrationFormState = {
  formData: {},
};

const registrationFormSlice = createSlice({
  name: "registrationForm",
  initialState,
  reducers: {
    saveFormData: (state, action: PayloadAction<Partial<RegistrationFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    clearFormData: state => {
      state.formData = {};
    },
  },
});

export const { saveFormData, clearFormData } = registrationFormSlice.actions;
export default registrationFormSlice.reducer;
