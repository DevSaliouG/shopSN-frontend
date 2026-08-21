/**
 * SearchBar Component - Phase 2 Partie 2
 * Barre de recherche avec autocomplete et suggestions
 *
 * Features:
 * - Debounce input (300ms)
 * - Autocomplete dropdown
 * - Recent searches (LocalStorage)
 * - Product suggestions
 * - Category suggestions
 * - Keyboard navigation (arrows, enter, escape)
 * - Loading state
 * - Highlighting matches
 */

import { Component, input, output, signal, computed, effect, inject, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ProductService } from '../../../features/services/product.service';
import { CategoryService } from '../../../features/services/category.service';
import {
  SEARCH_DEBOUNCE_MS,
  MAX_RECENT_SEARCHES,
  DEFAULT_SUGGESTIONS_LIMIT,
  CATEGORY_SUGGESTIONS_LIMIT,
  DROPDOWN_BLUR_DELAY
} from '../../constants/ui.constants';

interface SearchSuggestion {
  type: 'product' | 'category' | 'recent';
  label: string;
  id?: number;
  slug?: string;
  image?: string;
  count?: number;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Placeholder du input
   */
  placeholder = input<string>('Rechercher des produits...');

  /**
   * Valeur initiale
   */
  initialValue = input<string>('');

  /**
   * Afficher le bouton clear
   */
  showClear = input<boolean>(true);

  /**
   * Events
   */
  search = output<string>();
  searchSubmit = output<string>();

  /**
   * État local
   */
  searchQuery = signal<string>('');
  showSuggestions = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  recentSearches = signal<string[]>([]);
  productSuggestions = signal<SearchSuggestion[]>([]);
  categorySuggestions = signal<SearchSuggestion[]>([]);
  selectedIndex = signal<number>(-1);

  /**
   * Subjects pour debounce
   */
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  /**
   * Toutes les suggestions combinées
   */
  readonly allSuggestions = computed<SearchSuggestion[]>(() => {
    const suggestions: SearchSuggestion[] = [];

    // Recent searches
    const query = this.searchQuery().toLowerCase();
    if (!query && this.recentSearches().length > 0) {
      suggestions.push(
        ...this.recentSearches().slice(0, DEFAULT_SUGGESTIONS_LIMIT).map(term => ({
          type: 'recent' as const,
          label: term
        }))
      );
    }

    // Categories
    if (this.categorySuggestions().length > 0) {
      suggestions.push(...this.categorySuggestions().slice(0, CATEGORY_SUGGESTIONS_LIMIT));
    }

    // Products
    if (this.productSuggestions().length > 0) {
      suggestions.push(...this.productSuggestions().slice(0, DEFAULT_SUGGESTIONS_LIMIT));
    }

    return suggestions;
  });

  /**
   * Y a-t-il des suggestions?
   */
  readonly hasSuggestions = computed(() => this.allSuggestions().length > 0);

  constructor() {
    // Load recent searches from localStorage
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('recent_searches');
      if (stored) {
        try {
          this.recentSearches.set(JSON.parse(stored));
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    // Setup debounce
    this.searchSubject.pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });

    // Set initial value
    effect(() => {
      const initial = this.initialValue();
      if (initial) {
        this.searchQuery.set(initial);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Input change handler
   */
  onInputChange(value: string): void {
    this.searchQuery.set(value);
    this.selectedIndex.set(-1);

    if (value.trim().length > 0) {
      this.showSuggestions.set(true);
      this.isLoading.set(true);
      this.searchSubject.next(value);
    } else {
      this.showSuggestions.set(false);
      this.isLoading.set(false);
      this.productSuggestions.set([]);
      this.categorySuggestions.set([]);
    }

    this.search.emit(value);
  }

  /**
   * Perform search avec API
   */
  private performSearch(query: string): void {
    if (query.trim().length === 0) {
      this.isLoading.set(false);
      return;
    }

    // Search categories (using getCategories as searchCategories doesn't exist)
    this.categoryService.getCategories().subscribe({
      next: (response: any) => {
        const suggestions: SearchSuggestion[] = response.data
          .filter((cat: any) => cat.nom.toLowerCase().includes(query.toLowerCase()))
          .slice(0, CATEGORY_SUGGESTIONS_LIMIT)
          .map((cat: any) => ({
            type: 'category' as const,
            label: cat.nom,
            id: cat.id,
            slug: cat.slug,
            count: cat.produits_count
          }));
        this.categorySuggestions.set(suggestions);
      },
      error: () => {
        this.categorySuggestions.set([]);
      }
    });

    // Search products
    this.productService.getPublicProducts({ q: query, per_page: DEFAULT_SUGGESTIONS_LIMIT }).subscribe({
      next: (response) => {
        const suggestions: SearchSuggestion[] = response.data.map(product => ({
          type: 'product',
          label: product.nom,
          id: product.id,
          slug: product.slug,
          image: product.main_image?.url || product.main_image?.chemin
        }));
        this.productSuggestions.set(suggestions);
        this.isLoading.set(false);
      },
      error: () => {
        this.productSuggestions.set([]);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Submit search
   */
  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const query = this.searchQuery().trim();
    if (query) {
      this.addToRecentSearches(query);
      this.searchSubmit.emit(query);
      this.showSuggestions.set(false);
    }
  }

  /**
   * Clear search
   */
  onClear(): void {
    this.searchQuery.set('');
    this.showSuggestions.set(false);
    this.productSuggestions.set([]);
    this.categorySuggestions.set([]);
    this.search.emit('');
  }

  /**
   * Click sur suggestion
   */
  onSuggestionClick(suggestion: SearchSuggestion): void {
    if (suggestion.type === 'recent' || suggestion.type === 'category') {
      this.searchQuery.set(suggestion.label);
      this.addToRecentSearches(suggestion.label);
      this.searchSubmit.emit(suggestion.label);
    } else if (suggestion.type === 'product') {
      // Product click is handled by RouterLink
      this.addToRecentSearches(suggestion.label);
    }

    this.showSuggestions.set(false);
  }

  /**
   * Keyboard navigation
   */
  onKeyDown(event: KeyboardEvent): void {
    const suggestions = this.allSuggestions();

    if (!this.showSuggestions() || suggestions.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update(i =>
          i < suggestions.length - 1 ? i + 1 : 0
        );
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update(i =>
          i > 0 ? i - 1 : suggestions.length - 1
        );
        break;

      case 'Enter':
        event.preventDefault();
        const selected = suggestions[this.selectedIndex()];
        if (selected) {
          this.onSuggestionClick(selected);
        } else {
          this.onSubmit();
        }
        break;

      case 'Escape':
        this.showSuggestions.set(false);
        break;
    }
  }

  /**
   * Focus event
   */
  onFocus(): void {
    if (this.searchQuery().trim().length > 0 || this.recentSearches().length > 0) {
      this.showSuggestions.set(true);
    }
  }

  /**
   * Blur event (delayed to allow click on suggestions)
   */
  onBlur(): void {
    setTimeout(() => {
      this.showSuggestions.set(false);
    }, DROPDOWN_BLUR_DELAY);
  }

  /**
   * Add to recent searches
   */
  private addToRecentSearches(query: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const current = this.recentSearches();
    const filtered = current.filter(term => term.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    this.recentSearches.set(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.recentSearches.set([]);
    localStorage.removeItem('recent_searches');
  }

  /**
   * Highlight matches in text
   */
  highlightMatch(text: string): string {
    const query = this.searchQuery().trim();
    if (!query) return text;

    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
