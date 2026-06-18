/**
 * Composant de pagination générique
 * Affiche les contrôles de navigation entre les pages
 * 
 * Corrections:
 * - Gestion correcte de l'événement pageChange
 * - Validation des types Number
 * - Support des valeurs par défaut
 */

import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPages() > 1) {
      <nav class="flex items-center justify-center gap-2" aria-label="Pagination">
        <!-- Bouton Précédent -->
        <button
          (click)="goToPage(currentPage() - 1)"
          [disabled]="currentPage() === 1"
          class="pagination-btn"
          [class.disabled]="currentPage() === 1"
          aria-label="Page précédente"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <!-- Numéros de page -->
        <div class="flex gap-1">
          @for (page of visiblePages(); track page) {
            <button
              (click)="goToPage(page)"
              [class.active]="page === currentPage()"
              class="pagination-number"
              [attr.aria-label]="'Page ' + page"
              [attr.aria-current]="page === currentPage() ? 'page' : null"
            >
              {{ page }}
            </button>
          }
        </div>
        
        <!-- Bouton Suivant -->
        <button
          (click)="goToPage(currentPage() + 1)"
          [disabled]="currentPage() === totalPages()"
          class="pagination-btn"
          [class.disabled]="currentPage() === totalPages()"
          aria-label="Page suivante"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </nav>
    }
  `,
  styles: [`
    .pagination-btn, .pagination-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.5rem;
      height: 2.5rem;
      padding: 0 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      background: white;
      border: 1px solid #e5e7eb;
      color: #374151;
      cursor: pointer;
    }
    
    .pagination-btn:hover:not(.disabled),
    .pagination-number:hover:not(.active) {
      background: #f3f4f6;
      border-color: #d1d5db;
    }
    
    .pagination-number.active {
      background: #2D5A4C;
      border-color: #2D5A4C;
      color: white;
    }
    
    .pagination-btn.disabled,
    .pagination-number.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    @media (max-width: 640px) {
      .pagination-btn, .pagination-number {
        min-width: 2rem;
        height: 2rem;
        font-size: 0.75rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  // Inputs avec conversion automatique en nombre
  currentPage = input<number, number>(1, {
    transform: (value: number) => Number(value) || 1
  });
  
  totalPages = input<number, number>(1, {
    transform: (value: number) => Number(value) || 1
  });
  
  maxVisible = input<number>(5);
  
  // Output émet un nombre
  pageChange = output<number>();

  /**
   * Calcule les pages à afficher
   */
  readonly visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const maxVisible = this.maxVisible();
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  /**
   * Navigue vers une page spécifique
   * @param page - Numéro de page (nombre)
   */
  goToPage(page: number): void {
    // Conversion en nombre et validation
    const targetPage = Number(page);
    
    if (isNaN(targetPage)) {
      return;
    }
    
    if (targetPage !== this.currentPage() && targetPage >= 1 && targetPage <= this.totalPages()) {
      // Émet l'événement avec un nombre
      this.pageChange.emit(targetPage);
    }
  }
}