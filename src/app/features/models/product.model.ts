/**
 * Modèles TypeScript pour les produits ShopSN
 * Définit les structures de données utilisées dans tout le module produit
 */

export interface Category {
  id: number;
  nom: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  produits_count?: number;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  thumbnail_url: string;
  principale: boolean;
  alt_text: string | null;
  ordre: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  nom: string;
  slug: string;
  description: string;
  description_courte: string | null;
  prix: number;
  prix_format: string;      // "250 000 FCFA"
  stock: number;
  statut: 'actif' | 'inactif' | 'rupture';
  populaire: boolean;
  whatsapp_message: string | null;
  whatsapp_url: string;
  vues: number;
  category?: Category;
  images?: ProductImage[];
  main_image?: ProductImage;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Interface des filtres produits - Type cohérent
 */
export interface ProductFilters {
  page?: number;
  per_page?: number;
  category?: string;
  q?: string;
  prix_min?: number;
  prix_max?: number;
  sort?: 'recent' | 'prix_asc' | 'prix_desc' | 'populaire';
  en_stock?: boolean;
}

export interface CreateProductData {
  category_id: number;
  nom: string;
  description: string;
  description_courte?: string;
  prix: number;
  stock: number;
  statut: 'actif' | 'inactif';
  populaire?: boolean;
  whatsapp_message?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: number;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  links?: PaginationLinks;
}

export interface ProductStats {
  total: number;
  actifs: number;
  inactifs: number;
  rupture: number;
  populaires: number;
  vues_total: number;
}
