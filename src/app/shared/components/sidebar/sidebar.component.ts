import { Component, signal, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../features/services/auth.service';
import { SidebarService } from '../../../core/services/sidebar.service';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
}

/**
 * Composant Sidebar avec gestion d'état interne et service global
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  host: {
    '[class.collapsed]': 'isCollapsed()',
    '[class.expanded]': '!isCollapsed()',
    '[class.mobile-open]': 'isMobileOpen()',
  }
})
export class SidebarComponent {
  protected authService = inject(AuthService);
  private sidebarService = inject(SidebarService);

  // États du sidebar
  isMobileOpen = computed(() => this.sidebarService.isMobileOpen());
  isCollapsed = signal(false);

  // Liens publics (navbar)
  publicNavItems: NavItem[] = [
    { label: 'Accueil', route: '/', icon: 'home', exact: true },
    { label: 'Catalogue', route: '/produits', icon: 'catalog' },
    { label: 'À propos', route: '/a-propos', icon: 'info' },
    { label: 'Contact', route: '/contact', icon: 'contact' },
  ];

  // Liens admin
  adminNavItems: NavItem[] = [
    { label: 'Tableau de bord', route: '/admin/dashboard', icon: 'dashboard', exact: true },
    { label: 'Analytics', route: '/admin/analytics', icon: 'analytics' },
    { label: 'Produits', route: '/admin/produits', icon: 'products' },
    { label: 'Catégories', route: '/admin/categories', icon: 'categories' },
    { label: 'Utilisateurs', route: '/admin/utilisateurs', icon: 'users' },
    { label: 'Corbeille', route: '/admin/produits/supprimes', icon: 'trash' },
  ];

  constructor() {
    // Restaurer l'état de la sidebar depuis localStorage
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        this.isCollapsed.set(JSON.parse(saved));
      }
    }

    // Synchroniser la classe sidebar-collapsed avec le body
    effect(() => {
      if (typeof document !== 'undefined') {
        if (this.isCollapsed()) {
          document.body.classList.add('sidebar-collapsed');
        } else {
          document.body.classList.remove('sidebar-collapsed');
        }
      }
    });
  }

  /**
   * Toggle sidebar réduite (desktop)
   */
  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);

    // Sauvegarder dans localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(this.isCollapsed()));
    }
  }

  /**
   * Toggle sidebar mobile (délégué au service)
   */
  toggleMobileMenu(): void {
    this.sidebarService.toggleMobile();
  }

  /**
   * Fermer sidebar mobile (délégué au service)
   */
  closeMobileMenu(): void {
    this.sidebarService.closeMobile();
  }

  /**
   * Obtenir le label du tooltip
   */
  getTooltipLabel(item: NavItem): string {
    return item.label;
  }
}
