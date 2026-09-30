import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Register } from './register';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  template: ''
})
class DummyComponent {}

describe('Register', () => {

  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authService: {
    register: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {

    authService = {
      register: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Register],

      providers: [
        {
          provide: AuthService,
          useValue: authService
        },

        provideRouter([
          {
            path: 'login',
            component: DummyComponent
          }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Register);

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
  // Form initialization
  // --------------------------------------------------

  it('should initialize with CLIENT role', () => {

    expect(component.role.value)
      .toBe('CLIENT');

  });


  // --------------------------------------------------
  // Form validation
  // --------------------------------------------------

  it('should reject an empty form', () => {

    component.onSubmit();

    expect(component.registerForm.invalid)
      .toBe(true);

    expect(component.name.touched)
      .toBe(true);

    expect(component.email.touched)
      .toBe(true);

    expect(component.password.touched)
      .toBe(true);

    expect(authService.register)
      .not.toHaveBeenCalled();

  });


  it('should reject a name shorter than 2 characters', () => {

    component.registerForm.setValue({
      name: 'A',
      email: 'test@example.com',
      password: 'password123',
      role: 'CLIENT'
    });

    component.onSubmit();

    expect(component.name.hasError('minlength'))
      .toBe(true);

    expect(authService.register)
      .not.toHaveBeenCalled();

  });


  it('should reject an invalid email', () => {

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123',
      role: 'CLIENT'
    });

    component.onSubmit();

    expect(component.email.hasError('email'))
      .toBe(true);

    expect(authService.register)
      .not.toHaveBeenCalled();

  });


  it('should reject a password shorter than 8 characters', () => {

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'test@example.com',
      password: '1234567',
      role: 'CLIENT'
    });

    component.onSubmit();

    expect(component.password.hasError('minlength'))
      .toBe(true);

    expect(authService.register)
      .not.toHaveBeenCalled();

  });


  // --------------------------------------------------
  // Registration request
  // --------------------------------------------------

  it('should normalize name and email before calling the API', () => {

    authService.register.mockReturnValue(
      of({
        success: true,
        message: 'User registered successfully',
        data: null
      })
    );

    component.registerForm.setValue({
      name: '  John Doe  ',
      email: '  JOHN.DOE@GMAIL.COM  ',
      password: 'password123',
      role: 'CLIENT'
    });

    component.onSubmit();

    expect(authService.register)
      .toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'password123',
        role: 'CLIENT'
      });

  });


  // --------------------------------------------------
  // Roles
  // --------------------------------------------------

  it('should allow SELLER role', () => {

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'SELLER'
    });

    expect(component.role.value)
      .toBe('SELLER');

    expect(component.registerForm.valid)
      .toBe(true);

  });


  // --------------------------------------------------
  // Successful registration
  // --------------------------------------------------

  it('should submit a valid CLIENT registration', () => {

    authService.register.mockReturnValue(
      of({
        success: true,
        message: 'User registered successfully',
        data: null
      })
    );

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'CLIENT'
    });

    component.onSubmit();

    expect(authService.register)
      .toHaveBeenCalled();

    expect(component.isLoading())
      .toBe(false);

  });


  it('should display the success message after registration', () => {

    authService.register.mockReturnValue(
      of({
        success: true,
        message: 'User registered successfully',
        data: null
      })
    );

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'CLIENT'
    });

    component.onSubmit();

    expect(component.successMessage())
      .toBe('User registered successfully');

  });


  it('should navigate to login after successful registration', () => {

    authService.register.mockReturnValue(
      of({
        success: true,
        message: 'User registered successfully',
        data: null
      })
    );

    const navigateSpy = vi.spyOn(router, 'navigate');

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'CLIENT'
    });

    component.onSubmit();

    expect(navigateSpy)
      .toHaveBeenCalledWith(['/login']);

  });


  // --------------------------------------------------
  // Failed registration
  // --------------------------------------------------

  it('should display the server error after failed registration', () => {

    authService.register.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Email already exists'
        }
      }))
    );

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'CLIENT'
    });

    component.onSubmit();

    expect(component.errorMessage())
      .toBe('Email already exists');

    expect(component.isLoading())
      .toBe(false);

  });


  it('should use a fallback error message when the API provides no message', () => {

    authService.register.mockReturnValue(
      throwError(() => ({
        error: {}
      }))
    );

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'CLIENT'
    });

    component.onSubmit();

    expect(component.errorMessage())
      .toBe('Registration failed. Please try again.');

    expect(component.isLoading())
      .toBe(false);

  });

});
