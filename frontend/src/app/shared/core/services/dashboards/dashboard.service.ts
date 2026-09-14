import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DashboardData {
  cards: {
    valorImobilizadoTotal: number;
    percentualCrescimentoValor: number;
    totalAtivos: number;
    totalGuardados: number;
    totalEmUso: number;
    pendenciasNotaFiscal: number;
  };
  graficos: {
    distribuicaoStatus: Array<{ status: string; quantidade: number }>;
    valorPorLocal: Array<{ local: string; valorTotal: number }>;
  };
  devolucoesProximas: any[];
  historico: any[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token');
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }

  getDashboardCompleto(filters?: Record<string, any>): Observable<DashboardData> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value);
        }
      });
    }

    return this.http.get<DashboardData>(`${this.API_URL}/dashboard/completo`, {
      headers: this.getHeaders(),
      params,
    });
  }
}
