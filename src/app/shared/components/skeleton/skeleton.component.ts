import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card' | 'product-card';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (variant()) {
      @case ('card') {
        <div class="skeleton-card" [attr.style]="(width() ? 'width:' + width() + ';' : '') + (height() ? 'height:' + height() : '')">
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-line w-3/4"></div>
            <div class="skeleton-line w-1/2"></div>
          </div>
        </div>
      }
      @case ('product-card') {
        <div class="skeleton-product">
          <div class="skeleton-product-image"></div>
          <div class="skeleton-product-body">
            <div class="skeleton-line w-2/3 h-3"></div>
            <div class="skeleton-line w-full h-2.5"></div>
            <div class="skeleton-line w-1/3 h-4 mt-2"></div>
          </div>
        </div>
      }
      @case ('circular') {
        <div class="skeleton-pulse rounded-full" [attr.style]="'width:' + computedSize() + ';height:' + computedSize()"></div>
      }
      @case ('rectangular') {
        <div class="skeleton-pulse rounded-lg" [attr.style]="'width:' + (width() || '100%') + ';height:' + (height() || '120px')"></div>
      }
      @default {
        <div class="skeleton-pulse rounded" [attr.style]="'width:' + (width() || '100%') + ';height:' + (height() || '16px')"></div>
      }
    }
  `,
  styles: [`
    :host { display: block; }

    .skeleton-pulse {
      background: linear-gradient(90deg, #EBEBEB 25%, #F5F5F5 50%, #EBEBEB 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-card {
      border-radius: 16px;
      overflow: hidden;
      background: white;
      border: 1px solid #F0EDE8;
    }

    .skeleton-image {
      width: 100%;
      height: 180px;
      background: linear-gradient(90deg, #EBEBEB 25%, #F5F5F5 50%, #EBEBEB 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .skeleton-line {
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(90deg, #EBEBEB 25%, #F5F5F5 50%, #EBEBEB 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-product {
      border-radius: 16px;
      overflow: hidden;
      background: white;
      border: 1px solid #F0EDE8;
    }

    .skeleton-product-image {
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(90deg, #EBEBEB 25%, #F5F5F5 50%, #EBEBEB 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-product-body {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton-pulse, .skeleton-image, .skeleton-line, .skeleton-product-image {
        animation: none;
        opacity: 0.7;
      }
    }
  `]
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('text');
  width = input<string>('');
  height = input<string>('');
  size = input<string>('40px');

  computedSize = computed(() => this.size());
}
