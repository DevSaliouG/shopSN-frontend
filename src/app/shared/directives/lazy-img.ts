import { Directive, ElementRef, Input, OnInit, Renderer2, inject } from '@angular/core';

/**
 * Directive pour lazy loading des images avec blur placeholder
 *
 * Usage:
 * <img appLazyImg [src]="imageUrl" [appLazyBlur]="true" alt="Description" />
 */
@Directive({
  selector: 'img[appLazyImg]',
  standalone: true
})
export class LazyImgDirective implements OnInit {
  @Input() appLazyBlur: boolean = true;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const img = this.el.nativeElement as HTMLImageElement;

    // Ajouter classe blur initiale si activé
    if (this.appLazyBlur) {
      this.renderer.addClass(img, 'lazy-blur');
      this.renderer.setStyle(img, 'filter', 'blur(10px)');
      this.renderer.setStyle(img, 'transition', 'filter 0.3s ease');
    }

    // Native lazy loading (simple fallback)
    this.renderer.setAttribute(img, 'loading', 'lazy');

    // IntersectionObserver pour blur effect avancé (skip en SSR)
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window && this.appLazyBlur) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const image = entry.target as HTMLImageElement;

            // Charger l'image
            if (image.dataset['src']) {
              image.src = image.dataset['src'];
            }

            // Retirer le blur quand chargée
            image.onload = () => {
              this.renderer.setStyle(image, 'filter', 'none');
              this.renderer.removeClass(image, 'lazy-blur');
            };

            // Arrêter d'observer
            this.observer?.unobserve(image);
          }
        });
      }, {
        rootMargin: '50px' // Charger 50px avant d'être visible
      });

      // Si data-src existe, observer l'image
      if (img.dataset['src']) {
        this.observer.observe(img);
      }
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
