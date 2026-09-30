import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('jwt');

  const isPublic =
    req.url.endsWith('/auth/login') ||
    req.url.endsWith('/auth/register') ||
    req.url.endsWith('/actuator/health') ||
    (req.method === 'GET' &&
      (req.url.endsWith('/products') || /^.*\/products\/[^/]+$/.test(req.url)));

  const request =
    !token || isPublic
      ? req
      : req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });

  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401 && !isPublic) {
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
