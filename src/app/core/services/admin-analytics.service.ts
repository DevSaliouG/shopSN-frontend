import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../tokens/environment.token';

export interface KpiStats {
  total_sessions: number;
  unique_visitors: number;
  new_visitors: number;
  returning_visitors: number;
  page_views: number;
  avg_pages_per_session: number;
  avg_duration: number;
  bounce_rate: number;
  converted_sessions: number;
  conversion_rate: number;
  orders_count: number;
  orders_total: number;
  avg_order_value: number;
  online_users: number;
  changes?: any;
}

export interface Period {
  period: 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'last_month' | 'this_year' | 'custom';
  start_date?: string;
  end_date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAnalyticsService {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);
  private apiUrl = `${this.env.apiUrl}/api/admin/analytics`;

  getKpiStats(period: Period): Observable<any> {
    let params = new HttpParams().set('period', period.period);

    if (period.period === 'custom' && period.start_date && period.end_date) {
      params = params.set('start_date', period.start_date).set('end_date', period.end_date);
    }

    return this.http.get<any>(`${this.apiUrl}/kpi`, { params });
  }

  getChartStats(period: Period): Observable<any> {
    let params = new HttpParams().set('period', period.period);

    if (period.period === 'custom' && period.start_date && period.end_date) {
      params = params.set('start_date', period.start_date).set('end_date', period.end_date);
    }

    return this.http.get<any>(`${this.apiUrl}/chart-stats`, { params });
  }

  getDeviceStats(period: Period): Observable<any> {
    let params = new HttpParams().set('period', period.period);

    if (period.period === 'custom') {
      params = params.set('start_date', period.start_date!).set('end_date', period.end_date!);
    }

    return this.http.get<any>(`${this.apiUrl}/devices`, { params });
  }

  getSourceStats(period: Period): Observable<any> {
    let params = new HttpParams().set('period', period.period);

    if (period.period === 'custom') {
      params = params.set('start_date', period.start_date!).set('end_date', period.end_date!);
    }

    return this.http.get<any>(`${this.apiUrl}/sources`, { params });
  }

  getOnlineVisitors(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/online-visitors`);
  }
}
