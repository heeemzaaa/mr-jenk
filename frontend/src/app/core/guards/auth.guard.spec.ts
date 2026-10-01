import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
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

  it('should allow authenticated user', () => {
    authService['userSignal'].set({
      id: '1',
      role: 'CLIENT',
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('should redirect unauthenticated user to login', () => {
    const loginUrlTree = {};
    createUrlTree.mockReturnValue(loginUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(loginUrlTree);
  });
});
