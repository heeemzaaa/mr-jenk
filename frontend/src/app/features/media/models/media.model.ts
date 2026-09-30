export type TargetType = 'PRODUCT' | 'PROFILE';

export interface MediaRequest {
  targetType: TargetType;
  targetId: string;
  oldImagePaths: string[] | null;
}

export interface DeleteMediaRequest {
  targetType: TargetType;
  targetId: string;
  imagePaths: string[];
}

// Creating media has nothing to replace yet, so there's no oldImagePaths to send.
export type SaveMediaRequest = Omit<MediaRequest, 'oldImagePaths'>;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
