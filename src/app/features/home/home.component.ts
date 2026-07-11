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

import { Component, inject, OnInit, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
    this.loadCategories();
    this.loadPopularProducts();
    this.loadRecentProducts();
  }

  private loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.categoryService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  private loadPopularProducts(): void {
    this.isLoadingPopular.set(true);
    this.productStore
      .getPopularProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  private loadRecentProducts(): void {
    this.isLoadingRecent.set(true);
    this.productStore
      .getRecentProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
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
