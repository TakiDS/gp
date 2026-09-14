import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

// Interface para movimentação em massa
export interface BodyMovimentacaoEmMassa {
  patrimonioIDS: string[];
  novoLocal: string;
  novoStatus: string;
  observacoes: string;
}

@Injectable({
  providedIn: 'root',
})
export class PatrimonioService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}`;

  listAll(): Observable<any[]> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.API}/patrimonio-especifico?sort=dataCriacao,desc`, {
      headers,
    });
  }

  listById(id: string): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.API}/patrimonio-especifico/${id}`, { headers });
  }

  listAllAvailable(): Observable<any[]> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.API}/patrimonio-especifico?estado=GUARDADO&size=9999`, {
      headers,
    });
  }

  listInfoPatrimonio(id: string): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.API}/patrimonio-especifico/${id}`, { headers });
  }

  create(data: any): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.API}/patrimonio-geral`, data, { headers });
  }

  movimentarEmMassa(body: BodyMovimentacaoEmMassa): Observable<void> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<void>(`${this.API}/patrimonio-especifico`, body, { headers });
  }

  filtrarPatrimonios(filtros: {
    categoria?: string;
    estado?: string;
    local?: string;
    termoBusca?: string;
    possuiNota?: string;
  }): Observable<any[]> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let params = new HttpParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.http.get<any[]>(`${this.API}/patrimonio-especifico?sort=dataCriacao,desc`, {
      params,
      headers,
    });
  }

  uploadNotaFiscal(file: File, categoriaId: string, localId: string): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('file', file);

    if (categoriaId) {
      formData.append('categoriaUuid', categoriaId);
    }

    if (localId) {
      formData.append('localizacaoUuid', localId);
    }

    return this.http.post(`${this.API}/notafiscal`, formData, { headers });
  }

  movePatrimonio(
    patrimonioId: string,
    novoLocal: string,
    novoStatus: string,
    observacoes: string,
  ): Observable<any> {
    const body = {
      patrimonioIDS: [patrimonioId],
      novoLocal,
      novoStatus,
      observacoes,
    };

    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`${this.API}/patrimonio-especifico`, body, { headers });
  }

  updateEspecifico(id: string, data: any): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.patch<any>(`${this.API}/patrimonio-especifico/${id}`, data, { headers });
  }

  getHistorico(uuid: string, params?: any): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }

    return this.http.get<any>(`${this.API}/api/historico/patrimonio/${uuid}`, {
      headers,
      params: httpParams,
    });
  }

  deletePatrimonio(id: string, observacao?: string): Observable<void> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const requestBody = {
      observacao: observacao || null,
    };

    return this.http.delete<void>(`${this.API}/patrimonio-especifico/${id}`, {
      headers,
      body: requestBody,
    });
  }
}
