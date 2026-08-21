import { Injectable, signal } from '@angular/core';

/**
 * Service global pour gérer l'état du sidebar
 * Permet la communication entre Header et Sidebar
 */
@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // État mobile du sidebar
  isMobileOpen = signal(false);

  /**
   * Toggle l'ouverture du sidebar mobile
   */
  toggleMobile(): void {
    this.isMobileOpen.update(v => !v);
    this.updateBodyClass();
  }

  /**
   * Fermer le sidebar mobile
   */
  closeMobile(): void {
    this.isMobileOpen.set(false);
    this.updateBodyClass();
  }

  /**
   * Ouvrir le sidebar mobile
   */
  openMobile(): void {
    this.isMobileOpen.set(true);
    this.updateBodyClass();
  }

  /**
   * Met à jour la classe sur le body pour bloquer le scroll
   */
  private updateBodyClass(): void {
    if (typeof document !== 'undefined') {
      if (this.isMobileOpen()) {
        document.body.classList.add('sidebar-mobile-open');
      } else {
        document.body.classList.remove('sidebar-mobile-open');
      }
    }
  }
}
