import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotaFiscalService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/notafiscal`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token');
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }

  listAll(params?: any): Observable<any> {
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

    return this.http.get<any>(this.API, { headers, params: httpParams });
  }

  listNota(id: string): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.API}/${id}`, { headers });
  }

  // ✅ PUT /notafiscal/{uuid} — edita os dados da nota manual
  update(
    uuid: string,
    data: {
      fornecedor: string;
      cnpj: string;
      valorTotalNota: number;
      dataEmissao: string;
      quantidadeItensNota: number;
    },
  ): Observable<any> {
    return this.http.put<any>(`${this.API}/${uuid}`, data, {
      headers: this.getHeaders(),
    });
  }

  create(
    data: {
      fornecedor: string;
      cnpj: string;
      valorTotal: number;
      dataEmissao: string;
      quantidade: number;
    },
    file: File,
  ): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('fornecedor', data.fornecedor)
      .set('cnpj', data.cnpj)
      .set('valorTotal', data.valorTotal.toString())
      .set('dataEmissao', data.dataEmissao)
      .set('quantidade', data.quantidade.toString());

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.API}/nota-sem-patrimonio`, formData, { headers, params });
  }
}
