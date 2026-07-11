// src/app/core/services/auth.service.ts
import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ENVIRONMENT } from '../../core/tokens/environment.token';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  PasswordResetData,
} from '../models/auth.model';
import { ApiResponse } from '../models/product.model';

const STORAGE_KEYS = {
  TOKEN: 'onlineStore_token',
  USER: 'onlineStore_user',
  TOKEN_EXPIRY: 'onlineStore_token_expiry',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly env = inject(ENVIRONMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private _tokenExpiry = signal<number | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isLoggedIn = computed(() => {
    const token = this._token();
    const expiry = this._tokenExpiry();
    return !!(token && expiry && Date.now() < expiry);
  });

  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  readonly userFullName = computed(() => {
    const user = this._currentUser();
    return user ? `${user.prenom} ${user.nom}` : '';
  });

  readonly userInitials = computed(() => {
    const user = this._currentUser();
    return user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : '';
  });

  readonly tokenExpirationTime = computed(() => {
    const expiry = this._tokenExpiry();
    return expiry ? Math.max(0, Math.floor((expiry - Date.now()) / 1000)) : null;
  });

  readonly isTokenExpiringSoon = computed(() => {
    const secondsLeft = this.tokenExpirationTime();
    return secondsLeft !== null && secondsLeft > 0 && secondsLeft < 300;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreSession();
    }
  }

  private isLocalStorageAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined';
  }

  private restoreSession(): void {
    if (!this.isLocalStorageAvailable()) return;
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
      console.error('Erreur restauration session:', error);
      this.clearSession();
    }
  }

  private persistSession(token: string, user: User, expiresIn: number): void {
    if (!this.isLocalStorageAvailable()) return;
    const expiry = Date.now() + expiresIn * 1000;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
    this._token.set(token);
    this._tokenExpiry.set(expiry);
    this._currentUser.set(user);
  }

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

  // --- Méthodes publiques ---

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<AuthResponse>(`${this.env.apiUrl}/api/auth/login`, credentials).pipe(
      tap((response) => {
        this.persistSession(response.access_token, response.user, response.expires_in);
        this._isLoading.set(false);
      }),
      catchError((error) => {
        this._isLoading.set(false);
        const message = error.error?.message || 'Identifiants incorrects.';
        this._error.set(message);
        return throwError(() => error);
      }),
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<AuthResponse>(`${this.env.apiUrl}/api/auth/register`, data).pipe(
      tap((response) => {
        this.persistSession(response.access_token, response.user, response.expires_in);
        this._isLoading.set(false);
      }),
      catchError((error) => {
        this._isLoading.set(false);
        const message = error.error?.message || "Erreur lors de l'inscription.";
        this._error.set(message);
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    const token = this._token();
    if (token && this.isLocalStorageAvailable()) {
      this.http.post(`${this.env.apiUrl}/api/auth/logout`, {}).subscribe({
        next: () => {
          this.clearSession();
          this.router.navigate(['/connexion']);
        },
        error: () => {
          this.clearSession();
          this.router.navigate(['/connexion']);
        },
      });
    } else {
      this.clearSession();
      this.router.navigate(['/connexion']);
    }
  }

  refreshToken(): Observable<{ access_token: string; expires_in: number }> {
    return this.http
      .post<{ access_token: string; expires_in: number }>(`${this.env.apiUrl}/api/auth/refresh`, {})
      .pipe(
        tap((response) => {
          const user = this._currentUser();
          if (user) {
            this.persistSession(response.access_token, user, response.expires_in);
          }
        }),
        catchError((error) => {
          this.clearSession();
          this.router.navigate(['/connexion']);
          return throwError(() => error);
        }),
      );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http
      .post<{ message: string }>(`${this.env.apiUrl}/api/auth/forgot-password`, { email })
      .pipe(
        tap(() => this._isLoading.set(false)),
        catchError((error) => {
          this._isLoading.set(false);
          const message = error.error?.message || "Erreur lors de l'envoi de l'email.";
          this._error.set(message);
          return throwError(() => error);
        }),
      );
  }

  resetPassword(data: PasswordResetData): Observable<{ message: string }> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http
      .post<{ message: string }>(`${this.env.apiUrl}/api/auth/reset-password`, data)
      .pipe(
        tap(() => this._isLoading.set(false)),
        catchError((error) => {
          this._isLoading.set(false);
          const message = error.error?.message || 'Erreur lors de la réinitialisation.';
          this._error.set(message);
          return throwError(() => error);
        }),
      );
  }

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.env.apiUrl}/api/user/profile`, data).pipe(
      tap((response) => {
        const currentUser = this._currentUser();
        if (currentUser && response.data) {
          const updatedUser = { ...currentUser, ...response.data };
          this._currentUser.set(updatedUser);
          if (this.isLocalStorageAvailable()) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
          }
        }
      }),
    );
  }

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
      error: (err) => console.error('Erreur refresh user data:', err),
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.env.apiUrl}/api/user/password`, {
      current_password: currentPassword,
      password: newPassword,
    });
  }

  getToken(): string | null {
    return this._token();
  }

  hasRole(role: 'user' | 'admin'): boolean {
    if (role === 'admin') return this.isAdmin();
    return this.isLoggedIn();
  }
}
