import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Attaches JWT to same-origin `/api/**` requests when the admin token is stored. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getStoredToken();
  const isApiRequest = req.url.startsWith('/api') || (req.url.includes('://') && req.url.includes('/api/'));
  const isAuthRefreshRequest = req.url.includes('/api/auth/refresh');

  const withToken = token && isApiRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(withToken).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;
      const isAdminApiRequest = req.url.includes('/api/admin/');
      const alreadyRetried = req.headers.has('x-auth-retry');
      const refreshToken = auth.getStoredRefreshToken();

      if (
        !isUnauthorized ||
        !isApiRequest ||
        isAuthRefreshRequest ||
        alreadyRetried ||
        !refreshToken
      ) {
        if (isUnauthorized && isAdminApiRequest) {
          auth.logout();
          void router.navigateByUrl('/admin/login');
        }
        return throwError(() => error);
      }

      return auth.refreshAccessToken(refreshToken).pipe(
        switchMap((res) => {
          auth.setTokens(res.token, res.refreshToken ?? refreshToken);
          const retry = req.clone({
            setHeaders: {
              Authorization: `Bearer ${res.token}`,
              'x-auth-retry': '1',
            },
          });
          return next(retry);
        }),
        catchError((refreshError) => {
          auth.logout();
          if (isAdminApiRequest) {
            void router.navigateByUrl('/admin/login');
          }
          return throwError(() => refreshError);
        })
      );
    })
  );
};
