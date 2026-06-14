/**
 * Intercepteur JWT pour Angular 21
 * Version fonctionnelle utilisant les nouvelles API
 * 
 * Rôle:
 * - Ajoute automatiquement le token JWT aux requêtes authentifiées
 * - Gère les routes publiques qui ne nécessitent pas de token
 * - Optimise les performances en évitant les clones inutiles
 */

import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Routes qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES: RegExp[] = [
  /^\/api\/products(\/.*)?$/,      // Toutes les routes produits GET
  /^\/api\/categories(\/.*)?$/,    // Toutes les routes catégories
  /^\/api\/search(\/.*)?$/,        // Routes de recherche
  /^\/api\/auth\/(login|register|forgot-password|reset-password)/, // Auth publique
];

/**
 * Vérifie si une route est publique (ne nécessite pas de token)
 */
const isPublicRoute = (url: string, method: string): boolean => {
  // Les routes GET de produits/catégories sont publiques
  if (method === 'GET' && PUBLIC_ROUTES.some(pattern => pattern.test(url))) {
    return true;
  }
  return false;
};

/**
 * Intercepteur principal JWT
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const url = req.url;
  const method = req.method;

  // Si route publique, on passe la requête sans modification
  if (isPublicRoute(url, method)) {
    return next(req);
  }

  // Si token absent, on passe la requête sans token
  if (!token) {
    return next(req);
  }

  // Clone la requête avec le header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
