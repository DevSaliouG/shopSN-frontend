// src/app/features/admin/components/product-images/product-images.component.ts
import { Component, inject, signal, input, output, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { ProductImage } from '../../../models/product.model';
@Component({
  selector: 'app-product-images',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-images-container">
      <div class="images-header">
        <h3>📸 Images du produit</h3>
        <div class="header-actions">
          <button class="btn-upload" (click)="fileInput.click()" [disabled]="isUploading()">
            @if (isUploading()) {
              <span class="spinner-small"></span> Upload en cours...
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter des images
            }
          </button>
          <input
            #fileInput
            type="file"
            multiple
            accept="image/*"
            (change)="onFileSelected($event)"
            style="display: none"
          />
        </div>
      </div>

      <!-- Grille d'images -->
      <div class="images-grid">
        @for (image of images(); track image.id) {
          <div class="image-card" [class.main-image]="image.principale">
            <img [src]="getImageUrl(image)" [alt]="'Image produit'" loading="lazy" />
            <div class="image-overlay">
              <div class="image-actions">
                @if (!image.principale) {
                  <button 
                    class="btn-set-main" 
                    (click)="setMainImage(image.id)" 
                    title="Définir comme principale"
                    [disabled]="isDeleting() === image.id"
                  >
                    ⭐
                  </button>
                } @else {
                  <span class="badge-main">⭐ Principale</span>
                }
                <button 
                  class="btn-delete-image" 
                  (click)="deleteImage(image.id)" 
                  title="Supprimer"
                  [disabled]="isDeleting() === image.id"
                >
                  @if (isDeleting() === image.id) {
                    <span class="spinner-small"></span>
                  } @else {
                    ✕
                  }
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-images">
            <p>Aucune image pour ce produit</p>
            <p class="text-sm text-gray-400">Cliquez sur "Ajouter des images" pour en uploader</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .product-images-container {
      background: white;
      border-radius: 0.75rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      margin-top: 1.5rem;
    }
    .images-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .images-header h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-upload {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.8rem;
      background: #2D5A4C;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-upload:hover:not(:disabled) {
      background: #1E3D33;
    }
    .btn-upload:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner-small {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid white;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.75rem;
    }
    .image-card {
      position: relative;
      aspect-ratio: 1;
      border-radius: 0.5rem;
      overflow: hidden;
      border: 2px solid transparent;
      transition: border-color 0.2s;
      background: #f3f4f6;
    }
    .image-card.main-image {
      border-color: #2D5A4C;
    }
    .image-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .image-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.2s;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 0.5rem;
    }
    .image-card:hover .image-overlay {
      opacity: 1;
    }
    .image-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .image-actions button {
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 0.25rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-set-main:hover:not(:disabled) {
      background: #2D5A4C;
      color: white;
    }
    .btn-delete-image:hover:not(:disabled) {
      background: #ef4444;
      color: white;
    }
    .btn-set-main:disabled,
    .btn-delete-image:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .badge-main {
      background: #2D5A4C;
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.7rem;
      font-weight: 600;
    }
    .empty-images {
      grid-column: 1 / -1;
      text-align: center;
      padding: 2rem;
      color: #9ca3af;
    }
    .empty-images p {
      margin: 0.25rem 0;
    }
  `]
})
export class ProductImagesComponent {
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  productId = input.required<number>();
  images = signal<ProductImage[]>([]);
  isUploading = signal(false);
  isDeleting = signal<number | null>(null);

  private get apiUrl(): string {
    return 'http://localhost:8000';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    console.log('📁 Fichiers sélectionnés:', input.files.length);

    const formData = new FormData();
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      console.log(`📄 Fichier ${i + 1}:`, file.name, file.size, file.type);
      formData.append('images[]', file);
    }

    this.isUploading.set(true);
    this.productService.uploadImages(this.productId(), formData).subscribe({
      next: (response) => {
        console.log('✅ Images uploadées:', response);
        this.toast.success('Images uploadées avec succès');
        this.images.update(imgs => [...imgs, ...response.data]);
        this.isUploading.set(false);
        input.value = '';
      },
      error: (err) => {
        console.error('❌ Erreur upload images:', err);
        this.toast.error('Erreur lors de l\'upload des images');
        this.isUploading.set(false);
        input.value = '';
      }
    });
  }

  getImageUrl(image: ProductImage): string {
    if (image.url) return image.url;
    if (image.chemin) return `${this.apiUrl}/storage/${image.chemin}`;
    return '/assets/images/placeholder.webp';
  }

  setMainImage(imageId: number): void {
    this.productService.setMainImage(this.productId(), imageId).subscribe({
      next: (response) => {
        this.toast.success('Image principale définie');
        this.images.update(imgs =>
          imgs.map(img => ({
            ...img,
            principale: img.id === imageId
          }))
        );
      },
      error: (err) => {
        console.error('❌ Erreur setMainImage:', err);
        this.toast.error('Erreur lors de la définition de l\'image principale');
      }
    });
  }

  deleteImage(imageId: number): void {
    if (!confirm('Supprimer cette image ?')) return;

    this.isDeleting.set(imageId);
    this.productService.deleteImage(this.productId(), imageId).subscribe({
      next: () => {
        this.toast.success('Image supprimée');
        this.images.update(imgs => imgs.filter(img => img.id !== imageId));
        this.isDeleting.set(null);
      },
      error: (err) => {
        console.error('❌ Erreur deleteImage:', err);
        this.toast.error('Erreur lors de la suppression');
        this.isDeleting.set(null);
      }
    });
  }
}