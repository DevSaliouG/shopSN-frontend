/**
 * ProductGallery Component - Modern E-commerce Design
 * Clean, fast, thumb-driven gallery with lightbox
 *
 * Features:
 * - Instant thumbnail switching (no slide animation)
 * - Hover zoom on main image (desktop)
 * - Click to open lightbox with full Swiper navigation
 * - Vertical thumbnails (desktop) / Horizontal (mobile)
 * - Pinch to zoom in lightbox (mobile)
 * - Keyboard navigation in lightbox
 * - Minimal UI, maximum content
 */

import { Component, input, signal, computed, inject, PLATFORM_ID, ChangeDetectionStrategy, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Swiper from 'swiper';
import { Navigation, Pagination, Zoom } from 'swiper/modules';

export interface GalleryImage {
  id?: number;
  url?: string;
  chemin?: string;
  alt_text?: string | null;
  principale?: boolean;
  ordre: number;
  updated_at: string;
}

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-gallery.component.html',
  styleUrls: ['./product-gallery.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductGalleryComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Images de la galerie
   */
  images = input.required<GalleryImage[]>();

  /**
   * État local
   */
  showLightbox = signal<boolean>(false);
  currentImageIndex = signal<number>(0);
  isZoomed = signal<boolean>(false);
  zoomOrigin = signal<{ x: number; y: number }>({ x: 50, y: 50 });

  /**
   * Swiper instances (lightbox only)
   */
  private lightboxSwiper: Swiper | null = null;

  /**
   * Images triées par ordre
   */
  readonly sortedImages = computed(() =>
    [...this.images()].sort((a, b) => a.ordre - b.ordre)
  );

  /**
   * Image courante
   */
  readonly currentImage = computed(() => {
    const images = this.sortedImages();
    const index = this.currentImageIndex();
    return images[index] || images[0];
  });

  /**
   * URL de l'image avec cache-busting
   */
  getImageUrl(image: GalleryImage): string {
    const baseUrl = image.url || image.chemin || '';
    if (!baseUrl) return '/assets/images/placeholder.svg';

    const separator = baseUrl.includes('?') ? '&' : '?';
    const version = new Date(image.updated_at).getTime();
    return `${baseUrl}${separator}v=${version}`;
  }

  ngAfterViewInit(): void {
    // No Swiper initialization needed for main gallery
    // Swiper only used in lightbox
  }

  ngOnDestroy(): void {
    this.destroyLightbox();
  }

  /**
   * Destroy lightbox Swiper
   */
  private destroyLightbox(): void {
    if (this.lightboxSwiper) {
      this.lightboxSwiper.destroy(true, true);
      this.lightboxSwiper = null;
    }
  }

  /**
   * Select image by index (for thumbnails)
   */
  selectImage(index: number): void {
    this.currentImageIndex.set(index);
    this.isZoomed.set(false);
  }

  /**
   * Ouvre le lightbox
   */
  openLightbox(index?: number): void {
    if (index !== undefined) {
      this.currentImageIndex.set(index);
    }
    this.showLightbox.set(true);

    // Prevent body scroll
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';

      // Init lightbox swiper
      setTimeout(() => this.initLightboxSwiper(), 100);
    }
  }

  /**
   * Ferme le lightbox
   */
  closeLightbox(): void {
    this.showLightbox.set(false);
    this.isZoomed.set(false);

    // Restore body scroll
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }

    // Destroy lightbox swiper
    this.destroyLightbox();
  }

  /**
   * Init lightbox swiper
   */
  private initLightboxSwiper(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Register Swiper modules
    Swiper.use([Navigation, Pagination, Zoom]);

    const lightboxElement = document.querySelector('.lightbox-swiper') as HTMLElement;
    if (lightboxElement && !lightboxElement.classList.contains('swiper-initialized')) {
      this.lightboxSwiper = new Swiper('.lightbox-swiper', {
        initialSlide: this.currentImageIndex(),
        spaceBetween: 10,
        autoplay: false,
        loop: false,
        navigation: {
          nextEl: '.lightbox-button-next',
          prevEl: '.lightbox-button-prev',
        },
        pagination: {
          el: '.lightbox-pagination',
          type: 'fraction',
        },
        keyboard: {
          enabled: true,
        },
        zoom: {
          maxRatio: 3,
          minRatio: 1,
        },
        on: {
          slideChange: (swiper) => {
            this.currentImageIndex.set(swiper.activeIndex);
          },
        },
      });
    }
  }

  /**
   * Navigation lightbox
   */
  nextImage(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.lightboxSwiper) {
      this.lightboxSwiper.slideNext();
    }
  }

  previousImage(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.lightboxSwiper) {
      this.lightboxSwiper.slidePrev();
    }
  }

  /**
   * Zoom hover (desktop)
   */
  onMouseMove(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.zoomOrigin.set({ x, y });
    this.isZoomed.set(true);
  }

  onMouseLeave(): void {
    this.isZoomed.set(false);
  }


  /**
   * Keyboard navigation (lightbox)
   */
  onKeyDown(event: KeyboardEvent): void {
    if (!this.showLightbox()) return;

    switch (event.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowLeft':
        this.previousImage();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
    }
  }
}
