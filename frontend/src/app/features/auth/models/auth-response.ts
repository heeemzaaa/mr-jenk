export interface AuthResponse<T> {

  success: boolean;

  message: string;

  data: T;

}