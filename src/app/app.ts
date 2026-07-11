import { afterNextRender, Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrowserUtils } from './core/utils/browser.utils';
import { Header } from './shared/components/header/header';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { NotificationCenterComponent } from './shared/components/notification-center/notification-center.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, FooterComponent, ToastComponent, NotificationCenterComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('OnlineStore');

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    afterNextRender(() => {
      import('swiper/element/bundle').then((swiper) => {
        swiper.register();
      });
    });
  }

  ngOnInit() {
    BrowserUtils.init(this.platformId);
  }
}
