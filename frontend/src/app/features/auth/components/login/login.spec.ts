import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Login } from './login';
import { AuthService } from '../../../../core/services/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: {
    login: ReturnType<typeof vi.fn>;
    setUserFromToken: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    authService = {
      login: vi.fn(),
      setUserFromToken: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],

      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },

        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);

    component = fixture.componentInstance;

    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // --------------------------------------------------
  // Component
  // --------------------------------------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --------------------------------------------------
  // Form validation
  // --------------------------------------------------

  it('should initialize with an empty form', () => {
    expect(component.loginForm.value).toEqual({
      email: '',
      password: '',
    });
  });

  it('should mark the form as invalid when submitted empty', () => {
    component.onSubmit();

    expect(component.loginForm.invalid).toBe(true);

    expect(component.email.touched).toBe(true);

    expect(component.password.touched).toBe(true);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should reject an invalid email', () => {
    component.loginForm.setValue({
      email: 'invalid-email',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.email.hasError('email')).toBe(true);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should reject a password shorter than 8 characters', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: '1234567',
    });

    component.onSubmit();

    expect(component.password.hasError('minlength')).toBe(true);

    expect(authService.login).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // Login request
  // --------------------------------------------------

  it('should normalize the email before calling the API', () => {
    authService.login.mockReturnValue(
      of({
        success: true,
        message: 'Login successful',
        data: 'fake-jwt-token',
      })
    );

    component.loginForm.setValue({
      email: '  TEST@EXAMPLE.COM  ',
      password: 'password123',
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  // --------------------------------------------------
  // Failed login
  // --------------------------------------------------

  it('should display the server error after failed login', () => {
    authService.login.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Invalid email or password',
        },
      }))
    );

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid email or password');

    expect(component.isLoading()).toBe(false);
  });

  it('should use a fallback error message when the API provides no message', () => {
    authService.login.mockReturnValue(
      throwError(() => ({
        error: {},
      }))
    );

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid email or password.');

    expect(component.isLoading()).toBe(false);
  });
});
