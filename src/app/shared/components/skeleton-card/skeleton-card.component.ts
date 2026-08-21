/**
 * SkeletonCard Component - Phase 2
 * Composant de chargement réutilisable pour simuler le ProductCard
 *
 * Features:
 * - Animation shimmer/pulse
 * - Support grid/list view
 * - Reusable et standalone
 */

import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-card.component.html',
  styleUrls: ['./skeleton-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonCardComponent {
  /**
   * Mode d'affichage: grid ou list
   */
  isListView = input<boolean>(false);

  /**
   * Nombre de lignes de texte à afficher pour le titre
   */
  titleLines = input<number>(2);

  /**
   * Afficher le badge skeleton
   */
  showBadge = input<boolean>(true);
}
