import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

/**
 * Layout pour la zone admin avec sidebar
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="admin-layout">
      <app-sidebar class="admin-sidebar" />
      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }

    .admin-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
      background: var(--color-bg, #F9FAFB);
      position: relative;
    }

    .admin-sidebar {
      position: fixed;
      top: var(--navbar-height, 68px);
      left: 0;
      width: var(--sidebar-width, 260px);
      height: calc(100vh - var(--navbar-height, 68px));
      z-index: var(--z-sidebar, 100);
      transition: width var(--transition-base, 0.22s) ease,
                  transform var(--transition-base, 0.22s) ease;
    }

    /* Quand sidebar est réduite */
    :host-context(body.sidebar-collapsed) .admin-sidebar {
      width: var(--sidebar-width-collapsed, 72px);
    }

    .admin-main {
      flex: 1;
      margin-left: var(--sidebar-width, 260px);
      padding: var(--space-lg, 1.5rem);
      padding-top: calc(var(--navbar-height, 68px) + 1.5rem);
      min-height: 100vh;
      width: calc(100% - var(--sidebar-width, 260px));
      max-width: 100%;
      transition: margin-left var(--transition-base, 0.22s) ease,
                  width var(--transition-base, 0.22s) ease;
    }

    /* Quand sidebar est réduite */
    :host-context(body.sidebar-collapsed) .admin-main {
      margin-left: var(--sidebar-width-collapsed, 72px);
      width: calc(100% - var(--sidebar-width-collapsed, 72px));
    }

    /* Responsive Mobile */
    @media (max-width: 1023px) {
      .admin-sidebar {
        transform: translateX(-100%);
        width: min(85vw, 320px);
        z-index: var(--z-sidebar-overlay, 350);
      }

      :host-context(body.sidebar-mobile-open) .admin-sidebar {
        transform: translateX(0);
      }

      .admin-main {
        margin-left: 0;
        width: 100%;
        padding: var(--space-md, 1rem);
        padding-top: calc(var(--navbar-height, 68px) + 1rem);
      }

      :host-context(body.sidebar-collapsed) .admin-main {
        margin-left: 0;
        width: 100%;
      }
    }

    @media (max-width: 767px) {
      .admin-sidebar {
        top: 0;
        height: 100vh;
        width: min(90vw, 280px);
      }

      .admin-main {
        padding: var(--space-sm, 0.5rem);
        padding-top: calc(var(--navbar-height, 68px) + 0.75rem);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .admin-sidebar,
      .admin-main {
        transition-duration: 0.01ms !important;
      }
    }
  `]
})
export class AdminLayoutComponent {}
