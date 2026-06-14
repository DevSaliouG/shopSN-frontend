/**
 * Service de gestion des catégories
 * Récupère les catégories depuis l'API
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { ENVIRONMENT } from '../../app.config';
import { ApiResponse, Category } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);

  private categoriesCache$: Observable<ApiResponse<Category[]>> | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /**
   * Récupère toutes les catégories avec mise en cache
   */
  getCategories(): Observable<ApiResponse<Category[]>> {
    const now = Date.now();

    if (this.categoriesCache$ && now - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.categoriesCache$;
    }

    this.categoriesCache$ = this.http
      .get<ApiResponse<Category[]>>(`${this.env.apiUrl}/api/categories`)
      .pipe(shareReplay(1));
    this.cacheTimestamp = Date.now();
    return this.categoriesCache$;
  }

  /**
   * Récupère une catégorie par son slug
   */
  getCategoryBySlug(slug: string): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.env.apiUrl}/api/categories/${slug}`);
  }

  /**
   * Invalide le cache des catégories
   */
  invalidateCache(): void {
    this.categoriesCache$ = null;
    this.cacheTimestamp = 0;
  }
}
