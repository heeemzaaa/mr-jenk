import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse, ProfileResponse, UpdateProfileRequest } from '../models/profile.model';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  // Get the currently authenticated user's profile.
  getProfile(): Observable<ApiResponse<ProfileResponse>> {
    return this.http.get<ApiResponse<ProfileResponse>>(`${this.apiUrl}/MyProfile`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Update the currently authenticated user's profile.
  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<ProfileResponse>> {
    return this.http.put<ApiResponse<ProfileResponse>>(`${this.apiUrl}/MyProfile`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  // Add JWT Authorization header.
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
}
