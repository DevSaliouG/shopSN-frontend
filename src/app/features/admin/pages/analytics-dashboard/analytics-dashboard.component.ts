import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAnalyticsService, KpiStats, Period } from '../../../../core/services/admin-analytics.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private analyticsService = inject(AdminAnalyticsService);

  // Expose Math for template
  Math = Math;

  // Signals
  kpiStats = signal<KpiStats | null>(null);
  deviceStats = signal<any>(null);
  sourceStats = signal<any>(null);
  onlineVisitors = signal<any>(null);
  isLoading = signal(true);

  // Période sélectionnée
  selectedPeriod = signal<Period>({ period: 'today' });

  // Subscriptions
  private refreshSubscription?: Subscription;

  ngOnInit() {
    this.loadAllStats();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  /**
   * Charger toutes les stats
   */
  loadAllStats() {
    this.isLoading.set(true);
    const period = this.selectedPeriod();

    // KPI
    this.analyticsService.getKpiStats(period).subscribe({
      next: (response) => {
        this.kpiStats.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading KPI', err);
        this.isLoading.set(false);
      }
    });

    // Devices
    this.analyticsService.getDeviceStats(period).subscribe({
      next: (response) => {
        this.deviceStats.set(response.data);
      }
    });

    // Sources
    this.analyticsService.getSourceStats(period).subscribe({
      next: (response) => {
        this.sourceStats.set(response.data);
      }
    });

    // Online Visitors
    this.loadOnlineVisitors();
  }

  /**
   * Charger visiteurs en ligne
   */
  loadOnlineVisitors() {
    this.analyticsService.getOnlineVisitors().subscribe({
      next: (response) => {
        this.onlineVisitors.set(response.data);
      }
    });
  }

  /**
   * Changer période
   */
  changePeriod(period: string) {
    this.selectedPeriod.set({ period: period as any });
    this.loadAllStats();
  }

  /**
   * Auto-refresh toutes les 60 secondes
   */
  private startAutoRefresh() {
    this.refreshSubscription = interval(60000)
      .pipe(switchMap(() => this.analyticsService.getKpiStats(this.selectedPeriod())))
      .subscribe({
        next: (response) => {
          this.kpiStats.set(response.data);
        }
      });

    // Refresh online visitors toutes les 30 secondes
    interval(30000).subscribe(() => {
      this.loadOnlineVisitors();
    });
  }

  /**
   * Formater nombre
   */
  formatNumber(num: number | undefined): string {
    if (!num) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  }

  /**
   * Formater durée (secondes → format lisible)
   */
  formatDuration(seconds: number | undefined): string {
    if (!seconds) return '0s';

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }

  /**
   * Classe CSS selon variation
   */
  getChangeClass(change: number | undefined): string {
    if (!change) return '';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  }

  /**
   * Icône selon variation
   */
  getChangeIcon(change: number | undefined): string {
    if (!change) return '';
    return change > 0 ? '↑' : '↓';
  }

  /**
   * Calculer pourcentage appareil
   */
  getDevicePercentage(deviceType: string): number {
    const devices = this.deviceStats()?.devices;
    if (!devices) return 0;

    const total = devices.reduce((sum: number, d: any) => sum + d.sessions, 0);
    const device = devices.find((d: any) => d.device_type === deviceType);

    return device && total > 0 ? Math.round((device.sessions / total) * 100) : 0;
  }

  /**
   * Calculer pourcentage source
   */
  getSourcePercentage(sourceType: string): number {
    const sources = this.sourceStats()?.sources;
    if (!sources) return 0;

    const total = sources.reduce((sum: number, s: any) => sum + s.sessions, 0);
    const source = sources.find((s: any) => s.referrer_type === sourceType);

    return source && total > 0 ? Math.round((source.sessions / total) * 100) : 0;
  }
}
