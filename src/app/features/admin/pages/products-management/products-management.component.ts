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

  productForm = this.fb.group({
    nom: ['', Validators.required],
    category_id: [null as number | null, Validators.required],
    description: [''],
    prix: [0, [Validators.required, Validators.min(0)]],
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
    this.showModal.set(true);
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const raw = this.productForm.value;
    const data = {
      category_id: raw.category_id!,
      nom: raw.nom!,
      description: raw.description || '',
      prix: raw.prix!,
      stock: raw.stock ?? 0,
      statut: raw.statut as 'actif' | 'inactif',
      populaire: raw.populaire ?? false,
      whatsapp_message: raw.whatsapp_message || ''
    };

    console.log('📤 Données envoyées:', data);

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
        error: (err) => {
          console.error('Erreur modification:', err);
          this.toast.error('Erreur lors de la modification');
        }
      });
    } else {
      this.productService.createProduct(data).subscribe({
        next: () => {
          this.toast.success('Produit créé avec succès');
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Erreur création:', err);
          this.toast.error('Erreur lors de la création');
        }
      });
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

  // Helper pour afficher le titre de la page
  getPageTitle(): string {
    return this.showTrashed() ? '🗑️ Produits supprimés' : 'Gestion des produits';
  }

  
}