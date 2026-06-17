import { Component, inject, signal, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../../../../app.config';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { FcfaPipe } from '../../../../shared/pipes/fcfa.pipe';
import { AuthService } from '../../../services/auth.service';

// Interface pour la structure de données attendue dans le template
interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  revenue: number;
  recentProducts: {
    id: number;
    nom: string;
    prix: number;
    statut: 'actif' | 'inactif' | 'rupture';
    category?: { nom: string };
  }[];
}

// Interface décrivant la réponse complète du backend
interface ApiDashboardResponse {
  stats: {
    total_products?: number;
    total_users?: number;
    total_orders?: number;
    revenue?: number;
    // d'autres éventuels champs
  };
  top_products: Array<{
    id: number;
    nom?: string;        // selon le backend
    name?: string;       // fallback
    prix?: number;
    price?: number;
    statut?: string;
    status?: string;
    category?: {
      nom?: string;
      name?: string;
    };
  }>;
  recent_users: any[];   // non utilisé pour l'instant
  sales_data: any[];     // non utilisé pour l'instant
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
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0,
    recentProducts: [],
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
        // Extraction et mapping des données
        const stats = response.stats || {};
        const topProducts = response.top_products || [];

        const mappedStats: DashboardStats = {
          totalProducts: stats.total_products ?? 0,
          totalUsers: stats.total_users ?? 0,
          totalOrders: stats.total_orders ?? 0,
          revenue: stats.revenue ?? 0,
          recentProducts: topProducts.map((product) => ({
            id: product.id,
            nom: product.nom || product.name || 'Sans nom',
            prix: product.prix ?? product.price ?? 0,
            statut: (product.statut || product.status || 'inactif') as 'actif' | 'inactif' | 'rupture',
            category: product.category ? {
              nom: product.category.nom || product.category.name || 'Non catégorisé'
            } : undefined,
          })),
        };

        this.stats.set(mappedStats);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement dashboard:', err);
        this.error.set('Impossible de charger les statistiques. Réessayez plus tard.');
        this.isLoading.set(false);
      },
    });
  }
}