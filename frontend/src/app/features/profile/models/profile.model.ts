export type ProfileRole = 'CLIENT' | 'SELLER';

export interface ProfileResponse {
  name: string;
  email: string;
  role: ProfileRole;
  avatar: string | null;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  avatar: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}