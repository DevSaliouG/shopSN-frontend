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

import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WhatsAppUtil } from '../../../../shared/utils/whatsapp.util';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  product = input.required<Product>();
  isListView = input<boolean>(false);
  showBadges = input<boolean>(true);

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
    // Full images array (detail view or admin)
    if (product.images?.length) {
      const main = product.images.find(img => img.principale) ?? product.images[0];
      return main.url ?? main.chemin ?? '/assets/images/placeholder.webp';
    }
    // main_image only (list view — API returns single relation)
    if (product.main_image) {
      return product.main_image.url ?? product.main_image.chemin ?? '/assets/images/placeholder.webp';
    }
    return '/assets/images/placeholder.webp';
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
}
