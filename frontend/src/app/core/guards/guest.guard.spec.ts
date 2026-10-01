import { describe, it, expect, beforeEach, vi } from 'vitest';

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  let authService: AuthService;
  const createUrlTree = vi.fn();

  beforeEach(() => {
    createUrlTree.mockReset();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: { createUrlTree },
        },
      ],
    });

    authService = TestBed.inject(AuthService);
  });

  it('should allow unauthenticated user', () => {
    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('should redirect authenticated user to home', () => {
    const homeUrlTree = {};
    createUrlTree.mockReturnValue(homeUrlTree);

    authService['userSignal'].set({
      id: '1',
      role: 'CLIENT',
    });

    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));

    expect(createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(homeUrlTree);
  });
});
