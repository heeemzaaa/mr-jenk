export interface ResponseData<T> {
  success: boolean;
  message: string;
  data: T;
}