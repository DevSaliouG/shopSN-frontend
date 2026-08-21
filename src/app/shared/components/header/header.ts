import { Component, HostListener, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../features/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SearchAutocomplete } from '../search-autocomplete/search-autocomplete';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SearchAutocomplete],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.4, 0, 0.6, 1)', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class Header {
  protected authService = inject(AuthService);
  protected notificationService = inject(NotificationService);
  private router = inject(Router);

  dropdownOpen = signal(false);
  isCompact = signal(false);
  mobileMenuOpen = signal(false);

  private lastScrollTop = 0;
  private scrollThreshold = 100;

  constructor() {
    // Fermer le menu mobile lors de la navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
      });

    // Gérer le redimensionnement de la fenêtre
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        // Fermer le menu mobile quand on redimensionne vers desktop
        if (window.innerWidth >= 768 && this.mobileMenuOpen()) {
          this.closeMobileMenu();
        }

        // Désactiver le mode compact sur mobile
        if (window.innerWidth < 768 && this.isCompact()) {
          this.isCompact.set(false);
        }
      });
    }

    // Gérer le body overflow quand le menu est ouvert
    effect(() => {
      if (typeof document !== 'undefined') {
        if (this.mobileMenuOpen()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    // Ne pas activer le mode compact sur mobile (< 768px)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.isCompact.set(false);
      return;
    }

    const currentScroll = window.scrollY;

    // Activer le mode compact après scrollThreshold px (desktop/tablet uniquement)
    const shouldBeCompact = currentScroll > this.scrollThreshold;

    // Ne changer que si l'état change pour éviter les re-renders
    if (this.isCompact() !== shouldBeCompact) {
      this.isCompact.set(shouldBeCompact);
    }

    this.lastScrollTop = currentScroll;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.mobileMenuOpen()) {
      this.closeMobileMenu();
    }
    if (this.dropdownOpen()) {
      this.dropdownOpen.set(false);
    }
  }

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
    // Fermer le dropdown si ouvert
    if (this.mobileMenuOpen()) {
      this.dropdownOpen.set(false);
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
