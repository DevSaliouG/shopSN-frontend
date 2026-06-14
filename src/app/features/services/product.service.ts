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
import { Observable, of, shareReplay, tap } from 'rxjs';
import { ENVIRONMENT } from '../../app.config';
import {
  Product,
  ProductFilters,
  ApiResponse,
  ProductStats,
  CreateProductData,
  UpdateProductData,
  ProductImage
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);

  // Cache pour les produits populaires (invalide après 5 minutes)
  private popularProductsCache$: Observable<ApiResponse<Product[]>> | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Récupère la liste paginée des produits avec filtres
   * @param filters - Critères de filtrage et pagination
   */
  getProducts(filters: ProductFilters = {}): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams();
    
    // Construction des paramètres de requête
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Product[]>>(
      `${this.env.apiUrl}/api/products`,
      { params }
    );
  }

  /**
   * Récupère un produit par son slug SEO-friendly
   * @param slug - Slug unique du produit
   */
  getProductBySlug(slug: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(
      `${this.env.apiUrl}/api/products/${slug}`
    );
  }

  /**
   * Récupère les produits similaires (même catégorie)
   * @param slug - Slug du produit source
   */
  getSimilarProducts(slug: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(
      `${this.env.apiUrl}/api/products/${slug}/similar`
    );
  }

  /**
   * Récupère les produits populaires avec mise en cache
   * @param limit - Nombre de produits à récupérer (défaut: 12)
   */
  getPopularProducts(limit: number = 12): Observable<ApiResponse<Product[]>> {
    const now = Date.now();
    
    // Vérification du cache
    if (this.popularProductsCache$ && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.popularProductsCache$;
    }

    // Nouvelle requête avec cache
    this.popularProductsCache$ = this.http.get<ApiResponse<Product[]>>(
      `${this.env.apiUrl}/api/products/popular`,
      { params: new HttpParams().set('limit', limit.toString()) }
    ).pipe(shareReplay(1));
    
    this.cacheTimestamp = now;
    return this.popularProductsCache$;
  }

  /**
   * Récupère les produits récents
   * @param limit - Nombre de produits à récupérer (défaut: 12)
   * @param days - Période en jours (défaut: 30)
   */
  getRecentProducts(limit: number = 12, days: number = 30): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(
      `${this.env.apiUrl}/api/products/recent`,
      {
        params: new HttpParams()
          .set('limit', limit.toString())
          .set('days', days.toString())
      }
    );
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

    return this.http.get<ApiResponse<Product[]>>(
      `${this.env.apiUrl}/api/search`,
      { params }
    );
  }

  /**
   * Récupère les produits par catégorie
   * @param categorySlug - Slug de la catégorie
   * @param page - Numéro de page
   */
  getProductsByCategory(categorySlug: string, page: number = 1): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(
      `${this.env.apiUrl}/api/categories/${categorySlug}/products`,
      { params: new HttpParams().set('page', page.toString()) }
    );
  }

  // ==================== ADMIN CRUD ====================

  /**
   * Crée un nouveau produit (Admin uniquement)
   * @param data - Données du produit à créer
   */
  createProduct(data: CreateProductData): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(
      `${this.env.apiUrl}/api/admin/products`,
      data
    );
  }

  /**
   * Met à jour un produit existant
   * @param id - ID du produit
   * @param data - Données à mettre à jour
   */
  updateProduct(id: number, data: UpdateProductData): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(
      `${this.env.apiUrl}/api/admin/products/${id}`,
      data
    );
  }

  /**
   * Supprime un produit (soft delete)
   * @param id - ID du produit
   */
  deleteProduct(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.env.apiUrl}/api/admin/products/${id}`
    );
  }

  /**
   * Bascule le statut actif/inactif d'un produit
   * @param id - ID du produit
   */
  toggleProductStatus(id: number): Observable<ApiResponse<Product>> {
    return this.http.patch<ApiResponse<Product>>(
      `${this.env.apiUrl}/api/admin/products/${id}/toggle`,
      {}
    );
  }

  /**
   * Upload d'images pour un produit
   * @param productId - ID du produit
   * @param files - FormData contenant les fichiers images
   */
  uploadImages(productId: number, files: FormData): Observable<ApiResponse<ProductImage[]>> {
    return this.http.post<ApiResponse<ProductImage[]>>(
      `${this.env.apiUrl}/api/admin/products/${productId}/images`,
      files
    );
  }

  /**
   * Supprime une image de produit
   * @param productId - ID du produit
   * @param imageId - ID de l'image
   */
  deleteImage(productId: number, imageId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.env.apiUrl}/api/admin/products/${productId}/images/${imageId}`
    );
  }

  /**
   * Réordonne les images d'un produit
   * @param productId - ID du produit
   * @param imageIds - Tableau des IDs dans l'ordre souhaité
   */
  reorderImages(productId: number, imageIds: number[]): Observable<ApiResponse<ProductImage[]>> {
    return this.http.post<ApiResponse<ProductImage[]>>(
      `${this.env.apiUrl}/api/admin/products/${productId}/images/reorder`,
      { images: imageIds }
    );
  }

  /**
   * Définit une image comme principale
   * @param productId - ID du produit
   * @param imageId - ID de l'image
   */
  setMainImage(productId: number, imageId: number): Observable<ApiResponse<ProductImage>> {
    return this.http.post<ApiResponse<ProductImage>>(
      `${this.env.apiUrl}/api/admin/products/${productId}/images/${imageId}/main`,
      {}
    );
  }

  /**
   * Récupère les statistiques des produits (Admin)
   */
  getProductStats(): Observable<ApiResponse<ProductStats>> {
    return this.http.get<ApiResponse<ProductStats>>(
      `${this.env.apiUrl}/api/admin/products/stats`
    );
  }

  /**
   * Invalide le cache des produits populaires
   */
  invalidatePopularCache(): void {
    this.popularProductsCache$ = null;
    this.cacheTimestamp = 0;
  }
}
