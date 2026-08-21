/**
 * Composant Cart Slide-over
 * Panneau coulissant pour afficher le panier d'achat
 *
 * Fonctionnalités:
 * - Animation slide-in depuis la droite
 * - Affichage des produits avec quantités
 * - Calcul du total en temps réel
 * - Empty state élégant
 * - Actions : modifier quantité, supprimer
 */

import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  maxStock: number;
}

@Component({
  selector: 'app-cart-slide-over',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-slide-over.html',
  styleUrl: './cart-slide-over.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideIn', [
      state('closed', style({ transform: 'translateX(100%)' })),
      state('open', style({ transform: 'translateX(0)' })),
      transition('closed <=> open', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
    trigger('fadeIn', [
      state('closed', style({ opacity: 0 })),
      state('open', style({ opacity: 1 })),
      transition('closed => open', animate('250ms ease-in')),
      transition('open => closed', animate('200ms ease-out'))
    ]),
    trigger('itemAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(-20px)' }))
      ])
    ])
  ]
})
export class CartSlideOver {
  // Inputs
  isOpen = input<boolean>(false);
  items = input<CartItem[]>([]);

  // Outputs
  closeClicked = output<void>();
  quantityChanged = output<{ itemId: number; newQuantity: number }>();
  itemRemoved = output<number>();
  checkoutClicked = output<void>();

  // Computed
  readonly panelState = computed(() => this.isOpen() ? 'open' : 'closed');
  readonly itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );
  readonly isEmpty = computed(() => this.items().length === 0);

  /**
   * Ferme le panneau
   */
  onClose() {
    this.closeClicked.emit();
  }

  /**
   * Augmente la quantité d'un article
   */
  increaseQuantity(item: CartItem) {
    if (item.quantity < item.maxStock) {
      this.quantityChanged.emit({
        itemId: item.id,
        newQuantity: item.quantity + 1
      });
    }
  }

  /**
   * Diminue la quantité d'un article
   */
  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.quantityChanged.emit({
        itemId: item.id,
        newQuantity: item.quantity - 1
      });
    } else {
      this.removeItem(item.id);
    }
  }

  /**
   * Supprime un article du panier
   */
  removeItem(itemId: number) {
    this.itemRemoved.emit(itemId);
  }

  /**
   * Lance le processus de checkout
   */
  onCheckout() {
    this.checkoutClicked.emit();
  }

  /**
   * Formate le prix
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }
}
