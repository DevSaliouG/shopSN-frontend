/**
 * Service de cache global pour optimiser les performances
 * Implémente un cache en mémoire avec TTL (Time To Live)
 *
 * Fonctionnalités:
 * - Cache avec expiration automatique
 * - Invalidation manuelle
 * - Cache par clé
 * - Compatible SSR (vérification platformId)
 */

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, shareReplay, tap } from 'rxjs';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly platformId = inject(PLATFORM_ID);
  private cache = new Map<string, CacheEntry<any>>();
  private observableCache = new Map<string, Observable<any>>();

  // TTL par défaut : 5 minutes
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Vérifier si le cache a expiré
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Définit une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Vérifie si une clé existe et est valide
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalide une entrée du cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.observableCache.delete(key);
  }

  /**
   * Invalide toutes les entrées correspondant à un pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);

    // Invalider le cache de données
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }

    // Invalider le cache d'observables
    for (const key of this.observableCache.keys()) {
      if (regex.test(key)) {
        this.observableCache.delete(key);
      }
    }
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
    this.observableCache.clear();
  }

  /**
   * Obtient la taille du cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Wrap un Observable avec cache automatique
   * Utilise shareReplay pour éviter les requêtes multiples
   */
  wrapObservable<T>(
    key: string,
    observableFactory: () => Observable<T>,
    ttl: number = this.DEFAULT_TTL
  ): Observable<T> {
    // Vérifier si on a un cache valide
    const cached = this.get<T>(key);
    if (cached !== null) {
      return of(cached);
    }

    // Vérifier si on a déjà un Observable en cours
    const cachedObservable = this.observableCache.get(key);
    if (cachedObservable) {
      return cachedObservable;
    }

    // Créer un nouvel Observable avec cache
    const observable$ = observableFactory().pipe(
      tap(data => {
        this.set(key, data, ttl);
        this.observableCache.delete(key);
      }),
      shareReplay(1)
    );

    // Mettre en cache l'Observable
    this.observableCache.set(key, observable$);

    return observable$;
  }

  /**
   * Nettoie les entrées expirées (garbage collection)
   */
  cleanExpired(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * Obtient des statistiques sur le cache
   */
  getStats(): {
    size: number;
    keys: string[];
    expired: number;
  } {
    const now = Date.now();
    let expired = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      expired
    };
  }
}
