/**
 * Service d'authentification principal
 * Gère les tokens JWT, l'état utilisateur avec Signals, et les appels API
 * 
 * Optimisations:
 * - Utilisation de Signals pour la réactivité fine
 * - Compatibility SSR (vérification de l'existence de localStorage)
 * - Computed signals pour les dérivations d'état
 * - Persistence localStorage avec restore au démarrage
 * - Gestion automatique du refresh token
 */

import { Injectable, signal, computed, inject, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { ENVIRONMENT } from '../../app.config';
import { User, LoginCredentials, RegisterData, AuthResponse, PasswordResetData } from '../models/auth.model';
import { ApiResponse } from '../models/product.model';

// Clés de stockage localStorage
const STORAGE_KEYS = {
  TOKEN: 'shopSN_token',
  USER: 'shopSN_user',
  TOKEN_EXPIRY: 'shopSN_token_expiry'
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly env = inject(ENVIRONMENT);
  @Inject(PLATFORM_ID) private readonly platformId: any;

  // --- SIGNALS PRIVÉS (État interne mutable) ---
  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private _tokenExpiry = signal<number | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // --- SIGNALS PUBLICS (Lecture seule pour les composants) ---
  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // --- COMPUTED SIGNALS (Dérivations d'état performantes) ---
  readonly isLoggedIn = computed(() => {
    const token = this._token();
    const expiry = this._tokenExpiry();
    
    if (!token || !expiry) return false;
    return Date.now() < expiry;
  });

  readonly isAdmin = computed(() => 
    this._currentUser()?.role === 'admin'
  );

  readonly userFullName = computed(() => {
    const user = this._currentUser();
    return user ? `${user.prenom} ${user.nom}` : '';
  });

  readonly userInitials = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
  });

  readonly tokenExpirationTime = computed(() => {
    const expiry = this._tokenExpiry();
    if (!expiry) return null;
    return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
  });

  readonly isTokenExpiringSoon = computed(() => {
    const secondsLeft = this.tokenExpirationTime();
    return secondsLeft !== null && secondsLeft > 0 && secondsLeft < 300;
  });

  constructor() {
    // Effet automatique: restaure la session au démarrage (uniquement dans le navigateur)
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.restoreSession();
      }
    });
  }

  /**
   * Vérifie si localStorage est disponible
   */
  private isLocalStorageAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined';
  }

  /**
   * Restaure la session utilisateur depuis localStorage
   * Appelé automatiquement au démarrage de l'app (uniquement navigateur)
   */
  private restoreSession(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const savedExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

      if (savedToken && savedUser && savedExpiry) {
        const expiry = parseInt(savedExpiry, 10);
        
        if (Date.now() < expiry) {
          this._token.set(savedToken);
          this._tokenExpiry.set(expiry);
          this._currentUser.set(JSON.parse(savedUser));
          
          if (this.isTokenExpiringSoon()) {
            this.refreshToken().subscribe();
          }
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la restauration de session:', error);
      this.clearSession();
    }
  }

  /**
   * Persiste la session dans localStorage
   */
  private persistSession(token: string, user: User, expiresIn: number): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    const expiry = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
    
    this._token.set(token);
    this._tokenExpiry.set(expiry);
    this._currentUser.set(user);
  }

  /**
   * Nettoie complètement la session
   */
  private clearSession(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    }
    
    this._token.set(null);
    this._tokenExpiry.set(null);
    this._currentUser.set(null);
    this._error.set(null);
  }

  /**
   * Connexion utilisateur
   * @param credentials - Email et mot de passe
   * @returns Observable avec la réponse d'authentification
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<AuthResponse>(`${this.env.apiUrl}/api/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.persistSession(
            response.access_token,
            response.user,
            response.expires_in
          );
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._isLoading.set(false);
          const errorMessage = error.error?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
          this._error.set(errorMessage);
          return throwError(() => error);
        })
      );
  }

  /**
   * Inscription nouvel utilisateur
   * @param data - Données d'inscription complètes
   * @returns Observable avec la réponse d'authentification
   */
  register(data: RegisterData): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<AuthResponse>(`${this.env.apiUrl}/api/auth/register`, data)
      .pipe(
        tap(response => {
          this.persistSession(
            response.access_token,
            response.user,
            response.expires_in
          );
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._isLoading.set(false);
          const errorMessage = error.error?.message || 'Erreur lors de l\'inscription.';
          this._error.set(errorMessage);
          return throwError(() => error);
        })
      );
  }

  /**
   * Déconnexion utilisateur
   */
  logout(): void {
    const token = this._token();
    
    if (token && this.isLocalStorageAvailable()) {
      this.http.post(`${this.env.apiUrl}/api/auth/logout`, {}).subscribe({
        next: () => {
          this.clearSession();
          if (isPlatformBrowser(this.platformId)) {
            this.router.navigate(['/connexion']);
          }
        },
        error: () => {
          this.clearSession();
          if (isPlatformBrowser(this.platformId)) {
            this.router.navigate(['/connexion']);
          }
        }
      });
    } else {
      this.clearSession();
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate(['/connexion']);
      }
    }
  }

  /**
   * Rafraîchit le token JWT
   */
  refreshToken(): Observable<{ access_token: string; expires_in: number }> {
    return this.http.post<{ access_token: string; expires_in: number }>(
      `${this.env.apiUrl}/api/auth/refresh`,
      {}
    ).pipe(
      tap(response => {
        const user = this._currentUser();
        if (user) {
          this.persistSession(
            response.access_token,
            user,
            response.expires_in
          );
        }
      }),
      catchError((error) => {
        this.clearSession();
        if (isPlatformBrowser(this.platformId)) {
          this.router.navigate(['/connexion']);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   * @param email - Adresse email de l'utilisateur
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<{ message: string }>(
      `${this.env.apiUrl}/api/auth/forgot-password`,
      { email }
    ).pipe(
      tap(() => this._isLoading.set(false)),
      catchError((error) => {
        this._isLoading.set(false);
        this._error.set(error.error?.message || 'Erreur lors de l\'envoi de l\'email.');
        return throwError(() => error);
      })
    );
  }

  /**
   * Réinitialise le mot de passe avec le token reçu par email
   * @param data - Données de réinitialisation
   */
  resetPassword(data: PasswordResetData): Observable<{ message: string }> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<{ message: string }>(
      `${this.env.apiUrl}/api/auth/reset-password`,
      data
    ).pipe(
      tap(() => this._isLoading.set(false)),
      catchError((error) => {
        this._isLoading.set(false);
        this._error.set(error.error?.message || 'Erreur lors de la réinitialisation.');
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour le profil utilisateur
   * @param data - Données à mettre à jour
   */
  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.env.apiUrl}/api/user/profile`,
      data
    ).pipe(
      tap(response => {
        const currentUser = this._currentUser();
        if (currentUser && response.data) {
          const updatedUser = { ...currentUser, ...response.data };
          this._currentUser.set(updatedUser);
          if (this.isLocalStorageAvailable()) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
          }
        }
      })
    );
  }

  /**
   * Met à jour les données de l'utilisateur connecté
   * @param data - Données partielles à mettre à jour
   */
  updateUserData(data: Partial<User>): void {
    const currentUser = this._currentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data };
      this._currentUser.set(updatedUser);
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      }
    }
  }

  /**
   * Rafraîchit les données utilisateur depuis l'API
   */
  refreshUserData(): void {
    const token = this._token();
    if (!token || !this.isLocalStorageAvailable()) return;
    
    this.http.get<ApiResponse<User>>(`${this.env.apiUrl}/api/user/profile`).subscribe({
      next: (response) => {
        if (response.data) {
          this._currentUser.set(response.data);
          if (this.isLocalStorageAvailable()) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
          }
        }
      },
      error: (error) => {
        console.error('Failed to refresh user data:', error);
      }
    });
  }

  /**
   * Change le mot de passe de l'utilisateur connecté
   * @param currentPassword - Mot de passe actuel
   * @param newPassword - Nouveau mot de passe
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.env.apiUrl}/api/user/password`,
      { current_password: currentPassword, password: newPassword }
    );
  }

  /**
   * Récupère le token JWT actuel (pour l'interceptor)
   */
  getToken(): string | null {
    return this._token();
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * @param role - Rôle à vérifier ('user' ou 'admin')
   */
  hasRole(role: 'user' | 'admin'): boolean {
    if (role === 'admin') return this.isAdmin();
    return this.isLoggedIn();
  }
}