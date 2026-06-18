/**
 * Page de détail d'un produit
 * Affiche toutes les informations du produit, la galerie d'images,
 * les produits similaires, et les actions (WhatsApp, favori)
 * 
 * Fonctionnalités:
 * - Galerie d'images avec Swiper.js
 * - Affichage prix et disponibilité
 * - Intégration WhatsApp
 * - Produits similaires
 * - SEO dynamique
 * - Gestion des favoris
 */

import { Component, inject, OnInit, OnDestroy, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductStore } from '../../store/product.store';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { WhatsAppUtil } from '../../../../shared/utils/whatsapp.util';

// Importer Swiper pour la galerie
import Swiper from 'swiper';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { AuthService } from '../../../services/auth.service';
import { SeoService } from '../../../../core/services/seo.service';
import { FavoriteService } from '../../../services/favorite.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProductCardComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly productStore = inject(ProductStore);
  private readonly seoService = inject(SeoService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly authService = inject(AuthService);

  // État local
  selectedImageIndex = signal<number>(0);
  isFavorite = signal<boolean>(false);
  quantity = signal<number>(1);
  showFullDescription = signal<boolean>(false);
  
  // Swiper instances
  private mainSwiper: Swiper | null = null;
  private thumbsSwiper: Swiper | null = null;

  // Computed values
  readonly currentProduct = this.productStore.currentProduct;
  readonly isLoading = this.productStore.isDetailLoading;
  readonly similarProducts = this.productStore.similarProducts;
  readonly error = this.productStore.error;

  /**
   * URL WhatsApp générée dynamiquement
   */
  whatsappUrl = computed(() => {
    const product = this.currentProduct();
    if (!product) return '#';
    
    return WhatsAppUtil.generateProductUrl(
      product.nom,
      product.prix,
      product.id,
      product.whatsapp_message || undefined
    );
  });

  /**
   * Images du produit formatées pour Swiper
   */
  productImages = computed(() => {
    const product = this.currentProduct();
    if (!product?.images) return [];
    return product.images.sort((a, b) => a.ordre - b.ordre);
  });

  /**
   * Image principale
   */
  mainImage = computed(() => {
    const images = this.productImages();
    const selected = this.selectedImageIndex();
    return images[selected] || images[0] || null;
  });

  /**
   * Vérifie si le produit est en stock
   */
  isInStock = computed(() => {
    const product = this.currentProduct();
    return product ? product.stock > 0 : false;
  });

  /**
   * Message de stock formaté
   */
  stockMessage = computed(() => {
    const product = this.currentProduct();
    if (!product) return '';
    if (product.stock === 0) return 'Rupture de stock';
    if (product.stock < 10) return `Plus que ${product.stock} en stock`;
    return 'En stock';
  });

  /**
   * Stock class CSS
   */
  stockClass = computed(() => {
    const product = this.currentProduct();
    if (!product) return '';
    if (product.stock === 0) return 'text-red-600 bg-red-50';
    if (product.stock < 10) return 'text-orange-600 bg-orange-50';
    return 'text-[#2D5A4C] bg-[#E8EDF2]';
  });

  constructor() {
    effect(() => {
      const product = this.currentProduct();
      if (product) {
        this.seoService.setProductMeta(product);
        this.checkIfFavorite(product.id);
      }
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.productStore.loadProductBySlug(slug);
    }

    setTimeout(() => this.initSwiper(), 100);
  }

  ngOnDestroy(): void {
    // Nettoie les instances Swiper
    if (this.mainSwiper) {
      this.mainSwiper.destroy(true, true);
    }
    if (this.thumbsSwiper) {
      this.thumbsSwiper.destroy(true, true);
    }
    this.productStore.clearCurrentProduct();
  }

  /**
   * Initialise la galerie Swiper
   */
  private initSwiper(): void {
    Swiper.use([Navigation, Pagination, Thumbs, FreeMode]);
    
    // Swiper des miniatures
    this.thumbsSwiper = new Swiper('.product-thumbs', {
      slidesPerView: 4,
      spaceBetween: 10,
      freeMode: true,
      watchSlidesProgress: true,
      breakpoints: {
        640: { slidesPerView: 5 },
        768: { slidesPerView: 6 }
      }
    });

    // Swiper principal
    this.mainSwiper = new Swiper('.product-main-swiper', {
      modules: [Navigation, Pagination, Thumbs],
      spaceBetween: 10,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      thumbs: {
        swiper: this.thumbsSwiper,
      },
      on: {
        slideChange: (swiper) => {
          this.selectedImageIndex.set(swiper.activeIndex);
        }
      }
    });
  }

  /**
   * Vérifie si le produit est dans les favoris
   */
  private checkIfFavorite(productId: number): void {
    if (!this.authService.isLoggedIn()) {
      this.isFavorite.set(false);
      return;
    }
    
    this.favoriteService.isFavorite(productId).subscribe({
      next: (response) => {
        this.isFavorite.set(response.data);
      },
      error: () => {
        this.isFavorite.set(false);
      }
    });
  }

  /**
   * Bascule le statut favori
   */
  toggleFavorite(): void {
    if (!this.authService.isLoggedIn()) {
      // Rediriger vers login
      window.location.href = '/connexion?returnUrl=' + window.location.pathname;
      return;
    }
    
    const product = this.currentProduct();
    if (!product) return;
    
    this.favoriteService.toggleFavorite(product.id).subscribe({
      next: () => {
        this.isFavorite.update(value => !value);
      }
    });
  }

  /**
   * Incrémente/décrémente la quantité
   */
  updateQuantity(delta: number): void {
    const newQuantity = this.quantity() + delta;
    const product = this.currentProduct();
    
    if (newQuantity >= 1 && product && newQuantity <= product.stock) {
      this.quantity.set(newQuantity);
    }
  }

  /**
   * Génère le message WhatsApp avec la quantité
   */
  getWhatsAppMessageWithQuantity(): string {
    const product = this.currentProduct();
    if (!product) return '';
    
    const quantityMsg = this.quantity() > 1 ? `\nQuantité : ${this.quantity()}` : '';
    const baseMessage = product.whatsapp_message || WhatsAppUtil.buildProductMessage(
      product.nom,
      product.prix,
      product.id
    );
    
    return baseMessage + quantityMsg;
  }

  /**
   * Ouvre WhatsApp avec le message personnalisé
   */
  openWhatsApp(): void {
    const product = this.currentProduct();
    if (!product) return;
    
    let message = product.whatsapp_message || WhatsAppUtil.buildProductMessage(
      product.nom,
      product.prix,
      product.id
    );
    
    if (this.quantity() > 1) {
      message += `\nQuantité : ${this.quantity()}`;
    }
    
    const url = WhatsAppUtil.generateUrlWithMessage(message);
    window.open(url, '_blank');
  }

  /**
   * Partage sur les réseaux sociaux
   */
  shareOnFacebook(): void {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  shareOnTwitter(): void {
    const text = encodeURIComponent(`Découvrez ${this.currentProduct()?.nom} sur ShopSN`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  /**
   * Copie le lien du produit
   */
  copyLink(): void {
    navigator.clipboard.writeText(window.location.href);
    // Afficher une notification (à implémenter)
  }
}
