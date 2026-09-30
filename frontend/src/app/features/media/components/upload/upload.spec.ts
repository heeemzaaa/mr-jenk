import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { Upload } from './upload.component';
import { UploadService } from '../../services/upload.service';
import { ApiResponse } from '../../models/media.model';

describe('Upload', () => {
  let component: Upload;
  let fixture: ComponentFixture<Upload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Upload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Upload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps the picker tile visible and shows "Uploading…" while a gallery upload is in flight', () => {
    // Own fixture, set up before the first render: `isSingle`/`canAddMore` are
    // computed() over a plain (non-signal) `maxFiles` input, so they only get
    // evaluated once — it must be correct on that very first render.
    const galleryFixture = TestBed.createComponent(Upload);
    const galleryComponent = galleryFixture.componentInstance;
    galleryComponent.targetType = 'PRODUCT';
    galleryComponent.targetId = 'p1';
    galleryComponent.maxFiles = 5;
    galleryFixture.detectChanges();

    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    galleryComponent.onFilesPicked({ target: { files: [file], value: '' } } as unknown as Event);

    const upload$ = new Subject<ApiResponse<string[]>>();
    vi.spyOn(TestBed.inject(UploadService), 'saveMedia').mockReturnValue(upload$.asObservable());

    galleryComponent.commitNew('p1').subscribe();
    galleryFixture.detectChanges();

    expect(galleryComponent.uploading()).toBe(true);
    expect(galleryFixture.nativeElement.textContent).toContain('Uploading');

    upload$.next({ success: true, message: 'ok', data: ['https://example.com/photo.png'] });
    upload$.complete();
    galleryFixture.detectChanges();

    expect(galleryComponent.uploading()).toBe(false);
  });
});
