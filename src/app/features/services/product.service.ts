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
import { ENVIRONMENT } from '../../app.config';
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
  private cacheTimestamp = 0;
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

    console.log('📤 getDeletedProducts - URL:', `${this.env.apiUrl}/api/admin/products/trashed`);
    return this.http.get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/admin/products/trashed`, {
      params,
    });
  }

  /**
   * Restaure un produit supprimé (soft delete)
   */
  restoreProduct(id: number): Observable<{ data: Product }> {
    console.log('📤 restoreProduct - URL:', `${this.env.apiUrl}/api/admin/products/${id}/restore`);
    return this.http.post<{ data: Product }>(
      `${this.env.apiUrl}/api/admin/products/${id}/restore`,
      {},
    );
  }

  /**
   * Supprime définitivement un produit (hard delete)
   */
  forceDeleteProduct(id: number): Observable<{ message: string }> {
    console.log(
      '📤 forceDeleteProduct - URL:',
      `${this.env.apiUrl}/api/admin/products/${id}/force`,
    );
    return this.http.delete<{ message: string }>(
      `${this.env.apiUrl}/api/admin/products/${id}/force`,
    );
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

    if (this.popularProductsCache$ && now - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.popularProductsCache$;
    }

    this.popularProductsCache$ = this.http
      .get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/products/popular`, {
        params: new HttpParams().set('limit', limit.toString()),
      })
      .pipe(shareReplay(1));

    this.cacheTimestamp = now;
    return this.popularProductsCache$;
  }

  /**
   * Récupère les produits récents
   * @param limit - Nombre de produits à récupérer (défaut: 12)
   * @param days - Période en jours (défaut: 30)
   */
  getRecentProducts(limit: number = 12, days: number = 30): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.env.apiUrl}/api/products/recent`, {
      params: new HttpParams().set('limit', limit.toString()).set('days', days.toString()),
    });
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
    console.log('📤 createProduct - URL:', `${this.env.apiUrl}/api/admin/products`);
    console.log('📤 createProduct - Data:', data);
    return this.http.post<{ data: Product }>(`${this.env.apiUrl}/api/admin/products`, data);
  }

  /**
   * Met à jour un produit existant
   * @param data - Données à mettre à jour
   */
  updateProduct(data: UpdateProductData): Observable<{ data: Product }> {
    const { id, ...updateData } = data;
    console.log('📤 updateProduct - URL:', `${this.env.apiUrl}/api/admin/products/${id}`);
    console.log('📤 updateProduct - Data:', updateData);
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
    console.log('📤 deleteProduct - URL:', `${this.env.apiUrl}/api/admin/products/${id}`);
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
    return this.http.post<{ data: ProductImage }>(
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
    this.cacheTimestamp = 0;
  }

  // product.service.ts - Ajoutez cette méthode
  /**
   * Récupère la liste paginée des produits pour l'ADMIN
   * @param filters - Critères de filtrage et pagination
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

  /**
   * Upload d'images pour un produit
   * @param productId - ID du produit
   * @param files - FormData contenant les fichiers images
   */
  uploadImages(productId: number, files: FormData): Observable<{ data: ProductImage[] }> {
    // ✅ Vérifier le contenu du FormData avant l'envoi
    console.log(
      '📤 uploadImages - URL:',
      `${this.env.apiUrl}/api/admin/products/${productId}/images`,
    );
    console.log('📤 uploadImages - FormData entries:');
    for (const pair of files.entries()) {
      console.log(
        `   ${pair[0]}:`,
        pair[1] instanceof File ? `${pair[1].name} (${pair[1].size} bytes)` : pair[1],
      );
    }

    // ✅ S'assurer que le header Content-Type n'est pas défini manuellement
    // Angular le gère automatiquement avec FormData
    return this.http.post<{ data: ProductImage[] }>(
      `${this.env.apiUrl}/api/admin/products/${productId}/images`,
      files,
    );
  }
}
