/**
 * Toast Service - Phase 2
 * Service de notifications toast réutilisable
 *
 * Features:
 * - Success, Error, Info, Warning types
 * - Auto-dismiss configurable (default 3s)
 * - Dismiss manuel
 * - Multiple toasts simultanés
 * - Accessible (aria-live)
 */

import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private nextId = 1;

  /**
   * Signal exposé en readonly pour le component
   */
  readonly toasts$ = this.toasts.asReadonly();

  /**
   * Affiche un toast de succès
   */
  success(message: string, duration = 3000): void {
    this.show({
      type: 'success',
      message,
      duration
    });
  }

  /**
   * Affiche un toast d'erreur
   */
  error(message: string, duration = 5000): void {
    this.show({
      type: 'error',
      message,
      duration
    });
  }

  /**
   * Affiche un toast d'information
   */
  info(message: string, duration = 3000): void {
    this.show({
      type: 'info',
      message,
      duration
    });
  }

  /**
   * Affiche un toast d'avertissement
   */
  warning(message: string, duration = 4000): void {
    this.show({
      type: 'warning',
      message,
      duration
    });
  }

  /**
   * Affiche un toast personnalisé
   */
  show(options: Omit<Toast, 'id'>): void {
    const toast: Toast = {
      id: this.nextId++,
      dismissible: true,
      ...options
    };

    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-dismiss si duration fournie
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration);
    }
  }

  /**
   * Ferme un toast spécifique
   */
  dismiss(id: number): void {
    this.toasts.update(toasts =>
      toasts.filter(toast => toast.id !== id)
    );
  }

  /**
   * Ferme tous les toasts
   */
  dismissAll(): void {
    this.toasts.set([]);
  }
}
