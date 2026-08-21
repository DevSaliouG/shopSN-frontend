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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ProductStore } from '../../store/product.store';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { WhatsAppUtil } from '../../../../shared/utils/whatsapp.util';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductGalleryComponent } from '../../components/product-gallery/product-gallery.component';
import { ProductStickyBarComponent } from '../../components/product-sticky-bar/product-sticky-bar.component';
import { AuthService } from '../../../services/auth.service';
import { SeoService } from '../../../../core/services/seo.service';
import { FavoriteService } from '../../../services/favorite.service';
import { Breadcrumbs, BreadcrumbItem } from '../../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProductCardComponent,
    ProductGalleryComponent,
    ProductStickyBarComponent,
    LoadingSpinnerComponent,
    Breadcrumbs
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerItems', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(50, [
            animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
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

  // Computed values
  readonly currentProduct = this.productStore.currentProduct;
  readonly isLoading = this.productStore.isDetailLoading;
  readonly similarProducts = this.productStore.similarProducts;
  readonly error = this.productStore.error;

  /**
   * Breadcrumbs dynamiques basés sur le produit et sa catégorie
   */
  breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    const product = this.currentProduct();
    if (!product) return [];

    const items: BreadcrumbItem[] = [
      { label: 'Produits', url: '/produits' }
    ];

    if (product.category) {
      items.push({
        label: product.category.nom,
        url: `/categorie/${product.category.id}`
      });
    }

    items.push({
      label: product.nom,
      active: true
    });

    return items;
  });

  /**
   * Produit suivant dans les produits similaires
   */
  nextProduct = computed(() => {
    const similar = this.similarProducts();
    return similar.length > 0 ? similar[0] : null;
  });

  /**
   * Produit précédent dans les produits similaires
   */
  previousProduct = computed(() => {
    const similar = this.similarProducts();
    return similar.length > 1 ? similar[1] : null;
  });

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
   * Images du produit formatées pour la galerie
   */
  productImages = computed(() => {
    const product = this.currentProduct();
    if (!product?.images || product.images.length === 0) {
      // Retourne une image placeholder
      return [{
        id: 0,
        url: '/assets/images/placeholder-large.webp',
        chemin: '/assets/images/placeholder-large.webp',
        alt_text: product?.nom || 'Produit',
        ordre: 0,
        updated_at: new Date().toISOString(),
        principale: true
      }];
    }
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
    return 'text-[#FF6600] bg-[#F5F5F5]';
  });

  /**
   * Génère l'URL d'image avec cache-busting
   */
  getImageUrl(image: { url?: string; chemin?: string; updated_at: string }): string {
    const baseUrl = image.url ?? image.chemin;
    if (!baseUrl) return '/assets/images/placeholder.svg';

    const separator = baseUrl.includes('?') ? '&' : '?';
    const version = new Date(image.updated_at).getTime();
    return `${baseUrl}${separator}v=${version}`;
  }

  constructor() {
    effect(() => {
      const product = this.currentProduct();
      if (product) {
        this.seoService.setProductMeta(product);
        this.checkIfFavorite(product.id);
      }
    });

    // Écouter les changements de paramètres de route (navigation entre produits)
    this.route.paramMap.pipe(
      takeUntilDestroyed()
    ).subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        // Réinitialiser l'état du composant
        this.quantity.set(1);
        this.showFullDescription.set(false);
        this.selectedImageIndex.set(0);

        // Charger le nouveau produit
        this.productStore.loadProductBySlug(slug);

        // Scroll vers le haut
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  }

  ngOnInit(): void {
    // L'abonnement aux changements de route est maintenant dans le constructor
  }

  ngOnDestroy(): void {
    this.productStore.clearCurrentProduct();
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
    const text = encodeURIComponent(`Découvrez ${this.currentProduct()?.nom} sur OnlineStore`);
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
