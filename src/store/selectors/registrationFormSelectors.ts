import type { RootState } from "@/store/store";
import type { RegistrationFormData } from "@/services/validation/authSchemas";

export const selectRegistrationFormData = (
  state: RootState
): Partial<RegistrationFormData> | null => state.registrationForm.formData;
