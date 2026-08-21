/**
 * Service de gestion des produits
 * Communique avec l'API Laravel backend
 *
 * Optimisations:
 * - Cache avec shareReplay pour les requêtes fréquentes
 * - Gestion optimisée des paramètres HTTP
 * - Typage fort des réponses
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { ENVIRONMENT } from '../../core/tokens/environment.token';
import {
  Product,
  ProductFilters,
  ApiResponse,
  ProductStats,
  CreateProductData,
  UpdateProductData,
  ProductImage,
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);

  private popularProductsCache$: Observable<ApiResponse<Product[]>> | null = null;
  private recentProductsCache$: Observable<ApiResponse<Product[]>> | null = null;
  private popularCacheTimestamp = 0;
  private recentCacheTimestamp = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  // ==================== MÉTHODES PUBLIQUES (catalogue) ====================

  getPublicProducts(filters: ProductFilters = {}): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/products`, { params });
  }

  /**
   * Récupère la liste des produits pour l'ADMIN (exclut les supprimés)
   */
  getAdminProducts(filters: ProductFilters = {}): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/admin/products`, {
      params,
    });
  }

  /**
   * Récupère la liste des produits supprimés (soft deleted) pour l'ADMIN
   */
  getDeletedProducts(filters: ProductFilters = {}): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams();

    // Ajouter les paramètres de pagination
    if (filters.per_page) {
      params = params.set('per_page', filters.per_page.toString());
    }

    return this.http.get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/admin/products/trashed`, {
      params,
    });
  }

  /**
   * Restaure un produit supprimé (soft delete)
   */
  restoreProduct(id: number): Observable<{ data: Product }> {
    return this.http.post<{ data: Product }>(
      `${this.env.apiUrl}/api/admin/products/${id}/restore`,
      {},
    );
  }

  /**
   * Supprime définitivement un produit (hard delete)
   */
  forceDeleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.env.apiUrl}/api/admin/products/${id}/force`,
    );
  }

  /**
   * Récupère un produit par son ID (admin)
   * @param id - ID du produit
   */
  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.env.apiUrl}/api/admin/products/${id}`);
  }

  /**
   * Récupère un produit par son slug SEO-friendly
   * @param slug - Slug unique du produit
   */
  getProductBySlug(slug: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.env.apiUrl}/api/products/${slug}`);
  }

  /**
   * Récupère les produits similaires (même catégorie)
   * @param slug - Slug du produit source
   */
  getSimilarProducts(slug: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/products/${slug}/similar`);
  }

  /**
   * Récupère les produits populaires avec mise en cache
   * @param limit - Nombre de produits à récupérer (défaut: 12)
   */
  getPopularProducts(limit: number = 12): Observable<ApiResponse<Product[]>> {
    const now = Date.now();

    if (this.popularProductsCache$ && now - this.popularCacheTimestamp < this.CACHE_DURATION) {
      return this.popularProductsCache$;
    }

    this.popularProductsCache$ = this.http
      .get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/products/popular`, {
        params: new HttpParams().set('limit', limit.toString()),
      })
      .pipe(shareReplay(1));

    this.popularCacheTimestamp = now;
    return this.popularProductsCache$;
  }

  /**
   * Récupère les produits récents avec cache
   * @param limit - Nombre de produits à récupérer (défaut: 12)
   * @param days - Période en jours (défaut: 30)
   */
  getRecentProducts(limit: number = 12, days: number = 30): Observable<ApiResponse<Product[]>> {
    const now = Date.now();

    if (this.recentProductsCache$ && now - this.recentCacheTimestamp < this.CACHE_DURATION) {
      return this.recentProductsCache$;
    }

    this.recentProductsCache$ = this.http
      .get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/products/recent`, {
        params: new HttpParams().set('limit', limit.toString()).set('days', days.toString()),
      })
      .pipe(shareReplay(1));

    this.recentCacheTimestamp = now;
    return this.recentProductsCache$;
  }

  /**
   * Recherche full-text avec filtres avancés
   * @param query - Terme de recherche
   * @param filters - Filtres additionnels
   */
  searchProducts(query: string, filters: ProductFilters = {}): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams().set('q', query);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/search`, { params });
  }

  /**
   * Recherche rapide pour l'autocomplétion (limité à 5 résultats)
   * @param query - Terme de recherche
   */
  quickSearch(query: string): Observable<ApiResponse<Product[]>> {
    const params = new HttpParams()
      .set('q', query)
      .set('per_page', '5')
      .set('statut', 'actif');

    return this.http.get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/search`, { params });
  }

  /**
   * Récupère les produits par catégorie
   * @param categorySlug - Slug de la catégorie
   * @param page - Numéro de page
   */
  getProductsByCategory(
    categorySlug: string,
    page: number = 1,
  ): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(
      `${this.env.apiUrl}/api/categories/${categorySlug}/products`,
      { params: new HttpParams().set('page', page.toString()) },
    );
  }

  // ==================== ADMIN CRUD ====================

  /**
   * Crée un nouveau produit (Admin uniquement)
   * @param data - Données du produit à créer
   */
  createProduct(data: CreateProductData): Observable<{ data: Product }> {
    return this.http.post<{ data: Product }>(`${this.env.apiUrl}/api/admin/products`, data);
  }

  /**
   * Met à jour un produit existant
   * @param data - Données à mettre à jour
   */
  updateProduct(data: UpdateProductData): Observable<{ data: Product }> {
    const { id, ...updateData } = data;
    return this.http.put<{ data: Product }>(
      `${this.env.apiUrl}/api/admin/products/${id}`,
      updateData,
    );
  }

  /**
   * Supprime un produit (soft delete)
   * @param id - ID du produit
   */
  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.env.apiUrl}/api/admin/products/${id}`);
  }

  /**
   * Bascule le statut actif/inactif d'un produit
   * @param id - ID du produit
   */
  toggleProductStatus(id: number): Observable<{ data: Product }> {
    return this.http.patch<{ data: Product }>(
      `${this.env.apiUrl}/api/admin/products/${id}/toggle`,
      {},
    );
  }


  /**
   * Supprime une image de produit
   * @param productId - ID du produit
   * @param imageId - ID de l'image
   */
  deleteImage(productId: number, imageId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.env.apiUrl}/api/admin/products/${productId}/images/${imageId}`,
    );
  }

  /**
   * Réordonne les images d'un produit
   * @param productId - ID du produit
   * @param imageIds - Tableau des IDs dans l'ordre souhaité
   */
  reorderImages(productId: number, imageIds: number[]): Observable<{ data: ProductImage[] }> {
    return this.http.post<{ data: ProductImage[] }>(
      `${this.env.apiUrl}/api/admin/products/${productId}/images/reorder`,
      { images: imageIds },
    );
  }

  /**
   * Définit une image comme principale
   * @param productId - ID du produit
   * @param imageId - ID de l'image
   */
  setMainImage(productId: number, imageId: number): Observable<{ data: ProductImage }> {
    return this.http.patch<{ data: ProductImage }>(
      `${this.env.apiUrl}/api/admin/products/${productId}/images/${imageId}/main`,
      {},
    );
  }

  /**
   * Récupère les statistiques des produits (Admin)
   */
  getProductStats(): Observable<{ data: ProductStats }> {
    return this.http.get<{ data: ProductStats }>(`${this.env.apiUrl}/api/admin/products/stats`);
  }

  /**
   * Invalide le cache des produits populaires
   */
  invalidatePopularCache(): void {
    this.popularProductsCache$ = null;
    this.popularCacheTimestamp = 0;
  }

  /**
   * Invalide le cache des produits récents
   */
  invalidateRecentCache(): void {
    this.recentProductsCache$ = null;
    this.recentCacheTimestamp = 0;
  }

  /**
   * Invalide tous les caches
   */
  invalidateAllCaches(): void {
    this.invalidatePopularCache();
    this.invalidateRecentCache();
  }

  /**
   * Récupère la liste paginée des produits
   */
  getProducts(filters: ProductFilters = {}): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/products`, { params });
  }

  uploadImages(productId: number, files: FormData): Observable<{ data: ProductImage[] }> {
    return this.http.post<{ data: ProductImage[] }>(
      `${this.env.apiUrl}/api/admin/products/${productId}/images`,
      files,
    );
  }

  /**
   * Créer un produit avec image (FormData)
   */
  createProductWithImage(formData: FormData): Observable<{ data: Product }> {
    return this.http.post<{ data: Product }>(
      `${this.env.apiUrl}/api/admin/products`,
      formData
    );
  }

  /**
   * Mettre à jour un produit avec image (FormData)
   * Utilise POST avec _method=PUT pour supporter FormData
   */
  updateProductWithImage(id: number, formData: FormData): Observable<{ data: Product }> {
    // Laravel supporte _method pour simuler PUT avec FormData
    formData.append('_method', 'PUT');

    return this.http.post<{ data: Product }>(
      `${this.env.apiUrl}/api/admin/products/${id}`,
      formData
    );
  }
}
