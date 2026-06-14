/**
 * Modèles d'authentification pour ShopSN
 * Définit les structures de données liées à l'authentification
 */

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
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}
