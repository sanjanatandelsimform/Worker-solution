export interface User {
  id: string;
  firstName: string;
  lastName: string;
  businessEmail: string;
  emailVerify: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  data: User | null;
  loading: boolean;
  error: string | null;
}
