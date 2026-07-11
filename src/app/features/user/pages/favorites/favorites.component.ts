/**
 * Page des favoris (wishlist)
 * Affiche la liste des produits favoris de l'utilisateur
 */

import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../../../products/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { FavoriteService } from '../../../services/favorite.service';
import { Favorite } from '../../../models/user.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    PaginationComponent
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoritesComponent implements OnInit {
  private readonly favoriteService = inject(FavoriteService);
  private readonly router = inject(Router);

  favorites = signal<Favorite[]>([]);
  isLoading = signal<boolean>(true);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalItems = signal<number>(0);

  ngOnInit(): void {
    this.loadFavorites();
  }

  /**
   * Charge la liste des favoris
   */
  loadFavorites(): void {
    this.isLoading.set(true);
    
    this.favoriteService.getFavorites(this.currentPage(), 20).subscribe({
      next: (response) => {
        this.favorites.set(response.data);
        if (response.meta) {
          this.currentPage.set(response.meta.current_page);
          this.totalPages.set(response.meta.last_page);
          this.totalItems.set(response.meta.total);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des favoris:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Change de page
   * @param page - Numéro de page
   */
  onPageChange(page: number): void {
    if (page === this.currentPage() || page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
    this.loadFavorites();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Supprime un produit des favoris
   * @param productId - ID du produit à supprimer
   */
  removeFavorite(productId: number): void {
    this.favoriteService.removeFavorite(productId).subscribe({
      next: () => {
        // Met à jour la liste locale
        this.favorites.update(favorites => 
          favorites.filter(f => f.product_id !== productId)
        );
        this.totalItems.update(total => total - 1);
        
        // Affiche un petit feedback (optionnel)
        this.showTemporaryMessage('Produit retiré des favoris');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
      }
    });
  }

  /**
   * Navigue vers la page des produits
   */
  navigateToProducts(): void {
    this.router.navigate(['/produits']);
  }

  /**
   * Affiche un message temporaire (feedback utilisateur)
   * @param message - Message à afficher
   */
  private showTemporaryMessage(message: string): void {
    // Implémentation simple - peut être remplacée par un ToastService
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'fixed bottom-4 right-4 bg-[#FF6600] text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}