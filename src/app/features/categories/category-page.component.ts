import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, map } from 'rxjs';

import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProductCardComponent } from '../products/components/product-card/product-card.component';
import { ProductFiltersComponent } from '../products/components/product-filters/product-filters.component';
import { ProductStore } from '../products/store/product.store';
import { Product, ProductFilters } from '../models/product.model';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ProductCardComponent,
    ProductFiltersComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected productStore = inject(ProductStore);

  readonly slug = signal<string>('');
  readonly categoryName = signal<string>('');
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly products = signal<Product[]>([]);
  readonly totalProductsCount = signal(0);

  readonly filters = signal<ProductFilters>({
    q: '',
    prix_min: undefined,
    prix_max: undefined,
    sort: undefined,
    en_stock: false
  });

  // Les valeurs de l'option "Par défaut" est une chaîne vide (pour le select HTML).
  // Le composant convertira cette chaîne vide en undefined dans onSortChange.
  readonly sortOptions = [
    { value: '', label: 'Par défaut' },
    { value: 'prix_asc', label: 'Prix croissant' },
    { value: 'prix_desc', label: 'Prix décroissant' },
    { value: 'recent', label: 'Plus récents' }
  ];

  readonly hasProducts = computed(() => this.products().length > 0);

  private destroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      const slug = this.slug();
      if (slug) {
        this.loadCategoryAndProducts();
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(params => params.get('slug') ?? ''),
        takeUntil(this.destroy$)
      )
      .subscribe(slug => {
        // Réinitialiser les filtres et la page quand on change de catégorie
        this.filters.set({
          q: '',
          prix_min: undefined,
          prix_max: undefined,
          sort: undefined,
          en_stock: false
        });
        this.currentPage.set(1);
        this.slug.set(slug);
      });
  }

  private loadCategoryAndProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const f = this.filters();
    this.productStore
      .getProductsByCategory(this.slug(), {
        page: this.currentPage(),
        sort: f.sort,            // undefined ou l'une des valeurs autorisées
        search: f.q,
        minPrice: f.prix_min,
        maxPrice: f.prix_max,
        inStock: f.en_stock
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.products.set(response.data);
          this.totalPages.set(response.totalPages);
          this.totalProductsCount.set(response.totalProducts);
          this.categoryName.set(response.categoryName);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Impossible de charger les produits de cette catégorie.');
          this.isLoading.set(false);
          console.error(err);
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadCategoryAndProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    // Convertit la chaîne vide (option par défaut) en undefined
    const value = select.value === '' ? undefined : select.value as ProductFilters['sort'];
    this.filters.update(f => ({ ...f, sort: value }));
    this.currentPage.set(1);
    this.loadCategoryAndProducts();
  }

  applyFilters(newFilters: ProductFilters): void {
    // Remplacer complètement les filtres au lieu de les fusionner
    // pour que les valeurs undefined/false remplacent bien les anciennes valeurs
    this.filters.set({
      q: newFilters.q ?? '',
      prix_min: newFilters.prix_min,
      prix_max: newFilters.prix_max,
      sort: newFilters.sort,
      en_stock: newFilters.en_stock ?? false
    });
    this.currentPage.set(1);
    this.loadCategoryAndProducts();
  }

  changeViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  refresh(): void {
    this.loadCategoryAndProducts();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalProducts(): number {
    return this.totalProductsCount();
  }

  isLargeScreen(): boolean {
    return window.innerWidth >= 1024;
  }

  showFilters = signal(false);

  toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  closeFilters(): void {
    this.showFilters.set(false);
  }

  shouldShowFilters(): boolean {
    return this.isLargeScreen() || this.showFilters();
  }
}