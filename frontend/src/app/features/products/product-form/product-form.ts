import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  effect,
  input,
  signal,
  untracked,
} from '@angular/core';
import { FormField, form, required, submit, validate } from '@angular/forms/signals';
import { Observable, of } from 'rxjs';

import { Product } from '../../../shared/models/product.model';
import { CreateProductRequest } from '../../../shared/models/create-product-request';

import { Upload } from '../../media/components/upload/upload.component';

interface ProductFormModel {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

const EMPTY_MODEL: ProductFormModel = { name: '', description: '', price: 0, quantity: 0 };

// Stable reference so the `[initialImages]` binding doesn't look "changed"
// (and re-clear the picker) on every unrelated re-render while creating.
const NO_IMAGES: string[] = [];

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormField, Upload],
  templateUrl: './product-form.html',
})
export class ProductForm {
  editingProduct = input<Product | null>(null);
  focusTrigger = input(0);
  saving = input(false);

  @Output() save = new EventEmitter<CreateProductRequest>();

  @ViewChild('nameInput') private nameInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild(Upload) private uploadComponent?: Upload;

  // Exposed so the template's `[initialImages]` fallback can use this stable
  // reference instead of a fresh `[]` literal on every re-render.
  readonly noImages = NO_IMAGES;

  private readonly model = signal<ProductFormModel>({ ...EMPTY_MODEL });

  readonly productForm = form(this.model, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required.' });
    validate(schemaPath.name, (ctx) =>
      ctx.value().length <= 100 ? null : { kind: 'name', message: 'Name must be at most 100 characters.' },
    );

    required(schemaPath.description, { message: 'Description is required.' });
    validate(schemaPath.description, (ctx) =>
      ctx.value().length <= 1000
        ? null
        : { kind: 'description', message: 'Description must be at most 1000 characters.' },
    );

    validate(schemaPath.price, (ctx) =>
      ctx.value() > 0 ? null : { kind: 'price', message: 'Price must be greater than 0.' },
    );
    validate(schemaPath.price, (ctx) =>
      ctx.value() <= 999_999.99
        ? null
        : { kind: 'price', message: 'Price must be at most 999,999.99.' },
    );

    validate(schemaPath.quantity, (ctx) =>
      ctx.value() >= 0 ? null : { kind: 'quantity', message: 'Quantity cannot be negative.' },
    );
    validate(schemaPath.quantity, (ctx) =>
      ctx.value() <= 999_999
        ? null
        : { kind: 'quantity', message: 'Quantity must be at most 999,999.' },
    );
  });

  private isFirstRun = true;

  constructor() {
    effect(() => {
      const editing = this.editingProduct();
      this.focusTrigger();

      this.model.set(
        editing
          ? {
              name: editing.name,
              description: editing.description,
              price: editing.price,
              quantity: editing.quantity,
            }
          : { ...EMPTY_MODEL },
      );

      this.productForm().reset();

      // Editing an existing product repopulates images via [initialImages]
      // below; resetting to a blank/new form has nothing to repopulate from,
      // so explicitly wipe the picker (it wouldn't otherwise clear itself
      // when editingProduct was already null, e.g. right after a save).
      if (!editing) {
        // untracked: clear() reads/writes the Upload child's own `previews`
        // signal, and without this, that read would be attributed as a
        // dependency of *this* effect — turning "write previews" into
        // "re-trigger this effect" into "write previews" forever.
        untracked(() => this.uploadComponent?.clear());
      }

      if (!this.isFirstRun) {
        queueMicrotask(() => this.nameInputRef?.nativeElement.focus());
      }
      this.isFirstRun = false;
    });
  }

  async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    if (this.saving()) {
      return;
    }

    await submit(this.productForm, async (f) => {
      this.save.emit(f().value());
      return null;
    });
  }

  // Uploads whatever images the user picked, now that the product exists
  // (either just created with `targetId`, or already existing when editing).
  // Resolves with an empty list if nothing was picked, or if there's no
  // upload picker mounted (e.g. mid form-reset).
  commitImages(targetId: string): Observable<string[]> {
    if (!this.uploadComponent) {
      return of([]);
    }

    return this.editingProduct() ? this.uploadComponent.commit() : this.uploadComponent.commitNew(targetId);
  }
}