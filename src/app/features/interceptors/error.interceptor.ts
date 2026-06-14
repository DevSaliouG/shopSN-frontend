/**
 * Intercepteur d'erreurs HTTP
 * Gère de manière centralisée toutes les erreurs API
 * 
 * Fonctionnalités:
 * - Rafraîchissement automatique du token sur 401
 * - Messages d'erreur utilisateur contextualisés
 * - Logging des erreurs serveur
 * - Redirection sur erreurs 403 (accès refusé)
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Service de notification (à implémenter selon vos besoins)
// Pour l'exemple, on utilise console.error, mais vous pouvez injecter un ToastService
interface ToastService {
  error(message: string): void;
  warning(message: string): void;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // const toast = inject(ToastService); // À décommenter quand le service sera implémenté

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Gestion silencieuse des erreurs de refresh token
      const isRefreshRequest = req.url.includes('/api/auth/refresh');
      
      if (isRefreshRequest && error.status === 401) {
        authService.logout();
        return throwError(() => error);
      }

      // 401 - Non authentifié ou token expiré
      if (error.status === 401) {
        const errorType = error.error?.error;
        
        // Token expiré - tentative de refresh automatique
        if (errorType === 'token_expired') {
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Rejoue la requête originale avec le nouveau token
              const newToken = authService.getToken();
              const clonedRequest = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(clonedRequest);
            }),
            catchError((refreshError) => {
              authService.logout();
              router.navigate(['/connexion']);
              return throwError(() => refreshError);
            })
          );
        }
        
        // Token invalide ou absent
        authService.logout();
        router.navigate(['/connexion']);
        // toast.error('Votre session a expiré. Veuillez vous reconnecter.');
        return throwError(() => error);
      }

      // 403 - Accès interdit (permissions insuffisantes)
      if (error.status === 403) {
        // toast.error('Accès refusé. Vous n\'avez pas les droits nécessaires.');
        router.navigate(['/']);
        return throwError(() => error);
      }

      // 422 - Erreur de validation (propagation pour traitement local)
      if (error.status === 422) {
        // Les erreurs de validation sont gérées au niveau du composant
        return throwError(() => error);
      }

      // 429 - Trop de requêtes (rate limiting)
      if (error.status === 429) {
        // toast.warning('Trop de tentatives. Veuillez patienter 1 minute.');
        console.warn('Rate limit exceeded:', error.error?.message);
        return throwError(() => error);
      }

      // 500+ - Erreur serveur
      if (error.status >= 500) {
        console.error('Erreur serveur:', {
          status: error.status,
          url: req.url,
          message: error.message
        });
        // toast.error('Erreur serveur. Réessayez dans quelques instants.');
      }

      // Propagation des autres erreurs
      return throwError(() => error);
    })
  );
};
