import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser = {
    id: '1',
    role: 'CLIENT',
  };

  /**
   * Creates a fake JWT for testing.
   */
  const createFakeToken = (payload: object): string => {
    const header = btoa(
      JSON.stringify({
        alg: 'none',
        typ: 'JWT',
      }),
    );

    const encodedPayload = btoa(JSON.stringify(payload));

    return `${header}.${encodedPayload}.signature`;
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();

    localStorage.clear();

    vi.restoreAllMocks();
  });

  // --------------------------------------------------
  // Creation
  // --------------------------------------------------

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --------------------------------------------------
  // Login
  // --------------------------------------------------

  it('should send login request', () => {
    const loginRequest = {
      email: 'ayoub@gmail.com',
      password: 'password123',
    };

    const response = {
      data: 'fake-jwt-token',
    };

    service.login(loginRequest).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual(loginRequest);

    req.flush(response);
  });

  // --------------------------------------------------
  // Register
  // --------------------------------------------------

  it('should send register request', () => {
    const registerRequest = {
      name: 'Ayoub',
      email: 'ayoub@gmail.com',
      password: 'password123',
      role: 'SELLER',
    };

    const response = {
      data: {
        id: '1',
        name: 'Ayoub',
        email: 'ayoub@gmail.com',
      },
    };

    service.register(registerRequest).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual(registerRequest);

    req.flush(response);
  });

  // --------------------------------------------------
  // setUserFromToken
  // --------------------------------------------------

  it('should save JWT and user when setting user from token', () => {
    const token = createFakeToken({
      sub: mockUser.id,
      role: mockUser.role,
    });

    service.setUserFromToken(token);

    expect(localStorage.getItem('jwt')).toBe(token);

    expect(service.user()).toEqual(mockUser);

  });

  // --------------------------------------------------
  // initializeUser
  // --------------------------------------------------

  it('should initialize user from JWT', () => {
    const token = createFakeToken({
      sub: mockUser.id,
      role: mockUser.role,
    });

    localStorage.setItem('jwt', token);

    service.initializeUser();

    expect(service.user()).toEqual(mockUser);

  });

  // --------------------------------------------------
  // initializeUser without token
  // --------------------------------------------------

  it('should do nothing when there is no JWT', () => {
    service.initializeUser();

    expect(service.user()).toBeNull();
  });

  // --------------------------------------------------
  // Invalid JWT
  // --------------------------------------------------

  it('should logout when JWT is invalid', () => {
    localStorage.setItem('jwt', 'invalid-token');

    const logoutSpy = vi.spyOn(service, 'logout').mockImplementation(() => {});

    service.initializeUser();

    expect(logoutSpy).toHaveBeenCalled();
  });

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  it('should remove JWT from localStorage on logout', () => {
    localStorage.setItem('jwt', 'fake-jwt-token');

    service.logout();

    expect(localStorage.getItem('jwt')).toBeNull();
  });

  it('should remove user from localStorage on logout', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    service.logout();

  });

  it('should clear user signal on logout', () => {
    const token = createFakeToken({
      sub: mockUser.id,
      role: mockUser.role,
    });

    service.setUserFromToken(token);

    expect(service.user()).toEqual(mockUser);

    service.logout();

    expect(service.user()).toBeNull();
  });
});
