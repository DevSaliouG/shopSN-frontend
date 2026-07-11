import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../../../../core/tokens/environment.token';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'user' | 'admin';
  avatar_url: string | null;
  full_name: string;
  created_at: string;
}

interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css'],
})
export class UsersManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);
  private toast = inject(ToastService);
  protected authService = inject(AuthService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  isDeletingId = signal<number | null>(null);
  isTogglingRoleId = signal<number | null>(null);

  meta = signal({ total: 0, per_page: 20, current_page: 1, last_page: 1 });
  isEditMode = computed(() => this.editingId() !== null);

  userForm = this.fb.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['user' as 'user' | 'admin'],
    password: [''],
    password_confirmation: [''],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page = 1): void {
    this.isLoading.set(true);
    this.http
      .get<UsersResponse>(`${this.env.apiUrl}/api/admin/users?page=${page}&per_page=20`)
      .subscribe({
        next: (response) => {
          this.users.set(response.data);
          this.meta.set(response.meta);
          this.isLoading.set(false);
        },
        error: () => {
          this.toast.error('Erreur chargement utilisateurs');
          this.isLoading.set(false);
        },
      });
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.userForm.reset({ prenom: '', nom: '', email: '', role: 'user', password: '', password_confirmation: '' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  openEditModal(user: User): void {
    this.editingId.set(user.id);
    this.userForm.patchValue({ prenom: user.prenom, nom: user.nom, email: user.email, role: user.role, password: '', password_confirmation: '' });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const raw = this.userForm.value;
    const id = this.editingId();

    if (id) {
      const data: Record<string, any> = { prenom: raw.prenom!, nom: raw.nom!, email: raw.email!, role: raw.role! };
      if (raw.password?.trim()) {
        data['password'] = raw.password;
        data['password_confirmation'] = raw.password_confirmation;
      }
      this.http.put<{ data: User; message: string }>(`${this.env.apiUrl}/api/admin/users/${id}`, data).subscribe({
        next: () => {
          this.toast.success('Utilisateur mis à jour');
          this.closeModal();
          this.loadUsers(this.meta().current_page);
        },
        error: (err) => {
          const msg = err.error?.message || 'Erreur mise à jour utilisateur';
          this.toast.error(msg);
        },
      });
    } else {
      const data = { prenom: raw.prenom!, nom: raw.nom!, email: raw.email!, role: raw.role!, password: raw.password!, password_confirmation: raw.password_confirmation! };
      this.http.post<{ data: User; message: string }>(`${this.env.apiUrl}/api/admin/users`, data).subscribe({
        next: () => {
          this.toast.success('Utilisateur créé');
          this.closeModal();
          this.loadUsers(1);
        },
        error: (err) => {
          const msg = err.error?.message || 'Erreur création utilisateur';
          this.toast.error(msg);
        },
      });
    }
  }

  deleteUser(user: User): void {
    if (!confirm(`Supprimer l'utilisateur "${user.full_name}" ?`)) return;
    this.isDeletingId.set(user.id);
    this.http.delete<{ message: string }>(`${this.env.apiUrl}/api/admin/users/${user.id}`).subscribe({
      next: () => {
        this.toast.success('Utilisateur supprimé');
        this.isDeletingId.set(null);
        this.loadUsers(this.meta().current_page);
      },
      error: () => {
        this.toast.error('Erreur suppression utilisateur');
        this.isDeletingId.set(null);
      },
    });
  }

  toggleRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    this.isTogglingRoleId.set(user.id);
    this.http
      .patch<{ data: { user: User }; message: string }>(`${this.env.apiUrl}/api/admin/users/${user.id}/role`, { role: newRole })
      .subscribe({
        next: () => {
          this.toast.success(`Rôle mis à jour : ${newRole === 'admin' ? 'Admin' : 'Client'}`);
          this.isTogglingRoleId.set(null);
          this.loadUsers(this.meta().current_page);
          if (this.authService.currentUser()?.id === user.id) {
            this.authService.refreshUserData();
          }
        },
        error: () => {
          this.toast.error('Erreur mise à jour du rôle');
          this.isTogglingRoleId.set(null);
        },
      });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.userForm.reset();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.meta().last_page) return;
    this.loadUsers(page);
  }

  get pages(): number[] {
    return Array.from({ length: this.meta().last_page }, (_, i) => i + 1);
  }
}
