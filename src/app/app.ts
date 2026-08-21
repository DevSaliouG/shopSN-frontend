import { afterNextRender, Component, Inject, PLATFORM_ID, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrowserUtils } from './core/utils/browser.utils';
import { Header } from './shared/components/header/header';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { NotificationCenterComponent } from './shared/components/notification-center/notification-center.component';
import { CookieConsentComponent } from './shared/components/cookie-consent/cookie-consent.component';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, FooterComponent, ToastComponent, ToastContainerComponent, NotificationCenterComponent, CookieConsentComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('DkrOnlineStore');
  private analytics = inject(AnalyticsService);

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    afterNextRender(() => {
      import('swiper/element/bundle').then((swiper) => {
        swiper.register();
      });

      // Initialiser analytics après hydration
      this.analytics.init();
    });
  }

  ngOnInit() {
    BrowserUtils.init(this.platformId);
  }
}
