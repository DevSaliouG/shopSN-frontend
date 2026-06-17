// src/app/core/services/storage.service.ts
import { Injectable, inject } from '@angular/core';
import { ENVIRONMENT } from '../tokens/environment.token';
import { User } from '../../features/models/auth.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly env = inject(ENVIRONMENT);
  private readonly tokenKey: string;
  private readonly userKey: string;

  constructor() {
    this.tokenKey = this.env.jwtTokenKey || 'shopSN_token';
    this.userKey = this.env.userStorageKey || 'shopSN_user';
  }

  /**
   * Sauvegarde le token JWT
   */
  setToken(token: string): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Récupère le token JWT
   */
  getToken(): string | null {
    if (!this.isLocalStorageAvailable()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Supprime le token JWT
   */
  removeToken(): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Sauvegarde les données utilisateur
   */
  setUser(user: User): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Récupère les données utilisateur
   */
  getUser(): User | null {
    if (!this.isLocalStorageAvailable()) return null;
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Supprime les données utilisateur
   */
  removeUser(): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.removeItem(this.userKey);
  }

  /**
   * Nettoie toutes les données de session (token + user)
   */
  clearAll(): void {
    this.removeToken();
    this.removeUser();
  }

  /**
   * Vérifie si localStorage est disponible (SSR compatibilité)
   */
  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Vérifie si un token est présent
   */
  hasToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Récupère l'utilisateur sauvegardé avec typage strict
   */
  getStoredUser(): User | null {
    return this.getUser();
  }

  /**
   * Sauvegarde un token avec une date d'expiration (optionnel)
   */
  setTokenWithExpiry(token: string, expiresInSeconds: number): void {
    this.setToken(token);
    const expiry = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem(`${this.tokenKey}_expiry`, String(expiry));
  }

  /**
   * Vérifie si le token est expiré
   */
  isTokenExpired(): boolean {
    if (!this.isLocalStorageAvailable()) return true;
    const expiry = localStorage.getItem(`${this.tokenKey}_expiry`);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry, 10);
  }
}