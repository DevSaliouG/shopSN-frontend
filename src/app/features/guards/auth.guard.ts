/**
 * Guard d'authentification
 * Protège les routes nécessitant une authentification
 * 
 * Fonctionnalités:
 * - Redirige vers login si non authentifié
 * - Sauvegarde l'URL demandée pour redirection post-login
 * - Support du lazy loading avec canActivate
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Sauvegarde l'URL demandée pour redirection après connexion
  const returnUrl = state.url;
  
  // Redirection vers login avec paramètre returnUrl
  return router.createUrlTree(['/connexion'], {
    queryParams: { returnUrl }
  });
};
