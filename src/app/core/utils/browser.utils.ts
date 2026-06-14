import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

/**
 * Service utilitaire pour les opérations spécifiques au navigateur
 * Évite les erreurs "window is not defined" en SSR
 */
export class BrowserUtils {
  private static platformId: any;

  static init(platformId: any): void {
    BrowserUtils.platformId = platformId;
  }

  /**
   * Vérifie si on est dans le navigateur
   */
  static isBrowser(): boolean {
    return isPlatformBrowser(BrowserUtils.platformId);
  }

  /**
   * Récupère la largeur de l'écran
   */
  static getWindowWidth(): number {
    if (this.isBrowser()) {
      return window.innerWidth;
    }
    return 1024; // Valeur par défaut pour SSR
  }

  /**
   * Récupère la hauteur de l'écran
   */
  static getWindowHeight(): number {
    if (this.isBrowser()) {
      return window.innerHeight;
    }
    return 768; // Valeur par défaut pour SSR
  }

  /**
   * Scroll en haut de page
   */
  static scrollToTop(options?: ScrollToOptions): void {
    if (this.isBrowser()) {
      window.scrollTo({ top: 0, behavior: 'smooth', ...options });
    }
  }

  /**
   * Scroll vers un élément
   */
  static scrollToElement(elementId: string, options?: ScrollIntoViewOptions): void {
    if (this.isBrowser()) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start', ...options });
      }
    }
  }

  /**
   * Vérifie si l'écran est mobile
   */
  static isMobile(): boolean {
    if (this.isBrowser()) {
      return window.innerWidth < 768;
    }
    return false;
  }

  /**
   * Vérifie si l'écran est tablette
   */
  static isTablet(): boolean {
    if (this.isBrowser()) {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  }

  /**
   * Vérifie si l'écran est desktop
   */
  static isDesktop(): boolean {
    if (this.isBrowser()) {
      return window.innerWidth >= 1024;
    }
    return true;
  }

  /**
   * Enregistre un item dans localStorage
   */
  static setLocalStorage(key: string, value: any): void {
    if (this.isBrowser()) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  /**
   * Récupère un item de localStorage
   */
  static getLocalStorage(key: string): any {
    if (this.isBrowser()) {
      const item = localStorage.getItem(key);
      try {
        return item ? JSON.parse(item) : null;
      } catch {
        return item;
      }
    }
    return null;
  }

  /**
   * Supprime un item de localStorage
   */
  static removeLocalStorage(key: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(key);
    }
  }
}