/**
 * Store des produits avec Angular Signals
 * Gère l'état global des produits de manière réactive
 *
 * Optimisations:
 * - Computed signals pour les dérivations performantes
 * - Méthodes d'action immutables
 * - Séparation claire entre état et actions
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product, ProductFilters, PaginationMeta, ApiResponse } from '../../models/product.model';
import { map, Observable } from 'rxjs';
import { ENVIRONMENT } from '../../../core/tokens/environment.token';

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private readonly productService = inject(ProductService);

  // ==================== ÉTAT PRIVÉ (Writable Signals) ====================
  private _products = signal<Product[]>([]);
  private _currentProduct = signal<Product | null>(null);
  private _similarProducts = signal<Product[]>([]);
  private _isLoading = signal<boolean>(false);
  private _isDetailLoading = signal<boolean>(false);
  private _pagination = signal<PaginationMeta | null>(null);
  private _filters = signal<ProductFilters>({
    page: 1,
    per_page: 20,
    sort: 'recent',
  });
  private _error = signal<string | null>(null);

  // ==================== ÉTAT PUBLIC (Read-only Signals) ====================
  readonly products = this._products.asReadonly();
  readonly currentProduct = this._currentProduct.asReadonly();
  readonly similarProducts = this._similarProducts.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isDetailLoading = this._isDetailLoading.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly error = this._error.asReadonly();
  private readonly env = inject(ENVIRONMENT);

  // ==================== COMPUTED SIGNALS (Dérivations) ====================

  /**
   * Vérifie si la liste des produits est vide
   */
  readonly hasProducts = computed(() => this._products().length > 0);

  /**
   * Nombre total de pages
   */
  readonly totalPages = computed(() => this._pagination()?.last_page ?? 1);

  /**
   * Page actuelle
   */
  readonly currentPage = computed(() => this._pagination()?.current_page ?? 1);

  /**
   * Nombre total de produits
   */
  readonly totalProducts = computed(() => this._pagination()?.total ?? 0);

  /**
   * Produits populaires (filtre local si nécessaire)
   */
  readonly popularProducts = computed(() =>
    this._products()
      .filter((p) => p.populaire)
      .slice(0, 8),
  );

  /**
   * Produits en promotion (à implémenter selon besoin)
   */
  readonly onSaleProducts = computed(() =>
    this._products()
      .filter((p) => p.populaire)
      .slice(0, 4),
  );

  /**
   * Produits en rupture de stock
   */
  readonly outOfStockProducts = computed(() => this._products().filter((p) => p.stock === 0));

  /**
   * Plage de prix min/max pour les filtres
   */
  readonly priceRange = computed(() => {
    const products = this._products();
    if (products.length === 0) return { min: 0, max: 0 };

    const prices = products.map((p) => p.prix);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  });

  // ==================== ACTIONS ====================

  /**
   * Charge la liste des produits avec les filtres actuels
   */
  loadProducts(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.productService.getProducts(this._filters()).subscribe({
      next: (response: ApiResponse<Product[]>) => {
        this._products.set(response.data);
        if (response.meta) {
          this._pagination.set(response.meta);
        }
        this._isLoading.set(false);
      },
      error: (error: { message: any; }) => {
        this._error.set(error.message || 'Erreur lors du chargement des produits');
        this._isLoading.set(false);
        this._products.set([]);
      },
    });
  }

  /**
   * Charge un produit spécifique par son slug
   * @param slug - Slug unique du produit
   */
  loadProductBySlug(slug: string): void {
    this._isDetailLoading.set(true);
    this._error.set(null);

    this.productService.getProductBySlug(slug).subscribe({
      next: (response: ApiResponse<Product>) => {
        this._currentProduct.set(response.data);
        this._isDetailLoading.set(false);

        // Charge les produits similaires après le produit principal
        this.loadSimilarProducts(slug);
      },
      error: (error) => {
        this._error.set(error.message || 'Produit non trouvé');
        this._isDetailLoading.set(false);
        this._currentProduct.set(null);
      },
    });
  }

  /**
   * Charge les produits similaires
   * @param slug - Slug du produit source
   */
  loadSimilarProducts(slug: string): void {
    this.productService.getSimilarProducts(slug).subscribe({
      next: (response: ApiResponse<Product[]>) => {
        this._similarProducts.set(response.data);
      },
      error: () => {
        this._similarProducts.set([]);
      },
    });
  }

  /**
   * Met à jour les filtres et recharge les produits
   * @param filters - Nouveaux filtres
   */
  updateFilters(filters: Partial<ProductFilters>): void {
    // Utiliser Object.assign pour que les undefined remplacent les valeurs existantes
    const currentFilters = this._filters();
    const newFilters: ProductFilters = {
      page: 1, // Reset à la page 1 lors d'un changement de filtre
      per_page: currentFilters.per_page ?? 20,
      q: filters.q !== undefined ? filters.q : currentFilters.q,
      category: filters.category !== undefined ? filters.category : currentFilters.category,
      prix_min: filters.prix_min !== undefined ? filters.prix_min : currentFilters.prix_min,
      prix_max: filters.prix_max !== undefined ? filters.prix_max : currentFilters.prix_max,
      sort: filters.sort !== undefined ? filters.sort : currentFilters.sort,
      en_stock: filters.en_stock !== undefined ? filters.en_stock : currentFilters.en_stock,
    };

    this._filters.set(newFilters);
    this.loadProducts();
  }

  /**
   * Change la page courante
   * @param page - Numéro de page
   */
  changePage(page: number): void {
    if (page === this.currentPage() || page < 1 || page > this.totalPages()) {
      return;
    }

    this._filters.update((filters) => ({ ...filters, page }));
    this.loadProducts();
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this._filters.set({
      page: 1,
      per_page: 20,
      sort: 'recent',
    });
    this.loadProducts();
  }

  /**
   * Trie les produits
   * @param sort - Critère de tri
   */
  sortProducts(sort: ProductFilters['sort']): void {
    if (sort) {
      this.updateFilters({ sort });
    }
  }

  /**
   * Efface le produit courant de la mémoire
   */
  clearCurrentProduct(): void {
    this._currentProduct.set(null);
    this._similarProducts.set([]);
    this._error.set(null);
  }

  /**
   * Supprime un produit (Admin)
   * @param id - ID du produit
   */
  deleteProduct(id: number): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        // Recharge la liste après suppression
        if (this.currentPage() === 1) {
          this.loadProducts();
        } else {
          // Va à la page précédente si on était à la dernière page
          const newPage =
            this._products().length === 1
              ? Math.max(1, this.currentPage() - 1)
              : this.currentPage();
          this.updateFilters({ page: newPage });
        }
      },
      error: (error) => {
        this._error.set(error.message || 'Erreur lors de la suppression');
      },
    });
  }

  /**
   * Rafraîchit la liste des produits
   */
  refresh(): void {
    this.loadProducts();
  }

  /**
   * Invalide le cache des produits populaires
   */
  invalidateCache(): void {
    this.productService.invalidatePopularCache();
  }

  /**
   * Compte le nombre de filtres actifs
   */
  readonly activeFiltersCount = computed(() => {
    const filters = this._filters();
    let count = 0;
    if (filters.category) count++;
    if (filters.q) count++;
    if (filters.prix_min) count++;
    if (filters.prix_max) count++;
    if (filters.en_stock) count++;
    if (filters.sort && filters.sort !== 'recent') count++;
    return count;
  });

  /**
   * Vérifie si des filtres sont actifs
   */
  readonly hasActiveFilters = computed(() => this.activeFiltersCount() > 0);

  /**
   * Met à jour les filtres sans rechargement immédiat (pour debounce)
   * @param filters - Nouveaux filtres partiels
   */
  updateFiltersSilently(filters: Partial<ProductFilters>): void {
    const currentFilters = this._filters();
    const newFilters = {
      ...currentFilters,
      ...filters,
      page: 1,
    };
    this._filters.set(newFilters);
  }

  /**
   * Récupère les produits populaires depuis le service
   */
  getPopularProducts(): Observable<ApiResponse<Product[]>> {
    return this.productService.getPopularProducts();
  }

  /**
   * Récupère les produits récents depuis le service
   */
  getRecentProducts(): Observable<ApiResponse<Product[]>> {
    return this.productService.getRecentProducts();
  }

  getProductsByCategory(
    slug: string,
    params: {
      page: number;
      sort?: string;
      search?: string;
      minPrice?: number | null;
      maxPrice?: number | null;
      inStock?: boolean;
    },
  ): Observable<{
    data: Product[];
    totalPages: number;
    totalProducts: number;
    categoryName: string;
  }> {
    return this.productService
      .getPublicProducts({
        page: params.page,
        category: slug,
        sort: params.sort as ProductFilters['sort'],
        q: params.search,
        prix_min: params.minPrice ?? undefined,
        prix_max: params.maxPrice ?? undefined,
        en_stock: params.inStock,
      })
      .pipe(
        map((response) => {
          const meta = response.meta;
          // Gère le cas où total/last_page sont des tableaux (bug backend)
          const total = Array.isArray(meta?.total)
            ? (meta.total as number[])[0]
            : (meta?.total ?? 0);
          const lastPage = Array.isArray(meta?.last_page)
            ? (meta.last_page as number[])[0]
            : (meta?.last_page ?? 1);

          // Détermine le nom de la catégorie (priorité au premier produit)
          let categoryName = slug;
          if (response.data && response.data.length > 0 && response.data[0].category) {
            categoryName = response.data[0].category.nom;
          }

          return {
            data: response.data,
            totalPages: lastPage,
            totalProducts: total,
            categoryName: categoryName,
          };
        }),
      );
  }
}
