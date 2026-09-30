import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { ProductDetail } from './product-detail';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models/product.model';

const mockProduct: Product = {
  id: '1',
  name: 'chair',
  description: 'A sturdy wooden chair.',
  price: 21,
  quantity: 20,
  userId: 'u1',
  imageUrls: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('ProductDetail', () => {
  let productService: { getById: ReturnType<typeof vi.fn> };
  let activatedRoute: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };

  beforeEach(() => {
    productService = { getById: vi.fn() };
    activatedRoute = {
      snapshot: {
        paramMap: { get: vi.fn().mockReturnValue(mockProduct.id) },
      },
    };

    TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    });
  });

  function createFixture(): ComponentFixture<ProductDetail> {
    return TestBed.createComponent(ProductDetail);
  }

  it('should create', () => {
    productService.getById.mockReturnValue(of(mockProduct));
    const fixture = createFixture();
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show an error and never call getById when the route has no id param', () => {
    activatedRoute.snapshot.paramMap.get.mockReturnValue(null);

    const fixture = createFixture();
    fixture.detectChanges();

    expect(productService.getById).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error()).toBe(true);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should fetch via getById', () => {
    productService.getById.mockReturnValue(of(mockProduct));

    const fixture = createFixture();
    fixture.detectChanges();

    expect(productService.getById).toHaveBeenCalledWith(mockProduct.id);
    expect(fixture.componentInstance.product()).toEqual(mockProduct);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should show an error and turn off loading when getById fails', () => {
    productService.getById.mockReturnValue(throwError(() => new Error('network error')));

    const fixture = createFixture();
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBe(true);
    expect(fixture.componentInstance.loading()).toBe(false);
  });
});