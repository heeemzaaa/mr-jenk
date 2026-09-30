import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';

import { vi } from 'vitest';

import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([authInterceptor])
        ),

        provideHttpClientTesting(),

        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
          },
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should not add Authorization header when token does not exist', () => {
    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');

    expect(
      req.request.headers.has('Authorization')
    ).toBe(false);

    req.flush({});
  });

  it('should add Authorization header when token exists', () => {
    localStorage.setItem('jwt', 'my-jwt-token');

    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');

    expect(
      req.request.headers.get('Authorization')
    ).toBe('Bearer my-jwt-token');

    req.flush({});
  });

  it('should logout and redirect to login when JWT is invalid or expired', () => {
    localStorage.setItem('jwt', 'expired-token');

    const logoutSpy = vi.spyOn(authService, 'logout');
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/users/profile').subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne('/users/profile');

    expect(
      req.request.headers.get('Authorization')
    ).toBe('Bearer expired-token');

    req.flush(
      {
        error: 'Invalid or expired JWT',
      },
      {
        status: 401,
        statusText: 'Unauthorized',
      }
    );

    expect(logoutSpy).toHaveBeenCalled();

    expect(navigateSpy).toHaveBeenCalledWith([
      '/login',
    ]);
  });

  it('should not logout when a public endpoint returns 401', () => {
    localStorage.setItem('jwt', 'my-jwt-token');

    const logoutSpy = vi.spyOn(authService, 'logout');
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/products').subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne('/products');

    expect(
      req.request.headers.has('Authorization')
    ).toBe(false);

    req.flush(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
        statusText: 'Unauthorized',
      }
    );

    expect(logoutSpy).not.toHaveBeenCalled();

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
