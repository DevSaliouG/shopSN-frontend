/**
 * Composant carte produit
 * Affichage compact d'un produit dans les listes
 * 
 * Fonctionnalités:
 * - Affichage des badges (populaire, rupture)
 * - Intégration WhatsApp direct
 * - Optimisation des images avec NgOptimizedImage
 * - Lazy loading des images
 */

import { Component, input, computed, ChangeDetectionStrategy, signal, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { WhatsAppUtil } from '../../../../shared/utils/whatsapp.util';
import { Product } from '../../../models/product.model';
import { AnalyticsTrackingService } from '../../../../core/services/analytics-tracking.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('badgeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8) translateY(-5px)' }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ]),
    trigger('heartBeat', [
      transition('false => true', [
        animate('400ms', style({ transform: 'scale(1.3)' })),
        animate('200ms', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ProductCardComponent {
  private analyticsService = inject(AnalyticsTrackingService);

  product = input.required<Product>();
  isListView = input<boolean>(false);
  showBadges = input<boolean>(true);

  // Signals pour les interactions
  isHovered = signal(false);
  isInWishlist = signal(false);

  // Outputs pour les événements
  wishlistToggled = output<{ product: Product; added: boolean }>();

  /**
   * Vérifie si le produit est en rupture de stock
   */
  readonly isOutOfStock = computed(() => this.product().stock === 0);
  
  /**
   * Vérifie si le stock est faible
   */
  readonly isLowStock = computed(() => this.product().stock > 0 && this.product().stock < 10);
  
  readonly mainImageUrl = computed(() => {
    const product = this.product();
    let baseUrl: string | undefined;
    let imageTimestamp: string | undefined;

    // Full images array (detail view or admin)
    if (product.images?.length) {
      const main = product.images.find(img => img.principale) ?? product.images[0];
      baseUrl = main.url ?? main.chemin;
      imageTimestamp = main.updated_at;
    }
    // main_image only (list view — API returns single relation)
    else if (product.main_image) {
      baseUrl = product.main_image.url ?? product.main_image.chemin;
      imageTimestamp = product.main_image.updated_at;
    }

    if (!baseUrl) {
      return '/assets/images/placeholder.svg';
    }

    // Add cache-busting parameter using image timestamp
    // This forces browser refresh only when image actually changes
    const separator = baseUrl.includes('?') ? '&' : '?';
    const version = imageTimestamp ? new Date(imageTimestamp).getTime() : Date.now();
    return `${baseUrl}${separator}v=${version}`;
  });

  readonly imageAlt = computed(() => {
    const product = this.product();
    const img = product.images?.find(i => i.principale) ?? product.main_image;
    return img?.alt_text || product.nom;
  });
  
  /**
   * URL WhatsApp générée
   */
  readonly whatsappUrl = computed(() => {
    const product = this.product();
    return WhatsAppUtil.generateProductUrl(
      product.nom,
      product.prix,
      product.id,
      product.whatsapp_message || undefined
    );
  });
  
  /**
   * Classe CSS pour le badge de stock
   */
  readonly stockBadgeClass = computed(() => {
    if (this.isOutOfStock()) return 'bg-gray-500';
    if (this.isLowStock()) return 'bg-orange-500';
    return '';
  });
  
  /**
   * Texte du badge de stock
   */
  readonly stockBadgeText = computed(() => {
    if (this.isOutOfStock()) return 'Rupture';
    if (this.isLowStock()) return `Plus que ${this.product().stock}`;
    return '';
  });

  /**
   * Gère le hover sur la carte
   */
  onMouseEnter() {
    this.isHovered.set(true);
  }

  onMouseLeave() {
    this.isHovered.set(false);
  }

  /**
   * Toggle wishlist
   */
  onToggleWishlist(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isInWishlist.update(v => !v);
    this.wishlistToggled.emit({
      product: this.product(),
      added: this.isInWishlist()
    });
  }

  /**
   * Track WhatsApp click - CRITIQUE pour Analytics
   * Appelé AVANT l'ouverture de WhatsApp
   */
  onWhatsAppClick(event: MouseEvent) {
    const product = this.product();

    // Track l'événement d'intention d'achat
    this.analyticsService.trackEvent('whatsapp_purchase_click', {
      category: 'conversion',
      label: `Product: ${product.nom}`,
      data: {
        product_id: product.id,
        product_name: product.nom,
        product_price: product.prix,
        product_category: product.category?.nom || 'Uncategorized',
        product_slug: product.slug,
        quantity: 1 // Par défaut depuis la card
      },
      value: product.prix
    });

    // Le lien href s'ouvre normalement après le tracking
    // Pas besoin de preventDefault() car on veut que le lien fonctionne
  }
}
