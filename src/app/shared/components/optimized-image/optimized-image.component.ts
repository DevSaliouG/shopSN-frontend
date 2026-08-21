import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant image optimisé avec support WebP et fallback
 *
 * Usage:
 * <app-optimized-image
 *   src="logo.jpeg"
 *   alt="Logo DkrOnlineStore"
 *   [width]="200"
 *   [height]="200"
 * />
 */
@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <picture>
      <source
        [srcset]="webpSrc"
        type="image/webp"
      />
      <img
        [src]="src"
        [alt]="alt"
        [width]="width"
        [height]="height"
        [class]="className"
        [loading]="loading"
        [attr.fetchpriority]="fetchpriority"
      />
    </picture>
  `,
  styles: [`
    :host { display: contents; }
    picture { display: contents; }
    img { max-width: 100%; height: auto; }
  `]
})
export class OptimizedImageComponent {
  @Input() src!: string;
  @Input() alt: string = '';
  @Input() width?: number;
  @Input() height?: number;
  @Input() className: string = '';
  @Input() loading: 'lazy' | 'eager' = 'lazy';
  @Input() fetchpriority: 'high' | 'low' | 'auto' = 'auto';

  /**
   * Génère automatiquement le src WebP à partir du src original
   */
  get webpSrc(): string {
    return this.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
}
