import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../features/services/auth.service';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  protected authService = inject(AuthService);

  isMobileOpen = signal(false);
  isCollapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Tableau de bord', route: '/admin/dashboard', icon: 'dashboard', exact: true },
    { label: 'Produits', route: '/admin/produits', icon: 'products' },
    { label: 'Catégories', route: '/admin/categories', icon: 'categories' },
    { label: 'Utilisateurs', route: '/admin/utilisateurs', icon: 'users' },
    { label: 'Corbeille', route: '/admin/produits/supprimes', icon: 'trash' },
  ];

  toggleMobileMenu(): void {
    this.isMobileOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileOpen.set(false);
  }

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }
}