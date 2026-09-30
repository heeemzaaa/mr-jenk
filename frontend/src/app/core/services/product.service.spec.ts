import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProductService } from './product.service';
import { Product } from '../../shared/models/product.model';
import { ProductPageResponse } from '../../shared/models/product-page-response';
import { environment } from '../../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches products from the correct endpoint and unwraps the ResponseData/data envelope', () => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'chair',
        description: 'chair to sit on',
        price: 122.21,
        quantity: 12,
        userId: 'u1',
        imageUrls: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    const mockPageResponse: ProductPageResponse = {
      items: mockProducts,
      currentPage: 0,
      pageSize: 20,
      totalElements: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };

    service.getAll().subscribe((response) => {
      expect(response).toEqual(mockPageResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'Products retrieved successfully',
      data: mockPageResponse,
    });
  });

  it('propagates an error when the request fails', () => {
    let errored = false;

    service.getAll().subscribe({
      error: () => {
        errored = true;
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(errored).toBe(true);
  });
});