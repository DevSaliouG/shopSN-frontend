import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Service Google Tag Manager
 * Gère le tracking des événements et pageviews
 */
@Injectable({
  providedIn: 'root'
})
export class GtmService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private gtmId = 'GTM-XXXXXXX'; // À remplacer par votre ID GTM
  private isInitialized = false;

  /**
   * Initialise GTM et le tracking des pageviews
   */
  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.isInitialized) {
      return;
    }

    this.loadGTM();
    this.trackPageViews();
    this.isInitialized = true;
  }

  /**
   * Charge le script GTM
   */
  private loadGTM(): void {
    // DataLayer initialization
    (window as any).dataLayer = (window as any).dataLayer || [];

    // GTM script
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${this.gtmId}`;
    document.head.appendChild(gtmScript);

    // GTM noscript iframe
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${this.gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

    console.log('[GTM] Initialized with ID:', this.gtmId);
  }

  /**
   * Track automatique des pageviews
   */
  private trackPageViews(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.pushEvent({
          event: 'pageview',
          page_path: event.urlAfterRedirects,
          page_title: document.title,
        });
      });
  }

  /**
   * Push un événement dans le dataLayer
   */
  pushEvent(event: Record<string, any>): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const dataLayer = (window as any).dataLayer;
    if (dataLayer) {
      dataLayer.push(event);
      console.log('[GTM] Event pushed:', event);
    }
  }

  /**
   * Track un clic sur produit
   */
  trackProductClick(product: {
    id: number;
    name: string;
    price: number;
    category?: string;
  }): void {
    this.pushEvent({
      event: 'product_click',
      ecommerce: {
        items: [{
          item_id: product.id.toString(),
          item_name: product.name,
          price: product.price,
          item_category: product.category || 'Non catégorisé',
        }]
      }
    });
  }

  /**
   * Track une commande WhatsApp
   */
  trackWhatsAppOrder(product: {
    id: number;
    name: string;
    price: number;
    quantity?: number;
  }): void {
    this.pushEvent({
      event: 'whatsapp_order',
      ecommerce: {
        currency: 'XOF',
        value: product.price * (product.quantity || 1),
        items: [{
          item_id: product.id.toString(),
          item_name: product.name,
          price: product.price,
          quantity: product.quantity || 1,
        }]
      }
    });
  }

  /**
   * Track une recherche
   */
  trackSearch(searchTerm: string, resultsCount: number): void {
    this.pushEvent({
      event: 'search',
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }

  /**
   * Track un filtre appliqué
   */
  trackFilter(filterType: string, filterValue: string): void {
    this.pushEvent({
      event: 'filter_applied',
      filter_type: filterType,
      filter_value: filterValue,
    });
  }

  /**
   * Track une inscription
   */
  trackSignup(method: string): void {
    this.pushEvent({
      event: 'sign_up',
      method: method,
    });
  }

  /**
   * Track une connexion
   */
  trackLogin(method: string): void {
    this.pushEvent({
      event: 'login',
      method: method,
    });
  }

  /**
   * Track une erreur
   */
  trackError(errorMessage: string, errorLocation: string): void {
    this.pushEvent({
      event: 'error',
      error_message: errorMessage,
      error_location: errorLocation,
    });
  }
}
