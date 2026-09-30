export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}