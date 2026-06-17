import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { CategoryService } from '../../../services/category.service';
import { ToastService } from '../../../services/toast.service';
import { Category } from '../../../models/product.model';

@Component({
  selector: 'app-categories-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './categories-management.component.html',
  styleUrls: ['./categories-management.component.css']
})
export class CategoriesManagementComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  categories = signal<Category[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  editingId = signal<number | null>(null);

  categoryForm = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    parent_id: [null as number | null]
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors du chargement des catégories');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.categoryForm.reset({ nom: '', description: '', parent_id: null });
    this.showModal.set(true);
  }

  editCategory(cat: Category): void {
    this.editingId.set(cat.id);
    this.categoryForm.patchValue({
      nom: cat.nom,
      description: cat.description ?? '',
      parent_id: cat.parent_id ?? null
    });
    this.showModal.set(true);
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) return;

    const raw = this.categoryForm.value;
    const data: { nom?: string; description?: string; parent_id?: number | null } = {};

    if (raw.nom) data.nom = raw.nom;
    if (raw.description) data.description = raw.description;
    if (raw.parent_id !== undefined) data.parent_id = raw.parent_id;

    if (this.editingId()) {
      this.categoryService.updateCategory(this.editingId()!, data).subscribe({
        next: () => {
          this.toast.success('Catégorie modifiée avec succès');
          this.loadCategories();
          this.closeModal();
        },
        error: () => this.toast.error('Erreur lors de la modification')
      });
    } else {
      this.categoryService.createCategory(data).subscribe({
        next: () => {
          this.toast.success('Catégorie créée avec succès');
          this.loadCategories();
          this.closeModal();
        },
        error: () => this.toast.error('Erreur lors de la création')
      });
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Supprimer définitivement cette catégorie ? Cette action est irréversible.')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.toast.success('Catégorie supprimée');
          this.loadCategories();
        },
        error: () => this.toast.error('Erreur lors de la suppression')
      });
    }
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.categoryForm.reset();
  }
}