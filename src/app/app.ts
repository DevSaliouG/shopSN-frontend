import { afterNextRender, Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { BrowserUtils } from './core/utils/browser.utils';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('shopSN-frontend');

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    // afterNextRender s'assure que ce code ne tourne JAMAIS côté serveur (SSR)
    // Cela évite l'Erreur 500 !
    afterNextRender(() => {
      // Import dynamique de Swiper uniquement dans le navigateur
      import('swiper/element/bundle').then((swiper) => {
        swiper.register();
      });
    });
  }

  ngOnInit() {
    // 2. Enregistrer globalement les composants de Swiper (<swiper-container> et <swiper-slide>)
    register();
    BrowserUtils.init(this.platformId);
  }
}
