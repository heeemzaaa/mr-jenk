import { DestroyRef, Component, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import { Product } from '../../shared/models/product.model';
import { CreateProductRequest } from '../../shared/models/create-product-request';
import { ProductForm } from '../products/product-form/product-form';
import { ProductTableRow } from '../products/product-table-row/product-table-row';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ConfirmationModal } from '../../shared/components/confirmation-modal/confirmation-modal';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [ProductForm, ProductTableRow, LoadingSpinner, EmptyState, ConfirmationModal],
  templateUrl: './seller-dashboard.html',
})
export class SellerDashboard {
  private readonly productService = inject(ProductService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(ProductForm) private productFormRef?: ProductForm;

  products = signal<Product[]>([]);
  loading = signal(true);
  editingProduct = signal<Product | null>(null);
  focusTrigger = signal(0);
  productPendingDelete = signal<Product | null>(null);

  currentPage = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);
  totalElements = signal(0);

  constructor() {
    this.fetchProducts();
  }

  onCreateClick(): void {
    this.editingProduct.set(null);
    this.focusTrigger.update((n) => n + 1);
  }

  onEditClick(product: Product): void {
    this.editingProduct.set(product);
    this.focusTrigger.update((n) => n + 1);
  }

  onDeleteClick(product: Product): void {
    this.productPendingDelete.set(product);
  }

  onCancelDelete(): void {
    this.productPendingDelete.set(null);
  }

  onConfirmDelete(): void {
    const product = this.productPendingDelete();
    if (!product) {
      return;
    }

    this.productService
      .delete(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Product deleted.');
          this.productPendingDelete.set(null);

          if (this.products().length === 1 && this.currentPage() > 0) {
            this.currentPage.update((p) => p - 1);
          }

          this.fetchProducts();
        },
        error: () => {
          this.toastService.error('Could not delete this product. Try again.');
          this.productPendingDelete.set(null);
        },
      });
  }

  onFormSave(request: CreateProductRequest): void {
    const editing = this.editingProduct();
    const save$ = editing
      ? this.productService.update(editing.id, request)
      : this.productService.create(request);

    // Product first: only attempt the media upload once the product itself
    // is confirmed saved (and we have a real product id to attach images to).
    save$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (savedProduct) => this.uploadPendingImages(savedProduct, editing),
      error: () => {
        this.toastService.error(
          editing ? 'Could not update this product.' : 'Could not create this product.',
        );
      },
    });
  }

  private uploadPendingImages(savedProduct: Product, editing: Product | null): void {
    // commitImages() branches on editingProduct() (commit vs commitNew), so it
    // must run before the form resets and editingProduct is cleared below.
    const commitImages$ = this.productFormRef?.commitImages(savedProduct.id) ?? of([]);

    commitImages$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastService.success(editing ? 'Product updated.' : 'Product created.');
        this.finishSave();
      },
      error: () => {
        this.toastService.error(
          'Product saved, but the image(s) failed to upload. You can retry from the edit form.',
        );

        this.editingProduct.set(savedProduct);
        this.fetchProducts();
      },
    });
  }

  private finishSave(): void {
    // Reset the form (same mechanism as Create/Edit clicks) so a
    // second, accidental Submit can't re-post the same data.
    this.editingProduct.set(null);
    this.focusTrigger.update((n) => n + 1);

    // Refetch rather than patch products() locally — pagination is
    // server-driven now, so this component's local array is only ever
    // one page's worth of data; patching it in place would drift from
    // the server's actual page boundaries and totals.
    this.fetchProducts();
  }

  onNextPage(): void {
    if (!this.hasNext()) {
      return;
    }
    this.currentPage.update((p) => p + 1);
    this.fetchProducts();
  }

  onPreviousPage(): void {
    if (!this.hasPrevious()) {
      return;
    }
    this.currentPage.update((p) => p - 1);
    this.fetchProducts();
  }

  private fetchProducts(): void {
    const sellerId = this.authService.user()?.id;
    if (!sellerId) {
      this.toastService.error('Not signed in as a seller — try logging in again.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.productService
      .getAll(sellerId, this.currentPage(), PAGE_SIZE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.products.set(response.items);
          this.hasNext.set(response.hasNext);
          this.hasPrevious.set(response.hasPrevious);
          this.totalElements.set(response.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.toastService.error('Could not load your products. Try refreshing.');
          this.loading.set(false);
        },
      });
  }
}