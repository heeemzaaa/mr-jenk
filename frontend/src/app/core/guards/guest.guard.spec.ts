import { describe, it, expect, beforeEach, vi } from 'vitest';

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn(),
          },
        },
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow unauthenticated user', () => {
    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('should redirect authenticated user to home', () => {
    const homeUrlTree = {} as any;

    vi.spyOn(router, 'createUrlTree').mockReturnValue(homeUrlTree);

    authService['userSignal'].set({
      id: '1',
      role: 'CLIENT',
    });

    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);

    expect(result).toBe(homeUrlTree);
  });
});
