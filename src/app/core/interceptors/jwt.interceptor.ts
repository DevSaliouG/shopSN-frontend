import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/services/auth.service';

const PUBLIC_ROUTES: RegExp[] = [
  /^\/api\/products(\/.*)?$/,
  /^\/api\/categories(\/.*)?$/,
  /^\/api\/search(\/.*)?$/,
  /^\/api\/auth\/(login|register|forgot-password|reset-password)/,
];

const isPublicRoute = (url: string, method: string): boolean =>
  method === 'GET' && PUBLIC_ROUTES.some((pattern) => pattern.test(url));

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (isPublicRoute(req.url, req.method) || !token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
