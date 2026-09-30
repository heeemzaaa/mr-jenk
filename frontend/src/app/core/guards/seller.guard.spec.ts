import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../services/auth.service';
import { sellerGuard } from './seller.guard';

describe('sellerGuard', () => {
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

  it('should redirect unauthenticated user to home', () => {
    const homeUrlTree = {} as any;

    vi.spyOn(router, 'createUrlTree').mockReturnValue(homeUrlTree);

    const result = TestBed.runInInjectionContext(() => sellerGuard({} as any, {} as any));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);

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
    const homeUrlTree = {} as any;

    vi.spyOn(router, 'createUrlTree').mockReturnValue(homeUrlTree);

    authService['userSignal'].set({
      id: '1',
      role: 'CLIENT',
    });

    const result = TestBed.runInInjectionContext(() => sellerGuard({} as any, {} as any));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);

    expect(result).toBe(homeUrlTree);
  });
});
