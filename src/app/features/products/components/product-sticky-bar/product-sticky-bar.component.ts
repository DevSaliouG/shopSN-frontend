/**
 * ProductStickyBar Component - Phase 3
 * Barre sticky mobile avec prix et CTA WhatsApp
 *
 * Features:
 * - Affichage fixe en bas sur mobile
 * - Affiche prix et disponibilité
 * - CTA WhatsApp proéminent
 * - Animation slide-in on scroll
 * - Respecte safe area (iPhone notch)
 */

import { Component, input, computed, signal, inject, PLATFORM_ID, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { STICKY_BAR_SCROLL_THRESHOLD } from '../../../../shared/constants/ui.constants';

@Component({
  selector: 'app-product-sticky-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-sticky-bar.component.html',
  styleUrls: ['./product-sticky-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductStickyBarComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Props
   */
  productName = input.required<string>();
  price = input.required<number>();
  isInStock = input<boolean>(true);
  whatsappUrl = input.required<string>();

  /**
   * État local
   */
  isVisible = signal<boolean>(false);

  /**
   * Prix formaté
   */
  readonly formattedPrice = computed(() => {
    return this.price().toLocaleString('fr-FR');
  });

  /**
   * Scroll listener
   */
  private scrollListener?: () => void;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollListener();
    }
  }

  ngOnDestroy(): void {
    if (this.scrollListener && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  /**
   * Setup scroll listener to show/hide sticky bar
   */
  private setupScrollListener(): void {
    let ticking = false;

    this.scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          if (scrollY > STICKY_BAR_SCROLL_THRESHOLD && !this.isVisible()) {
            this.isVisible.set(true);
          } else if (scrollY <= STICKY_BAR_SCROLL_THRESHOLD && this.isVisible()) {
            this.isVisible.set(false);
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  /**
   * Handle WhatsApp click
   */
  onWhatsAppClick(): void {
    if (!this.isInStock()) return;

    const url = this.whatsappUrl();
    if (isPlatformBrowser(this.platformId)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
