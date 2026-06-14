/**
 * Composant d'état vide
 * Affiche un message lorsqu'aucune donnée n'est disponible
 * 
 * Fonctionnalités:
 * - Icônes personnalisables (shopping-bag, search, favorites, error, etc.)
 * - Titre et message personnalisés
 * - Bouton d'action optionnel
 * - Illustration animée
 * - Support multilingue
 */

import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type EmptyStateIcon = 
  | 'shopping-bag' 
  | 'search' 
  | 'favorites' 
  | 'error' 
  | 'network' 
  | 'cart' 
  | 'filter'
  | 'custom';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  icon = input<EmptyStateIcon>('shopping-bag');
  title = input<string>('Aucune donnée');
  message:any = input<string>('Aucun élément à afficher pour le moment.');
  actionLabel = input<string>('');
  actionIcon = input<string>('');
  showAction = input<boolean>(true);
  compact = input<boolean>(false);
  
  action = output<void>();

  /**
   * URL de l'icône SVG basée sur le type
   */
  readonly iconPath = computed(() => {
    switch (this.icon()) {
      case 'shopping-bag':
        return `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a2 2 0 100-4 2 2 0 000 4z" />
        `;
      
      case 'search':
        return `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        `;
      
      case 'favorites':
        return `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        `;
      
      case 'error':
        return `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        `;
      
      case 'network':
        return `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9" />
        `;
      
      case 'cart':
        return `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6" />
        `;
      
      case 'filter':
        return `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        `;
      
      default:
        return `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        `;
    }
  });

  /**
   * Classe CSS pour la taille en fonction du mode compact
   */
  readonly containerClass = computed(() => {
    return this.compact() 
      ? 'py-8 px-4'
      : 'py-12 px-6';
  });

  /**
   * Classe CSS pour la taille de l'icône
   */
  readonly iconSizeClass = computed(() => {
    return this.compact() 
      ? 'w-12 h-12'
      : 'w-20 h-20';
  });

  /**
   * Classe CSS pour la taille du titre
   */
  readonly titleSizeClass = computed(() => {
    return this.compact() 
      ? 'text-base'
      : 'text-xl md:text-2xl';
  });

  /**
   * Classe CSS pour la taille du message
   */
  readonly messageSizeClass = computed(() => {
    return this.compact() 
      ? 'text-xs'
      : 'text-sm md:text-base';
  });

  /**
   * Émet l'événement d'action
   */
  onAction(): void {
    this.action.emit();
  }
}
