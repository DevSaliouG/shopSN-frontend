import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter, interval, switchMap } from 'rxjs';
import { ENVIRONMENT } from '../tokens/environment.token';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsTrackingService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private env = inject(ENVIRONMENT);
  private apiUrl = `${this.env.apiUrl}/api/analytics`;

  private pageLoadTime = Date.now();

  init() {
    // Track page views sur navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.url);
      });

    // Heartbeat toutes les 30 secondes (garder session active)
    interval(30000)
      .pipe(switchMap(() => this.http.post(`${this.apiUrl}/heartbeat`, {})))
      .subscribe({
        error: () => {} // Ignorer erreurs heartbeat
      });
  }

  /**
   * Track page view
   */
  trackPageView(url: string) {
    const path = url.split('?')[0];

    const data = {
      url: window.location.href,
      path: path,
      title: document.title,
      page_type: this.detectPageType(path),
      product_id: this.extractProductId(path),
      product_slug: this.extractProductSlug(path),
    };

    this.http.post(`${this.apiUrl}/track/page-view`, data).subscribe({
      error: (err) => console.warn('Analytics tracking error', err)
    });

    this.pageLoadTime = Date.now();
  }

  /**
   * Track event
   */
  trackEvent(eventType: string, eventData: any = {}) {
    const data = {
      event_type: eventType,
      event_category: eventData.category,
      event_label: eventData.label,
      event_data: eventData.data,
      event_value: eventData.value,
    };

    this.http.post(`${this.apiUrl}/track/event`, data).subscribe({
      error: (err) => console.warn('Analytics event error', err)
    });
  }

  /**
   * Track product view
   */
  trackProductView(product: any) {
    this.trackEvent('product_view', {
      category: 'e-commerce',
      label: product.name,
      data: {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_category: product.category?.name,
      },
      value: product.price,
    });
  }

  /**
   * Track WhatsApp click
   */
  trackWhatsAppClick(product?: any) {
    this.trackEvent('whatsapp_click', {
      category: 'engagement',
      label: product ? `Product: ${product.name}` : 'Contact',
      data: product ? { product_id: product.id } : null,
    });
  }

  /**
   * Track order
   */
  trackOrder(order: any) {
    this.trackEvent('order', {
      category: 'conversion',
      label: `Order ${order.order_number}`,
      data: {
        order_id: order.id,
        order_number: order.order_number,
        items_count: order.items.length,
        payment_method: order.payment_method,
      },
      value: order.total,
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount: number) {
    this.trackEvent('search', {
      category: 'engagement',
      label: query,
      data: {
        query: query,
        results_count: resultsCount,
      },
    });
  }

  // Helpers
  private detectPageType(path: string): string {
    if (path === '/' || path === '') return 'homepage';
    if (path.startsWith('/produit/')) return 'product';
    if (path.startsWith('/produits') || path.startsWith('/categorie/')) return 'category';
    if (path === '/panier') return 'cart';
    if (path === '/commander') return 'checkout';
    if (path === '/contact') return 'contact';
    if (path === '/a-propos') return 'about';
    return 'other';
  }

  private extractProductId(path: string): number | null {
    const match = path.match(/produit\/.*-(\d+)$/);
    return match ? parseInt(match[1]) : null;
  }

  private extractProductSlug(path: string): string | null {
    const match = path.match(/produit\/(.+)$/);
    return match ? match[1] : null;
  }
}
