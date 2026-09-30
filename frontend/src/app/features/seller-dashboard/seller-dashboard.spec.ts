import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { SellerDashboard } from './seller-dashboard';
import { Product } from '../../shared/models/product.model';
import { ProductPageResponse } from '../../shared/models/product-page-response';
import { ProductService } from '../../core/services/product.service'; 
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

const SELLER_ID = 'seller-123';

const mockProduct: Product = {
  id: '1212',
  name: 'chair',
  description: 'A sturdy wooden chair.',
  price: 21,
  quantity: 20,
};

function pageResponse(items: Product[], overrides: Partial<ProductPageResponse> = {}): ProductPageResponse {
  return {
    items,
    currentPage: 0,
    pageSize: 20,
    totalElements: items.length,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    ...overrides,
  };
}

describe('SellerDashboard', () => {
  let productService: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let toastService: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };
  let authService: {
    user: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    productService = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    toastService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    authService = {
      user: vi.fn().mockReturnValue({ id: SELLER_ID, role: 'SELLER' }),
    };

    await TestBed.configureTestingModule({
      imports: [SellerDashboard],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: ToastService, useValue: toastService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    // Default: getAll resolves immediately with one product. Individual
    // tests override productService.getAll BEFORE calling createFixture()
    // if they need different timing/behavior — the constructor calls
    // fetchProducts() synchronously on creation, so the mock has to
    // already be in place before TestBed.createComponent runs.
    productService.getAll.mockReturnValue(of(pageResponse([mockProduct])));
  });

  function createFixture(): ComponentFixture<SellerDashboard> {
    return TestBed.createComponent(SellerDashboard);
  }

  it('should create', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  // --------------------------------------------------
  // Fetching on init
  // --------------------------------------------------

  it('should fetch products on construction, passing the seller id, and turn off loading', () => {
    const fixture = createFixture();
    fixture.detectChanges();

    expect(productService.getAll).toHaveBeenCalledWith(SELLER_ID, 0, 20);
    expect(fixture.componentInstance.products()).toEqual([mockProduct]);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should be loading before the fetch resolves', () => {
    const subject = new Subject<ProductPageResponse>();
    productService.getAll.mockReturnValue(subject.asObservable());

    const fixture = createFixture();

    expect(fixture.componentInstance.loading()).toBe(true);

    subject.next(pageResponse([mockProduct]));
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should show an error toast and turn off loading when the fetch fails', () => {
    productService.getAll.mockReturnValue(throwError(() => new Error('network error')));

    const fixture = createFixture();
    fixture.detectChanges();

    expect(toastService.error).toHaveBeenCalledWith('Could not load your products. Try refreshing.');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should show an error toast and never call getAll when no seller id is available', () => {
    authService.user.mockReturnValue(null);

    const fixture = createFixture();
    fixture.detectChanges();

    expect(productService.getAll).not.toHaveBeenCalled();
    expect(toastService.error).toHaveBeenCalledWith('Not signed in as a seller — try logging in again.');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  // --------------------------------------------------
  // Create / edit focus state
  // --------------------------------------------------

  it('should clear editingProduct and bump focusTrigger on create', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.onEditClick(mockProduct); // set some editing state first
    const before = component.focusTrigger();

    component.onCreateClick();

    expect(component.editingProduct()).toBeNull();
    expect(component.focusTrigger()).toBeGreaterThan(before);
  });

  it('should set editingProduct and bump focusTrigger on edit', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const before = component.focusTrigger();

    component.onEditClick(mockProduct);

    expect(component.editingProduct()).toEqual(mockProduct);
    expect(component.focusTrigger()).toBeGreaterThan(before);
  });

  // --------------------------------------------------
  // Delete confirmation flow
  // --------------------------------------------------

  it('should set productPendingDelete on delete click, without calling the service yet', () => {
    const fixture = createFixture();
    fixture.detectChanges();

    fixture.componentInstance.onDeleteClick(mockProduct);

    expect(fixture.componentInstance.productPendingDelete()).toEqual(mockProduct);
    expect(productService.delete).not.toHaveBeenCalled();
  });

  it('should clear productPendingDelete on cancel, without calling the service', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.onDeleteClick(mockProduct);
    component.onCancelDelete();

    expect(component.productPendingDelete()).toBeNull();
    expect(productService.delete).not.toHaveBeenCalled();
  });

  it('should delete, show a success toast, clear productPendingDelete, and refetch when confirmed delete succeeds', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const component = fixture.componentInstance;
    productService.delete.mockReturnValue(of(undefined));
    productService.getAll.mockReturnValue(of(pageResponse([]))); // the refetch

    component.onDeleteClick(mockProduct);
    component.onConfirmDelete();

    expect(productService.delete).toHaveBeenCalledWith(mockProduct.id);
    expect(toastService.success).toHaveBeenCalledWith('Product deleted.');
    expect(component.productPendingDelete()).toBeNull();
    // Refetch, not a local splice — getAll called again beyond the
    // initial construction-time fetch.
    expect(productService.getAll).toHaveBeenCalledTimes(2);
  });

  it('should step back a page when deleting the only item on a page beyond the first', () => {
    productService.getAll.mockReturnValue(
      of(pageResponse([mockProduct], { currentPage: 1, hasPrevious: true })),
    );

    const fixture = createFixture();
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.currentPage.set(1);

    productService.delete.mockReturnValue(of(undefined));
    productService.getAll.mockReturnValue(of(pageResponse([])));

    component.onDeleteClick(mockProduct);
    component.onConfirmDelete();

    expect(component.currentPage()).toBe(0);
  });

  it('should show an error toast, clear productPendingDelete, and not refetch when confirmed delete fails', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const component = fixture.componentInstance;
    productService.delete.mockReturnValue(throwError(() => new Error('network error')));

    component.onDeleteClick(mockProduct);
    component.onConfirmDelete();

    expect(toastService.error).toHaveBeenCalledWith('Could not delete this product. Try again.');
    expect(component.productPendingDelete()).toBeNull();
    // Failure path doesn't refetch — only the one call from construction.
    expect(productService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should do nothing if onConfirmDelete is somehow called with no product pending', () => {
    const fixture = createFixture();
    fixture.detectChanges();

    fixture.componentInstance.onConfirmDelete();

    expect(productService.delete).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // Save (create / update)
  // --------------------------------------------------

  it('should call create, show a success toast, reset the form, and refetch when not editing', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const before = component.focusTrigger();
    const newProduct: Product = { id: '3', name: 'table', description: 'desc', price: 50, quantity: 5 };
    productService.create.mockReturnValue(of(newProduct));
    productService.getAll.mockReturnValue(of(pageResponse([mockProduct, newProduct])));

    component.onFormSave({ name: 'table', description: 'desc', price: 50, quantity: 5 });

    expect(productService.create).toHaveBeenCalledWith({
      name: 'table',
      description: 'desc',
      price: 50,
      quantity: 5,
    });
    expect(toastService.success).toHaveBeenCalledWith('Product created.');
    expect(component.focusTrigger()).toBeGreaterThan(before);
    // Refetch, not a local append.
    expect(productService.getAll).toHaveBeenCalledTimes(2);
    expect(component.products()).toEqual([mockProduct, newProduct]);
  });

  it('should call update, clear editingProduct, reset focusTrigger, and refetch when editing', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const updated: Product = { ...mockProduct, name: 'renamed chair', price: 99 };
    productService.update.mockReturnValue(of(updated));
    productService.getAll.mockReturnValue(of(pageResponse([updated])));

    component.onEditClick(mockProduct);
    const before = component.focusTrigger();

    component.onFormSave({
      name: 'renamed chair',
      description: mockProduct.description,
      price: 99,
      quantity: mockProduct.quantity,
    });

    expect(productService.update).toHaveBeenCalledWith(mockProduct.id, {
      name: 'renamed chair',
      description: mockProduct.description,
      price: 99,
      quantity: mockProduct.quantity,
    });
    expect(toastService.success).toHaveBeenCalledWith('Product updated.');
    expect(component.editingProduct()).toBeNull();
    expect(component.focusTrigger()).toBeGreaterThan(before);
    expect(component.products()).toEqual([updated]);
  });

  it('should show an error toast and not refetch when create fails', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    productService.create.mockReturnValue(throwError(() => new Error('network error')));

    fixture.componentInstance.onFormSave({ name: 'table', description: 'desc', price: 50, quantity: 5 });

    expect(toastService.error).toHaveBeenCalledWith('Could not create this product.');
    expect(productService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast, keep editingProduct set, and not refetch when update fails', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const component = fixture.componentInstance;
    productService.update.mockReturnValue(throwError(() => new Error('network error')));

    component.onEditClick(mockProduct);
    component.onFormSave({
      name: 'renamed chair',
      description: mockProduct.description,
      price: 99,
      quantity: mockProduct.quantity,
    });

    expect(component.editingProduct()).toEqual(mockProduct);
    expect(toastService.error).toHaveBeenCalledWith('Could not update this product.');
    expect(productService.getAll).toHaveBeenCalledTimes(1);
  });
});