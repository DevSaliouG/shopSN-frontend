/**
 * Page d'accueil du site OnlineStore
 * Affiche les sections principales : hero, catégories, produits populaires, produits récents
 *
 * Fonctionnalités:
 * - Hero section avec CTA WhatsApp
 * - Liste des catégories principales
 * - Produits populaires (carrrousel ou grille)
 * - Produits récents
 * - Newsletter subscription
 * - Animations au scroll (compatible SSR)
 * - SEO dynamique
 */

import { Component, inject, OnInit, signal, ChangeDetectionStrategy, DestroyRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import { ProductStore } from '../products/store/product.store';
import { CategoryService } from '../services/category.service';
import { ProductCardComponent } from '../products/components/product-card/product-card.component';
import { HeroSectionComponent } from './components/hero-section.component';
import { SeoService } from '../../core/services/seo.service';
import { WhatsAppUtil } from '../../shared/utils/whatsapp.util';
import { Category, Product, ApiResponse } from '../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent, HeroSectionComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly productStore = inject(ProductStore);
  private readonly categoryService = inject(CategoryService);
  private readonly seoService = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  // Cache statique pour éviter les rechargements
  private static homeDataCache: {
    categories: Category[];
    popularProducts: Product[];
    recentProducts: Product[];
    timestamp: number;
  } | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  categories = signal<Category[]>([]);
  popularProducts = signal<Product[]>([]);
  recentProducts = signal<Product[]>([]);
  isLoadingCategories = signal<boolean>(true);
  isLoadingPopular = signal<boolean>(true);
  isLoadingRecent = signal<boolean>(true);
  error = signal<string | null>(null);

  newsletterEmail = '';
  isSubscribing = signal<boolean>(false);
  newsletterSuccess = signal<boolean>(false);
  newsletterError = signal<string | null>(null);

  ngOnInit(): void {
    this.seoService.setHomeMeta();

    // Vérifier si on peut utiliser le cache
    if (this.canUseCache()) {
      this.loadFromCache();
    } else {
      this.loadAllData();
    }
  }

  /**
   * Vérifie si le cache est valide
   */
  private canUseCache(): boolean {
    if (!isPlatformBrowser(this.platformId) || !HomeComponent.homeDataCache) {
      return false;
    }

    const now = Date.now();
    const cacheAge = now - HomeComponent.homeDataCache.timestamp;
    return cacheAge < HomeComponent.CACHE_DURATION;
  }

  /**
   * Charge les données depuis le cache
   */
  private loadFromCache(): void {
    if (!HomeComponent.homeDataCache) return;

    // Charger instantanément depuis le cache
    this.categories.set(HomeComponent.homeDataCache.categories);
    this.popularProducts.set(HomeComponent.homeDataCache.popularProducts);
    this.recentProducts.set(HomeComponent.homeDataCache.recentProducts);

    // Désactiver les loaders
    this.isLoadingCategories.set(false);
    this.isLoadingPopular.set(false);
    this.isLoadingRecent.set(false);

    // Optionnel : rafraîchir en arrière-plan si le cache est ancien
    const cacheAge = Date.now() - HomeComponent.homeDataCache.timestamp;
    if (cacheAge > HomeComponent.CACHE_DURATION / 2) {
      this.refreshDataInBackground();
    }
  }

  /**
   * Charge toutes les données en parallèle (optimisé)
   */
  private loadAllData(): void {
    // Lancer les 3 requêtes en parallèle avec forkJoin
    forkJoin({
      categories: this.categoryService.getCategories().pipe(
        catchError(error => {
          console.error('Erreur chargement catégories:', error);
          return of({ success: false, data: [] } as ApiResponse<Category[]>);
        })
      ),
      popular: this.productStore.getPopularProducts().pipe(
        catchError(error => {
          console.error('Erreur chargement produits populaires:', error);
          return of({ success: false, data: [] } as ApiResponse<Product[]>);
        })
      ),
      recent: this.productStore.getRecentProducts().pipe(
        catchError(error => {
          console.error('Erreur chargement produits récents:', error);
          return of({ success: false, data: [] } as ApiResponse<Product[]>);
        })
      )
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(results => {
      // Extraire et limiter les données
      const categories = results.categories.data.slice(0, 8);
      const popularProducts = results.popular.data.slice(0, 8);
      const recentProducts = results.recent.data.slice(0, 8);

      // Mettre à jour les signals
      this.categories.set(categories);
      this.popularProducts.set(popularProducts);
      this.recentProducts.set(recentProducts);

      // Sauvegarder dans le cache
      if (isPlatformBrowser(this.platformId)) {
        HomeComponent.homeDataCache = {
          categories,
          popularProducts,
          recentProducts,
          timestamp: Date.now()
        };
      }

      // Désactiver les loaders
      this.isLoadingCategories.set(false);
      this.isLoadingPopular.set(false);
      this.isLoadingRecent.set(false);
    });
  }

  /**
   * Rafraîchit les données en arrière-plan sans bloquer l'UI
   */
  private refreshDataInBackground(): void {
    forkJoin({
      categories: this.categoryService.getCategories(),
      popular: this.productStore.getPopularProducts(),
      recent: this.productStore.getRecentProducts()
    })
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => of(null))
    )
    .subscribe(results => {
      if (!results) return;

      // Mettre à jour silencieusement
      this.categories.set(results.categories.data.slice(0, 8));
      this.popularProducts.set(results.popular.data.slice(0, 8));
      this.recentProducts.set(results.recent.data.slice(0, 8));

      // Mettre à jour le cache
      if (isPlatformBrowser(this.platformId)) {
        HomeComponent.homeDataCache = {
          categories: results.categories.data.slice(0, 8),
          popularProducts: results.popular.data.slice(0, 8),
          recentProducts: results.recent.data.slice(0, 8),
          timestamp: Date.now()
        };
      }
    });
  }

  /**
   * Met à jour l'email de la newsletter
   */
  subscribeNewsletter(): void {
    const email = this.newsletterEmail.trim();

    if (!email) {
      this.newsletterError.set('Veuillez saisir votre email');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.newsletterError.set('Email invalide');
      return;
    }

    this.isSubscribing.set(true);
    this.newsletterError.set(null);

    setTimeout(() => {
      this.isSubscribing.set(false);
      this.newsletterSuccess.set(true);
      this.newsletterEmail = '';

      setTimeout(() => {
        this.newsletterSuccess.set(false);
      }, 3000);
    }, 1000);
  }

  /**
   * Valide le format email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Génère l'URL WhatsApp pour le hero
   */
  getWhatsAppUrl(): string {
    const message = "Bonjour, je souhaite obtenir plus d'informations sur vos produits.";
    return WhatsAppUtil.generateUrl(undefined, message);
  }

  /**
   * Définit le délai d'animation pour les cartes
   */
  getAnimationDelay(index: number): string {
    return `${index * 0.05}s`;
  }

  /**
   * Track by function pour les listes
   */
  trackById(index: number, item: { id: number }): number {
    return item.id;
  }

}
