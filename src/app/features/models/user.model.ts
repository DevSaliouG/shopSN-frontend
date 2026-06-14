/**
 * Modèles TypeScript pour la gestion des utilisateurs
 * Définit les structures de données du profil utilisateur
 */

import { Product } from './product.model';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string | null;
  avatar_url: string;
  full_name: string;
  email_verified_at: string | null;
  phone?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  nom?: string;
  prenom?: string;
  email?: string;
  phone?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
}

export interface PasswordChange {
  current_password: string;
  password: string;
  password_confirmation: string;
}

/**
 * Interface corrigée pour la réponse d'upload d'avatar
 * La structure peut être: { data: { avatar_url: string } } ou { avatar_url: string }
 */
export interface AvatarUploadResponse {
  data?: {
    avatar_url: string;
    user?: User;
  };
  avatar_url?: string;
  message?: string;
  success?: boolean;
}

/**
 * Interface alternative si l'API retourne directement l'utilisateur
 */
export interface AvatarUploadApiResponse {
  success: boolean;
  message: string;
  data: {
    avatar_url: string;
    user?: User;
  };
}

export interface Favorite {
  id: number;
  user_id: number;
  product_id: number;
  product: Product;
  created_at: string;
}

export interface UserStats {
  total_favorites: number;
  total_orders?: number;
  total_views?: number;
  member_since: string;
  last_login?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}