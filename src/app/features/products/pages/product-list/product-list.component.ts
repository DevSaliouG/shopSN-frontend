/**
 * Page de liste des produits (catalogue)
 * Affiche la grille de produits avec filtres et pagination
 */

import { Component, inject, OnInit, OnDestroy, signal, HostListener, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { ProductStore } from '../../store/product.store';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductFiltersComponent } from '../../components/product-filters/product-filters.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ProductFilters } from '../../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    ProductFiltersComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit, OnDestroy {
  protected readonly productStore = inject(ProductStore);
  private readonly platformId = inject(PLATFORM_ID);
  
  // État local
  showFilters = signal<boolean>(false);
  viewMode = signal<'grid' | 'list'>('grid');
  private destroy$ = new Subject<void>();
  
  // Expose les signaux du store au template
  readonly products = this.productStore.products;
  readonly isLoading = this.productStore.isLoading;
  readonly pagination = this.productStore.pagination;
  readonly filters = this.productStore.filters;
  readonly error = this.productStore.error;
  readonly hasProducts = this.productStore.hasProducts;
  readonly totalProducts = this.productStore.totalProducts;

  // Options de tri disponibles
  sortOptions = [
    { value: 'recent', label: 'Plus récents' },
    { value: 'prix_asc', label: 'Prix croissant' },
    { value: 'prix_desc', label: 'Prix décroissant' },
    { value: 'populaire', label: 'Plus populaires' }
  ];

  ngOnInit(): void {
    // Charge les produits au démarrage
    this.productStore.loadProducts();
    
    // Restaure le mode d'affichage sauvegardé (seulement dans le navigateur)
    if (isPlatformBrowser(this.platformId)) {
      const savedMode = localStorage.getItem('product_view_mode') as 'grid' | 'list';
      if (savedMode && (savedMode === 'grid' || savedMode === 'list')) {
        this.viewMode.set(savedMode);
      }
      
      // Vérifie la taille d'écran au chargement
      this.checkScreenSize();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Vérifie la taille initiale de l'écran
   */
  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isLargeScreen()) {
        this.showFilters.set(true);
      } else {
        this.showFilters.set(false);
      }
    }
  }

  /**
   * Vérifie si l'écran est large (>= 1024px)
   * Version compatible SSR
   */
  isLargeScreen(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth >= 1024;
    }
    // En SSR, on suppose que l'écran est large (desktop par défaut)
    return true;
  }

  /**
   * Écoute les changements de redimensionnement
   */
  @HostListener('window:resize')
  onResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isLargeScreen() && !this.showFilters()) {
        // Optionnel: réafficher les filtres
      } else if (!this.isLargeScreen() && this.showFilters()) {
        this.showFilters.set(false);
      }
    }
  }

  /**
   * Vérifie si les filtres doivent être affichés
   */
  shouldShowFilters(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return this.showFilters() || this.isLargeScreen();
    }
    // En SSR, afficher les filtres par défaut
    return true;
  }

  /**
   * Change la page courante
   */
  onPageChange(page: number): void {
    if (isNaN(page) || page < 1) {
      return;
    }
    this.productStore.changePage(page);
    
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Change l'option de tri
   */
  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const sort = select.value as ProductFilters['sort'];
    
    if (sort && sort !== this.filters().sort) {
      this.productStore.sortProducts(sort);
    }
  }

  /**
   * Bascule l'affichage des filtres sur mobile
   */
  toggleFilters(): void {
    this.showFilters.update(value => !value);
  }

  /**
   * Ferme les filtres
   */
  closeFilters(): void {
    if (isPlatformBrowser(this.platformId) && !this.isLargeScreen()) {
      this.showFilters.set(false);
    }
  }

  /**
   * Change le mode d'affichage
   */
  changeViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('product_view_mode', mode);
    }
  }

  /**
   * Rafraîchit la liste
   */
  refresh(): void {
    this.productStore.refresh();
  }

  /**
   * Scroll en haut
   */
  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Applique les filtres
   */
  applyFilters(filters: ProductFilters): void {
    this.productStore.updateFilters(filters);
    this.closeFilters();
  }

  /**
   * Retourne le nombre total de pages
   */
  totalPages(): number {
    return this.productStore.totalPages();
  }

  /**
   * Retourne la page courante
   */
  currentPage(): number {
    return this.productStore.currentPage();
  }
}