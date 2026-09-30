import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, DeleteMediaRequest, MediaRequest, SaveMediaRequest } from '../models/media.model';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  // Create new media for a target that has none yet (e.g. a brand-new product).
  saveMedia(request: SaveMediaRequest, images: File[]): Observable<ApiResponse<string[]>> {
    const payload: MediaRequest = { ...request, oldImagePaths: null };
    const formData = new FormData();

    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    images.forEach((image) => formData.append('images', image));

    return this.http.post<ApiResponse<string[]>>(`${this.apiUrl}/media/images`, formData);
  }

  updateMedia(request: MediaRequest, images: File[]): Observable<ApiResponse<string[]>> {
    const formData = new FormData();

    formData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));

    images.forEach((image) => formData.append('images', image));

    return this.http.put<ApiResponse<string[]>>(`${this.apiUrl}/media/images`, formData);
  }

  deleteMedia(request: DeleteMediaRequest): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/media/images`, { body: request });
  }

  // Bulk lookup: every product's images, keyed by product id. Used to
  // populate `imageUrls` for a product list, since product-service itself
  // doesn't track them.
  getProductsMedias(): Observable<ApiResponse<Record<string, string[]>>> {
    return this.http.get<ApiResponse<Record<string, string[]>>>(`${this.apiUrl}/media/images`);
  }
}
