import { Component, Input, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import { ImagePreview } from '../../models/image-preview.model';
import { ApiResponse, DeleteMediaRequest, MediaRequest, SaveMediaRequest, TargetType } from '../../models/media.model';
import { UploadService } from '../../services/upload.service';
import { validateImageFiles } from '../../utils/image-validation';
import { ConfirmationModal } from '../../../../shared/components/confirmation-modal/confirmation-modal'; // adjust path
import { ToastService } from '../../../../core/services/toast.service'; // adjust path

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [ConfirmationModal],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class Upload {
  // What this upload belongs to, e.g. a profile avatar or a product's gallery
  @Input({ required: true }) targetType!: TargetType;
  @Input({ required: true }) targetId!: string;

  // How many images are allowed in total (1 = single avatar-style picker, >1 = gallery picker)
  @Input() maxFiles = 1;

  // Only used by the single-image (avatar) variant, for the fallback initials
  @Input() name: string | null = null;

  // Title text shown next to the picker, e.g. "Profile picture" or "Product pictures"
  @Input() label = 'Profile picture';

  @Input()
  set initialImages(value: string | string[] | null) {
    const urls = value == null ? [] : Array.isArray(value) ? value : [value];

    this.previews.set(urls.filter(Boolean).map((url) => ({ url, file: null })));
    this.originalAvatarUrl = urls[0] ?? null;
  }

  private readonly uploadService = inject(UploadService);
  private readonly toastService = inject(ToastService);

  // The last backend-confirmed avatar url, kept aside so a pending pick
  // (which replaces `previews`) doesn't lose track of what to ask the
  // backend to delete on commit.
  private originalAvatarUrl: string | null = null;

  readonly previews = signal<ImagePreview[]>([]);
  readonly uploading = signal(false);
  readonly errorMessage = signal('');

  readonly pendingDeleteIndex = signal<number | null>(null);

  readonly isSingle = computed(() => this.maxFiles <= 1);
  readonly canAddMore = computed(() => !this.uploading() && this.previews().length < this.maxFiles);
  readonly hasPendingChanges = computed(() => this.previews().some((preview) => preview.file));

  get avatarUrl(): string | null {
    return this.previews()[0]?.url ?? null;
  }

  onFilesPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    input.value = '';

    if (!files.length) {
      return;
    }

    const { valid, errors } = validateImageFiles(files);

    const remaining = this.isSingle() ? 1 : this.maxFiles - this.previews().length;
    const accepted = valid.slice(0, remaining);

    if (valid.length > accepted.length) {
      errors.push(`You can only upload up to ${this.maxFiles} image(s).`);
    }

    this.errorMessage.set(errors.join('\n'));

    if (!accepted.length) {
      return;
    }

    const picked: ImagePreview[] = accepted.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    this.previews.update((list) => {
      if (this.isSingle()) {
        list.forEach((preview) => this.revokeIfLocal(preview));
        return picked;
      }

      return [...list, ...picked];
    });
  }

  removeImage(index: number): void {
    const preview = this.previews()[index];

    if (!preview) {
      return;
    }

    // Not yet uploaded — just drop it locally, nothing to delete on the backend.
    if (preview.file) {
      this.previews.update((list) => list.filter((p) => p !== preview));
      this.revokeIfLocal(preview);
      return;
    }

    // Already-persisted image — ask for confirmation first; the actual
    // delete request happens in confirmRemove().
    this.pendingDeleteIndex.set(index);
  }

  cancelRemove(): void {
    this.pendingDeleteIndex.set(null);
  }

  confirmRemove(): void {
    const index = this.pendingDeleteIndex();
    this.pendingDeleteIndex.set(null);

    if (index === null) {
      return;
    }

    const preview = this.previews()[index];
    if (!preview) {
      return;
    }

    this.errorMessage.set('');

    const request: DeleteMediaRequest = {
      targetType: this.targetType,
      targetId: this.targetId,
      imagePaths: [preview.url],
    };

    this.uploadService.deleteMedia(request).subscribe({
      next: () => {
        this.previews.update((list) => list.filter((p) => p !== preview));
        this.toastService.success('Image deleted.');
      },
      error: (error) => {
        const message = error?.error?.message || 'Failed to delete image. Please try again.';
        this.errorMessage.set(message);
        this.toastService.error(message);
      },
    });
  }

  // Uploads any newly picked files to the media service, replacing whatever
  // was there before. The caller (e.g. a profile/product form on submit)
  // should subscribe to this before saving the rest of its data, and must
  // not proceed on error.
  commit(): Observable<string[]> {
    const pendingFiles = this.pendingFiles();

    if (!pendingFiles.length) {
      return of(this.previews().map((preview) => preview.url));
    }

    const oldImagePaths = this.isSingle() && this.originalAvatarUrl ? [this.originalAvatarUrl] : null;

    const request: MediaRequest = {
      targetType: this.targetType,
      targetId: this.targetId,
      oldImagePaths,
    };

    return this.runUpload(this.uploadService.updateMedia(request, pendingFiles));
  }

  // For a target that doesn't exist until the caller creates it as part of
  // the same submit (e.g. a brand-new product): the caller creates it first,
  // then passes back the resulting id so any picked images can be attached
  // to it. Resolves with an empty list (no request made) if nothing was picked.
  commitNew(targetId: string): Observable<string[]> {
    this.targetId = targetId;

    const pendingFiles = this.pendingFiles();

    if (!pendingFiles.length) {
      return of([]);
    }

    const request: SaveMediaRequest = {
      targetType: this.targetType,
      targetId,
    };

    return this.runUpload(this.uploadService.saveMedia(request, pendingFiles));
  }

  private pendingFiles(): File[] {
    return this.previews()
      .filter((preview) => preview.file)
      .map((preview) => preview.file as File);
  }

  private runUpload(upload$: Observable<ApiResponse<string[]>>): Observable<string[]> {
    this.uploading.set(true);
    this.errorMessage.set('');

    return upload$.pipe(
      map((res) => {
        const confirmed: ImagePreview[] = res.data.map((url) => ({ url, file: null }));

        this.previews()
          .filter((preview) => preview.file)
          .forEach((preview) => this.revokeIfLocal(preview));

        const stillConfirmed = this.previews().filter((preview) => !preview.file);
        const nextPreviews = this.isSingle() ? confirmed : [...stillConfirmed, ...confirmed];

        this.previews.set(nextPreviews);

        if (this.isSingle()) {
          this.originalAvatarUrl = confirmed[0]?.url ?? null;
        }

        this.uploading.set(false);

        return nextPreviews.map((preview) => preview.url);
      }),
      catchError((error) => {
        this.uploading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'Failed to upload image(s). Please try again.',
        );

        return throwError(() => error);
      }),
    );
  }

  // Discards any picked-but-not-yet-committed files, e.g. when the parent
  // form is cancelled. Confirmed (already backend-persisted) images are kept.
  resetPending(): void {
    this.previews()
      .filter((preview) => preview.file)
      .forEach((preview) => this.revokeIfLocal(preview));

    this.previews.set(
      this.isSingle()
        ? this.originalAvatarUrl
          ? [{ url: this.originalAvatarUrl, file: null }]
          : []
        : this.previews().filter((preview) => !preview.file),
    );

    this.errorMessage.set('');
  }

  // Wipes everything — pending and already-confirmed images alike. Used when
  // the parent form resets entirely, e.g. right after a successful save.
  clear(): void {
    this.previews().forEach((preview) => this.revokeIfLocal(preview));

    this.previews.set([]);
    this.originalAvatarUrl = null;
    this.errorMessage.set('');
  }

  private revokeIfLocal(preview: ImagePreview): void {
    if (preview.file) {
      URL.revokeObjectURL(preview.url);
    }
  }
}