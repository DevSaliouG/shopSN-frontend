import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../features/services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ne pas rediriger pour les endpoints analytics (non critiques)
      if (req.url.includes('/api/analytics')) {
        return throwError(() => error);
      }

      if (req.url.includes('/api/auth/refresh') && error.status === 401) {
        authService.logout();
        return throwError(() => error);
      }

      if (error.status === 401) {
        if (error.error?.error === 'token_expired') {
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = authService.getToken();
              return next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                }),
              );
            }),
            catchError((refreshError) => {
              authService.logout();
              router.navigate(['/connexion']);
              return throwError(() => refreshError);
            }),
          );
        }

        authService.logout();
        router.navigate(['/connexion']);
        return throwError(() => error);
      }

      if (error.status === 403) {
        router.navigate(['/']);
        return throwError(() => error);
      }

      if (error.status >= 500) {
        console.error('Erreur serveur:', { status: error.status, url: req.url });
      }

      return throwError(() => error);
    }),
  );
};
