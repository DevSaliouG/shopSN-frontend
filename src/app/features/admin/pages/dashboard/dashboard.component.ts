import { Component, inject, signal, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../../../../core/tokens/environment.token';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { FcfaPipe } from '../../../../shared/pipes/fcfa.pipe';
import { AuthService } from '../../../services/auth.service';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalFavorites: number;
  totalOrders: number;
  revenue: number;
  recentProducts: {
    id: number;
    nom: string;
    prix: number;
    statut: 'actif' | 'inactif' | 'rupture';
    category?: { nom: string };
  }[];
  recentUsers: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    created_at: string;
  }[];
}

interface ApiDashboardResponse {
  data: {
    stats: {
      total_products: number;
      active_products: number;
      total_categories: number;
      total_users: number;
      total_favorites: number;
      total_orders: number;
      total_revenue: number;
    };
    top_products: Array<{
      id: number;
      nom: string;
      prix: number;
      statut: string;
      category?: { nom: string };
    }>;
    recent_users: Array<{
      id: number;
      nom: string;
      prenom: string;
      email: string;
      role: string;
      created_at: string;
    }>;
    sales_data: any;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FcfaPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);
  protected authService = inject(AuthService);

  private apiUrl = `${this.env.apiUrl}/api/admin/dashboard`;

  stats = signal<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalFavorites: 0,
    totalOrders: 0,
    revenue: 0,
    recentProducts: [],
    recentUsers: [],
  });

  isLoading = signal(true);
  error = signal<string | null>(null);

  hasRecentProducts = computed(() => this.stats().recentProducts.length > 0);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<ApiDashboardResponse>(this.apiUrl).subscribe({
      next: (response) => {
        const { stats, top_products, recent_users } = response.data;

        const mappedStats: DashboardStats = {
          totalProducts: stats.total_products ?? 0,
          activeProducts: stats.active_products ?? 0,
          totalCategories: stats.total_categories ?? 0,
          totalUsers: stats.total_users ?? 0,
          totalFavorites: stats.total_favorites ?? 0,
          totalOrders: stats.total_orders ?? 0,
          revenue: stats.total_revenue ?? 0,
          recentProducts: (top_products || []).map((product) => ({
            id: product.id,
            nom: product.nom || 'Sans nom',
            prix: product.prix ?? 0,
            statut: (product.statut || 'inactif') as 'actif' | 'inactif' | 'rupture',
            category: product.category ? { nom: product.category.nom || 'Non categorise' } : undefined,
          })),
          recentUsers: recent_users || [],
        };

        this.stats.set(mappedStats);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement dashboard:', err);
        this.error.set('Impossible de charger les statistiques. Reessayez plus tard.');
        this.isLoading.set(false);
      },
    });
  }
}