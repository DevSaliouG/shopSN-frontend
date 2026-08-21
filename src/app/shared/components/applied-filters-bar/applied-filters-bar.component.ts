/**
 * AppliedFiltersBar Component - Phase 2 Partie 2
 * Barre affichant les filtres actifs avec possibilité de les retirer
 *
 * Features:
 * - Pills removable pour chaque filtre
 * - Bouton "Tout effacer"
 * - Animation entrance/exit
 * - Responsive
 */

import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export interface AppliedFilter {
  key: string;
  label: string;
  value: any;
}

@Component({
  selector: 'app-applied-filters-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applied-filters-bar.component.html',
  styleUrls: ['./applied-filters-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in',
          style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ]
})
export class AppliedFiltersBarComponent {
  /**
   * Filtres actifs
   */
  filters = input<AppliedFilter[]>([]);

  /**
   * Events
   */
  removeFilter = output<string>();
  clearAll = output<void>();

  /**
   * Retire un filtre
   */
  onRemoveFilter(key: string): void {
    this.removeFilter.emit(key);
  }

  /**
   * Efface tous les filtres
   */
  onClearAll(): void {
    this.clearAll.emit();
  }
}
