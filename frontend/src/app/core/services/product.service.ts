import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { CreateProductRequest } from '../../shared/models/create-product-request';
import { Product } from '../../shared/models/product.model';
import { ProductPageResponse } from '../../shared/models/product-page-response';
import { ResponseData } from '../../shared/models/response-data';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  getAll(owner?: string, page?: number, limit?: number) {
    let params = new HttpParams();
    if (owner) {
      params = params.set('owner', owner);
    }
    if (page !== undefined) {
      params = params.set('page', page.toString());
    }
    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    return this.http
      .get<ResponseData<ProductPageResponse>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string) {
    return this.http
      .get<ResponseData<Product>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(request: CreateProductRequest) {
    return this.http
      .post<ResponseData<Product>>(this.apiUrl, request)
      .pipe(map((response) => response.data));
  }

  update(id: string, request: CreateProductRequest) {
    return this.http
      .put<ResponseData<Product>>(`${this.apiUrl}/${id}`, request)
      .pipe(map((response) => response.data));
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}