// src/app/features/categories/services/category.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { ENVIRONMENT } from '../../app.config';
import { ApiResponse, Category } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);
  private readonly apiUrl = `${this.env.apiUrl}/api`;

  // Cache public
  private categoriesCache$: Observable<ApiResponse<Category[]>> | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // ------------------- Méthodes publiques (catalogue) -------------------

  /**
   * Récupère toutes les catégories avec mise en cache
   */
 getCategories(): Observable<ApiResponse<Category[]>> {
  const now = Date.now();
  if (this.categoriesCache$ && now - this.cacheTimestamp < this.CACHE_DURATION) {
    return this.categoriesCache$;
  }
  this.categoriesCache$ = this.http
    .get<ApiResponse<Category[]>>(`${this.apiUrl}/categories/with-product-count`)
    .pipe(shareReplay(1));
  this.cacheTimestamp = Date.now();
  return this.categoriesCache$;
}

  /**
   * Récupère une catégorie par son slug (pour page catégorie)
   */
  getCategoryBySlug(slug: string): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/categories/${slug}`);
  }

  // ------------------- Méthodes Admin (CRUD) -------------------

  /**
   * Crée une nouvelle catégorie (admin)
   * @param data - Données de la catégorie (nom, description, parent_id facultatif)
   */
  createCategory(data: Partial<Category>): Observable<{ data: Category }> {
    this.invalidateCache();
    return this.http.post<{ data: Category }>(`${this.apiUrl}/admin/categories`, data);
  }

  /**
   * Met à jour une catégorie existante (admin)
   * @param id - ID de la catégorie
   * @param data - Données à mettre à jour
   */
  updateCategory(id: number, data: Partial<Category>): Observable<{ data: Category }> {
    this.invalidateCache();
    return this.http.put<{ data: Category }>(`${this.apiUrl}/admin/categories/${id}`, data);
  }

  /**
   * Supprime une catégorie (admin)
   * @param id - ID de la catégorie à supprimer
   */
  deleteCategory(id: number): Observable<{ message: string }> {
    this.invalidateCache();
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/categories/${id}`);
  }

  /**
   * Upload d'une image pour une catégorie (admin)
   * @param id - ID de la catégorie
   * @param file - Fichier image (File)
   */
  uploadCategoryImage(id: number, file: File): Observable<{ data: Category }> {
    const formData = new FormData();
    formData.append('image', file);
    this.invalidateCache();
    return this.http.post<{ data: Category }>(
      `${this.apiUrl}/admin/categories/${id}/image`,
      formData,
    );
  }

  // ------------------- Utilitaires -------------------

  /**
   * Invalide le cache des catégories (appelé après chaque modification)
   */
  invalidateCache(): void {
    this.categoriesCache$ = null;
    this.cacheTimestamp = 0;
  }
}
