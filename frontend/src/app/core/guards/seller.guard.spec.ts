import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../services/auth.service';
import { sellerGuard } from './seller.guard';

describe('sellerGuard', () => {
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

  it('should redirect unauthenticated user to home', () => {
    const homeUrlTree = {};
    createUrlTree.mockReturnValue(homeUrlTree);

    const result = TestBed.runInInjectionContext(() => sellerGuard({} as any, {} as any));

    expect(createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(homeUrlTree);
  });

  it('should allow SELLER user', () => {
    authService['userSignal'].set({
      id: '2',
      role: 'SELLER',
    });

    const result = TestBed.runInInjectionContext(() => sellerGuard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('should redirect CLIENT user to home', () => {
    const homeUrlTree = {};
    createUrlTree.mockReturnValue(homeUrlTree);

    authService['userSignal'].set({
      id: '1',
      role: 'CLIENT',
    });

    const result = TestBed.runInInjectionContext(() => sellerGuard({} as any, {} as any));

    expect(createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(homeUrlTree);
  });
});
