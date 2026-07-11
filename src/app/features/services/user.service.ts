/**
 * Service de gestion des utilisateurs
 * Gère le profil, l'avatar, et les préférences utilisateur
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ENVIRONMENT } from '../../core/tokens/environment.token';
import { 
  User, 
  UserProfileUpdate, 
  PasswordChange, 
  AvatarUploadResponse,
  AvatarUploadApiResponse,
  UserStats,
  ApiResponse 
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.env.apiUrl}/api/user/profile`);
  }

  /**
   * Met à jour le profil utilisateur
   * @param data - Données du profil à mettre à jour
   */
  updateProfile(data: UserProfileUpdate): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.env.apiUrl}/api/user/profile`, data);
  }

  /**
   * Change le mot de passe
   * @param data - Données de changement de mot de passe
   */
  changePassword(data: PasswordChange): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.env.apiUrl}/api/user/password`, data);
  }

  /**
   * Upload de l'avatar - Version corrigée avec typage flexible
   * @param file - Fichier image
   */
  uploadAvatar(file: File): Observable<{ avatar_url: string; user?: User }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post<AvatarUploadApiResponse | AvatarUploadResponse>(
      `${this.env.apiUrl}/api/user/avatar`,
      formData
    ).pipe(
      map((response: any) => {
        // Gère différents formats de réponse possibles
        if (response.data && response.data.avatar_url) {
          return { avatar_url: response.data.avatar_url, user: response.data.user };
        }
        if (response.avatar_url) {
          return { avatar_url: response.avatar_url };
        }
        if (response.data && typeof response.data === 'string') {
          return { avatar_url: response.data };
        }
        // Fallback - essaie de trouver l'URL n'importe où
        const avatarUrl = response.avatar_url || response.data?.avatar_url || response.url || '';
        return { avatar_url: avatarUrl };
      })
    );
  }

  /**
   * Supprime l'avatar
   */
  deleteAvatar(): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.env.apiUrl}/api/user/avatar`);
  }

  /**
   * Récupère les statistiques de l'utilisateur
   */
  getUserStats(): Observable<ApiResponse<UserStats>> {
    return this.http.get<ApiResponse<UserStats>>(`${this.env.apiUrl}/api/user/stats`);
  }

  /**
   * Supprime le compte utilisateur
   */
  deleteAccount(): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.env.apiUrl}/api/user/account`);
  }
}