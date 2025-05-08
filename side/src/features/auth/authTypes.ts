export interface AuthState {
  token: string | null;
  email: string | null;
  username: string | null;
  id: number | null;
  loading: boolean;
  error: string | null;
}
