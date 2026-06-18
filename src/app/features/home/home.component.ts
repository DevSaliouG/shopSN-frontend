/**
 * Page d'accueil du site ShopSN
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

import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductStore } from '../products/store/product.store';
import { CategoryService } from '../services/category.service';
import { ProductCardComponent } from '../products/components/product-card/product-card.component';
import { HeroSectionComponent } from './components/hero-section.component';
import { SeoService } from '../../core/services/seo.service';
import { WhatsAppUtil } from '../../shared/utils/whatsapp.util';
import { Subject, takeUntil } from 'rxjs';
import { Category, Product, ApiResponse } from '../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent, HeroSectionComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly productStore = inject(ProductStore);
  private readonly categoryService = inject(CategoryService);
  private readonly seoService = inject(SeoService);

  // État
  categories = signal<Category[]>([]);
  popularProducts = signal<Product[]>([]);
  recentProducts = signal<Product[]>([]);
  isLoadingCategories = signal<boolean>(true);
  isLoadingPopular = signal<boolean>(true);
  isLoadingRecent = signal<boolean>(true);
  error = signal<string | null>(null);

  // Newsletter
  newsletterEmail = '';
  isSubscribing = signal<boolean>(false);
  newsletterSuccess = signal<boolean>(false);
  newsletterError = signal<string | null>(null);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.seoService.setHomeMeta();
    this.loadCategories();
    this.loadPopularProducts();
    this.loadRecentProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les catégories depuis l'API
   */
  private loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.categoryService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Category[]>) => {
          this.categories.set(response.data.slice(0, 8));
          this.isLoadingCategories.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement catégories:', error);
          this.isLoadingCategories.set(false);
        },
      });
  }

  /**
   * Charge les produits populaires
   */
  private loadPopularProducts(): void {
    this.isLoadingPopular.set(true);
    this.productStore
      .getPopularProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Product[]>) => {
          this.popularProducts.set(response.data.slice(0, 8));
          this.isLoadingPopular.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement produits populaires:', error);
          this.isLoadingPopular.set(false);
        },
      });
  }

  /**
   * Charge les produits récents
   */
  private loadRecentProducts(): void {
    this.isLoadingRecent.set(true);
    this.productStore
      .getRecentProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Product[]>) => {
          this.recentProducts.set(response.data.slice(0, 8));
          this.isLoadingRecent.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement produits récents:', error);
          this.isLoadingRecent.set(false);
        },
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
