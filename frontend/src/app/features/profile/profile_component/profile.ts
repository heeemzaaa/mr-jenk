import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProfileResponse, ProfileRole, UpdateProfileRequest } from '../models/profile.model';

import { ProfileService } from '../services/profile.service';

import { AuthService } from '../../../core/services/auth.service';

import { Upload } from '../../media/components/upload/upload.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, Upload],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);

  @ViewChild(Upload) uploadComponent?: Upload;

  // CURRENT USER ID (used as the media target id for the avatar upload)
  get userId(): string {
    return this.authService.user()?.id ?? '';
  }

  // FORM
  readonly profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
  });

  // PROFILE STATE
  readonly profile = signal<ProfileResponse | null>(null);
  readonly role = signal<ProfileRole>('CLIENT');
  readonly avatar = signal<string | null>(null);

  // ORIGINAL PROFILE
  readonly originalProfile = signal<ProfileResponse | null>(null);

  // UI STATE
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  // FORM CONTROLS
  get nameControl() {
    return this.profileForm.controls.name;
  }

  get emailControl() {
    return this.profileForm.controls.email;
  }

  // LIFECYCLE
  ngOnInit(): void {
    this.loadProfile();
  }

  // LOAD PROFILE
  loadProfile(): void {
    this.loading.set(true);
    this.showErrorMessage('');

    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.applyProfile(res.data);
        this.loading.set(false);
      },

      error: (error) => {
        this.showErrorMessage(
          error?.error?.message || 'Failed to load your profile. Please try again.',
        );
        this.loading.set(false);
      },
    });
  }

  // APPLY PROFILE
  private applyProfile(data: ProfileResponse): void {
    this.profile.set(data);
    this.role.set(data.role);
    this.avatar.set(data.avatar);
    this.originalProfile.set({
      ...data,
    });

    this.profileForm.setValue({
      name: data.name,
      email: data.email,
    });

    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();
  }

  // CHECK CHANGES
  private hasChanges(): boolean {
    const original = this.originalProfile();

    if (!original) {
      return false;
    }

    const { name, email } = this.profileForm.getRawValue();
    const avatarChanged = this.uploadComponent?.hasPendingChanges() ?? false;

    return name !== original.name || email !== original.email || avatarChanged;
  }

  // SAVE
  saveProfile(): void {
    if (this.saving()) {
      return;
    }

    this.showSuccessMessage('');
    this.showErrorMessage('');

    // Trim values before validation
    const name = this.nameControl.value.trim();
    const email = this.emailControl.value.trim().toLowerCase();

    this.profileForm.controls.name.setValue(name, {
      emitEvent: false,
    });

    this.profileForm.controls.email.setValue(email, {
      emitEvent: false,
    });

    // Validation
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();

      this.showErrorMessage('Please fix the errors below.');

      return;
    }

    // No changes
    if (!this.hasChanges()) {
      this.showErrorMessage('No changes were made to your profile.');

      return;
    }

    this.saving.set(true);

    if (!this.uploadComponent) {
      this.submitProfile(name, email, this.avatar());

      return;
    }

    // Upload the picture first: only proceed to the user service once the
    // media service has confirmed it.
    this.uploadComponent.commit().subscribe({
      next: (images) => {
        this.submitProfile(name, email, images[0] ?? this.avatar());
      },

      error: (error) => {
        console.error('Failed to upload the profile picture:', error);

        this.showErrorMessage(
          error?.error?.message || 'Failed to upload the profile picture. Please try again.',
        );

        this.saving.set(false);
      },
    });
  }

  private submitProfile(name: string, email: string, avatar: string | null): void {
    const data: UpdateProfileRequest = {
      name,
      email,
      avatar,
    };

    this.profileService.updateProfile(data).subscribe({
      next: (res) => {
        this.applyProfile(res.data);

        this.showSuccessMessage('Your profile has been updated successfully.');

        this.saving.set(false);
      },

      error: (error) => {
        console.error('Failed to update profile:', error);

        this.showErrorMessage(
          error?.error?.message || 'Failed to update your profile. Please try again.',
        );

        this.saving.set(false);
      },
    });
  }

  // CANCEL
  cancelChanges(): void {
    const original = this.originalProfile();

    if (!original) {
      return;
    }

    if (!this.hasChanges()) {
      return;
    }

    this.showSuccessMessage('');
    this.showErrorMessage('');

    this.profileForm.reset({
      name: original.name,
      email: original.email,
    });

    this.avatar.set(original.avatar);

    this.role.set(original.role);

    this.uploadComponent?.resetPending();

    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();
  }

  // show Success Message in duration 3s
  private showSuccessMessage(message: string, duration = 3000): void {
    this.successMessage.set(message);
    setTimeout(() => {
      this.successMessage.set('');
    }, duration);
  }

  // show Error Message in duration 3s
  private showErrorMessage(message: string, duration = 3000): void {
    this.errorMessage.set(message);
    setTimeout(() => {
      this.errorMessage.set('');
    }, duration);
  }
}
