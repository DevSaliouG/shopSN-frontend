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
import { NgOptimizedImage } from '@angular/common';
import { WhatsAppUtil } from '../../../../shared/utils/whatsapp.util';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
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
  
  /**
   * URL de l'image principale
   */
  readonly mainImageUrl = computed(() => {
    const product = this.product();
    const mainImage = product.images?.find(img => img.principale);
    if (mainImage) return mainImage.url;
    if (product.images?.length) return product.images[0].url;
    return '/assets/images/placeholder.webp';
  });
  
  /**
   * Alt text pour l'image
   */
  readonly imageAlt = computed(() => {
    const product = this.product();
    const mainImage = product.images?.find(img => img.principale);
    return mainImage?.alt_text || product.nom;
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
