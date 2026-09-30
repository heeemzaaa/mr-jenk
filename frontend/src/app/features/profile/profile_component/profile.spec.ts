import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { Profile } from './profile';
import { ProfileService } from '../services/profile.service';
import { ProfileResponse } from '../models/profile.model';

import { AuthService } from '../../../core/services/auth.service';
import { Upload } from '../../media/components/upload/upload.component';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let httpMock: HttpTestingController;
  let profileService: {
    getProfile: ReturnType<typeof vi.fn>;
    updateProfile: ReturnType<typeof vi.fn>;
  };

  const mockProfile: ProfileResponse = {
    name: 'Ayoub Nachti',
    email: 'ayoub@gmail.com',
    role: 'CLIENT',
    avatar: null,
  };

  const mockProfileWithAvatar: ProfileResponse = {
    name: 'Ayoub Nachti',
    email: 'ayoub@gmail.com',
    role: 'CLIENT',
    avatar: 'https://example.com/avatar.jpg',
  };

  // Replaces the real (rendered) Upload child with a controllable fake, so
  // tests can dictate what the "media upload" step returns/throws without
  // going through a real HTTP call.
  function stubUploadComponent(overrides: {
    commit?: ReturnType<typeof vi.fn>;
    resetPending?: ReturnType<typeof vi.fn>;
    hasPendingChanges?: () => boolean;
  }): void {
    component.uploadComponent = {
      commit: overrides.commit ?? vi.fn().mockReturnValue(of([])),
      resetPending: overrides.resetPending ?? vi.fn(),
      hasPendingChanges: overrides.hasPendingChanges ?? (() => false),
    } as unknown as Upload;
  }

  beforeEach(async () => {
    profileService = {
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ProfileService,
          useValue: profileService,
        },
        {
          provide: AuthService,
          useValue: {
            user: () => ({ id: 'user-1', role: 'CLIENT' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // =========================================================
  // COMPONENT CREATION
  // =========================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  it('should load the profile on initialization', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    fixture.detectChanges();

    expect(profileService.getProfile).toHaveBeenCalledTimes(1);

    expect(component.profile()).toEqual(mockProfile);
    expect(component.role()).toBe('CLIENT');
    expect(component.avatar()).toBeNull();

    expect(component.profileForm.getRawValue()).toEqual({
      name: 'Ayoub Nachti',
      email: 'ayoub@gmail.com',
    });

    expect(component.loading()).toBe(false);
  });

  // =========================================================
  // PROFILE WITHOUT AVATAR
  // =========================================================

  it('should keep avatar as null when the profile has no avatar', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    fixture.detectChanges();

    expect(component.avatar()).toBeNull();
  });

  // =========================================================
  // PROFILE WITH AVATAR
  // =========================================================

  it('should load the avatar when the profile has an avatar', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfileWithAvatar,
      }),
    );

    fixture.detectChanges();

    expect(component.avatar()).toBe('https://example.com/avatar.jpg');
  });

  // =========================================================
  // ROLE
  // =========================================================

  it('should load the user role', () => {
    const sellerProfile: ProfileResponse = {
      ...mockProfile,
      role: 'SELLER',
    };

    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: sellerProfile,
      }),
    );

    fixture.detectChanges();

    expect(component.role()).toBe('SELLER');
  });

  // =========================================================
  // FORM
  // =========================================================

  it('should populate the form with profile data', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    fixture.detectChanges();

    expect(component.nameControl.value).toBe('Ayoub Nachti');

    expect(component.emailControl.value).toBe('ayoub@gmail.com');
  });

  // =========================================================
  // FORM VALIDATION
  // =========================================================

  it('should require a name', () => {
    component.profileForm.controls.name.setValue('');

    expect(component.nameControl.invalid).toBe(true);
    expect(component.nameControl.hasError('required')).toBe(true);
  });

  it('should reject a name shorter than 3 characters', () => {
    component.profileForm.controls.name.setValue('Ab');

    expect(component.nameControl.invalid).toBe(true);
    expect(component.nameControl.hasError('minlength')).toBe(true);
  });

  it('should reject a name longer than 100 characters', () => {
    component.profileForm.controls.name.setValue('A'.repeat(101));

    expect(component.nameControl.invalid).toBe(true);
    expect(component.nameControl.hasError('maxlength')).toBe(true);
  });

  it('should require an email', () => {
    component.profileForm.controls.email.setValue('');

    expect(component.emailControl.invalid).toBe(true);
    expect(component.emailControl.hasError('required')).toBe(true);
  });

  it('should reject an invalid email', () => {
    component.profileForm.controls.email.setValue('invalid-email');

    expect(component.emailControl.invalid).toBe(true);
    expect(component.emailControl.hasError('email')).toBe(true);
  });

  it('should accept a valid form', () => {
    component.profileForm.setValue({
      name: 'Ayoub Nachti',
      email: 'ayoub@gmail.com',
    });

    expect(component.profileForm.valid).toBe(true);
  });

  // =========================================================
  // SAVE - NO CHANGES
  // =========================================================

  it('should not update the profile when there are no changes', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    fixture.detectChanges();

    component.saveProfile();

    expect(profileService.updateProfile).not.toHaveBeenCalled();

    expect(component.errorMessage()).toBe('No changes were made to your profile.');
  });

  // =========================================================
  // SAVE - INVALID FORM
  // =========================================================

  it('should not update the profile when the form is invalid', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    fixture.detectChanges();

    component.profileForm.controls.name.setValue('');

    component.saveProfile();

    expect(profileService.updateProfile).not.toHaveBeenCalled();

    expect(component.errorMessage()).toBe('Please fix the errors below.');

    expect(component.nameControl.touched).toBe(true);
  });

  // =========================================================
  // SAVE - SUCCESS (NAME/EMAIL ONLY, NO AVATAR CHANGE)
  // =========================================================

  it('should update the profile successfully', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfileWithAvatar,
      }),
    );

    const updatedProfile: ProfileResponse = {
      name: 'Ayoub Updated',
      email: 'updated@gmail.com',
      role: 'CLIENT',
      avatar: 'https://example.com/avatar.jpg',
    };

    profileService.updateProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      }),
    );

    fixture.detectChanges();

    component.profileForm.setValue({
      name: 'Ayoub Updated',
      email: 'updated@gmail.com',
    });

    component.saveProfile();

    expect(profileService.updateProfile).toHaveBeenCalledTimes(1);

    expect(profileService.updateProfile).toHaveBeenCalledWith({
      name: 'Ayoub Updated',
      email: 'updated@gmail.com',
      avatar: 'https://example.com/avatar.jpg',
    });

    expect(component.profile()).toEqual(updatedProfile);

    expect(component.originalProfile()).toEqual(updatedProfile);

    expect(component.avatar()).toBe('https://example.com/avatar.jpg');

    expect(component.saving()).toBe(false);

    expect(component.successMessage()).toBe('Your profile has been updated successfully.');
  });

  // =========================================================
  // SAVE - AVATAR UPLOAD RUNS BEFORE THE PROFILE UPDATE
  // =========================================================

  it('should upload the pending avatar first and send the returned url to the profile service', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    profileService.updateProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile updated successfully',
        data: { ...mockProfile, avatar: 'https://example.com/new-avatar.jpg' },
      }),
    );

    fixture.detectChanges();

    const commit = vi.fn().mockReturnValue(of(['https://example.com/new-avatar.jpg']));
    stubUploadComponent({ commit, hasPendingChanges: () => true });

    component.saveProfile();

    expect(commit).toHaveBeenCalledTimes(1);

    expect(profileService.updateProfile).toHaveBeenCalledWith({
      name: 'Ayoub Nachti',
      email: 'ayoub@gmail.com',
      avatar: 'https://example.com/new-avatar.jpg',
    });
  });

  // =========================================================
  // SAVE - AVATAR UPLOAD FAILS
  // =========================================================

  it('should not call the profile service when the avatar upload fails', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    fixture.detectChanges();

    const commit = vi.fn().mockReturnValue(
      throwError(() => ({
        error: { message: 'The image has more than 2MB !' },
      })),
    );
    stubUploadComponent({ commit, hasPendingChanges: () => true });

    component.saveProfile();

    expect(commit).toHaveBeenCalledTimes(1);

    expect(profileService.updateProfile).not.toHaveBeenCalled();

    expect(component.errorMessage()).toBe('The image has more than 2MB !');

    expect(component.saving()).toBe(false);
  });

  // =========================================================
  // SAVE - TRIM
  // =========================================================

  it('should trim name and email before updating', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    profileService.updateProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile updated successfully',
        data: {
          ...mockProfile,
          name: 'New Name',
          email: 'new@gmail.com',
        },
      }),
    );

    fixture.detectChanges();

    component.profileForm.setValue({
      name: '  New Name  ',
      email: '  new@gmail.com  ',
    });

    component.saveProfile();

    expect(profileService.updateProfile).toHaveBeenCalledWith({
      name: 'New Name',
      email: 'new@gmail.com',
      avatar: null,
    });
  });

  // =========================================================
  // SAVE - ERROR
  // =========================================================

  it('should handle update profile errors', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    profileService.updateProfile.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Email already exists',
        },
      })),
    );

    fixture.detectChanges();

    component.profileForm.controls.name.setValue('New Name');

    component.saveProfile();

    expect(component.saving()).toBe(false);

    expect(component.errorMessage()).toBe('Email already exists');
  });

  // =========================================================
  // DOUBLE SAVE PROTECTION
  // =========================================================

  it('should not save while another save is in progress', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    fixture.detectChanges();

    component.saving.set(true);

    component.saveProfile();

    expect(profileService.updateProfile).not.toHaveBeenCalled();
  });

  // =========================================================
  // CANCEL
  // =========================================================

  it('should restore original profile values when cancel is clicked', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    fixture.detectChanges();

    // Make changes
    component.profileForm.setValue({
      name: 'Changed Name',
      email: 'changed@gmail.com',
    });

    expect(component.profileForm.getRawValue()).toEqual({
      name: 'Changed Name',
      email: 'changed@gmail.com',
    });

    // Cancel
    component.cancelChanges();

    expect(component.profileForm.getRawValue()).toEqual({
      name: 'Ayoub Nachti',
      email: 'ayoub@gmail.com',
    });

    expect(component.avatar()).toBeNull();
    expect(component.role()).toBe('CLIENT');

    expect(component.profileForm.pristine).toBe(true);
    expect(component.profileForm.untouched).toBe(true);
  });

  // =========================================================
  // CANCEL - AVATAR
  // =========================================================

  it('should discard a pending avatar change and restore the original avatar when cancel is clicked', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfileWithAvatar,
      }),
    );

    fixture.detectChanges();

    const resetPending = vi.fn();
    stubUploadComponent({ resetPending, hasPendingChanges: () => true });

    component.cancelChanges();

    expect(resetPending).toHaveBeenCalledTimes(1);

    expect(component.avatar()).toBe('https://example.com/avatar.jpg');
  });

  // =========================================================
  // CANCEL - NO CHANGES
  // =========================================================

  it('should do nothing when cancel is clicked without changes', () => {
    profileService.getProfile.mockReturnValue(
      of({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockProfile,
      }),
    );

    fixture.detectChanges();

    const originalProfile = component.profile();
    const originalAvatar = component.avatar();

    component.cancelChanges();

    expect(component.profile()).toEqual(originalProfile);

    expect(component.avatar()).toBe(originalAvatar);

    expect(component.errorMessage()).toBe('');
    expect(component.successMessage()).toBe('');
  });

  // =========================================================
  // LOAD ERROR
  // =========================================================

  it('should handle profile loading errors', () => {
    profileService.getProfile.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Unauthorized',
        },
      })),
    );

    fixture.detectChanges();

    expect(component.loading()).toBe(false);

    expect(component.errorMessage()).toBe('Unauthorized');
  });

  // =========================================================
  // LOAD ERROR - DEFAULT MESSAGE
  // =========================================================

  it('should use the default message when profile loading fails without a server message', () => {
    profileService.getProfile.mockReturnValue(throwError(() => ({})));

    fixture.detectChanges();

    expect(component.loading()).toBe(false);

    expect(component.errorMessage()).toBe('Failed to load your profile. Please try again.');
  });
});
