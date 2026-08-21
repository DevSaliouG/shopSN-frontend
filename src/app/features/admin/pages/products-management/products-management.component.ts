import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product, Category, UpdateProductData } from '../../../models/product.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { FcfaPipe } from '../../../../shared/pipes/fcfa.pipe';
import { ToastService } from '../../../services/toast.service';
import { ProductImagesComponent } from '../../components/product-images/product-images.component';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, FcfaPipe, ProductImagesComponent],
  templateUrl: './products-management.component.html',
  styleUrls: ['./products-management.component.css']
})
export class ProductsManagementComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  showTrashed = signal(false);
  isRestoring = signal<number | null>(null);
  isEditMode = computed(() => this.editingId() !== null);
  serverErrors = signal<Record<string, string[]>>({});
  isToggling = signal<number | null>(null);

  // Gestion des images (multiple)
  selectedImages = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);
  currentImageUrl = signal<string | null>(null);

  productForm = this.fb.group({
    nom: ['', Validators.required],
    category_id: [null as number | null, Validators.required],
    description: [''],
    prix: [0, [Validators.required, Validators.min(1)]],
    stock: [0, Validators.min(0)],
    statut: ['actif'],
    populaire: [false],
    whatsapp_message: ['']
  });

  ngOnInit(): void {
    // Vérifier si on est en mode corbeille via les données de route
    this.route.data.subscribe(data => {
      this.showTrashed.set(data['showTrashed'] === true);
      this.loadProducts();
    });

    this.loadCategories();

    // Vérifier si on doit ouvrir le modal de création avec une catégorie pré-remplie
    this.route.queryParams.subscribe(params => {
      const categoryId = params['categoryId'];
      if (categoryId) {
        const categoryIdNum = parseInt(categoryId, 10);
        if (!isNaN(categoryIdNum)) {
          // Attendre que les catégories soient chargées avant d'ouvrir le modal
          setTimeout(() => {
            this.openCreateModalWithCategory(categoryIdNum);
          }, 500);
        }
      }
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);

    if (this.showTrashed()) {
      this.productService.getDeletedProducts({ per_page: 100 }).subscribe({
        next: (res) => {
          console.log('🗑️ Produits supprimés chargés:', res.data);
          this.products.set(res.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('❌ Erreur chargement produits supprimés:', err);
          this.toast.error('Erreur chargement produits supprimés');
          this.isLoading.set(false);
        }
      });
    } else {
      this.productService.getAdminProducts({ per_page: 100 }).subscribe({
        next: (res) => {
          console.log('✅ Produits chargés:', res.data);
          this.products.set(res.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('❌ Erreur chargement produits:', err);
          this.toast.error('Erreur chargement produits');
          this.isLoading.set(false);
        }
      });
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories.set(res.data),
      error: () => this.toast.error('Erreur chargement catégories')
    });
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.serverErrors.set({});
    this.productForm.reset({
      nom: '',
      category_id: null,
      description: '',
      prix: 0,
      stock: 0,
      statut: 'actif',
      populaire: false,
      whatsapp_message: ''
    });
    this.selectedImages.set([]);
    this.imagePreviews.set([]);
    this.currentImageUrl.set(null);
    this.showModal.set(true);
  }

  /**
   * Ouvre le modal de création avec une catégorie pré-remplie
   */
  openCreateModalWithCategory(categoryId: number): void {
    this.editingId.set(null);
    this.serverErrors.set({});
    this.productForm.reset({
      nom: '',
      category_id: categoryId,
      description: '',
      prix: 0,
      stock: 0,
      statut: 'actif',
      populaire: false,
      whatsapp_message: ''
    });
    this.selectedImages.set([]);
    this.imagePreviews.set([]);
    this.currentImageUrl.set(null);
    this.showModal.set(true);
  }

  editProduct(product: Product): void {
    this.editingId.set(product.id);
    this.productForm.patchValue({
      nom: product.nom,
      category_id: product.category_id,
      description: product.description,
      prix: product.prix,
      stock: product.stock,
      statut: product.statut,
      populaire: product.populaire,
      whatsapp_message: product.whatsapp_message ?? ''
    });

    // Charger l'image principale si elle existe
    if (product.images && product.images.length > 0) {
      const mainImage = product.images.find(img => img.principale) || product.images[0];
      this.currentImageUrl.set(mainImage.url || null);
    } else {
      this.currentImageUrl.set(null);
    }

    this.selectedImages.set([]);
    this.imagePreviews.set([]);
    this.showModal.set(true);
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.serverErrors.set({});

    const raw = this.productForm.value;

    // Si des images sont sélectionnées, utiliser FormData
    if (this.selectedImages().length > 0) {
      const formData = new FormData();

      formData.append('category_id', raw.category_id!.toString());
      formData.append('nom', raw.nom!.trim());
      formData.append('description', raw.description || '');
      formData.append('prix', raw.prix!.toString());
      formData.append('stock', (raw.stock ?? 0).toString());
      formData.append('statut', raw.statut as string);
      formData.append('populaire', (raw.populaire ?? false) ? '1' : '0');

      if (raw.whatsapp_message?.trim()) {
        formData.append('whatsapp_message', raw.whatsapp_message.trim());
      }

      // Ajouter toutes les images
      this.selectedImages().forEach(image => {
        formData.append('images[]', image);
      });

      if (this.editingId()) {
        // Mode modification avec images
        this.productService.updateProductWithImage(this.editingId()!, formData).subscribe({
          next: () => {
            const count = this.selectedImages().length;
            this.toast.success(`Produit et ${count} image${count > 1 ? 's' : ''} modifié${count > 1 ? 's' : ''} avec succès`);
            this.loadProducts();
            this.closeModal();
          },
          error: (err: any) => {
            this.handleServerError(err, 'modification');
          }
        });
      } else {
        // Mode création avec images
        this.productService.createProductWithImage(formData).subscribe({
          next: () => {
            const count = this.selectedImages().length;
            this.toast.success(`Produit créé avec ${count} image${count > 1 ? 's' : ''} avec succès`);
            this.loadProducts();
            this.closeModal();
          },
          error: (err: any) => {
            this.handleServerError(err, 'création');
          }
        });
      }
    } else {
      // Pas d'image, utiliser JSON classique
      const data: Record<string, any> = {
        category_id: raw.category_id!,
        nom: raw.nom!.trim(),
        description: raw.description || '',
        prix: raw.prix!,
        stock: raw.stock ?? 0,
        statut: raw.statut as 'actif' | 'inactif',
        populaire: raw.populaire ?? false,
      };

      if (raw.whatsapp_message?.trim()) {
        data['whatsapp_message'] = raw.whatsapp_message.trim();
      }

      if (this.editingId()) {
        const updateData: UpdateProductData = {
          id: this.editingId()!,
          ...data
        };
        this.productService.updateProduct(updateData).subscribe({
          next: () => {
            this.toast.success('Produit modifié avec succès');
            this.loadProducts();
            this.closeModal();
          },
          error: (err: any) => {
            this.handleServerError(err, 'modification');
          }
        });
      } else {
        this.productService.createProduct(data as any).subscribe({
          next: () => {
            this.toast.success('Produit créé avec succès');
            this.loadProducts();
            this.closeModal();
          },
          error: (err: any) => {
            this.handleServerError(err, 'création');
          }
        });
      }
    }
  }

  private handleServerError(err: any, action: string): void {
    if (err.status === 422 && err.error?.errors) {
      this.serverErrors.set(err.error.errors);
      const messages = Object.values(err.error.errors as Record<string, string[]>)
        .flat()
        .join('. ');
      this.toast.error(messages);
    } else {
      this.toast.error(`Erreur lors de la ${action}`);
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Supprimer ce produit ?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.toast.success('Produit supprimé');
          this.loadProducts();
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.toast.error('Erreur lors de la suppression');
        }
      });
    }
  }

  restoreProduct(id: number): void {
    if (confirm('Restaurer ce produit ?')) {
      this.isRestoring.set(id);
      this.productService.restoreProduct(id).subscribe({
        next: () => {
          this.toast.success('Produit restauré avec succès');
          this.isRestoring.set(null);
          this.loadProducts();
        },
        error: (err) => {
          console.error('Erreur restauration:', err);
          this.toast.error('Erreur lors de la restauration');
          this.isRestoring.set(null);
        }
      });
    }
  }

  forceDeleteProduct(id: number): void {
    if (confirm('Supprimer définitivement ce produit ? Cette action est irréversible.')) {
      this.productService.forceDeleteProduct(id).subscribe({
        next: () => {
          this.toast.success('Produit supprimé définitivement');
          this.loadProducts();
        },
        error: (err) => {
          console.error('Erreur suppression définitive:', err);
          this.toast.error('Erreur suppression définitive');
        }
      });
    }
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.productForm.reset();
  }

  toggleStatus(product: Product): void {
    this.isToggling.set(product.id);
    this.productService.toggleProductStatus(product.id).subscribe({
      next: (res) => {
        this.products.update(list =>
          list.map(p => p.id === product.id ? { ...p, statut: res.data.statut } : p)
        );
        this.toast.success(`Produit "${product.nom}" : statut mis à jour`);
        this.isToggling.set(null);
      },
      error: () => {
        this.toast.error('Erreur lors du changement de statut');
        this.isToggling.set(null);
      }
    });
  }

  getPageTitle(): string {
    return this.showTrashed() ? '🗑️ Produits supprimés' : 'Gestion des produits';
  }

  /**
   * Gestion de la sélection de plusieurs images
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 10; // Limite maximale d'images

    // Vérifier le nombre total d'images
    const currentCount = this.selectedImages().length;
    if (currentCount + files.length > maxFiles) {
      this.toast.error(`Vous ne pouvez ajouter que ${maxFiles} images maximum`);
      return;
    }

    // Valider chaque fichier
    const validFiles: File[] = [];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        this.toast.error(`${file.name} : Format invalide. Formats acceptés : JPEG, PNG, WebP`);
        continue;
      }

      if (file.size > maxSize) {
        this.toast.error(`${file.name} : L'image ne doit pas dépasser 5 MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    // Ajouter les fichiers valides
    this.selectedImages.update(current => [...current, ...validFiles]);

    // Créer les previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviews.update(current => [...current, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset l'input pour permettre la re-sélection du même fichier
    input.value = '';
  }

  /**
   * Supprimer une image spécifique par index
   */
  removeImage(index: number): void {
    this.selectedImages.update(images => images.filter((_, i) => i !== index));
    this.imagePreviews.update(previews => previews.filter((_, i) => i !== index));
  }

  /**
   * Supprimer toutes les images sélectionnées
   */
  clearAllImages(): void {
    this.selectedImages.set([]);
    this.imagePreviews.set([]);
  }

  /**
   * Annuler la sélection d'image (bouton X) - garde pour compatibilité
   */
  clearImageSelection(): void {
    this.clearAllImages();
  }

  /**
   * URL de l'image à afficher (preview ou image actuelle) - garde pour compatibilité
   */
  getDisplayImageUrl(): string | null {
    return this.imagePreviews().length > 0 ? this.imagePreviews()[0] : this.currentImageUrl();
  }

  /**
   * Vérifie s'il y a des images sélectionnées
   */
  hasSelectedImages(): boolean {
    return this.selectedImages().length > 0;
  }
}