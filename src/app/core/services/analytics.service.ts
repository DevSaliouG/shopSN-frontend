import { Injectable, inject } from '@angular/core';
import { GtmService } from './gtm.service';
import { AnalyticsTrackingService } from './analytics-tracking.service';

/**
 * Service Analytics - Interface simplifiée pour le tracking
 * Utilise GTM + Backend tracking
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private gtm = inject(GtmService);
  private tracking = inject(AnalyticsTrackingService);

  /**
   * Initialise les analytics
   * À appeler dans app.component.ts
   */
  init(): void {
    this.gtm.init();
    this.tracking.init(); // Initialiser tracking backend
  }

  /**
   * Track une vue de page produit
   */
  viewProduct(product: {
    id: number;
    nom: string;
    prix: number;
    categorie?: { nom: string };
  }): void {
    this.gtm.pushEvent({
      event: 'view_item',
      ecommerce: {
        currency: 'XOF',
        value: product.prix,
        items: [{
          item_id: product.id.toString(),
          item_name: product.nom,
          price: product.prix,
          item_category: product.categorie?.nom || 'Non catégorisé',
        }]
      }
    });
  }

  /**
   * Track un clic sur produit (liste)
   */
  clickProduct(product: any, listName: string = 'Catalogue'): void {
    this.gtm.trackProductClick({
      id: product.id,
      name: product.nom,
      price: product.prix,
      category: product.categorie?.nom,
    });

    this.gtm.pushEvent({
      event: 'select_item',
      ecommerce: {
        item_list_name: listName,
        items: [{
          item_id: product.id.toString(),
          item_name: product.nom,
          price: product.prix,
        }]
      }
    });
  }

  /**
   * Track une commande WhatsApp (conversion principale)
   */
  orderWhatsApp(product: any, quantity: number = 1): void {
    this.gtm.trackWhatsAppOrder({
      id: product.id,
      name: product.nom,
      price: product.prix,
      quantity: quantity,
    });

    // Conversion GA4
    this.gtm.pushEvent({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'XOF',
        value: product.prix * quantity,
        items: [{
          item_id: product.id.toString(),
          item_name: product.nom,
          price: product.prix,
          quantity: quantity,
        }]
      }
    });
  }

  /**
   * Track une recherche de produits
   */
  search(query: string, resultsCount: number): void {
    this.gtm.trackSearch(query, resultsCount);
  }

  /**
   * Track un filtre appliqué
   */
  applyFilter(filterType: string, value: string | number): void {
    this.gtm.trackFilter(filterType, value.toString());
  }

  /**
   * Track ajout aux favoris
   */
  addToFavorites(product: any): void {
    this.gtm.pushEvent({
      event: 'add_to_wishlist',
      ecommerce: {
        currency: 'XOF',
        value: product.prix,
        items: [{
          item_id: product.id.toString(),
          item_name: product.nom,
          price: product.prix,
        }]
      }
    });
  }

  /**
   * Track une inscription utilisateur
   */
  signUp(method: string = 'email'): void {
    this.gtm.trackSignup(method);
  }

  /**
   * Track une connexion
   */
  login(method: string = 'email'): void {
    this.gtm.trackLogin(method);
  }

  /**
   * Track un scroll jusqu'à une certaine profondeur
   */
  scrollDepth(depth: number): void {
    this.gtm.pushEvent({
      event: 'scroll_depth',
      depth: depth,
    });
  }

  /**
   * Track une erreur applicative
   */
  error(message: string, location: string): void {
    this.gtm.trackError(message, location);
  }

  /**
   * Track un partage social
   */
  share(method: string, contentType: string, itemId: string): void {
    this.gtm.pushEvent({
      event: 'share',
      method: method,
      content_type: contentType,
      item_id: itemId,
    });
  }
}
