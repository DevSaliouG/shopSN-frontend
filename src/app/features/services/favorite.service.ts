/**
 * Service de gestion des favoris (wishlist)
 * Permet d'ajouter/supprimer des produits des favoris
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, Product } from '../models/product.model';
import { Favorite } from '../models/user.model';
import { ENVIRONMENT } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);

  /**
   * Récupère la liste des favoris de l'utilisateur
   * @param page - Numéro de page
   * @param perPage - Nombre d'éléments par page
   */
  getFavorites(page: number = 1, perPage: number = 20): Observable<ApiResponse<Favorite[]>> {
    return this.http.get<ApiResponse<Favorite[]>>(`${this.env.apiUrl}/api/user/favorites`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString()
      }
    }).pipe(
      map(response => {
        // S'assure que chaque produit a tous les champs requis
        if (response.data) {
          response.data = response.data.map(favorite => ({
            ...favorite,
            product: this.ensureCompleteProduct(favorite.product)
          }));
        }
        return response;
      })
    );
  }

  /**
   * Ajoute un produit aux favoris
   * @param productId - ID du produit
   */
  addFavorite(productId: number): Observable<ApiResponse<Favorite>> {
    return this.http.post<ApiResponse<Favorite>>(`${this.env.apiUrl}/api/user/favorites`, {
      product_id: productId
    }).pipe(
      map(response => {
        if (response.data) {
          response.data.product = this.ensureCompleteProduct(response.data.product);
        }
        return response;
      })
    );
  }

  /**
   * Supprime un produit des favoris
   * @param productId - ID du produit
   */
  removeFavorite(productId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.env.apiUrl}/api/user/favorites/${productId}`);
  }

  /**
   * Bascule le statut favori (ajoute ou supprime)
   * @param productId - ID du produit
   */
  toggleFavorite(productId: number): Observable<ApiResponse<{ is_favorite: boolean }>> {
    return this.http.post<ApiResponse<{ is_favorite: boolean }>>(
      `${this.env.apiUrl}/api/user/favorites/toggle`,
      { product_id: productId }
    );
  }

  /**
   * Vérifie si un produit est dans les favoris
   * @param productId - ID du produit
   */
  isFavorite(productId: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.env.apiUrl}/api/user/favorites/check/${productId}`);
  }

  /**
   * Compte le nombre total de favoris
   */
  getFavoritesCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.env.apiUrl}/api/user/favorites/count`);
  }

  /**
   * Assure que l'objet produit a toutes les propriétés requises par le type Product
   * @param product - Produit partiel reçu de l'API
   */
  private ensureCompleteProduct(product: any): Product {
    return {
      id: product.id,
      category_id: product.category_id || product.category?.id || 0,
      nom: product.nom,
      slug: product.slug,
      description: product.description || '',
      description_courte: product.description_courte || null,
      prix: product.prix,
      prix_format: product.prix_format || this.formatPrice(product.prix),
      stock: product.stock ?? 10,
      statut: product.statut || 'actif',
      populaire: product.populaire || false,
      whatsapp_message: product.whatsapp_message || null,
      whatsapp_url: product.whatsapp_url || '',
      vues: product.vues || 0,
      category: product.category ? {
        id: product.category.id,
        nom: product.category.nom,
        slug: product.category.slug,
        description: null,
        image_url: null,
        created_at: '',
        updated_at: ''
      } : undefined,
      images: product.images ? product.images.map((img: any) => ({
        id: img.id,
        product_id: product.id,
        url: img.url,
        thumbnail_url: img.thumbnail_url || img.url,
        principale: img.principale || false,
        alt_text: img.alt_text || null,
        ordre: img.ordre || 0,
        created_at: '',
        updated_at: ''
      })) : [],
      main_image: product.main_image ? {
        id: product.main_image.id,
        product_id: product.id,
        url: product.main_image.url,
        thumbnail_url: product.main_image.thumbnail_url || product.main_image.url,
        principale: true,
        alt_text: product.main_image.alt_text || null,
        ordre: 0,
        created_at: '',
        updated_at: ''
      } : undefined,
      created_at: product.created_at || new Date().toISOString(),
      updated_at: product.updated_at || new Date().toISOString(),
      deleted_at: null
    };
  }

  /**
   * Formate le prix en FCFA
   */
  private formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-SN').format(price) + ' FCFA';
  }
}