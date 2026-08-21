/**
 * Composant Product Filters
 * Système de filtrage avancé pour les produits
 *
 * Fonctionnalités:
 * - Range slider pour les prix avec double curseur
 * - Filtres multi-sélection avec chips
 * - Recherche dans les filtres
 * - Compteur de résultats par filtre
 * - Reset filters button
 * - Animations fluides
 */

import { Component, input, output, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface FilterCategory {
  id: string;
  name: string;
  count: number;
  selected: boolean;
}

export interface FilterBrand {
  id: string;
  name: string;
  count: number;
  selected: boolean;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface FiltersState {
  categories: string[];
  brands: string[];
  priceRange: PriceRange;
  inStock: boolean;
}

@Component({
  selector: 'app-product-filters',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('chipAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0', opacity: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', opacity: '1' })),
      transition('collapsed <=> expanded', animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class ProductFilters {
  // Inputs
  categories = input<FilterCategory[]>([]);
  brands = input<FilterBrand[]>([]);
  minPrice = input<number>(0);
  maxPrice = input<number>(1000000);
  totalProducts = input<number>(0);

  // Outputs
  filtersChanged = output<FiltersState>();
  filtersReset = output<void>();

  // Signals pour l'état local
  selectedCategories = signal<string[]>([]);
  selectedBrands = signal<string[]>([]);
  currentPriceMin = signal<number>(0);
  currentPriceMax = signal<number>(1000000);
  inStockOnly = signal<boolean>(false);
  categorySearch = signal<string>('');
  brandSearch = signal<string>('');

  // Section expansion states
  categoriesExpanded = signal<boolean>(true);
  brandsExpanded = signal<boolean>(true);
  priceExpanded = signal<boolean>(true);

  // Computed
  readonly filteredCategories = computed(() => {
    const search = this.categorySearch().toLowerCase();
    return this.categories().filter(cat =>
      cat.name.toLowerCase().includes(search)
    );
  });

  readonly filteredBrands = computed(() => {
    const search = this.brandSearch().toLowerCase();
    return this.brands().filter(brand =>
      brand.name.toLowerCase().includes(search)
    );
  });

  readonly activeFiltersCount = computed(() => {
    return this.selectedCategories().length +
           this.selectedBrands().length +
           (this.inStockOnly() ? 1 : 0) +
           (this.currentPriceMin() > this.minPrice() || this.currentPriceMax() < this.maxPrice() ? 1 : 0);
  });

  readonly hasActiveFilters = computed(() => this.activeFiltersCount() > 0);

  readonly priceRangeText = computed(() => {
    const min = this.formatPrice(this.currentPriceMin());
    const max = this.formatPrice(this.currentPriceMax());
    return `${min} - ${max}`;
  });

  constructor() {
    // Synchroniser les prix initiaux
    effect(() => {
      this.currentPriceMin.set(this.minPrice());
      this.currentPriceMax.set(this.maxPrice());
    }, { allowSignalWrites: true });

    // Émettre les changements de filtres
    effect(() => {
      const state: FiltersState = {
        categories: this.selectedCategories(),
        brands: this.selectedBrands(),
        priceRange: {
          min: this.currentPriceMin(),
          max: this.currentPriceMax()
        },
        inStock: this.inStockOnly()
      };
      this.filtersChanged.emit(state);
    });
  }

  /**
   * Toggle category selection
   */
  toggleCategory(categoryId: string) {
    this.selectedCategories.update(cats => {
      const index = cats.indexOf(categoryId);
      if (index > -1) {
        return cats.filter(id => id !== categoryId);
      } else {
        return [...cats, categoryId];
      }
    });
  }

  /**
   * Toggle brand selection
   */
  toggleBrand(brandId: string) {
    this.selectedBrands.update(brands => {
      const index = brands.indexOf(brandId);
      if (index > -1) {
        return brands.filter(id => id !== brandId);
      } else {
        return [...brands, brandId];
      }
    });
  }

  /**
   * Remove specific category chip
   */
  removeCategory(categoryId: string) {
    this.toggleCategory(categoryId);
  }

  /**
   * Remove specific brand chip
   */
  removeBrand(brandId: string) {
    this.toggleBrand(brandId);
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    this.selectedCategories.set([]);
    this.selectedBrands.set([]);
    this.currentPriceMin.set(this.minPrice());
    this.currentPriceMax.set(this.maxPrice());
    this.inStockOnly.set(false);
    this.categorySearch.set('');
    this.brandSearch.set('');
    this.filtersReset.emit();
  }

  /**
   * Toggle section expansion
   */
  toggleSection(section: 'categories' | 'brands' | 'price') {
    if (section === 'categories') {
      this.categoriesExpanded.update(v => !v);
    } else if (section === 'brands') {
      this.brandsExpanded.update(v => !v);
    } else if (section === 'price') {
      this.priceExpanded.update(v => !v);
    }
  }

  /**
   * Handle price range changes
   */
  onPriceMinChange(value: number) {
    if (value <= this.currentPriceMax()) {
      this.currentPriceMin.set(value);
    }
  }

  onPriceMaxChange(value: number) {
    if (value >= this.currentPriceMin()) {
      this.currentPriceMax.set(value);
    }
  }

  /**
   * Format price
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  /**
   * Get category name by id
   */
  getCategoryName(id: string): string {
    return this.categories().find(c => c.id === id)?.name || id;
  }

  /**
   * Get brand name by id
   */
  getBrandName(id: string): string {
    return this.brands().find(b => b.id === id)?.name || id;
  }
}
