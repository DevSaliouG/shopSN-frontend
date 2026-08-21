/**
 * Composant de filtres pour les produits
 * Permet aux utilisateurs de filtrer le catalogue par catégorie, prix, stock, etc.
 */

import { Component, inject, output, input, OnInit, OnDestroy, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CategoryService } from '../../../services/category.service';
import { Category, ProductFilters } from '../../../models/product.model';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-filters.component.html',
  styleUrls: ['./product-filters.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFiltersComponent implements OnInit, OnDestroy {
  private readonly categoryService = inject(CategoryService);
  
  // Inputs - Utilisation du type ProductFilters cohérent
  currentFilters  = input<ProductFilters>({});
  isMobile = input<boolean>(false);
  
  // Output - Émet le même type ProductFilters
  filtersChange = output<ProductFilters>();
  
  // État local
  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(false);
  
  // Valeurs des filtres
  selectedCategory = signal<string>('');
  prixMin = signal<number | null>(null);
  prixMax = signal<number | null>(null);
  enStockOnly = signal<boolean>(false);
  
  // Prix slider
  sliderMin = signal<number>(0);
  sliderMax = signal<number>(1000000);
  sliderValue = signal<{ min: number; max: number }>({ min: 0, max: 1000000 });
  
  // Debounce
  private prixMinSubject = new Subject<number | null>();
  private prixMaxSubject = new Subject<number | null>();
  private destroy$ = new Subject<void>();
  
  // Prix formatés
  readonly formattedPrixMin = computed(() => {
    const value = this.prixMin();
    return value ? this.formatPrice(value) : 'Min';
  });
  
  readonly formattedPrixMax = computed(() => {
    const value = this.prixMax();
    return value ? this.formatPrice(value) : 'Max';
  });
  
  // Nombre de filtres actifs
  readonly activeFiltersCount = computed(() => {
    let count = 0;
    if (this.selectedCategory()) count++;
    if (this.prixMin()) count++;
    if (this.prixMax()) count++;
    if (this.enStockOnly()) count++;
    return count;
  });
  
  ngOnInit(): void {
    this.loadCategories();
    this.initPriceDebounce();
    this.syncWithCurrentFilters();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Charge la liste des catégories
   */
  private loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
  
  /**
   * Initialise le debounce pour les prix
   */
  private initPriceDebounce(): void {
    this.prixMinSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.prixMin.set(value);
      this.emitFiltersChange();
    });
    
    this.prixMaxSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.prixMax.set(value);
      this.emitFiltersChange();
    });
  }
  
  /**
   * Synchronise les filtres avec les valeurs actuelles
   */
  private syncWithCurrentFilters(): void {
    const filters = this.currentFilters();
    
    if (filters.category) {
      this.selectedCategory.set(filters.category);
    }
    
    if (filters.prix_min) {
      this.prixMin.set(filters.prix_min);
      this.sliderValue.update(v => ({ ...v, min: filters.prix_min! }));
    }
    
    if (filters.prix_max) {
      this.prixMax.set(filters.prix_max);
      this.sliderValue.update(v => ({ ...v, max: filters.prix_max! }));
    }
    
    if (filters.en_stock) {
      this.enStockOnly.set(filters.en_stock);
    }
  }
  
  /**
   * Émet les changements de filtres avec le type ProductFilters correct
   */
  protected emitFiltersChange(): void {
    const filters: ProductFilters = {
      page: 1, // Reset à la page 1 quand les filtres changent
      per_page: 20,
      category: this.selectedCategory() || undefined,
      prix_min: this.prixMin() || undefined,
      prix_max: this.prixMax() || undefined,
      en_stock: this.enStockOnly(),
      q: '', // Réinitialiser la recherche aussi
    };

    // Préserve le tri actuel si présent
    const currentSort = this.currentFilters().sort;
    if (currentSort) {
      filters.sort = currentSort;
    }

    this.filtersChange.emit(filters);
  }
  
  /**
   * Sélectionne une catégorie
   */
  selectCategory(slug: string): void {
    if (this.selectedCategory() === slug) {
      this.selectedCategory.set('');
    } else {
      this.selectedCategory.set(slug);
    }
    this.emitFiltersChange();
  }
  
  /**
   * Met à jour le prix minimum
   */
  onPrixMinChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value ? parseInt(input.value, 10) : null;
    this.prixMinSubject.next(value);
    this.sliderValue.update(v => ({ ...v, min: value || 0 }));
  }
  
  /**
   * Met à jour le prix maximum
   */
  onPrixMaxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value ? parseInt(input.value, 10) : null;
    this.prixMaxSubject.next(value);
    this.sliderValue.update(v => ({ ...v, max: value || 1000000 }));
  }
  
  /**
   * Met à jour le slider
   */
  onSliderChange(event: Event): void {
    // Implémentation optionnelle
  }
  
  /**
   * Bascule le filtre "en stock"
   */
  toggleEnStock(): void {
    this.enStockOnly.update(value => !value);
    this.emitFiltersChange();
  }
  
  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.selectedCategory.set('');
    this.prixMin.set(null);
    this.prixMax.set(null);
    this.enStockOnly.set(false);
    this.sliderValue.set({ min: 0, max: 1000000 });
    this.prixMinSubject.next(null);
    this.prixMaxSubject.next(null);
    this.emitFiltersChange();
  }
  
  /**
   * Formate un prix
   */
  private formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-SN').format(price) + ' FCFA';
  }
}