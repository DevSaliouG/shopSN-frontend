// src/app/features/admin/pages/users-management/users-management.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../../../../app.config';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>

      <div class="bg-white rounded-xl shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom complet</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscrit le</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @if (isLoading()) {
                <tr><td colspan="6" class="text-center py-8"><app-loading-spinner size="sm" /></td></tr>
              } @else {
                @for (user of users(); track user.id) {
                  <tr>
                    <td class="px-6 py-4 text-sm">{{ user.id }}</td>
                    <td class="px-6 py-4 text-sm">{{ user.prenom }} {{ user.nom }}</td>
                    <td class="px-6 py-4 text-sm">{{ user.email }}</td>
                    <td class="px-6 py-4 text-sm">
                      <span [class]="user.role === 'admin' ? 'text-purple-600 font-medium' : 'text-gray-600'">
                        {{ user.role === 'admin' ? 'Admin' : 'Client' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm">{{ user.created_at | date:'dd/MM/yyyy' }}</td>
                    <td class="px-6 py-4 text-right space-x-2">
                      <button (click)="toggleRole(user)" class="text-blue-600 hover:text-blue-800">
                        {{ user.role === 'admin' ? 'Retirer admin' : 'Nommer admin' }}
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UsersManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);
  private toast = inject(ToastService);
  private authService = inject(AuthService);

  users = signal<User[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<User[]>(`${this.env.apiUrl}/api/admin/users`).subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur chargement utilisateurs');
        this.isLoading.set(false);
      }
    });
  }

  toggleRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    this.http.patch(`${this.env.apiUrl}/api/admin/users/${user.id}/role`, { role: newRole }).subscribe({
      next: () => {
        this.toast.success(`Rôle mis à jour : ${newRole === 'admin' ? 'Admin' : 'Client'}`);
        this.loadUsers();
        // Rafraîchir l'utilisateur courant si c'est lui-même
        if (this.authService.currentUser()?.id === user.id) {
          this.authService.refreshUserData();
        }
      },
      error: () => this.toast.error('Erreur mise à jour du rôle')
    });
  }
}