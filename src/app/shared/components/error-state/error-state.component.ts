/**
 * ErrorState Component - Phase 2
 * Composant d'état d'erreur avec retry et détails techniques
 *
 * Features:
 * - Message d'erreur user-friendly
 * - Bouton Retry
 * - Détails techniques collapsible
 * - Icons par type d'erreur
 * - Actions multiples (retry, home, support)
 */

import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ErrorType = 'network' | 'server' | 'notfound' | 'forbidden' | 'generic';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-state.component.html',
  styleUrls: ['./error-state.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorStateComponent {
  /**
   * Type d'erreur
   */
  errorType = input<ErrorType>('generic');

  /**
   * Message principal
   */
  title = input<string>('Une erreur est survenue');

  /**
   * Description de l'erreur
   */
  message = input<string>('Impossible de charger les données. Veuillez réessayer.');

  /**
   * Détails techniques (code, stack trace, etc.)
   */
  technicalDetails = input<string>('');

  /**
   * Afficher le bouton retry
   */
  showRetry = input<boolean>(true);

  /**
   * Afficher le bouton retour accueil
   */
  showHomeButton = input<boolean>(false);

  /**
   * Label du bouton retry
   */
  retryLabel = input<string>('Réessayer');

  /**
   * État du retry (loading)
   */
  isRetrying = signal<boolean>(false);

  /**
   * Afficher les détails techniques
   */
  showDetails = signal<boolean>(false);

  /**
   * Events
   */
  retry = output<void>();
  goHome = output<void>();

  /**
   * Gère le click sur retry
   */
  async onRetry(): Promise<void> {
    this.isRetrying.set(true);
    this.retry.emit();

    // Reset loading state après 2s (au cas où le parent ne le fait pas)
    setTimeout(() => {
      this.isRetrying.set(false);
    }, 2000);
  }

  /**
   * Toggle les détails techniques
   */
  toggleDetails(): void {
    this.showDetails.update(value => !value);
  }

  /**
   * Gère le click sur retour accueil
   */
  onGoHome(): void {
    this.goHome.emit();
  }

  /**
   * Retourne l'icône selon le type
   */
  getIconPath(): string {
    switch (this.errorType()) {
      case 'network':
        return 'M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z';
      case 'server':
        return 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01';
      case 'notfound':
        return 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z';
      case 'forbidden':
        return 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z';
      default:
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    }
  }

  /**
   * Retourne la couleur selon le type
   */
  getColorClass(): string {
    switch (this.errorType()) {
      case 'network':
        return 'text-orange-600';
      case 'server':
        return 'text-red-600';
      case 'notfound':
        return 'text-blue-600';
      case 'forbidden':
        return 'text-purple-600';
      default:
        return 'text-red-600';
    }
  }
}
