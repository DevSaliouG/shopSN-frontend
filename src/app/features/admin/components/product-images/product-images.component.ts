// src/app/features/admin/components/product-images/product-images.component.ts
import { Component, inject, signal, input, output, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ProductImage } from '../../../models/product.model';
import { ENVIRONMENT } from '../../../../core/tokens/environment.token';
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

      <!-- Section Preview avant upload -->
      @if (previewImages().length > 0) {
        <div class="preview-section">
          <div class="preview-header">
            <h4>🖼️ Aperçu ({{ previewImages().length }} image(s))</h4>
            <div class="preview-actions">
              <button class="btn-cancel" (click)="cancelPreviews()">
                Annuler
              </button>
              <button
                class="btn-confirm"
                (click)="uploadImages()"
                [disabled]="isUploading()"
              >
                @if (isUploading()) {
                  <span class="spinner-small"></span> Upload...
                } @else {
                  ✓ Confirmer l'upload
                }
              </button>
            </div>
          </div>
          <div class="preview-grid">
            @for (preview of previewImages(); track $index) {
              <div class="preview-card">
                <img [src]="preview.preview" [alt]="preview.file.name" />
                <button
                  class="btn-remove-preview"
                  (click)="removePreview($index)"
                  title="Retirer"
                >
                  ✕
                </button>
                <div class="preview-info">
                  <span class="file-name">{{ preview.file.name }}</span>
                  <span class="file-size">{{ formatFileSize(preview.file.size) }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

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
      background: #FF6600;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-upload:hover:not(:disabled) {
      background: #E65500;
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
    .upload-guidelines {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }
    .guidelines-icon {
      width: 20px;
      height: 20px;
      color: #2563EB;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .guidelines-text {
      font-size: 0.875rem;
      color: #1E40AF;
      line-height: 1.5;
    }
    .guidelines-text strong {
      color: #1E3A8A;
      font-weight: 600;
    }
    .guidelines-text small {
      font-size: 0.8125rem;
      color: #3B82F6;
    }
    .preview-section {
      background: #F0FDF4;
      border: 2px dashed #10B981;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .preview-header h4 {
      font-size: 0.9rem;
      font-weight: 600;
      color: #047857;
      margin: 0;
    }
    .preview-actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn-cancel {
      padding: 0.4rem 0.8rem;
      background: white;
      border: 1px solid #D1D5DB;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-cancel:hover {
      background: #F3F4F6;
    }
    .btn-confirm {
      padding: 0.4rem 0.8rem;
      background: #10B981;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .btn-confirm:hover:not(:disabled) {
      background: #059669;
    }
    .btn-confirm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.75rem;
    }
    .preview-card {
      position: relative;
      border-radius: 0.5rem;
      overflow: hidden;
      background: white;
      border: 2px solid #10B981;
    }
    .preview-card img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }
    .btn-remove-preview {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      background: rgba(239, 68, 68, 0.9);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.2s;
    }
    .btn-remove-preview:hover {
      background: #DC2626;
      transform: scale(1.1);
    }
    .preview-info {
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    .file-name {
      font-size: 0.75rem;
      color: #374151;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .file-size {
      font-size: 0.7rem;
      color: #6B7280;
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
      border-color: #FF6600;
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
      background: #FF6600;
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
      background: #FF6600;
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
export class ProductImagesComponent implements OnInit {
  private productService = inject(ProductService);
  private toast = inject(ToastService);
  private logger = inject(LoggerService);
  private env = inject(ENVIRONMENT);

  productId = input.required<number>();
  images = signal<ProductImage[]>([]);
  previewImages = signal<Array<{ file: File; preview: string }>>([]);
  isUploading = signal(false);
  isDeleting = signal<number | null>(null);
  isLoadingImages = signal(false);

  private get apiUrl(): string {
    return this.env.apiUrl || '';
  }

  constructor() {
    // Écouter les changements de productId pour recharger les images
    effect(() => {
      const id = this.productId();
      if (id) {
        this.logger.debug('ProductId changed:', id);
        this.loadImages();
      }
    });
  }

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    const id = this.productId();
    if (!id) {
      this.logger.warn('No product ID provided');
      return;
    }

    this.isLoadingImages.set(true);
    this.logger.debug('Loading images for product:', id);

    this.productService.getProduct(id).subscribe({
      next: (response) => {
        this.logger.debug('Product loaded with images:', response.data);
        // La structure est response.data.data.images (double nested)
        const product = (response.data as any).data || response.data;
        if (product.images && Array.isArray(product.images)) {
          this.images.set(product.images);
          this.logger.info(`${product.images.length} images loaded`);
        } else {
          this.images.set([]);
          this.logger.info('No images for this product');
        }
        this.isLoadingImages.set(false);
      },
      error: (err) => {
        this.logger.error('Error loading product images:', err);
        this.images.set([]);
        this.isLoadingImages.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    this.logger.debug('Files selected:', input.files.length);

    // Créer les previews
    const previews: Array<{ file: File; preview: string }> = [];
    const filesArray = Array.from(input.files);

    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({
          file,
          preview: e.target?.result as string
        });

        // Quand toutes les previews sont chargées, les afficher
        if (previews.length === filesArray.length) {
          this.previewImages.set(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  uploadImages(): void {
    const previews = this.previewImages();
    if (previews.length === 0) return;

    const formData = new FormData();
    previews.forEach(({ file }) => {
      formData.append('images[]', file);
    });

    this.isUploading.set(true);
    this.productService.uploadImages(this.productId(), formData).subscribe({
      next: (response) => {
        this.logger.info('Images uploaded successfully:', response);
        this.toast.success('Images uploadées avec succès');
        // Recharger toutes les images pour obtenir les nouveaux updated_at
        this.loadImages();
        // Invalider le cache des produits populaires
        this.productService.invalidatePopularCache();
        this.isUploading.set(false);
        this.previewImages.set([]);
      },
      error: (err) => {
        this.logger.error('Error uploading images:', err);

        // Extraire message d'erreur détaillé du backend
        let errorMessage = 'Erreur lors de l\'upload des images';

        if (err.error?.errors) {
          // Validation Laravel: afficher première erreur
          const firstError = Object.values(err.error.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          }
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.toast.error(errorMessage);
        this.isUploading.set(false);
        this.previewImages.set([]);
      }
    });
  }

  cancelPreviews(): void {
    this.previewImages.set([]);
  }

  removePreview(index: number): void {
    this.previewImages.update(previews =>
      previews.filter((_, i) => i !== index)
    );
  }

  getImageUrl(image: ProductImage): string {
    // Si l'URL est déjà fournie par l'API (complète), l'utiliser directement
    // Sinon construire l'URL à partir du chemin
    let baseUrl: string;

    if (image.url) {
      baseUrl = image.url;
    } else if (image.chemin) {
      // En développement avec proxy : /storage/products/xxx.jpg
      // Le proxy redirige automatiquement vers http://127.0.0.1:8000/storage/...
      baseUrl = `/storage/${image.chemin}`;
    } else {
      return '/assets/images/placeholder.webp';
    }

    // Add cache-busting parameter using image timestamp
    const separator = baseUrl.includes('?') ? '&' : '?';
    const version = image.updated_at ? new Date(image.updated_at).getTime() : Date.now();
    return `${baseUrl}${separator}v=${version}`;
  }

  setMainImage(imageId: number): void {
    this.productService.setMainImage(this.productId(), imageId).subscribe({
      next: (response) => {
        this.toast.success('Image principale définie');
        // Recharger pour obtenir les nouveaux updated_at
        this.loadImages();
        // Invalider le cache des produits populaires
        this.productService.invalidatePopularCache();
      },
      error: (err) => {
        this.logger.error('Error setting main image:', err);
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
        // Recharger toutes les images pour obtenir les nouveaux updated_at
        this.loadImages();
        // Invalider le cache des produits populaires
        this.productService.invalidatePopularCache();
        this.isDeleting.set(null);
      },
      error: (err) => {
        this.logger.error('Error deleting image:', err);
        this.toast.error('Erreur lors de la suppression');
        this.isDeleting.set(null);
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}