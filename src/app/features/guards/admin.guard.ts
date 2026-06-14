/**
 * Guard d'administration
 * Restreint l'accès aux utilisateurs avec rôle admin uniquement
 * 
 * Hérite du guard d'authentification + vérification du rôle
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifie d'abord l'authentification
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/connexion'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // Vérifie le rôle admin
  if (authService.isAdmin()) {
    return true;
  }

  // Redirection vers l'accueil si pas admin
  return router.createUrlTree(['/']);
};
