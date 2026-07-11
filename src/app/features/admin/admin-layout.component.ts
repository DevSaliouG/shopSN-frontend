import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="admin-layout">
      <app-sidebar />
      <main class="admin-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #F5F5F5;
    }
    .admin-content {
      flex: 1;
      margin-left: 280px;  /* largeur par défaut */
      padding: 1.5rem;
      transition: margin-left 0.3s ease;
      margin-top: 72px;    /* pour ne pas être caché par le header */
    }
    /* Quand le sidebar est réduit, on ajuste la marge */
    .admin-layout:has(app-sidebar.collapsed) .admin-content {
      margin-left: 80px;
    }
    @media (max-width: 768px) {
      .admin-content {
        margin-left: 0 !important;
        margin-top: 0;
        padding: 1rem;
      }
    }
  `]
})
export class AdminLayoutComponent {}