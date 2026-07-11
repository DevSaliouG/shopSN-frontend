/**
 * Composant de galerie d'images avec Swiper
 * Affiche une galerie tactile avec miniatures
 *
 * Fonctionnalités:
 * - Swiper principal avec navigation
 * - Miniatures cliquables
 * - Zoom sur image (optionnel)
 * - Responsive (mobile/desktop)
 * - Lazy loading des images
 */

import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  signal,
  computed,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Swiper from 'swiper';
import { Navigation, Pagination, Thumbs, FreeMode, Zoom } from 'swiper/modules';

// Styles Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';

export interface GalleryImage {
  id: number;
  url: string;
  thumbnail: string;
  alt?: string;
  isMain?: boolean;
}

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-gallery">
      <!-- Swiper Principal -->
      <div class="main-swiper-container relative">
        <div class="swiper-wrapper">
          @for (image of images(); track image.id; let i = $index) {
            <div class="swiper-slide">
              <div class="swiper-zoom-container">
                <img
                  [src]="image.url"
                  [alt]="image.alt || 'Image produit'"
                  class="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          }
          @if (images().length === 0) {
            <div class="swiper-slide">
              <div class="swiper-zoom-container">
                <img
                  src="/assets/images/placeholder-large.webp"
                  alt="Image non disponible"
                  class="w-full h-full object-contain"
                />
              </div>
            </div>
          }
        </div>

        <!-- Navigation -->
        @if (images().length > 1) {
          <div class="swiper-button-next !text-primary-600"></div>
          <div class="swiper-button-prev !text-primary-600"></div>
        }

        <!-- Pagination -->
        <div class="swiper-pagination"></div>
      </div>

      <!-- Miniatures Swiper -->
      @if (images().length > 1) {
        <div class="thumbs-swiper-container mt-4">
          <div class="swiper-wrapper">
            @for (image of images(); track image.id) {
              <div class="swiper-slide">
                <img
                  [src]="image.thumbnail || image.url"
                  [alt]="image.alt || 'Miniature'"
                  class="w-full h-full object-cover rounded-lg cursor-pointer"
                  [class.main-thumb]="currentIndex() === $index"
                />
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .image-gallery {
        width: 100%;
        max-width: 100%;
      }

      .main-swiper-container {
        width: 100%;
        aspect-ratio: 1 / 1;
        background: #f9fafb;
        border-radius: 1rem;
        overflow: hidden;
      }

      .main-swiper-container .swiper-slide {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .main-swiper-container img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .thumbs-swiper-container {
        width: 100%;
        height: 100px;
      }

      .thumbs-swiper-container .swiper-slide {
        width: 80px;
        height: 80px;
        opacity: 0.6;
        transition: opacity 0.2s;
        cursor: pointer;
      }

      .thumbs-swiper-container .swiper-slide-thumb-active {
        opacity: 1;
      }

      .thumbs-swiper-container .swiper-slide img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 0.5rem;
        border: 2px solid transparent;
        transition: border-color 0.2s;
      }

      .thumbs-swiper-container .swiper-slide-thumb-active img {
        border-color: #FF6600;
      }

      .main-thumb {
        border-color: #FF6600 !important;
      }

      @media (max-width: 640px) {
        .thumbs-swiper-container {
          height: 70px;
        }
        .thumbs-swiper-container .swiper-slide {
          width: 60px;
          height: 60px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGalleryComponent implements OnInit, OnDestroy, AfterViewInit {
  images = input<GalleryImage[]>([]);
  enableZoom = input<boolean>(true);

  @ViewChild('mainSwiperContainer') mainSwiperContainer!: ElementRef;
  @ViewChild('thumbsSwiperContainer') thumbsSwiperContainer!: ElementRef;

  private mainSwiper: Swiper | null = null;
  private thumbsSwiper: Swiper | null = null;

  currentIndex = signal<number>(0);

  ngOnInit(): void {
    // Initialisation différée
  }

  ngAfterViewInit(): void {
    this.initSwipers();
  }

  ngOnDestroy(): void {
    this.destroySwipers();
  }

  private initSwipers(): void {
    // Module Zoom optionnel
    const modules = [Navigation, Pagination, FreeMode];
    if (this.enableZoom()) {
      modules.push(Zoom);
    }

    Swiper.use(modules);

    // Swiper des miniatures
    if (this.thumbsSwiperContainer) {
      this.thumbsSwiper = new Swiper(this.thumbsSwiperContainer.nativeElement, {
        slidesPerView: 'auto',
        spaceBetween: 10,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
          0: { spaceBetween: 8 },
          640: { spaceBetween: 10 },
          1024: { spaceBetween: 12 },
        },
      });
    }

    // Swiper principal
    if (this.mainSwiperContainer) {
      const swiperConfig: any = {
        slidesPerView: 1,
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
          slideChange: (swiper: Swiper) => {
            this.currentIndex.set(swiper.activeIndex);
          },
        },
      };

      if (this.enableZoom()) {
        swiperConfig.zoom = {
          maxRatio: 3,
          minRatio: 1,
          toggle: true,
        };
      }

      this.mainSwiper = new Swiper(this.mainSwiperContainer.nativeElement, swiperConfig);
    }
  }

  private destroySwipers(): void {
    if (this.mainSwiper) {
      this.mainSwiper.destroy(true, true);
      this.mainSwiper = null;
    }
    if (this.thumbsSwiper) {
      this.thumbsSwiper.destroy(true, true);
      this.thumbsSwiper = null;
    }
  }

  slideTo(index: number): void {
    if (this.mainSwiper) {
      this.mainSwiper.slideTo(index);
    }
  }
}
