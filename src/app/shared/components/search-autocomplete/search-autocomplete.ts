/**
 * Composant Search Autocomplete - Ultra Discret
 * Recherche instantanée avec autocomplétion moderne
 *
 * Fonctionnalités:
 * - Debounce 400ms (optimisé pour performance)
 * - Minimum 2 caractères pour recherche
 * - Navigation clavier (↑↓ Enter Esc)
 * - Recherches récentes (localStorage)
 * - Produits populaires
 * - Highlight des termes
 * - Responsive mobile/desktop
 */

import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  inject,
  ElementRef,
  viewChild,
  OnDestroy,
  PLATFORM_ID,
  ChangeDetectionStrategy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { ProductService } from '../../../features/services/product.service';
import { Product } from '../../../features/models/product.model';

export interface SearchSuggestion {
  id: number;
  name: string;
  slug: string;
  category?: string;
  image?: string;
  price?: number;
  type: 'product' | 'category' | 'recent';
}

@Component({
  selector: 'app-search-autocomplete',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-autocomplete.html',
  styleUrl: './search-autocomplete.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dropdownAnimation', [
      state('closed', style({ opacity: 0, transform: 'translateY(-8px)' })),
      state('open', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('closed => open', animate('180ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('open => closed', animate('150ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class SearchAutocomplete implements OnDestroy {
  private productService = inject(ProductService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Inputs
  placeholder = input<string>('Recherche instantanée...');

  // Outputs
  searchSubmitted = output<string>();

  // ViewChild
  private searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private mobileSearchInput = viewChild<ElementRef<HTMLInputElement>>('mobileSearchInput');

  // Signals
  searchQuery = signal<string>('');
  suggestions = signal<SearchSuggestion[]>([]);
  popularProducts = signal<SearchSuggestion[]>([]);
  isLoading = signal<boolean>(false);
  isOpen = signal<boolean>(false);
  selectedIndex = signal<number>(-1);
  recentSearches = signal<string[]>([]);
  isMobileSearchOpen = signal<boolean>(false); // Overlay mobile

  // Subject pour gestion reactive
  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Computed
  readonly dropdownState = computed(() => this.isOpen() ? 'open' : 'closed');
  readonly hasResults = computed(() =>
    this.suggestions().length > 0 ||
    this.popularProducts().length > 0 ||
    this.recentSearches().length > 0
  );
  readonly showDropdown = computed(() => this.isOpen() && this.hasResults());

  constructor() {
    // Charger les recherches récentes et produits populaires
    this.loadRecentSearches();
    this.loadPopularProducts();

    // Configuration du flux de recherche réactive
    this.setupSearchStream();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configure le flux de recherche avec debounce et optimisations
   */
  private setupSearchStream(): void {
    this.searchSubject$
      .pipe(
        debounceTime(400), // Attendre 400ms après la dernière frappe
        distinctUntilChanged(), // Ignorer les valeurs identiques
        switchMap(query => {
          // Ne pas lancer de recherche si moins de 2 caractères
          const trimmed = query.trim();
          if (trimmed.length < 2) {
            this.suggestions.set([]);
            this.isLoading.set(false);
            return of({ data: [] });
          }

          // Activer le loading
          this.isLoading.set(true);

          // Lancer la recherche rapide (limitée à 5 résultats)
          return this.productService.quickSearch(trimmed).pipe(
            catchError(error => {
              console.error('Erreur de recherche:', error);
              return of({ data: [] });
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(response => {
        // Transformer les résultats en suggestions
        const results = response.data || [];
        const suggestions: SearchSuggestion[] = results.map((item: any) => ({
          id: item.id,
          name: item.nom,
          slug: item.slug,
          category: item.category?.nom || item.category_nom,
          image: this.getProductImage(item),
          price: item.prix,
          type: 'product' as const
        }));

        this.suggestions.set(suggestions);
        this.isLoading.set(false);

        // Ouvrir le dropdown si on a des résultats ou du contenu
        if (suggestions.length > 0 || this.recentSearches().length > 0) {
          this.isOpen.set(true);
        }
      });
  }

  /**
   * Charge les produits populaires au démarrage
   */
  private loadPopularProducts(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.productService.getPopularProducts(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const products = response.data || [];
          const popular: SearchSuggestion[] = products.map(product => ({
            id: product.id,
            name: product.nom,
            slug: product.slug,
            category: product.category?.nom,
            image: this.getProductImage(product),
            price: product.prix,
            type: 'product' as const
          }));

          this.popularProducts.set(popular);
        },
        error: (error) => {
          console.error('Erreur chargement produits populaires:', error);
        }
      });
  }

  /**
   * Extrait l'image du produit (compatible avec différents formats d'API)
   */
  private getProductImage(product: any): string | undefined {
    // Format 1: images array (produits standards)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0]?.thumbnail_url || product.images[0]?.url;
    }

    // Format 2: champs directs (API search)
    if (product.thumbnail_url) {
      return product.thumbnail_url;
    }

    if (product.image_url) {
      return product.image_url;
    }

    // Format 3: mainImage relation
    if (product.mainImage) {
      return product.mainImage.thumbnail_url || product.mainImage.url;
    }

    return undefined;
  }

  /**
   * Gère le changement de l'input
   */
  onInputChange(value: string): void {
    this.searchQuery.set(value);
    this.selectedIndex.set(-1);

    // Émettre vers le flux de recherche
    this.searchSubject$.next(value);
  }

  /**
   * Gère le focus de l'input
   */
  onFocus(): void {
    const query = this.searchQuery().trim();

    // Ouvrir si on a du contenu à afficher
    if (query.length >= 2 || this.recentSearches().length > 0 || this.popularProducts().length > 0) {
      this.isOpen.set(true);
    }
  }

  /**
   * Gère le blur de l'input
   */
  onBlur(): void {
    // Délai pour permettre les clics sur les suggestions
    setTimeout(() => {
      this.isOpen.set(false);
    }, 200);
  }

  /**
   * Gère la navigation au clavier
   */
  onKeyDown(event: KeyboardEvent): void {
    const allSuggestions = [
      ...this.suggestions(),
      ...this.popularProducts()
    ];

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update(i => Math.min(i + 1, allSuggestions.length - 1));
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update(i => Math.max(i - 1, -1));
        break;

      case 'Enter':
        event.preventDefault();
        const index = this.selectedIndex();
        if (index >= 0 && index < allSuggestions.length) {
          this.selectSuggestion(allSuggestions[index]);
        } else {
          this.submitSearch();
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.isOpen.set(false);
        this.searchInput()?.nativeElement.blur();
        break;
    }
  }

  /**
   * Sélectionne une suggestion
   */
  selectSuggestion(suggestion: SearchSuggestion): void {
    // Naviguer vers la page détail du produit
    this.router.navigate(['/produits', suggestion.slug]);

    // Ajouter aux recherches récentes
    this.addToRecentSearches(suggestion.name);

    // Fermer le dropdown
    this.isOpen.set(false);

    // Mettre à jour le champ
    this.searchQuery.set(suggestion.name);
  }

  /**
   * Soumet la recherche (Enter ou "Voir tous")
   */
  submitSearch(): void {
    const query = this.searchQuery().trim();
    if (!query || query.length < 2) {
      return;
    }

    // Naviguer vers la page de résultats
    this.router.navigate(['/produits'], { queryParams: { q: query } });

    // Ajouter aux recherches récentes
    this.addToRecentSearches(query);

    // Émettre l'événement
    this.searchSubmitted.emit(query);

    // Fermer le dropdown
    this.isOpen.set(false);
  }

  /**
   * Efface la recherche
   */
  clearSearch(): void {
    this.searchQuery.set('');
    this.suggestions.set([]);
    this.selectedIndex.set(-1);
    this.isOpen.set(false);
    this.searchInput()?.nativeElement.focus();
  }

  /**
   * Supprime une recherche récente
   */
  removeRecentSearch(term: string): void {
    this.recentSearches.update(searches =>
      searches.filter(s => s !== term)
    );
    this.saveRecentSearches();
  }

  /**
   * Efface toutes les recherches récentes
   */
  clearRecentSearches(): void {
    this.recentSearches.set([]);
    this.saveRecentSearches();
  }

  /**
   * Ajoute une recherche aux récentes
   */
  private addToRecentSearches(term: string): void {
    if (!term.trim() || term.length < 2) {
      return;
    }

    this.recentSearches.update(searches => {
      const filtered = searches.filter(s => s.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, 5); // Max 5 recherches récentes
    });

    this.saveRecentSearches();
  }

  /**
   * Charge les recherches récentes depuis localStorage
   */
  private loadRecentSearches(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.recentSearches.set(parsed);
        }
      }
    } catch (error) {
      console.error('Erreur chargement recherches récentes:', error);
    }
  }

  /**
   * Sauvegarde les recherches récentes dans localStorage
   */
  private saveRecentSearches(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches()));
    } catch (error) {
      console.error('Erreur sauvegarde recherches récentes:', error);
    }
  }

  /**
   * Met en surbrillance le terme de recherche
   */
  highlightText(text: string, query: string): string {
    if (!query || !text) {
      return text;
    }

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }

  /**
   * Formate le prix
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price) + ' FCFA';
  }

  /**
   * Ouvre l'overlay de recherche mobile
   */
  openMobileSearch(): void {
    this.isMobileSearchOpen.set(true);

    // Bloquer le scroll du body
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';

      // Auto-focus sur l'input mobile après l'ouverture
      setTimeout(() => {
        this.mobileSearchInput()?.nativeElement.focus();
      }, 100);
    }
  }

  /**
   * Ferme l'overlay de recherche mobile
   */
  closeMobileSearch(): void {
    this.isMobileSearchOpen.set(false);
    this.isOpen.set(false);

    // Restaurer le scroll du body
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }
}
